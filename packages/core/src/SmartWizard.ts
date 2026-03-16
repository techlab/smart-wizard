import {
    WizardOptions, WizardInterface, StepDirection, StepPosition, StepState,
    ContentDirection, StepEventArgs, LeaveStepEventArgs, StepInfo, TransitionHandler
} from './types';
import { transitions } from './transitions';
import { defaultOptions } from './options';
import {
    addClass, removeClass, hasClass, showElement, hideElement,
    addEvent, dispatchEvent, getAttribute, setAttribute,
    getFirstDescendant, getAllDescendants,
    getElementHeight, setElementHeight, deepMerge
} from './util';

// CSS Custom Properties
const CSS_PROPERTIES = {
    PROGRESS_PERCENTAGE: '--sw-progress-percentage',
};

// Data attributes
const DATA_ATTRIBUTES = {
    THEME: 'data-theme',
};

export class SmartWizard implements WizardInterface {
    public options: WizardOptions;
    public readonly main: HTMLElement;
    public container!: HTMLElement;
    private nav!: HTMLElement;
    public steps!: HTMLElement[];
    public pages!: HTMLElement[];
    private progressbars: HTMLElement[] = [];
    private contentDirection!: ContentDirection;
    private isInitialized: boolean = false;
    public currentIndex: number = -1;
    private touchStartX: number = 0;
    private touchStartY: number = 0;

    constructor(element: HTMLElement, options?: Partial<WizardOptions>) {
        this.options = deepMerge({ ...defaultOptions }, options ?? {});
        this.main = element;

        this.setup();
        this.init();

        requestAnimationFrame(() => {
            this.load();
        });
    }

    private setup(): void {
        // Content container
        const container = getFirstDescendant(`.${this.options.styles.content.container}`, this.main);
        if (!container) throw new Error('SmartWizard: Content container not found');
        this.container = container;

        // Navigation bar element
        const nav = getFirstDescendant(`.${this.options.styles.navigation.container}`, this.main);
        if (!nav) throw new Error('SmartWizard: Navigation element not found');
        this.nav = nav;

        // Step anchor elements
        this.steps = getAllDescendants(`.${this.options.styles.navigation.link}`, this.nav);

        // Content pages
        this.pages = Array.from(this.container.children).filter(
            child => child.classList.contains(this.options.styles.content.panel)
        ) as HTMLElement[];

        // Progress bars
        this.progressbars = getAllDescendants(`.${this.options.styles.progressBar.container}`, this.main);

        // Direction, RTL/LTR
        this.contentDirection = (this.main.getAttribute('dir') ||
            document.documentElement.getAttribute('dir') || 'ltr') as ContentDirection;

        // Initial state
        this.currentIndex = -1;
        this.isInitialized = false;
    }

    private init(): void {
        // Set main element classes including theme
        this.setElements();
        // Add toolbar
        this.setToolbar();
        // Set anchor states
        this.setNav();

        // Skip event binding if already initialized
        if (this.isInitialized === true) return;

        // Assign events
        this.setEvents();

        // Trigger initialized event
        dispatchEvent(this.main, 'initialized', {
            detail: { wizard: this },
            bubbles: true
        });

        this.isInitialized = true;
    }

    private load(): void {
        // Hide all pages
        this.pages.forEach(p => hideElement(p));

        // Reset index
        this.currentIndex = -1;

        // Get initial step
        const idx = this.getInitialStep();

        // Mark previous steps as completed if needed
        if (idx > 0 && this.options.navigation.completed.enabled && this.options.navigation.completed.completeAllPreviousSteps) {
            this.steps.slice(0, idx).forEach(step => {
                addClass(this.options.styles.anchorStates.completed, step);
            });
        }

        // Show the initial step
        this.showStep(idx);

        // Trigger loaded event
        dispatchEvent(this.main, 'loaded', {
            detail: { wizard: this },
            bubbles: true
        });
    }

