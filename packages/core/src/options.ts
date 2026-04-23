import { WizardOptions } from './types';

export const defaultOptions: WizardOptions = {
    initialStep: 0, // Initial selected step (0 = first step)
    theme: 'default', // Theme name, ensure related CSS is included
    colorScheme: 'auto', // auto (system preference) | dark | light | none (no class applied)
    layout: 'horizontal', // Layout: horizontal | vertical
    color: 'default', // Color preset: default | blue | violet | any custom string
    behavior: {
        autoHeight: true, // Auto-adjust content height
        useUrlHash: false, // Enable step selection via URL hash
        supportBrowserHistory: false // Enable browser history support
    },
    navigation: {
        enabled: true, // Enable/Disable anchor navigation
        alwaysClickable: false, // Allow clicking on any anchor at any time
        completed: {
            enabled: true, // Mark visited steps as completed
            completeAllPreviousSteps: true, // Mark all previous steps as completed when using URL hash
            clearOnBack: false, // Clear completed state when navigating back
            clickable: true // Allow navigation via completed state steps
        }
    },
    transition: {
        effect: 'default', // Transition type: default|fade|slideHorizontal|slideVertical|slideSwing|css
        speed: 400, // Animation speed
        easing: '', // Animation easing
        css: { // Settings for CSS transitions
            prefix: '', // CSS animation prefix
            forward: { show: '', hide: '' }, // Forward animation classes
            backward: { show: '', hide: '' } // Backward animation classes
        }
    },
    keyboardNavigation: {
        enabled: true, // Enable/Disable keyboard navigation (left/right keys)
        keys: {
            left: [37], // Left key codes
            right: [39] // Right key codes
        }
    },
    stepStates: {
        completed: [], // Completed steps
        disabled: [], // Disabled steps
        hidden: [], // Hidden steps
        error: [], // Steps with errors
        warning: [], // Warning steps
    },
    swipeNavigation: {
        enabled: false, // Enable/Disable swipe navigation on touch devices
        threshold: 50, // Minimum swipe distance in pixels to trigger navigation
    },
    scrollToView: true, // Scroll the active step anchor into view on step change
    contentLoader: null // Callback function for dynamically loading content
};
