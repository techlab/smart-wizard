import {
    WizardOptions, WizardInterface, StepDirection, StepPosition,
    ContentDirection, StepEventArgs, LeaveStepEventArgs, StepInfo, WizardInfo, TransitionHandler, StepItem,
    WizardExtension, ExtensionBeforeShowArgs, ExtensionAfterShowArgs, WizardEvents,
    EventCallback, StepState, IWizardStep, IWizardStepCollection, WizardLoader
} from './types';
import { transitions } from './transitions';
import {
    addClass, removeClass, hasClass, hideElement,
    getAttribute, setAttribute,
    getFirstDescendant, getAllDescendants,
    getElementHeight, setElementHeight, deepMerge
} from './util';
import { EventEmitter } from './EventEmitter';
import { EventBinder } from './EventBinder';
import { NavScroll } from './NavScroll';
import { ExtensionRegistry } from './ExtensionRegistry';
import { StepStateManager } from './StepStateManager';
import { OptionsParser } from './OptionsParser';
import { ProgressBar } from './ProgressBar';
import { StepNavigator } from './StepNavigator';
import { WizardStep } from './WizardStep';
import { WizardStepCollection } from './WizardStepCollection';
import { STYLES, DATA_ATTRIBUTES, EVENTS, STEP_DIRECTION, STEP_POSITION, CONTENT_DIRECTION } from './constants';

export class SmartWizard implements WizardInterface {
    private _options: WizardOptions;
    public readonly main: HTMLElement;
    public container!: HTMLElement;
    protected nav!: HTMLElement;
    public stepItems!: StepItem[];
    private contentDirection!: ContentDirection;
    private isInitialized: boolean = false;
    private _activeIndex: number = -1;
    private touchStartX: number = 0;
    private touchStartY: number = 0;

    // ─── Modules ─────────────────────────────────────────────────────────────
    private readonly emitter: EventEmitter;
    private readonly binder: EventBinder;
    private readonly registry: ExtensionRegistry;
    private navScroll!: NavScroll;
    private stateManager!: StepStateManager;
    private navigator!: StepNavigator;
    private progressBar!: ProgressBar;
    private navButtons!: { prev: HTMLElement[]; next: HTMLElement[] };

    // ─── Instance tracking ─────────────────────────────────────────────────────
    private static _instanceCounter: number = 0;
    public readonly id: string;

    constructor(element: HTMLElement | string, options?: Partial<WizardOptions>) {
        const el = typeof element === 'string'
            ? document.querySelector(element) as HTMLElement
            : element;

        if (!el) {
            throw new Error(`SmartWizard: Element not found: ${element}`);
        }

        this.main = el;
        this._options = OptionsParser.parse(this.main, options);
        this.id = this._generateWizardId();
        this.main.dataset.swId = this.id;

        this.emitter = new EventEmitter(this.main);
        this.binder = new EventBinder();
        this.registry = new ExtensionRegistry();

        this.setup();
        this.init();

        requestAnimationFrame(() => {
            this.load();
        });
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
        this.navScroll = new NavScroll(this.nav, () => this._options.layout, () => this.stepItems);

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

        // Cache nav button elements (queried once, not on every step change)
        this.navButtons = {
            prev: getAllDescendants(`.${STYLES.BUTTONS.PREVIOUS}`, this.main),
            next: getAllDescendants(`.${STYLES.BUTTONS.NEXT}`, this.main),
        };

        // Progress bar(s)
        const bars = getAllDescendants(`.${STYLES.PROGRESSBAR.CONTAINER}`, this.main);
        this.progressBar = new ProgressBar(bars);

        // Step state manager
        this.stateManager = new StepStateManager(this.stepItems);

        // Step navigator
        this.navigator = new StepNavigator(
            () => this.stepItems,
            () => this._activeIndex,
            () => this._options
        );

        // Direction, RTL/LTR
        this.contentDirection = (this.main.getAttribute('dir') ||
            document.documentElement.getAttribute('dir') || CONTENT_DIRECTION.LEFT_TO_RIGHT) as ContentDirection;

        // Initial state
        this._activeIndex = -1;
        this.isInitialized = false;
    }

    private _generateWizardId(): string {
        return `sw-${Date.now()}-${++SmartWizard._instanceCounter}`;
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
        this.emitter.emit('initialized', {
            wizard: this
        });

        this.isInitialized = true;

        // Fire onInit hook on all extensions
        this.registry.runSync('onInit', this);
    }

