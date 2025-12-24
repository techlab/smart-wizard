import { WizardOptions, WizardInterface, StepInfo, StepState, StepDirection } from './types';
import { defaultOptions } from './options';
import { transitions } from './transitions';
import {
    addClass, removeClass, hasClass, addEvent, hideElement, showElement,
    getAllDescendants, getFirstDescendant, getAttribute, getElementHeight,
    setElementHeight, dispatchEvent, deepMerge, setAttribute
} from './util';

export class SmartWizard implements WizardInterface {
    main: HTMLElement;
    nav: HTMLElement;
    container: HTMLElement;
    steps: HTMLElement[];
    pages: HTMLElement[];
    progressbar: HTMLElement[];
    toolbar: HTMLElement | null = null;
    currentIndex: number;
    isInitialized: boolean;
    options: WizardOptions;

    constructor(selector: string | HTMLElement, options: Partial<WizardOptions> = {}, autoload = true) {
        // Initialize main element
        const mainElement = typeof selector === 'string'
            ? document.querySelector(selector) as HTMLElement
            : selector;

        if (!mainElement) {
            throw new Error('SmartWizard: Main element not found');
        }
        this.main = mainElement;

        // Get nav and container elements
        const nav = getFirstDescendant('.nav', this.main);
        const container = getFirstDescendant('.tab-content', this.main);

        if (!nav || !container) {
            throw new Error('SmartWizard: Required elements not found. Make sure .nav and .tab-content elements exist.');
        }

        this.nav = nav;
        this.container = container;
        this.currentIndex = -1;
        this.isInitialized = false;

        // Deep merge options with defaults
        this.options = deepMerge({ ...defaultOptions }, options);

        // Initialize arrays
        this.steps = getAllDescendants('.nav-link', this.nav);
        this.pages = getAllDescendants('.tab-pane', this.container);
        this.progressbar = getAllDescendants('.progress-bar', this.main);

        if (autoload) {
            this.init();
        }
    }

    init(): void {
        if (this.isInitialized) {
            return;
        }

        // Apply theme
        if (this.options.theme && this.options.theme !== 'default') {
            addClass(`${this.options.style.themePrefixCss}${this.options.theme}`, this.main);
        }

        // Apply justified class
        if (this.options.justified) {
            addClass(this.options.style.justifiedCss, this.nav);
        }

        // Hide all pages initially
        this.pages.forEach(hideElement);

        // Remove active and done classes from steps
        this.steps.forEach(step => {
            removeClass(`${this.options.style.anchorDoneCss} ${this.options.style.anchorActiveCss}`, step);
        });

        // Apply initial step states
        this.#applyStepStates();

        // Create toolbar if needed
        if (this.options.toolbar.position !== 'none') {
            this.#createToolbar();
        }

        // Show selected step
        const selectedStep = Math.max(0, Math.min(this.options.selected, this.steps.length - 1));
        this.#showStep(selectedStep);

        // Bind events
        this.#bindEvents();

        this.isInitialized = true;

        // Trigger initialized event
        dispatchEvent(this.main, 'initialized', {
            detail: { wizard: this }
        });
    }

    #applyStepStates(): void {
        // Apply disabled steps
        this.options.disabledSteps.forEach(idx => {
            if (this.steps[idx]) {
                addClass(this.options.style.anchorDisabledCss, this.steps[idx]);
            }
        });

        // Apply hidden steps
        this.options.hiddenSteps.forEach(idx => {
            if (this.steps[idx]) {
                addClass(this.options.style.anchorHiddenCss, this.steps[idx]);
            }
        });

        // Apply error steps
        this.options.errorSteps.forEach(idx => {
            if (this.steps[idx]) {
                addClass(this.options.style.anchorErrorCss, this.steps[idx]);
            }
        });

