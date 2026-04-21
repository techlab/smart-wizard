import {
    WizardOptions, WizardInterface, StepDirection, StepPosition,
    ContentDirection, StepEventArgs, LeaveStepEventArgs, StepInfo, TransitionHandler, StepItem,
    WizardLayout
} from './types';
import { transitions } from './transitions';
import { defaultOptions } from './options';
import {
    addClass, removeClass, hasClass, hideElement,
    addEvent, dispatchEvent, getAttribute, setAttribute,
    getFirstDescendant, getAllDescendants,
    getElementHeight, setElementHeight, deepMerge,
    mergeOptions
} from './util';

import { CSS_PROPERTIES, STYLES, DATA_ATTRIBUTES, EVENTS, STEP_DIRECTION, STEP_POSITION, LAYOUT, CONTENT_DIRECTION } from './constants';

export class SmartWizard implements WizardInterface {
    public options: WizardOptions;
    public readonly main: HTMLElement;
    public container!: HTMLElement;
    private nav!: HTMLElement;
    public stepItems!: StepItem[];
    private progressbars: HTMLElement[] = [];
    private contentDirection!: ContentDirection;
    private isInitialized: boolean = false;
    public currentIndex: number = -1;
    private touchStartX: number = 0;
    private touchStartY: number = 0;

    constructor(element: HTMLElement | string, options?: Partial<WizardOptions>) {
        const el = typeof element === 'string'
            ? document.querySelector(element) as HTMLElement
            : element;

        if (!el) {
            throw new Error(`SmartWizard: Element not found: ${element}`);
        }

        this.main = el;

        // Merge data attributes from the element — they override all other options.
        this.options = mergeOptions(deepMerge({} as WizardOptions, defaultOptions), options ?? {});
        const dataOverrides = this.getOptionsFromAttributes(el);
        if (Object.keys(dataOverrides).length > 0) {
            this.options = mergeOptions(this.options, dataOverrides);
        }

        this.setup();
        this.init();

        requestAnimationFrame(() => {
            this.load();
        });
    }

    private getOptionsFromAttributes(el: HTMLElement): Partial<WizardOptions> {
        const overrides: Partial<WizardOptions> = {};

        const layout = el.getAttribute(DATA_ATTRIBUTES.LAYOUT);
        if (layout !== null) overrides.layout = layout as WizardLayout;

        const theme = el.getAttribute(DATA_ATTRIBUTES.THEME);
        if (theme !== null) overrides.theme = theme;

        const color = el.getAttribute(DATA_ATTRIBUTES.COLOR);
        if (color !== null) overrides.color = color;

        const transition = el.getAttribute(DATA_ATTRIBUTES.TRANSITION);
        if (transition !== null) {
            overrides.transition = { ...this.options.transition, effect: transition };
        }

        return overrides;
    }

    private setup(): void {
        // Content container
        const container = getFirstDescendant(`.${STYLES.CONTENT.CONTAINER}`, this.main);
        if (!container) throw new Error('SmartWizard: Content container not found');
        this.container = container;

        // Navigation bar element
        const nav = getFirstDescendant(`.${STYLES.NAVIGATION.CONTAINER}`, this.main);
        if (!nav) throw new Error('SmartWizard: Navigation element not found');
        this.nav = nav;

        // Step anchor elements paired with their controlled panels (via aria-controls)
        const stepAnchors = getAllDescendants(`.${STYLES.NAVIGATION.ITEM}`, this.nav);
        this.stepItems = stepAnchors.map(step => {
            const panelId = step.getAttribute('aria-controls');
            const page = panelId
                ? (this.container.querySelector(`#${panelId}`) as HTMLElement | null)
                ?? (this.container.children[stepAnchors.indexOf(step)] as HTMLElement)
                : (this.container.children[stepAnchors.indexOf(step)] as HTMLElement);
            return { step, page };
        });

        // Progress bars
        this.progressbars = getAllDescendants(`.${STYLES.PROGRESSBAR.CONTAINER}`, this.main);

        // Direction, RTL/LTR
        this.contentDirection = (this.main.getAttribute('dir') ||
            document.documentElement.getAttribute('dir') || CONTENT_DIRECTION.LEFT_TO_RIGHT) as ContentDirection;

        // Initial state
        this.currentIndex = -1;
        this.isInitialized = false;
    }