    private load(): void {
        // Hide all pages
        this.stepItems.forEach(({ page }) => hideElement(page));

        // Reset index
        this._activeIndex = -1;

        // Get initial step
        const idx = this.getInitialStep();

        // Mark previous steps as completed if needed
        if (idx > 0 && this._options.navigation.completed.enabled && this._options.navigation.completed.completeAllPreviousSteps) {
            this.stepItems.slice(0, idx).forEach(({ step }) => {
                addClass(STYLES.STATES.COMPLETED, step);
            });
        }

        // Show the initial step
        this.showStep(idx);

        // Trigger loaded event
        this.emitter.emit('loaded', {
            wizard: this
        });

        // Fire onLoad hook on all extensions
        this.registry.runSync('onLoad', this);
    }

    private getInitialStep(): number {
        // Determine target step from hash if enabled
        let hashIndex: number | null = null;
        if (this._options.behavior.useUrlHash) {
            const hash = window.location.hash;
            hashIndex = hash ? this.getStepByAnchor(hash) : null;
        }

        // Determine initial step index
        const initialIndex = hashIndex ?? this._options.initialStep;

        // Find the first showable step starting from the initial index
        const showableIndex = this.navigator.nextShowable(initialIndex - 1, 'forward');

        // If invalid or not showable, fallback to first showable
        return showableIndex ?? (initialIndex > 0 ? this.navigator.nextShowable(-1, 'forward') ?? 0 : initialIndex);
    }

    private setElements(): void {
        // Remove any existing theme class
        Array.from(this.main.classList).forEach(cls => {
            if (cls.startsWith(STYLES.THEME_PREFIX)) {
                this.main.classList.remove(cls);
            }
        });
        addClass(STYLES.BASE + ' ' + STYLES.THEME_PREFIX + this._options.theme + ' ' + STYLES.LAYOUT_PREFIX + this._options.layout, this.main);

        // Set display mode
        this.setColorScheme();
    }

