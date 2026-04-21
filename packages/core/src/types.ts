// Types for SmartWizard

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

// skip // Skipped state <<<== upcoming

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
        left: number[];
        right: number[];
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

export interface StepEventArgs {
    stepIndex: number;
    stepElement: HTMLElement | null;
    stepDirection: StepDirection;
    stepPosition: StepPosition;
}

export interface LeaveStepEventArgs extends StepEventArgs {
    nextStepIndex: number;
}

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

export interface WizardInterface {
    options: WizardOptions;
    stepItems: StepItem[];
    currentIndex: number;
}

export interface StepInfo {
    currentStep: number;
    totalSteps: number;
}

export interface Transitions {
    [key: string]: TransitionHandler;
}
