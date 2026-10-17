/**
 * Events used on the plugin
 */
export const EVENTS = {
    // DOM Events
    CLICK: `click`,
    KEYUP: `keyup`,
    HASHCHANGE: `hashchange`,
    SCROLLEND: `scrollend`,
    WHEEL: `wheel`,
    RESIZE: `resize`,
    ANIMATIONEND: `animationend`,
    ANIMATIONCANCEL: `animationcancel`,
    TOUCHSTART: `touchstart`,
    TOUCHEND: `touchend`,

    // SmartWizard Custom Events
    INITIALIZED: `initialized`,
    LOADED: `loaded`,
    LEAVESTEP: `leave`,
    SHOWSTEP: `shown`,
} as const;

export const STEP_DIRECTION = {
    FORWARD: "forward",
    BACKWARD: "backward",
} as const;

export const CONTENT_DIRECTION = {
    LEFT_TO_RIGHT: "ltr",
    RIGHT_TO_LEFT: "rtl",
} as const;

export const STEP_POSITION = {
    FIRST: "first",
    MIDDLE: "middle",
    LAST: "last",
} as const;

export const LAYOUT = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical"
} as const;

/**
 * CSS Custom Properties
 */
export const CSS_PROPERTIES = {
    PROGRESS_PERCENTAGE: '--sw-progress-percentage',
};

/**
 * Data attributes used
 */
export const DATA_ATTRIBUTES = {
    THEME: 'data-theme',
    COLOR_SCHEME: 'data-color-scheme', // auto | dark | light | none
    COLOR: 'data-color', // default | any string
    LAYOUT: 'data-layout', // horizontal | vertical
    TRANSITION: 'data-transition',
    INITIAL_STEP: 'data-initial-step',
    START_STEP: 'data-start-step',
};

export const STYLES = {
    BASE: 'sw',
    NAVIGATION: {
        CONTAINER: 'sw-nav',
        ITEM: 'sw-nav-item',
    },
    CONTENT: {
        CONTAINER: 'sw-panels',
        PANEL: 'sw-panel'
    },
    THEME_PREFIX: 'sw-theme-',
    LAYOUT_PREFIX: 'sw-layout-',
    STATES: {
        DEFAULT: 'default',
        COMPLETED: 'completed',
        ACTIVE: 'active',
        DISABLED: 'disabled',
        HIDDEN: 'hidden',
        ERROR: 'error',
        WARNING: 'warning'
    },
    BUTTONS: {
        BASE: 'sw-btn',
        NEXT: 'sw-btn-next',
        PREVIOUS: 'sw-btn-prev',
        RESET: 'sw-btn-reset',
        SCROLL: 'sw-nav-scroll-btn',
    },
    LOADER: 'sw-loading',
    PROGRESSBAR: {
        CONTAINER: 'sw-progress',
        BAR: 'sw-progress-bar'
    },
    TOOLBAR: {
        BASE: 'sw-toolbar',
        PREFIX: 'sw-toolbar-'
    }
};