    private setColorScheme(): void {
        const mode = this._options.colorScheme;

        // Remove existing data-color-scheme attribute
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
                this.binder.bind(mediaQuery, 'change', handleChange as EventListener);
            }
        }
    }

    private setNav(): void {
        this.stateManager.reset(this._options);
        this.navScroll.create();
    }

    private setEvents(): void {
        // Step anchor click
        this.stepItems.forEach(({ step }, idx) => {
            const handler = (e: Event) => {
                e.preventDefault();
                if (!this._options.navigation.enabled) return;
                if (this.navigator.isShowable(idx)) {
                    this.showStep(idx);
                }
            };
            this.binder.bind(step, EVENTS.CLICK, handler);
        });

        // Next / Prev / Scroll buttons (event delegation on main)
        const mainClickHandler = (e: Event) => {
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
                    this.navScroll.scroll(e.target.dataset.scrollAction as 'prev' | 'next');
                }
            }
        };
        this.binder.bind(this.main, EVENTS.CLICK, mainClickHandler);

        // Scroll end check on nav
        const scrollEndHandler = () => this.navScroll.check();
        this.binder.bind(this.nav, EVENTS.SCROLLEND, scrollEndHandler);

        // Redirect vertical wheel scroll to horizontal on nav
        const wheelHandler = (e: WheelEvent) => {
            if (this.nav.scrollWidth <= this.nav.clientWidth) return;
            if (e.deltaY === 0) return;
            e.preventDefault();
            this.nav.scrollLeft += e.deltaY;
        };
        this.binder.bind(this.nav, EVENTS.WHEEL, wheelHandler as EventListener, { passive: false });

        // Keyboard navigation
        if (this._options.keyboardNavigation.enabled) {
            const keyupHandler = (e: Event) => {
                if (!(e instanceof KeyboardEvent)) return;

                // Ignore key events when focus is inside an input/textarea/select
                const tag = (e.target as HTMLElement)?.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

                const key = e as KeyboardEvent;
                if (this._options.keyboardNavigation.keys.left.includes(key.key)) {
                    this.navigate(STEP_DIRECTION.BACKWARD);
                } else if (this._options.keyboardNavigation.keys.right.includes(key.key)) {
                    this.navigate(STEP_DIRECTION.FORWARD);
                }
            };
            this.binder.bind(document, EVENTS.KEYUP, keyupHandler);
        }

        // Browser back/forward
        if (this._options.behavior.useUrlHash && this._options.behavior.supportBrowserHistory) {
            const hashChangeHandler = () => {
                const idx = this.getURLHashIndex();
                if (idx !== null && this.navigator.isShowable(idx)) {
                    this.showStep(idx);
                }
            };
            this.binder.bind(window, EVENTS.HASHCHANGE, hashChangeHandler);
        }

        // Fix height on window resize
        if (this._options.behavior.autoHeight) {
            const resizeHandler = () => {
                if (this._activeIndex >= 0 && this.stepItems[this._activeIndex]) {
                    this.recalculateHeight(this._activeIndex);
                }
            };
            this.binder.bind(window, EVENTS.RESIZE, resizeHandler);
        }

        // Swipe navigation on touch
        const touchStartHandler = (e: Event) => {
            const touch = (e as TouchEvent).touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        };
        this.binder.bind(this.container, EVENTS.TOUCHSTART, touchStartHandler);

        const touchEndHandler = (e: Event) => {
            if (!this._options.swipeNavigation.enabled) return;
            const touch = (e as TouchEvent).changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            // Ignore mostly-vertical swipes
            if (Math.abs(deltaX) < Math.abs(deltaY)) return;
            const { threshold } = this._options.swipeNavigation;
            if (deltaX < -threshold) {
                this.navigate(STEP_DIRECTION.FORWARD);
            } else if (deltaX > threshold) {
                this.navigate(STEP_DIRECTION.BACKWARD);
            }
        };
        this.binder.bind(this.container, EVENTS.TOUCHEND, touchEndHandler);
    }

    private setAnchor(stepIdx: number): void {
        this.stateManager.setAnchor(stepIdx, this._activeIndex, this._options);
    }

    private setButtons(stepPosition: StepPosition): void {
        this.navButtons.prev.forEach(btn => {
            if (stepPosition === STEP_POSITION.FIRST) setAttribute(btn, 'disabled', 'disabled');
            else btn.removeAttribute('disabled');
        });
        this.navButtons.next.forEach(btn => {
            if (stepPosition === STEP_POSITION.LAST) setAttribute(btn, 'disabled', 'disabled');
            else btn.removeAttribute('disabled');
        });
    }

    private setProgressbar(stepIdx: number): void {
        this.progressBar.update(stepIdx, this.stepItems.length);
    }

    private async showStep(stepIdx: number): Promise<void> {
        if (stepIdx === -1 || stepIdx === null) return;
        if (stepIdx === this._activeIndex) return;
        const selItem = this.stepItems[stepIdx];
        if (!selItem) return;
        if (!this.navigator.isEnabled(selItem.step)) return;

        const stepDirection = this.navigator.getDirection(stepIdx);

        // Run onBeforeShow hooks — any extension can cancel by returning false
        const allowed = await this.registry.runBeforeShow(this, {
            stepIdx,
            activeIndex: this._activeIndex,
            direction: stepDirection,
        });
        if (!allowed) return;

        if (this._activeIndex !== -1) {
            const leaveArgs: LeaveStepEventArgs = {
                stepIndex: this._activeIndex,
                nextStepIndex: stepIdx,
                stepElement: this.stepItems[this._activeIndex]?.step ?? null,
                stepDirection,
                stepPosition: this.navigator.getPosition(this._activeIndex),
            };
            if (!this.emitter.emit('leaveStep', leaveArgs, { cancelable: true })) return;
        }

        // Load content if contentLoader is set
        this.loadContent(stepIdx, () => {
            const { step: selStep, page: selPage } = this.stepItems[stepIdx];

            // Update URL hash
            if (this._options.behavior.useUrlHash && this._options.behavior.supportBrowserHistory) {
                const hash = getAttribute(selStep, 'href');
                if (hash) this.setURLHash(hash);
            }

            // Update anchor classes
            this.setAnchor(stepIdx);

            // Scroll step into view
            if (this._options.scrollToView) {
                this.navScroll.scrollToStep(stepIdx);
            }

            // Get pages
            const curPage = this.stepItems[this._activeIndex]?.page ?? null;

            // Perform transition
            const transition: TransitionHandler = (transitions as any)[this._options.transition.effect]
                || (transitions as any)['default'];

            console.log('transition', this._options.transition.effect, transitions)
            transition(selPage, curPage, stepDirection, this, () => {
                // Fix height
                if (this._options.behavior.autoHeight) {
                    this.recalculateHeight(stepIdx);
                }

                // Trigger showStep event
                const stepArgs: StepEventArgs = {
                    stepIndex: stepIdx,
                    stepElement: selStep,
                    stepDirection,
                    stepPosition: this.navigator.getPosition(stepIdx),
                };
                this.emitter.emit('showStep', stepArgs);

                // Fire onAfterShow hooks
                this.registry.runSync('onAfterShow', this, { stepIdx, direction: stepDirection });
            });

            // Update active index
            this._activeIndex = stepIdx;
            // Update buttons
            const stepPosition = this.navigator.getPosition(stepIdx);
            this.setButtons(stepPosition);
            // Update progress bar
            this.setProgressbar(stepIdx);
        });
    }


    private loadContent(idx: number, callback: () => void): void {
        if (!this._options.contentLoader || typeof this._options.contentLoader !== 'function') {
            callback();
            return;
        }

        const selItem = this.stepItems[idx];
        if (!selItem) { callback(); return; }
        const { step: selStep, page: selPage } = selItem;

        const stepDirection = this.navigator.getDirection(idx);
        const stepPosition = this.navigator.getPosition(idx);

        this._options.contentLoader(idx, stepDirection, stepPosition, selStep, (content) => {
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
        const stepIndex = this.navigator.nextShowable(this._activeIndex, direction);
        if (stepIndex !== null) this.showStep(stepIndex);
    }

    private navigateToIndex(stepIndex: number): void {
        if (this.navigator.isShowable(stepIndex)) this.showStep(stepIndex);
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

    private recalculateHeight(stepIdx: number): void {
        const page = this.stepItems[stepIdx]?.page;
        if (!page) return;
        const h = getElementHeight(page);
        setElementHeight(this.container, h || 'auto');
    }

    // ─── Extension System ─────────────────────────────────────────────────────

    /**
     * Register one or more extensions. Safe to call before or after init().
     * Returns `this` for fluent chaining.
     */
    public extend(...exts: WizardExtension[]): this {
        this.registry.register(this, ...exts);
        return this;
    }

    // ─── Public Methods ───────────────────────────────────────────────────────

    /** Index of the active step */
    get activeIndex(): number {
        return this._activeIndex >= 0 ? this._activeIndex : 0;
    }

    /** Length of the steps */
    get stepLength(): number {
        return this.stepItems.length;
    }

    // ─── Step Fluent API ──────────────────────────────────────────────────────

    /**
     * Return a `WizardStep` wrapper for the step at the given index.
     * @example wizard.step(2).disable();
     * @example wizard.step(0).complete().show();
     */
    public step(index: number): WizardStep {
        const item = this.stepItems[index];
        if (!item) throw new Error(`SmartWizard: Step index ${index} is out of range (0–${this.stepItems.length - 1}).`);
        return new WizardStep(index, item, () => this._activeIndex);
    }

    /**
     * Return a `WizardStepCollection` for the given indices.
     * When called with no arguments, wraps **all** steps.
     * @example wizard.steps([1, 2, 3]).disable();
     * @example wizard.steps().reset();
     */
    public steps(indexes?: number[]): WizardStepCollection {
        const wizardSteps = indexes
            ? indexes.map(i => this.step(i))
            : this.stepItems.map((_, i) => this.step(i));
        return new WizardStepCollection(wizardSteps);
    }

    /** The currently active step as a `WizardStep` object. */
    get activeStep(): WizardStep {
        const idx = this._activeIndex >= 0 ? this._activeIndex : 0;
        return this.step(idx);
    }

    /**
     * Current progress as a percentage (0–100).
     * 0% on the first step, 100% on the last step.
     */
    get progress(): number {
        const total = this.stepItems.length;
        if (total <= 1) return 100;
        const idx = this._activeIndex >= 0 ? this._activeIndex : 0;
        return Math.round((idx / (total - 1)) * 100);
    }

    /** `true` if there is a showable step after the current one. */
    get canGoNext(): boolean {
        return this.navigator.nextShowable(this._activeIndex, STEP_DIRECTION.FORWARD) !== null;
    }

    /** `true` if there is a showable step before the current one. */
    get canGoPrev(): boolean {
        return this.navigator.nextShowable(this._activeIndex, STEP_DIRECTION.BACKWARD) !== null;
    }

    /** Configuration */
    get options(): Readonly<WizardOptions> {
        return this._options;
    }

    get width(): number {
        return this.main.offsetWidth;
    }

    get height(): number {
        return this.main.offsetHeight;
    }

    /** Returns an aggregated snapshot of the wizard's current runtime state. */
    get info(): WizardInfo {
        return {
            stepInfo: {
                currentStep: this._activeIndex >= 0 ? this._activeIndex : 0,
                totalSteps: this.stepItems.length
            },
            contentDirection: this.contentDirection || CONTENT_DIRECTION.LEFT_TO_RIGHT,
            layout: this._options.layout,
            colorScheme: this._options.colorScheme,
            width: this.main.offsetWidth,
            height: this.main.offsetHeight,
        };
    }

    public next(): void {
        this.navigate(STEP_DIRECTION.FORWARD);
    }

    public prev(): void {
        this.navigate(STEP_DIRECTION.BACKWARD);
    }

    public first(): void {
        this.navigateToIndex(0);
    }

    public last(): void {
        this.navigateToIndex(this.stepItems.length - 1);
    }

    public goTo(stepIndex: number, options?: { force?: boolean }): void {
        const { force = false } = options || {};
        if (!force && !this.navigator.isShowable(stepIndex)) return;

        // Mark previous steps as completed when forced
        if (force && stepIndex > 0 && this._options.navigation.completed.enabled
            && this._options.navigation.completed.completeAllPreviousSteps) {
            this.stepItems.slice(0, stepIndex).forEach(({ step }) => {
                addClass(STYLES.STATES.COMPLETED, step);
            });
        }

        this.showStep(stepIndex);
    }

    public reset(): void {
        const { COMPLETED, ACTIVE, ERROR, WARNING } = STYLES.STATES;
        this.stepItems.forEach(({ step }) => removeClass(`${COMPLETED} ${ACTIVE} ${ERROR} ${WARNING}`, step));

        if (this._options.behavior.useUrlHash && this._options.behavior.supportBrowserHistory) {
            this.setURLHash('#');
        }

        this.init();
        this.load();
    }


    public setOptions(options: Partial<WizardOptions>): void {
        this._options = OptionsParser.parse(this.main, { ...this._options, ...options });
        this.init();
        this.load();
    }

    public getOptions(): WizardOptions {
        return this._options;
    }

    /**
     * Controls the wizard loading overlay.
     *
     * @example
     * wizard.loader.show();
     * // ... async work ...
     * wizard.loader.hide();
     */
    get loader(): WizardLoader {
        return {
            show: () => addClass(STYLES.LOADER, this.main),
            hide: () => removeClass(STYLES.LOADER, this.main),
        };
    }

    public updateHeight(): void {
        this.recalculateHeight(this._activeIndex);
    }

    public on<K extends keyof WizardEvents>(
        eventName: K,
        callback: EventCallback<WizardEvents[K]>
    ): this {
        this.emitter.on(eventName, callback);
        return this;
    }

    public off<K extends keyof WizardEvents>(
        eventName: K,
        callback?: EventCallback<WizardEvents[K]>
    ): this {
        this.emitter.off(eventName, callback);
        return this;
    }

    public once<K extends keyof WizardEvents>(
        eventName: K,
        callback: EventCallback<WizardEvents[K]>
    ): this {
        this.emitter.once(eventName, callback);
        return this;
    }

    /**
     * Destroy the wizard and remove all event listeners and styles
     */
    public destroy(): void {
        // Notify extensions before teardown
        this.registry.runSync('onDestroy', this);
        this.registry.clear();

        // Remove all tracked DOM event listeners
        this.binder.unbindAll();

        // Clear internal event listener registry
        this.emitter.clear();

        // Remove injected scroll-button elements from the nav bar
        this.navScroll.destroy();

        // Restore all step and page elements to their initial visual state
        this.stepItems.forEach(({ step, page }) => {
            removeClass(
                [STYLES.STATES.ACTIVE, STYLES.STATES.COMPLETED, STYLES.STATES.DEFAULT,
                STYLES.STATES.DISABLED, STYLES.STATES.ERROR, STYLES.STATES.WARNING,
                STYLES.STATES.HIDDEN].join(' '),
                step
            );
            page.style.removeProperty('display');
            page.style.removeProperty('height');
        });

        // Remove wizard CSS classes and attributes from the main element
        Array.from(this.main.classList)
            .filter(cls => cls.startsWith(STYLES.THEME_PREFIX) || cls.startsWith(STYLES.LAYOUT_PREFIX) || cls === STYLES.BASE || cls === STYLES.LOADER)
            .forEach(cls => this.main.classList.remove(cls));
        this.main.removeAttribute(DATA_ATTRIBUTES.COLOR_SCHEME);

        // Reset container inline height
        this.container.style.removeProperty('height');

        // Reset internal state flags
        this._activeIndex = -1;
        this.isInitialized = false;
    }
}
