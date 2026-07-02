// Types for SmartWizard

import { SmartWizard } from "./SmartWizard";

export type ContentDirection = "ltr" | "rtl";
export type ColorScheme = 'auto' | 'dark' | 'light' | 'none';
export type WizardLayout = 'horizontal' | 'vertical';
export type WizardColor = 'default' | 'blue' | 'violet' | string;
export type StepDirection = 'forward' | 'backward' | 'none';
export type StepPosition = 'first' | 'middle' | 'last';
export type StepState =
    | 'default'    // Default initial state
    | 'active'     // Current step
    | 'completed'  // Successfully visited
    | 'disabled'   // Not allowed to visit
    | 'hidden'     // Conditionally not shown
    | 'error'      // Validation failed
    | 'warning';   // Soft validation warning

// Types for the wizard options
export interface WizardOptions {
    initialStep: number;
    theme: string;
    colorScheme: ColorScheme;
    layout: WizardLayout;
    color: WizardColor;
    behavior: Behavior;
    navigation: Navigation;
    transition: Transition;
    keyboardNavigation: KeyboardNavigation;
    stepStates: {
        completed: number[];
        disabled: number[];
        hidden: number[];
        error: number[];
        warning: number[];
    };
    swipeNavigation: SwipeNavigation;
    scrollToView: boolean;
    contentLoader: ContentLoader | null;
}

export interface Behavior {
    autoHeight: boolean;
    useUrlHash: boolean;
    supportBrowserHistory: boolean;
}

export interface Navigation {
    enabled: boolean;
    alwaysClickable: boolean;
    completed: {
        enabled: boolean;
        completeAllPreviousSteps: boolean;
        clearOnBack: boolean;
        clickable: boolean;
    };
}

export interface Transition {
    effect: 'default' | 'fade' | 'slideHorizontal' | 'slideVertical' | 'slideSwing' | 'css' | string;
    speed: number;
    easing: string;
    css: {
        prefix: string;
        forward: {
            show: string;
            hide: string;
        };
        backward: {
            show: string;
            hide: string;
        };
    };
}

export interface KeyboardNavigation {
    enabled: boolean;
    keys: {
        left: string[];
        right: string[];
    };
}

export interface SwipeNavigation {
    enabled: boolean;
    threshold: number; // Minimum px distance to trigger a swipe
}

export type ContentLoader = (
    stepIndex: number,
    stepDirection: StepDirection,
    stepPosition: StepPosition,
    stepElement: HTMLElement,
    callback: (content: string | Node) => void
) => void;

export type TransitionCallback = () => void;
export interface TransitionHandler {
    (
        next: HTMLElement,
        current: HTMLElement | null,
        stepDirection: StepDirection,
        wizard: WizardInterface,
        callback: TransitionCallback
    ): void;
}

export interface StepItem {
    step: HTMLElement;
    page: HTMLElement;
}

// ─── Step Fluent API Interfaces ───────────────────────────────────────────────

/**
 * Contract for a single wizard step wrapper.
 * Implemented by `WizardStep`. Declared here to avoid circular imports
 * between `types.ts` ↔ `WizardStep.ts`.
 */
export interface IWizardStep {
    /** Zero-based index of this step. */
    readonly index: number;
    /** The nav anchor `<a>` / `<button>` element. */
    readonly element: HTMLElement;
    /** The content panel element. */
    readonly page: HTMLElement;

    // ── State queries ──────────────────────────────────────────────────────
    /** Returns `true` if the given state class is applied. */
    hasState(state: StepState): boolean;
    /** Returns `true` if this is the currently active step. */
    isActive(): boolean;
    /** Returns `true` if the step has the `disabled` state. */
    isDisabled(): boolean;
    /** Returns `true` if the step has the `completed` state. */
    isCompleted(): boolean;
    /** Returns `true` if the step has the `hidden` state. */
    isHidden(): boolean;

    // ── State mutations (all return `this` for fluent chaining) ────────────
    state(s: StepState): this;
    removeState(s: StepState): this;
    /** Remove **all** state classes from this step. */
    reset(): this;
    disable(): this;
    enable(): this;
    complete(): this;
    warning(): this;
    error(): this;
    show(): this;
    hide(): this;
}

/**
 * Contract for a collection of wizard steps supporting bulk operations.
 * Implemented by `WizardStepCollection`.
 */
export interface IWizardStepCollection {
    /** Number of steps in the collection. */
    readonly length: number;

    // ── Bulk state mutations (all return `this` for fluent chaining) ───────
    state(s: StepState): this;
    removeState(s: StepState): this;
    /** Clear all state classes from every step in the collection. */
    reset(): this;
    disable(): this;
    enable(): this;
    complete(): this;
    warning(): this;
    error(): this;
    show(): this;
    hide(): this;
}

/** Controls the wizard's loading overlay. */
export interface WizardLoader {
    /** Show the loading overlay (`sw-loading` class on the root element). */
    show(): void;
    /** Hide the loading overlay. */
    hide(): void;
}

/**
 * The public API surface that extensions receive in every hook.
 * Extension packages should depend on this interface rather than
 * the concrete `SmartWizard` class, keeping the dependency graph clean.
 */