        // Apply warning steps
        this.options.warningSteps.forEach(idx => {
            if (this.steps[idx]) {
                addClass(this.options.style.anchorWarningCss, this.steps[idx]);
            }
        });
    }

    #createToolbar(): void {
        const toolbarHtml = `
      <div class="${this.options.style.toolbarCss} ${this.options.style.toolbarPrefixCss}${this.options.toolbar.position}">
        ${this.options.toolbar.showPreviousButton ? `<button class="${this.options.style.btnCss} ${this.options.style.btnPrevCss}" type="button">${this.options.lang.previous}</button>` : ''}
        ${this.options.toolbar.extraHtml}
        ${this.options.toolbar.showNextButton ? `<button class="${this.options.style.btnCss} ${this.options.style.btnNextCss}" type="button">${this.options.lang.next}</button>` : ''}
      </div>
    `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = toolbarHtml;
        const toolbar = tempDiv.firstElementChild as HTMLElement;

        if (toolbar) {
            if (this.options.toolbar.position === 'top' || this.options.toolbar.position === 'both') {
                this.main.insertBefore(toolbar.cloneNode(true), this.main.firstChild);
            }
            if (this.options.toolbar.position === 'bottom' || this.options.toolbar.position === 'both') {
                this.main.appendChild(toolbar);
            }

            // Bind toolbar button events
            const prevButtons = getAllDescendants(`.${this.options.style.btnPrevCss}`, this.main);
            const nextButtons = getAllDescendants(`.${this.options.style.btnNextCss}`, this.main);

            prevButtons.forEach(btn => {
                addEvent(btn, 'click', () => this.prev());
            });

            nextButtons.forEach(btn => {
                addEvent(btn, 'click', () => this.next());
            });
        }
    }

    #bindEvents(): void {
        // Step click events
        this.steps.forEach((step, idx) => {
            addEvent(step, 'click', (e: Event) => {
                e.preventDefault();
                if (this.#isStepClickable(idx)) {
                    this.goToStep(idx);
                }
            });
        });

        // Keyboard navigation
        if (this.options.keyboard.keyNavigation) {
            addEvent(document, 'keyup', (e: Event) => {
                const keyEvent = e as KeyboardEvent;
                if (this.options.keyboard.keyLeft.includes(keyEvent.keyCode)) {
                    this.prev();
                } else if (this.options.keyboard.keyRight.includes(keyEvent.keyCode)) {
                    this.next();
                }
            });
        }

        // Handle hash changes
        if (this.options.enableUrlHash && this.options.backButtonSupport) {
            addEvent(window, 'hashchange', () => {
                const hash = window.location.hash;
                const stepIndex = this.steps.findIndex(s => getAttribute(s, 'href') === hash);
                if (stepIndex >= 0 && this.#isStepClickable(stepIndex)) {
                    this.#showStep(stepIndex);
                }
            });
        }

        // Handle window resize for auto height adjustment
        if (this.options.autoAdjustHeight) {
            addEvent(window, 'resize', () => {
                if (this.currentIndex >= 0) {
                    const currentPage = this.pages[this.currentIndex];
                    if (currentPage) {
                        this.#adjustHeight(currentPage);
                    }
                }
            });
        }
    }

    #showStep(idx: number, force: boolean = false): void {
        if (idx < 0 || idx >= this.steps.length) {
            return;
        }

        // Check if navigation is allowed
        if (!force && !this.#isStepClickable(idx)) {
            return;
        }

        const curStep = this.steps[this.currentIndex];
        const selStep = this.steps[idx];
        const curPage = this.pages[this.currentIndex];
        const selPage = this.pages[idx];

        if (!selStep || !selPage) {
            return;
        }

        // Get the direction of step navigation
        const stepDirection: StepDirection = this.currentIndex < idx ? 'forward' : this.currentIndex > idx ? 'backward' : 'none';

        // Trigger before step change event
        const beforeEvent = dispatchEvent(this.main, 'leaveStep', {
            detail: {
                fromStep: this.currentIndex,
                toStep: idx,
                direction: stepDirection
            },
            cancelable: true
        });

        if (!beforeEvent) {
            return; // Event was cancelled
        }

        // Update navigation classes
        if (curStep) {
            removeClass(this.options.style.anchorActiveCss, curStep);
            if (this.options.anchor.enableDoneState) {
                if (stepDirection === 'forward' && this.options.anchor.markPreviousStepsAsDone) {
                    addClass(this.options.style.anchorDoneCss, curStep);
                } else if (stepDirection === 'backward' && this.options.anchor.unDoneOnBackNavigation) {
                    removeClass(this.options.style.anchorDoneCss, curStep);
                }
            }
        }

        // Mark all previous steps as done if needed
        if (this.options.anchor.markPreviousStepsAsDone && stepDirection === 'forward') {
            for (let i = 0; i < idx; i++) {
                if (this.steps[i]) {
                    addClass(this.options.style.anchorDoneCss, this.steps[i]);
                }
            }
        }

        removeClass(this.options.style.anchorDoneCss, selStep);
        addClass(this.options.style.anchorActiveCss, selStep);

        // Get transition type
        const transition = transitions[this.options.transition.animation] || transitions.none;

        // Perform transition
        transition(selPage, curPage || null, stepDirection, this, () => {
            this.currentIndex = idx;
            this.#updateProgress();

            // Update URL hash if available
            if (this.options.enableUrlHash) {
                const href = getAttribute(selStep, 'href');
                if (href) {
                    this.#setURLHash(href);
                }
            }

            // Adjust container height
            if (this.options.autoAdjustHeight) {
                this.#adjustHeight(selPage);
            }

            // Update toolbar buttons
            this.#updateToolbarButtons();

            // Trigger step change event
            dispatchEvent(this.main, 'showStep', {
                detail: {
                    step: idx,
                    direction: stepDirection,
                    element: selStep
                }
            });
        });
    }

    #adjustHeight(element: HTMLElement): void {
        const height = getElementHeight(element);
        if (height) {
            setElementHeight(this.container, height);
        }
    }

    #updateProgress(): void {
        if (this.progressbar.length === 0) return;

        const stepCount = this.steps.length;
        const currentStep = this.currentIndex + 1;
        const percent = (currentStep / stepCount) * 100;

        this.progressbar.forEach(bar => {
            bar.style.width = `${percent}%`;
            setAttribute(bar, 'aria-valuenow', percent.toString());
        });
    }

    #updateToolbarButtons(): void {
        const prevButtons = getAllDescendants(`.${this.options.style.btnPrevCss}`, this.main);
        const nextButtons = getAllDescendants(`.${this.options.style.btnNextCss}`, this.main);

        prevButtons.forEach(btn => {
            if (this.currentIndex === 0) {
                setAttribute(btn, 'disabled', 'disabled');
            } else {
                btn.removeAttribute('disabled');
            }
        });

        nextButtons.forEach(btn => {
            if (this.currentIndex === this.steps.length - 1) {
                setAttribute(btn, 'disabled', 'disabled');
            } else {
                btn.removeAttribute('disabled');
            }
        });
    }

    #setURLHash(hash: string): void {
        if (window.history && window.history.pushState) {
            window.history.pushState(null, '', hash);
        } else {
            window.location.hash = hash;
        }
    }

    #isStepClickable(idx: number): boolean {
        const step = this.steps[idx];
        if (!step) return false;

        // Check if step is disabled or hidden
        if (hasClass(this.options.style.anchorDisabledCss, step) ||
            hasClass(this.options.style.anchorHiddenCss, step)) {
            return false;
        }

        // Check navigation settings
        if (!this.options.anchor.enableNavigation) {
            return false;
        }

        if (this.options.anchor.enableNavigationAlways) {
            return true;
        }

        // Check if step is done or active
        if (hasClass(this.options.style.anchorDoneCss, step) ||
            hasClass(this.options.style.anchorActiveCss, step)) {
            return this.options.anchor.enableDoneStateNavigation;
        }

        // Only allow forward navigation to next step
        return idx === this.currentIndex + 1;
    }

    // Public methods
    public next(): void {
        this.#showStep(this.currentIndex + 1);
    }

    public prev(): void {
        this.#showStep(this.currentIndex - 1);
    }

    public goToStep(index: number, force: boolean = false): void {
        this.#showStep(index, force);
    }

    public reset(): void {
        this.currentIndex = -1;
        this.isInitialized = false;

        // Remove all state classes
        this.steps.forEach(step => {
            removeClass(`${this.options.style.anchorActiveCss} ${this.options.style.anchorDoneCss}`, step);
        });

        this.init();
    }

    public getStepInfo(): StepInfo {
        return {
            currentStep: this.currentIndex,
            totalSteps: this.steps.length
        };
    }

    public setState(steps: number[], state: StepState): void {
        const stateClass = this.#getStateClass(state);
        if (!stateClass) return;

        steps.forEach(idx => {
            if (this.steps[idx]) {
                addClass(stateClass, this.steps[idx]);
            }
        });
    }

    public unsetState(steps: number[], state: StepState): void {
        const stateClass = this.#getStateClass(state);
        if (!stateClass) return;

        steps.forEach(idx => {
            if (this.steps[idx]) {
                removeClass(stateClass, this.steps[idx]);
            }
        });
    }

    public setOptions(options: Partial<WizardOptions>): void {
        this.options = deepMerge({ ...this.options }, options);

        // Re-initialize if needed
        if (this.isInitialized) {
            this.isInitialized = false;
            this.init();
        }
    }

    public getOptions(): WizardOptions {
        return { ...this.options };
    }

    public loader(action: 'show' | 'hide'): void {
        const loader = getFirstDescendant(`.${this.options.style.loaderCss}`, this.main);

        if (action === 'show') {
            if (!loader) {
                const loaderHtml = `<div class="${this.options.style.loaderCss}"></div>`;
                this.main.insertAdjacentHTML('beforeend', loaderHtml);
            } else {
                showElement(loader);
            }
        } else {
            if (loader) {
                hideElement(loader);
            }
        }
    }

    public fixHeight(): void {
        const currentPage = this.pages[this.currentIndex];
        if (currentPage) {
            this.#adjustHeight(currentPage);
        }
    }

    #getStateClass(state: StepState): string {
        switch (state) {
            case 'active': return this.options.style.anchorActiveCss;
            case 'done': return this.options.style.anchorDoneCss;
            case 'disabled': return this.options.style.anchorDisabledCss;
            case 'hidden': return this.options.style.anchorHiddenCss;
            case 'error': return this.options.style.anchorErrorCss;
            case 'warning': return this.options.style.anchorWarningCss;
            default: return this.options.style.anchorDefaultCss;
        }
    }
}
