// Core types for SmartWizard
export interface TransitionOptions {
    animation: 'none' | 'fade' | 'slideHorizontal' | 'slideVertical' | 'slideSwing' | 'css';
    speed: string;
    easing: string;
    prefixCss?: string;
    fwdShowCss: string;
    fwdHideCss: string;
    bckShowCss: string;
    bckHideCss: string;
}

export interface ToolbarOptions {
    position: 'none' | 'top' | 'bottom' | 'both';
    showNextButton: boolean;
    showPreviousButton: boolean;
    extraHtml: string;
}

export interface AnchorOptions {
    enableNavigation: boolean;
    enableNavigationAlways: boolean;
    enableDoneState: boolean;
    markPreviousStepsAsDone: boolean;
    unDoneOnBackNavigation: boolean;
    enableDoneStateNavigation: boolean;
}

export interface KeyboardOptions {
    keyNavigation: boolean;
    keyLeft: number[];
    keyRight: number[];
}

export interface LanguageOptions {
    next: string;
    previous: string;
}

export interface StyleOptions {
    mainCss: string;
    navCss: string;
    stepCss: string;
    contentCss: string;
    contentPanelCss: string;
    themePrefixCss: string;
    anchorDefaultCss: string;
    anchorDoneCss: string;
    anchorActiveCss: string;
    anchorDisabledCss: string;
    anchorHiddenCss: string;
    anchorErrorCss: string;
    anchorWarningCss: string;
    justifiedCss: string;
    btnCss: string;
    btnNextCss: string;
    btnPrevCss: string;
    loaderCss: string;
    progressCss: string;
    progressBarCss: string;
    toolbarCss: string;
    toolbarPrefixCss: string;
}

export interface WizardOptions {
    selected: number;
    theme: string;
    justified: boolean;
    autoAdjustHeight: boolean;
    backButtonSupport: boolean;
    enableUrlHash: boolean;
    transition: TransitionOptions;
    toolbar: ToolbarOptions;
    anchor: AnchorOptions;
    keyboard: KeyboardOptions;
    lang: LanguageOptions;
    style: StyleOptions;
    disabledSteps: number[];
    errorSteps: number[];
    warningSteps: number[];
    hiddenSteps: number[];
    getContent?: (
        idx: number,
        stepDirection: string,
        stepPosition: string,
        selStep: HTMLElement,
        callback: (content: any) => void
    ) => void;
}

export interface WizardState {
    currentStepIndex: number;
    totalSteps: number;
    isNavigating: boolean;
}

export interface WizardInterface {
    options: WizardOptions;
    steps: HTMLElement[];
    pages: HTMLElement[];
    currentIndex: number;
}

export interface Transitions {
    [key: string]: (
        elmToShow: HTMLElement,
        elmToHide: HTMLElement | null,
        stepDirection: string,
        wizard: WizardInterface,
        callback: TransitionCallback
    ) => void;
}

export type TransitionCallback = () => void;

export type StepDirection = 'forward' | 'backward' | 'none';
export type StepState = 'default' | 'active' | 'done' | 'disabled' | 'hidden' | 'error' | 'warning';

export interface StepInfo {
    currentStep: number;
    totalSteps: number;
}

export interface StepChangeEventDetail {
    step: number;
    direction: StepDirection;
    element: HTMLElement;
}

export interface LoaderOptions {
    show: boolean;
    message?: string;
}