export interface WizardInterface {
    // ── State ────────────────────────────────────────────────────────────
    readonly options: WizardOptions;
    readonly stepItems: StepItem[];
    readonly activeIndex: number;
    /** The currently active step as a `WizardStep` object. */
    readonly activeStep: IWizardStep;
    /** Current progress as a percentage (0–100). 0% on the first step, 100% on the last. */
    readonly progress: number;
    /** `true` if there is a showable step after the current one. */
    readonly canGoNext: boolean;
    /** `true` if there is a showable step before the current one. */
    readonly canGoPrev: boolean;

    // ── Root elements ────────────────────────────────────────────────────
    readonly main: HTMLElement;
    readonly container: HTMLElement;

    // ── Navigation ───────────────────────────────────────────────────────
    next(): void;
    prev(): void;
    goTo(stepIndex: number, options?: { force?: boolean }): void;
    reset(): void;

    // ── Step fluent API ───────────────────────────────────────────────────
    /**
     * Return a `WizardStep` wrapper for the step at the given index.
     * @example wizard.step(2).disable();
     */
    step(index: number): IWizardStep;
    /**
     * Return a `WizardStepCollection` for the given indices, or **all** steps
     * if no indices are provided.
     * @example wizard.steps([1, 2, 3]).disable();
     * @example wizard.steps().reset();
     */
    steps(indexes?: number[]): IWizardStepCollection;

    // ── Layout ───────────────────────────────────────────────────────────
    readonly width: number;
    readonly height: number;
    updateHeight(): void;

    // ── Info ─────────────────────────────────────────────────────────────
    readonly info: WizardInfo;

    // ── Loader ───────────────────────────────────────────────────────────
    /** Controls the wizard loading overlay. */
    readonly loader: WizardLoader;
}

export interface StepInfo {
    currentStep: number;
    totalSteps: number;
}

/** Aggregated snapshot of the wizard's current runtime state. */
export interface WizardInfo {
    /** Current and total step counts. */
    stepInfo: StepInfo;
    /** Text flow direction of the wizard content area. */
    contentDirection: ContentDirection;
    /** Active layout mode. */
    layout: WizardLayout;
    /** Active color scheme. */
    colorScheme: ColorScheme;
    /** Width of the root wizard element in pixels. */
    width: number;
    /** Height of the root wizard element in pixels. */
    height: number;
}

export interface Transitions {
    [key: string]: TransitionHandler;
}

// ─── Extension System ─────────────────────────────────────────────────────────

/** Arguments passed to `onBeforeShow`. */
export interface ExtensionBeforeShowArgs {
    /** Index of the step about to be shown. */
    stepIdx: number;
    /** Index of the step that is currently active (-1 on initial load). */
    activeIndex: number;
    /** Direction of the navigation. */
    direction: StepDirection;
}

/** Arguments passed to `onAfterShow`. */
export interface ExtensionAfterShowArgs {
    /** Index of the step that was just shown. */
    stepIdx: number;
    /** Direction of the navigation. */
    direction: StepDirection;
}

/**
 * A `WizardExtension` is a plain object that hooks into the SmartWizard lifecycle.
 * All hooks are optional.
 *
 * @example
 * const myExtension: WizardExtension = {
 *   name: 'my-extension',
 *   onBeforeShow(wizard, { stepIdx, direction }) {
 *     if (!validate(stepIdx)) return false; // cancel navigation
 *   },
 * };
 * wizard.extend(myExtension);
 */
export interface WizardExtension {
    /** Unique identifier — used to prevent duplicate registration. */
    readonly name: string;

    /**
     * Called once immediately after the extension is registered via `extend()`.
     * Use this to set up any state your extension needs.
     */
    onInstall?(wizard: WizardInterface): void;

    /**
     * Called every time `init()` runs: on construction, after `setOptions()`, and after `reset()`.
     * Use this to re-apply DOM mutations that init() might have undone.
     */
    onInit?(wizard: WizardInterface): void;

    /**
     * Called after the wizard finishes loading and the first step is shown.
     * Fires on construction and after `setOptions()` / `reset()`.
     */
    onLoad?(wizard: WizardInterface): void;

    /**
     * Called just before a step transition begins.
     * Return `false` or `Promise<false>` to **cancel** the navigation.
     *
     * @example Async validation
     * async onBeforeShow(wizard, { stepIdx, activeIndex }) {
     *   const ok = await myApi.validateStep(activeIndex);
     *   if (!ok) return false;
     * }
     */
    onBeforeShow?(
        wizard: WizardInterface,
        args: ExtensionBeforeShowArgs
    ): Promise<boolean | void> | boolean | void;

    /**
     * Called after a step transition completes and the new page is visible.
     */
    onAfterShow?(
        wizard: WizardInterface,
        args: ExtensionAfterShowArgs
    ): void;

    /**
     * Called when `destroy()` is invoked on the wizard.
     * Use this to clean up any resources your extension allocated.
     */
    onDestroy?(wizard: WizardInterface): void;
}

export interface StepEventArgs {
    stepIndex: number;
    stepElement: HTMLElement | null;
    stepDirection: StepDirection;
    stepPosition: StepPosition;
}

export interface LeaveStepEventArgs extends StepEventArgs {
    nextStepIndex: number;
}

export interface WizardEvents {
    initialized: {
        wizard: SmartWizard;
    };

    loaded: {
        wizard: SmartWizard;
    };

    showStep: StepEventArgs;

    leaveStep: LeaveStepEventArgs;

    stepChanged: {
        currentStep: number;
        previousStep: number;
    };
}

export type EventCallback<T = any> = (event: CustomEvent<T>) => void;