    private init(): void {
        // Set main element classes including theme
        this.setElements();
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
        this.stepItems.forEach(({ page }) => hideElement(page));

        // Reset index
        this.currentIndex = -1;

        // Get initial step
        const idx = this.getInitialStep();

        // Mark previous steps as completed if needed
        if (idx > 0 && this.options.navigation.completed.enabled && this.options.navigation.completed.completeAllPreviousSteps) {
            this.stepItems.slice(0, idx).forEach(({ step }) => {
                addClass(STYLES.STATES.COMPLETED, step);
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
        Array.from(this.main.classList).forEach(cls => {
            if (cls.startsWith(STYLES.THEME_PREFIX)) {
                this.main.classList.remove(cls);
            }
        });
        addClass(STYLES.BASE + ' ' + STYLES.THEME_PREFIX + this.options.theme + ' ' + STYLES.LAYOUT_PREFIX + this.options.layout, this.main);

        // Set display mode
        this.setColorScheme();
    }

    private setColorScheme(): void {
        const mode = this.options.colorScheme;

        // Remove existing data-theme attribute
        this.main.removeAttribute(DATA_ATTRIBUTES.COLOR_SCHEME);

        if (mode === 'none') {
            return;
        }

        if (mode === 'dark') {
            setAttribute(this.main, DATA_ATTRIBUTES.COLOR_SCHEME, 'dark');
        } else if (mode === 'light') {
            setAttribute(this.main, DATA_ATTRIBUTES.COLOR_SCHEME, 'light');
        } else if (mode === 'auto') {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setAttribute(this.main, DATA_ATTRIBUTES.COLOR_SCHEME, prefersDark ? 'dark' : 'light');

            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const handleChange = (e: MediaQueryListEvent) => {
                    setAttribute(this.main, DATA_ATTRIBUTES.COLOR_SCHEME, e.matches ? 'dark' : 'light');
                };
                if (mediaQuery.addEventListener) {
                    mediaQuery.addEventListener('change', handleChange);
                } else if ((mediaQuery as any).addListener) {
                    (mediaQuery as any).addListener(handleChange);
                }
            }
        }
    }

    private setNav(): void {
        // Clear all state classes
        this.stepItems.forEach(({ step }) => {
            removeClass([
                STYLES.STATES.COMPLETED, STYLES.STATES.ACTIVE, STYLES.STATES.DEFAULT,
                STYLES.STATES.DISABLED, STYLES.STATES.ERROR, STYLES.STATES.WARNING, STYLES.STATES.HIDDEN
            ].join(' '), step);
        });

        // Add default class if navigation is controlled
        if (!this.options.navigation.alwaysClickable || !this.options.navigation.enabled) {
            this.stepItems.forEach(({ step }) => addClass(STYLES.STATES.DEFAULT, step));
        }

        // Apply step states from options
        this.applyStepStates(this.options.stepStates.completed, STYLES.STATES.COMPLETED);
        this.applyStepStates(this.options.stepStates.disabled, STYLES.STATES.DISABLED);
        this.applyStepStates(this.options.stepStates.warning, STYLES.STATES.WARNING);
        this.applyStepStates(this.options.stepStates.error, STYLES.STATES.ERROR);
        this.applyStepStates(this.options.stepStates.hidden, STYLES.STATES.HIDDEN);

        // Add scroll buttons for nav bar
        this.createAnchorScroll();
    }

    private applyStepStates(stepIndices: number[], cssClass: string): void {
        stepIndices.forEach(idx => {
            const item = this.stepItems[idx];
            if (item) {
                addClass(cssClass, item.step);
            }
        });
    }

    private setEvents(): void {
        // Step anchor click
        this.stepItems.forEach(({ step }, idx) => {
            addEvent(step, EVENTS.CLICK, (e: Event) => {
                e.preventDefault();
                if (!this.options.navigation.enabled) return;
                if (this.isShowable(idx)) {
                    this.showStep(idx);
                }
            });
        });

        // Next / Prev / Scroll buttons (event delegation on main)
        addEvent(this.main, EVENTS.CLICK, (e: Event) => {
            const target = e.target as HTMLElement;

            if (target.classList.contains(STYLES.BUTTONS.NEXT)) {
                e.preventDefault();
                this.navigate(STEP_DIRECTION.FORWARD);
            } else if (target.classList.contains(STYLES.BUTTONS.PREVIOUS)) {
                e.preventDefault();
                this.navigate(STEP_DIRECTION.BACKWARD);
            } else if (target.classList.contains(STYLES.BUTTONS.RESET)) {
                e.preventDefault();
                this.reset();
            } else if (target.classList.contains(STYLES.BUTTONS.SCROLL)) {
                e.preventDefault();
                if (e.target && e.target instanceof HTMLElement) {
                    this.scrollAnchor(e.target.dataset.scrollAction as 'prev' | 'next');
                }
            }
        });

        // Scroll end check on nav
        this.nav.addEventListener(EVENTS.SCROLLEND, () => this.scrollCheck());

        // Redirect vertical wheel scroll to horizontal on nav
        this.nav.addEventListener(EVENTS.WHEEL, (e: WheelEvent) => {
            if (this.nav.scrollWidth <= this.nav.clientWidth) return;
            if (e.deltaY === 0) return;
            e.preventDefault();
            this.nav.scrollLeft += e.deltaY;
        }, { passive: false });

        // Keyboard navigation
        if (this.options.keyboardNavigation.enabled) {
            addEvent(document, EVENTS.KEYUP, (e: Event) => {
                const key = e as KeyboardEvent;
                if (this.options.keyboardNavigation.keys.left.includes(key.keyCode)) {
                    this.navigate(STEP_DIRECTION.BACKWARD);
                } else if (this.options.keyboardNavigation.keys.right.includes(key.keyCode)) {
                    this.navigate(STEP_DIRECTION.FORWARD);
                }
            });
        }

        // Browser back/forward
        if (this.options.behavior.useUrlHash && this.options.behavior.supportBrowserHistory) {
            addEvent(window, EVENTS.HASHCHANGE, () => {
                const idx = this.getURLHashIndex();
                if (idx !== null && this.isShowable(idx)) {
                    this.showStep(idx);
                }
            });
        }

        // Fix height on window resize
        if (this.options.behavior.autoHeight) {
            addEvent(window, EVENTS.RESIZE, () => {
                if (this.currentIndex >= 0 && this.stepItems[this.currentIndex]) {
                    this.fixHeight(this.currentIndex);
                }
            });
        }

        // Swipe navigation on touch
        addEvent(this.container, EVENTS.TOUCHSTART, (e: Event) => {
            const touch = (e as TouchEvent).touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        });

        addEvent(this.container, EVENTS.TOUCHEND, (e: Event) => {
            if (!this.options.swipeNavigation.enabled) return;
            const touch = (e as TouchEvent).changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            // Ignore mostly-vertical swipes
            if (Math.abs(deltaX) < Math.abs(deltaY)) return;
            const { threshold } = this.options.swipeNavigation;
            if (deltaX < -threshold) {
                this.navigate(STEP_DIRECTION.FORWARD);
            } else if (deltaX > threshold) {
                this.navigate(STEP_DIRECTION.BACKWARD);
            }
        });
    }

    private setAnchor(stepIdx: number): void {
        const states = STYLES.STATES;

        if (this.currentIndex !== null && this.currentIndex >= 0) {
            const currentStep = this.stepItems[this.currentIndex]?.step;
            let removeCss = `${STYLES.STATES.ACTIVE} ${STYLES.STATES.DEFAULT}`;
            let addCss = '';

            if (this.options.navigation.completed.enabled) {
                const stepDirection = this.getStepDirection(stepIdx);

                if (stepDirection === STEP_DIRECTION.FORWARD && !this.options.navigation.completed.clearOnBack) {
                    addCss = STYLES.STATES.COMPLETED;
                } else if (stepDirection === STEP_DIRECTION.BACKWARD && this.options.navigation.completed.clearOnBack) {
                    removeCss += ' ' + STYLES.STATES.COMPLETED;
                } else {
                    addCss = STYLES.STATES.COMPLETED;
                }
            }

            if (currentStep) {
                removeClass(removeCss, currentStep);
                if (addCss) addClass(addCss, currentStep);
            }
        }

        // Set target step as active
        const targetStep = this.stepItems[stepIdx]?.step;
        if (targetStep) {
            removeClass(STYLES.STATES.COMPLETED + ' ' + STYLES.STATES.DEFAULT, targetStep);
            addClass(STYLES.STATES.ACTIVE, targetStep);
        }
    }

    private setButtons(stepPosition: StepPosition): void {
        getAllDescendants(`.${STYLES.BUTTONS.PREVIOUS}`, this.main).forEach(btn => {
            if (stepPosition == STEP_POSITION.FIRST) {
                setAttribute(btn, 'disabled', 'disabled');
            } else {
                btn.removeAttribute('disabled');
            }
        });

        getAllDescendants(`.${STYLES.BUTTONS.NEXT}`, this.main).forEach(btn => {
            if (stepPosition == STEP_POSITION.LAST) {
                setAttribute(btn, 'disabled', 'disabled');
            } else {
                btn.removeAttribute('disabled');
            }
        });
    }

    private setProgressbar(stepIdx: number): void {
        if (this.progressbars.length === 0) return;
        const percent = ((stepIdx + 1) / this.stepItems.length) * 100;

        this.progressbars.forEach(bar => {
            // Set CSS custom property on bar's parent (container)
            bar.style.setProperty(CSS_PROPERTIES.PROGRESS_PERCENTAGE, `${percent}%`);
            // Also update the inner progress bar element directly
            const progressBar = getFirstDescendant(`.${STYLES.PROGRESSBAR.BAR}`, bar);
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
                setAttribute(progressBar, 'aria-valuenow', Math.round(percent).toString());
            }
        });
    }

    private showStep(stepIdx: number): void {
        if (stepIdx === -1 || stepIdx === null) return;
        if (stepIdx === this.currentIndex) return;
        const selItem = this.stepItems[stepIdx];
        if (!selItem) return;
        if (!this.isEnabled(selItem.step)) return;

        const stepDirection = this.getStepDirection(stepIdx);

        if (this.currentIndex !== -1) {
            const leaveArgs: LeaveStepEventArgs = {
                stepIndex: this.currentIndex,
                nextStepIndex: stepIdx,
                stepElement: this.stepItems[this.currentIndex]?.step ?? null,
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
            const { step: selStep, page: selPage } = this.stepItems[stepIdx];

            // Update URL hash
            if (this.options.behavior.useUrlHash && this.options.behavior.supportBrowserHistory) {
                const hash = getAttribute(selStep, 'href');
                if (hash) this.setURLHash(hash);
            }

            // Update anchor classes
            this.setAnchor(stepIdx);

            // Scroll step into view
            if (this.options.scrollToView) {
                this.scrollToStep(stepIdx);
            }

            // Get pages
            const curPage = this.stepItems[this.currentIndex]?.page ?? null;

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
            const stepPosition = this.getStepPosition(stepIdx);
            this.setButtons(stepPosition);
            // Update progress bar
            this.setProgressbar(stepIdx);
        });
    }

    private scrollToStep(stepIdx: number) {
        const { step: selStep } = this.stepItems[stepIdx];
        const isHorizontal = this.options.layout === LAYOUT.HORIZONTAL;

        const itemStart = isHorizontal ? selStep.offsetLeft : selStep.offsetTop;
        const itemSize = isHorizontal ? selStep.offsetWidth : selStep.offsetHeight;

        const containerSize = isHorizontal
            ? this.nav.clientWidth
            : this.nav.clientHeight;

        const itemCenter = itemStart + itemSize / 2;
        const containerCenter = containerSize / 2;
        let newScroll = itemCenter - containerCenter;

        const maxScroll = isHorizontal
            ? this.nav.scrollWidth - this.nav.clientWidth
            : this.nav.scrollHeight - this.nav.clientHeight;

        newScroll = Math.max(0, Math.min(newScroll, maxScroll));

        this.nav.scrollTo({
            [isHorizontal ? 'left' : 'top']: newScroll,
            behavior: 'smooth'
        });
    }

    private loadContent(idx: number, callback: () => void): void {
        if (!this.options.contentLoader || typeof this.options.contentLoader !== 'function') {
            callback();
            return;
        }

        const selItem = this.stepItems[idx];
        if (!selItem) { callback(); return; }
        const { step: selStep, page: selPage } = selItem;

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
        const stepIndex = direction === STEP_DIRECTION.FORWARD
            ? this.getShowable(this.currentIndex, STEP_DIRECTION.FORWARD)
            : this.getShowable(this.currentIndex, STEP_DIRECTION.BACKWARD);

        if (stepIndex !== null) {
            this.showStep(stepIndex);
        }
    }

    private getShowable(fromIndex: number, direction: StepDirection): number | null {
        const isForward = direction === STEP_DIRECTION.FORWARD;
        let idx = fromIndex + (isForward ? 1 : -1);

        while (isForward ? idx < this.stepItems.length : idx >= 0) {
            if (this.isEnabled(this.stepItems[idx].step)) return idx;
            idx += isForward ? 1 : -1;
        }
        return null;
    }

    private isShowable(idx: number): boolean {
        const item = this.stepItems[idx];
        if (!item) return false;
        if (!this.isEnabled(item.step)) return false;

        const isCompleted = hasClass(STYLES.STATES.COMPLETED, item.step);
        if (this.options.navigation.completed.enabled === false && isCompleted) {
            return false;
        }

        if (this.options.navigation.completed.clickable === false && isCompleted) {
            return false;
        }

        if (this.options.navigation.alwaysClickable === false && !isCompleted) {
            return false;
        }

        return true;
    }

    private isEnabled(step: HTMLElement): boolean {
        return !hasClass(STYLES.STATES.DISABLED, step) && !hasClass(STYLES.STATES.HIDDEN, step);
    }

    private getStepDirection(stepIdx: number): StepDirection {
        if (this.currentIndex < stepIdx) return 'forward';
        if (this.currentIndex > stepIdx) return 'backward';
        return 'none';
    }

    private getStepPosition(idx: number): StepPosition {
        if (idx === 0) return 'first';
        if (idx === this.stepItems.length - 1) return 'last';
        return 'middle';
    }

    private getStepByAnchor(hash: string): number | null {
        for (let i = 0; i < this.stepItems.length; i++) {
            if (getAttribute(this.stepItems[i].step, 'href') === hash) return i;
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
        const page = this.stepItems[stepIdx]?.page;
        if (!page) return;
        const h = getElementHeight(page);
        if (h) setElementHeight(this.container, h);
    }

    private changeState(stepArray: number[], state: string, addOrRemove: boolean): void {
        let css = '';
        if (state === 'default') css = STYLES.STATES.DEFAULT;
        else if (state === 'active') css = STYLES.STATES.ACTIVE;
        else if (state === 'completed') css = STYLES.STATES.COMPLETED;
        else if (state === 'disable') css = STYLES.STATES.DISABLED;
        else if (state === 'hidden') css = STYLES.STATES.HIDDEN;
        else if (state === 'error') css = STYLES.STATES.ERROR;
        else if (state === 'warning') css = STYLES.STATES.WARNING;

        stepArray.forEach(n => {
            const item = this.stepItems[n];
            if (item) {
                if (addOrRemove) {
                    addClass(css, item.step);
                } else {
                    removeClass(css, item.step);
                }
            }
        });
    }

    // ─── Nav Scroll ──────────────────────────────────────────────────────────

    private createAnchorScroll(): void {
        // Remove existing scroll buttons
        getAllDescendants(`.${STYLES.BUTTONS.SCROLL}`, this.nav).forEach(btn => btn.parentNode?.removeChild(btn));

        // Create left scroll button
        const scrollBtn = document.createElement('button');
        scrollBtn.type = 'button';
        scrollBtn.className = `${STYLES.BUTTONS.SCROLL}`;
        scrollBtn.setAttribute('aria-label', 'Scroll left');
        scrollBtn.dataset.scrollAction = 'prev'

        // Create right scroll button
        const rightBtn = scrollBtn.cloneNode(true) as HTMLButtonElement;
        rightBtn.setAttribute('aria-label', 'Scroll right');
        rightBtn.dataset.scrollAction = 'next'

        this.nav.prepend(scrollBtn);
        this.nav.append(rightBtn);

        // Initial check
        this.scrollCheck();
    }

    private scrollCheck(): void {
        const scrollBtns = getAllDescendants(`.${STYLES.BUTTONS.SCROLL}`, this.nav);
        const canScroll = this.options.layout === LAYOUT.VERTICAL
            ? this.nav.scrollHeight > this.nav.clientHeight
            : this.nav.scrollWidth > this.nav.clientWidth;

        scrollBtns.forEach(btn => {
            btn.style.display = canScroll ? '' : 'none';
        });
    }

    private scrollAnchor(direction: 'prev' | 'next'): void {
        const isHorizontal = this.options.layout === LAYOUT.HORIZONTAL;

        const scrollAmount = isHorizontal
            ? this.nav.clientWidth / 2
            : this.nav.clientHeight / 2;

        const maxScroll = isHorizontal
            ? this.nav.scrollWidth - this.nav.clientWidth
            : this.nav.scrollHeight - this.nav.clientHeight;

        let targetScroll = isHorizontal ? this.nav.scrollLeft : this.nav.scrollTop;

        targetScroll += direction === 'next' ? scrollAmount : -scrollAmount;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        this.nav.scrollTo({
            [isHorizontal ? 'left' : 'top']: targetScroll,
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
            this.stepItems.slice(0, stepIndex).forEach(({ step }) => {
                addClass(STYLES.STATES.COMPLETED, step);
            });
        }

        this.showStep(stepIndex);
    }

    public reset(): void {
        const { COMPLETED, ACTIVE, ERROR, WARNING } = STYLES.STATES;
        this.stepItems.forEach(({ step }) => removeClass(`${COMPLETED} ${ACTIVE} ${ERROR} ${WARNING}`, step));

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
        return this.contentDirection || CONTENT_DIRECTION.LEFT_TO_RIGHT;
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public getStepInfo(): StepInfo {
        return {
            currentStep: this.currentIndex >= 0 ? this.currentIndex : 0,
            totalSteps: this.stepItems.length
        };
    }

    public loader(state: 'show' | 'hide'): void {
        if (state === 'show') {
            addClass(STYLES.LOADER, this.main);
        } else {
            removeClass(STYLES.LOADER, this.main);
        }
    }

    public adjustHeight(): void {
        this.fixHeight(this.currentIndex);
    }

    public resetHeight(): void {
        const elm = this.stepItems[0]?.page;
        if (!elm) return;
        const h = getElementHeight(elm);
        setElementHeight(this.container, h || 'auto');
    }

    public getWidth(): number {
        return this.container.offsetWidth;
    }
}