    private getInitialStep(): number {
        // Determine target step from hash if enabled
        let hashIndex: number | null = null;
        if (this.options.behavior.useUrlHash) {
            const hash = window.location.hash;
            hashIndex = hash ? this.getStepByAnchor(hash) : null;
        }

        // Determine initial step index
        const initialIndex = hashIndex ?? this.options.initialStep;

        // Find the first showable step starting from the initial index
        const showableIndex = this.getShowable(initialIndex - 1, 'forward');

        // If invalid or not showable, fallback to first showable
        return showableIndex ?? (initialIndex > 0 ? this.getShowable(-1, 'forward') ?? 0 : initialIndex);
    }

    private setElements(): void {
        // Remove any existing theme class
        const themePrefix = this.options.styles.themePrefix;
        Array.from(this.main.classList).forEach(cls => {
            if (cls.startsWith(themePrefix)) {
                this.main.classList.remove(cls);
            }
        });
        addClass(this.options.styles.baseClass + ' ' + themePrefix + this.options.theme, this.main);

        // Set display mode
        this.setDisplayMode();
    }

    private setDisplayMode(): void {
        const mode = this.options.displayMode;

        // Remove existing data-theme attribute
        this.main.removeAttribute(DATA_ATTRIBUTES.THEME);

        if (mode === 'none') {
            return;
        }

        if (mode === 'dark') {
            setAttribute(this.main, DATA_ATTRIBUTES.THEME, 'dark');
        } else if (mode === 'light') {
            setAttribute(this.main, DATA_ATTRIBUTES.THEME, 'light');
        } else if (mode === 'auto') {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setAttribute(this.main, DATA_ATTRIBUTES.THEME, prefersDark ? 'dark' : 'light');

            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const handleChange = (e: MediaQueryListEvent) => {
                    setAttribute(this.main, DATA_ATTRIBUTES.THEME, e.matches ? 'dark' : 'light');
                };
                if (mediaQuery.addEventListener) {
                    mediaQuery.addEventListener('change', handleChange);
                } else if ((mediaQuery as any).addListener) {
                    (mediaQuery as any).addListener(handleChange);
                }
            }
        }
    }

    private setToolbar(): void {
        if (this.options.toolbar.position === 'none') return;

        // Remove existing toolbars
        const existingToolbars = getAllDescendants(`.${this.options.styles.toolbar.base}`, this.main);
        existingToolbars.forEach(t => t.parentNode?.removeChild(t));

        const { buttons, extraElements, position } = this.options.toolbar;
        const { base: btnBase, next: btnNext, previous: btnPrev } = this.options.styles.buttons;
        const { next: nextLabel, previous: prevLabel } = this.options.localization.buttons;
        const { base: toolbarBase, prefix: toolbarPrefix } = this.options.styles.toolbar;

        const createToolbar = (): HTMLElement => {
            const div = document.createElement('div');
            div.className = `${toolbarBase} ${toolbarPrefix}${position}`;

            if (buttons.showPrevious) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `${btnBase} ${btnPrev}`;
                btn.textContent = prevLabel;
                div.appendChild(btn);
            }

            if (extraElements) {
                const extra = document.createElement('div');
                extra.innerHTML = extraElements;
                while (extra.firstChild) {
                    div.appendChild(extra.firstChild);
                }
            }

            if (buttons.showNext) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `${btnBase} ${btnNext}`;
                btn.textContent = nextLabel;
                div.appendChild(btn);
            }

            return div;
        };

        if (position === 'top' || position === 'both') {
            const topBar = createToolbar();
            this.main.insertBefore(topBar, this.main.firstChild);
        }
        if (position === 'bottom' || position === 'both') {
            this.main.appendChild(createToolbar());
        }
    }

    private setNav(): void {
        const { anchorStates: states } = this.options.styles;

        // Clear all state classes
        this.steps.forEach(step => {
            removeClass([
                states.completed, states.active, states.default,
                states.disabled, states.error, states.warning, states.hidden
            ].join(' '), step);
        });

        // Add default class if navigation is controlled
        if (!this.options.navigation.alwaysClickable || !this.options.navigation.enabled) {
            this.steps.forEach(step => addClass(states.default, step));
        }

        // Apply step states from options
        this.applyStepStates(this.options.stepStates.completed, states.completed);
        this.applyStepStates(this.options.stepStates.disabled, states.disabled);
        this.applyStepStates(this.options.stepStates.warning, states.warning);
        this.applyStepStates(this.options.stepStates.error, states.error);
        this.applyStepStates(this.options.stepStates.hidden, states.hidden);

        // Add scroll buttons for nav bar
        this.createAnchorScroll();
    }

    private applyStepStates(stepIndices: number[], cssClass: string): void {
        stepIndices.forEach(idx => {
            if (this.steps[idx]) {
                addClass(cssClass, this.steps[idx]);
            }
        });
    }

    private setEvents(): void {
        // Step anchor click
        this.steps.forEach((step, idx) => {
            addEvent(step, 'click', (e: Event) => {
                e.preventDefault();
                if (!this.options.navigation.enabled) return;
                if (this.isShowable(idx)) {
                    this.showStep(idx);
                }
            });
        });

        // Next / Prev / Scroll buttons (event delegation on main)
        addEvent(this.main, 'click', (e: Event) => {
            const target = e.target as HTMLElement;
            const { next, previous, scrollNext, scrollPrevious } = this.options.styles.buttons;

            if (target.classList.contains(next)) {
                e.preventDefault();
                this.navigate('forward');
            } else if (target.classList.contains(previous)) {
                e.preventDefault();
                this.navigate('backward');
            } else if (target.classList.contains(scrollNext)) {
                e.preventDefault();
                this.scrollAnchor('right');
            } else if (target.classList.contains(scrollPrevious)) {
                e.preventDefault();
                this.scrollAnchor('left');
            }
        });

        // Scroll end check on nav
        this.nav.addEventListener('scrollend', () => this.scrollCheck());

        // Redirect vertical wheel scroll to horizontal on nav
        this.nav.addEventListener('wheel', (e: WheelEvent) => {
            if (this.nav.scrollWidth <= this.nav.clientWidth) return;
            if (e.deltaY === 0) return;
            e.preventDefault();
            this.nav.scrollLeft += e.deltaY;
        }, { passive: false });

        // Keyboard navigation
        if (this.options.keyboardNavigation.enabled) {
            addEvent(document, 'keyup', (e: Event) => {
                const key = e as KeyboardEvent;
                if (this.options.keyboardNavigation.keys.left.includes(key.keyCode)) {
                    this.navigate('backward');
                } else if (this.options.keyboardNavigation.keys.right.includes(key.keyCode)) {
                    this.navigate('forward');
                }
            });
        }

        // Browser back/forward
        if (this.options.behavior.useUrlHash && this.options.behavior.supportBrowserHistory) {
            addEvent(window, 'hashchange', () => {
                const idx = this.getURLHashIndex();
                if (idx !== null && this.isShowable(idx)) {
                    this.showStep(idx);
                }
            });
        }

        // Fix height on window resize
        if (this.options.behavior.autoHeight) {
            addEvent(window, 'resize', () => {
                if (this.currentIndex >= 0 && this.pages[this.currentIndex]) {
                    this.fixHeight(this.currentIndex);
                }
            });
        }

        // Swipe navigation on touch
        addEvent(this.container, 'touchstart', (e: Event) => {
            const touch = (e as TouchEvent).touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        });

        addEvent(this.container, 'touchend', (e: Event) => {
            if (!this.options.swipeNavigation.enabled) return;
            const touch = (e as TouchEvent).changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            // Ignore mostly-vertical swipes
            if (Math.abs(deltaX) < Math.abs(deltaY)) return;
            const { threshold } = this.options.swipeNavigation;
            if (deltaX < -threshold) {
                this.navigate('forward');
            } else if (deltaX > threshold) {
                this.navigate('backward');
            }
        });
    }

    private setAnchor(stepIdx: number): void {
        const states = this.options.styles.anchorStates;

        if (this.currentIndex !== null && this.currentIndex >= 0) {
            let removeCss = `${states.active} ${states.default}`;
            let addCss = '';

            if (this.options.navigation.completed.enabled) {
                const stepDirection = this.getStepDirection(stepIdx);

                if (stepDirection === 'forward' && !this.options.navigation.completed.clearOnBack) {
                    addCss = states.completed;
                } else if (stepDirection === 'backward' && this.options.navigation.completed.clearOnBack) {
                    removeCss += ' ' + states.completed;
                } else {
                    addCss = states.completed;
                }
            }

            removeClass(removeCss, this.steps[this.currentIndex]);
            if (addCss) addClass(addCss, this.steps[this.currentIndex]);
        }

        // Set target step as active
        removeClass(states.completed + ' ' + states.default, this.steps[stepIdx]);
        addClass(states.active, this.steps[stepIdx]);
    }

    private setButtons(stepIdx: number): void {
        const isFirst = stepIdx === 0;
        const isLast = stepIdx === this.steps.length - 1;
        const { previous: btnPrev, next: btnNext } = this.options.styles.buttons;

        getAllDescendants(`.${btnPrev}`, this.main).forEach(btn => {
            if (isFirst) {
                setAttribute(btn, 'disabled', 'disabled');
            } else {
                btn.removeAttribute('disabled');
            }
        });

        getAllDescendants(`.${btnNext}`, this.main).forEach(btn => {
            if (isLast) {
                setAttribute(btn, 'disabled', 'disabled');
            } else {
                btn.removeAttribute('disabled');
            }
        });
    }

    private setProgressbar(stepIdx: number): void {
        if (this.progressbars.length === 0) return;
        const percent = ((stepIdx + 1) / this.steps.length) * 100;

        this.progressbars.forEach(bar => {
            // Set CSS custom property on bar's parent (container)
            bar.style.setProperty(CSS_PROPERTIES.PROGRESS_PERCENTAGE, `${percent}%`);
            // Also update the inner progress bar element directly
            const progressBar = getFirstDescendant(`.${this.options.styles.progressBar.bar}`, bar);
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
                setAttribute(progressBar, 'aria-valuenow', Math.round(percent).toString());
            }
        });
    }

    private showStep(stepIdx: number): void {
        if (stepIdx === -1 || stepIdx === null) return;
        if (stepIdx === this.currentIndex) return;
        if (!this.steps[stepIdx]) return;
        if (!this.isEnabled(this.steps[stepIdx])) return;

        const stepDirection = this.getStepDirection(stepIdx);

        if (this.currentIndex !== -1) {
            const leaveArgs: LeaveStepEventArgs = {
                stepIndex: this.currentIndex,
                nextStepIndex: stepIdx,
                stepElement: this.steps[this.currentIndex] ?? null,
                stepDirection,
                stepPosition: this.getStepPosition(this.currentIndex),
            };
            const event = new CustomEvent('leaveStep', {
                detail: leaveArgs,
                bubbles: true,
                cancelable: true
            });
            if (!this.main.dispatchEvent(event)) return;
        }

        // Load content if contentLoader is set
        this.loadContent(stepIdx, () => {
            const selStep = this.steps[stepIdx];
            if (!selStep) return;

            // Update URL hash
            if (this.options.behavior.useUrlHash && this.options.behavior.supportBrowserHistory) {
                const hash = getAttribute(selStep, 'href');
                if (hash) this.setURLHash(hash);
            }

            // Update anchor classes
            this.setAnchor(stepIdx);

            // Scroll step into view
            if (this.options.scrollToView) {
                selStep.scrollIntoView({ behavior: 'smooth' });
            }

            // Get pages
            const curPage = this.pages[this.currentIndex] ?? null;
            const selPage = this.pages[stepIdx];
            if (!selPage) return;

            // Perform transition
            const transition: TransitionHandler = (transitions as any)[this.options.transition.effect]
                || (transitions as any)['default'];

            transition(selPage, curPage, stepDirection, this, () => {
                // Fix height
                this.fixHeight(stepIdx);

                // Trigger showStep event
                const stepArgs: StepEventArgs = {
                    stepIndex: stepIdx,
                    stepElement: selStep,
                    stepDirection,
                    stepPosition: this.getStepPosition(stepIdx),
                };
                dispatchEvent(this.main, 'showStep', {
                    detail: stepArgs,
                    bubbles: true
                });
            });

            // Update current index
            this.currentIndex = stepIdx;
            // Update buttons
            this.setButtons(stepIdx);
            // Update progress bar
            this.setProgressbar(stepIdx);
        });
    }

    private loadContent(idx: number, callback: () => void): void {
        if (!this.options.contentLoader || typeof this.options.contentLoader !== 'function') {
            callback();
            return;
        }

        const selPage = this.pages[idx];
        if (!selPage) { callback(); return; }

        const selStep = this.steps[idx];
        if (!selStep) { callback(); return; }

        const stepDirection = this.getStepDirection(idx);
        const stepPosition = this.getStepPosition(idx);

        this.options.contentLoader(idx, stepDirection, stepPosition, selStep, (content) => {
            if (content) {
                if (typeof content === 'string') {
                    selPage.innerHTML = content;
                } else {
                    selPage.innerHTML = '';
                    selPage.appendChild(content as Node);
                }
            }
            callback();
        });
    }

    private navigate(direction: StepDirection): void {
        const stepIndex = direction === 'forward'
            ? this.getShowable(this.currentIndex, 'forward')
            : this.getShowable(this.currentIndex, 'backward');

        if (stepIndex !== null) {
            this.showStep(stepIndex);
        }
    }

    private getShowable(fromIndex: number, direction: StepDirection): number | null {
        const isForward = direction === 'forward';
        let idx = fromIndex + (isForward ? 1 : -1);

        while (isForward ? idx < this.steps.length : idx >= 0) {
            if (this.isShowable(idx)) return idx;
            idx += isForward ? 1 : -1;
        }
        return null;
    }

    private isShowable(idx: number): boolean {
        const step = this.steps[idx];
        if (!step) return false;
        return this.isEnabled(step);
    }

    private isEnabled(step: HTMLElement): boolean {
        const { disabled, hidden } = this.options.styles.anchorStates;
        return !hasClass(disabled, step) && !hasClass(hidden, step);
    }

    private getStepDirection(stepIdx: number): StepDirection {
        if (this.currentIndex < stepIdx) return 'forward';
        if (this.currentIndex > stepIdx) return 'backward';
        return 'none';
    }

    private getStepPosition(idx: number): StepPosition {
        if (idx === 0) return 'first';
        if (idx === this.steps.length - 1) return 'last';
        return 'middle';
    }

    private getStepByAnchor(hash: string): number | null {
        for (let i = 0; i < this.steps.length; i++) {
            if (getAttribute(this.steps[i], 'href') === hash) return i;
        }
        return null;
    }

    private getURLHashIndex(): number | null {
        const hash = window.location.hash;
        return hash ? this.getStepByAnchor(hash) : null;
    }

    private setURLHash(hash: string): void {
        if (window.history && window.history.pushState) {
            window.history.pushState(null, '', hash);
        } else {
            window.location.hash = hash;
        }
    }

    private fixHeight(stepIdx: number): void {
        if (!this.options.behavior.autoHeight) return;
        const page = this.pages[stepIdx];
        if (!page) return;
        const h = getElementHeight(page);
        if (h) setElementHeight(this.container, h);
    }

    private changeState(stepArray: number[], state: string, addOrRemove: boolean): void {
        let css = '';
        const { anchorStates: states } = this.options.styles;
        if (state === 'default') css = states.default;
        else if (state === 'active') css = states.active;
        else if (state === 'completed') css = states.completed;
        else if (state === 'disable') css = states.disabled;
        else if (state === 'hidden') css = states.hidden;
        else if (state === 'error') css = states.error;
        else if (state === 'warning') css = states.warning;

        stepArray.forEach(n => {
            if (this.steps[n]) {
                if (addOrRemove) {
                    addClass(css, this.steps[n]);
                } else {
                    removeClass(css, this.steps[n]);
                }
            }
        });
    }

    // ─── Nav Scroll ──────────────────────────────────────────────────────────

    private createAnchorScroll(): void {
        const { scroll, scrollNext, scrollPrevious } = this.options.styles.buttons;

        // Remove existing scroll buttons
        getAllDescendants(`.${scroll}`, this.nav).forEach(btn => btn.parentNode?.removeChild(btn));

        // Create left scroll button
        const leftBtn = document.createElement('button');
        leftBtn.type = 'button';
        leftBtn.className = `${scroll} ${scrollPrevious}`;
        leftBtn.setAttribute('aria-label', 'Scroll left');

        // Create right scroll button
        const rightBtn = document.createElement('button');
        rightBtn.type = 'button';
        rightBtn.className = `${scroll} ${scrollNext}`;
        rightBtn.setAttribute('aria-label', 'Scroll right');

        this.nav.appendChild(leftBtn);
        this.nav.appendChild(rightBtn);

        // Initial check
        this.scrollCheck();
    }

    private scrollCheck(): void {
        const { scroll } = this.options.styles.buttons;
        const scrollBtns = getAllDescendants(`.${scroll}`, this.nav);
        const canScroll = this.nav.scrollWidth > this.nav.clientWidth;
        scrollBtns.forEach(btn => {
            btn.style.display = canScroll ? '' : 'none';
        });
    }

    private scrollAnchor(direction: 'left' | 'right'): void {
        const scrollAmount = this.nav.clientWidth / 2;
        this.nav.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
    }

    // ─── Public Methods ───────────────────────────────────────────────────────

    public next(): void {
        this.navigate('forward');
    }

    public prev(): void {
        this.navigate('backward');
    }

    public goToStep(stepIndex: number, force: boolean = false): void {
        if (!force && !this.isShowable(stepIndex)) return;

        // Mark previous steps as completed when forced
        if (force && stepIndex > 0 && this.options.navigation.completed.enabled
            && this.options.navigation.completed.completeAllPreviousSteps) {
            this.steps.slice(0, stepIndex).forEach(step => {
                addClass(this.options.styles.anchorStates.completed, step);
            });
        }

        this.showStep(stepIndex);
    }

    public reset(): void {
        const { completed, active, error, warning } = this.options.styles.anchorStates;
        this.steps.forEach(step => removeClass(`${completed} ${active} ${error} ${warning}`, step));

        if (this.options.behavior.useUrlHash && this.options.behavior.supportBrowserHistory) {
            this.setURLHash('#');
        }

        this.init();
        this.load();
    }

    public setState(stepArray: number[], state: string): void {
        this.changeState(stepArray, state, true);
    }

    public unsetState(stepArray: number[], state: string): void {
        this.changeState(stepArray, state, false);
    }

    public setOptions(options: Partial<WizardOptions>): void {
        this.options = deepMerge({ ...this.options }, options);
        this.init();
        this.load();
    }

    public getOptions(): WizardOptions {
        return this.options;
    }

    public getContentDirection(): ContentDirection {
        return this.contentDirection || 'ltr';
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public getStepInfo(): StepInfo {
        return {
            currentStep: this.currentIndex >= 0 ? this.currentIndex : 0,
            totalSteps: this.steps.length
        };
    }

    public loader(state: 'show' | 'hide'): void {
        const loaderCss = this.options.styles.loader;
        if (state === 'show') {
            addClass(loaderCss, this.main);
        } else {
            removeClass(loaderCss, this.main);
        }
    }

    public adjustHeight(): void {
        this.fixHeight(this.currentIndex);
    }

    public resetHeight(): void {
        const elm = this.pages[0];
        if (!elm) return;
        const h = getElementHeight(elm);
        setElementHeight(this.container, h || 'auto');
    }

    public getWidth(): number {
        return this.container.offsetWidth;
    }
}
