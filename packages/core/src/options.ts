import { WizardOptions } from './types';

export const defaultOptions: WizardOptions = {
    selected: 0,
    theme: 'default',
    justified: true,
    autoAdjustHeight: true,
    backButtonSupport: true,
    enableUrlHash: true,
    transition: {
        animation: 'none',
        speed: '400',
        easing: '',
        prefixCss: '',
        fwdShowCss: '',
        fwdHideCss: '',
        bckShowCss: '',
        bckHideCss: '',
    },
    toolbar: {
        position: 'bottom',
        showNextButton: true,
        showPreviousButton: true,
        extraHtml: ''
    },
    anchor: {
        enableNavigation: true,
        enableNavigationAlways: false,
        enableDoneState: true,
        markPreviousStepsAsDone: true,
        unDoneOnBackNavigation: false,
        enableDoneStateNavigation: true
    },
    keyboard: {
        keyNavigation: true,
        keyLeft: [37],
        keyRight: [39]
    },
    lang: {
        next: 'Next',
        previous: 'Previous'
    },
    style: {
        mainCss: 'sw',
        navCss: 'nav',
        stepCss: 'nav-item',
        contentCss: 'tab-content',
        contentPanelCss: 'tab-pane',
        themePrefixCss: 'sw-theme-',
        anchorDefaultCss: 'default',
        anchorDoneCss: 'done',
        anchorActiveCss: 'active',
        anchorDisabledCss: 'disabled',
        anchorHiddenCss: 'hidden',
        anchorErrorCss: 'error',
        anchorWarningCss: 'warning',
        justifiedCss: 'sw-justified',
        btnCss: 'sw-btn',
        btnNextCss: 'sw-btn-next',
        btnPrevCss: 'sw-btn-prev',
        loaderCss: 'sw-loading',
        progressCss: 'progress',
        progressBarCss: 'progress-bar',
        toolbarCss: 'toolbar',
        toolbarPrefixCss: 'toolbar-',
    },
    disabledSteps: [],
    errorSteps: [],
    warningSteps: [],
    hiddenSteps: [],
};
