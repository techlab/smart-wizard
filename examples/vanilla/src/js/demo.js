'use strict';
// DEMO PAGE JS
// ── Dark mode toggle ──
const STORAGE_KEY = 'swx-example-theme'; // 'dark' | 'light' | 'auto'
const osPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
var displayMode;

/**
 * Apply a theme ('dark' | 'light') to the document and optionally
 * sync the SmartWizard instance.
 */
function applyTheme(isDark) {
    document.body.dataset.uiTheme = isDark ? 'dark' : 'light';

    const colorScheme = isDark ? 'dark' : 'light';
    var wizardIndex = 1;
    while (typeof window["wizard" + wizardIndex] !== 'undefined') {
        window["wizard" + wizardIndex].setOptions({ colorScheme: colorScheme });
        wizardIndex++;
    }
}

// ── Demo navigation
const demoNavs = document.getElementById('demo-nav');
const demoList = {
    'Main': 'index.html',
    // 'Ajax': 'ajax.html',
    // 'Validation': 'validation.html',
    // 'RTL': 'rtl.html',
    // 'Multiple': 'multiple.html',
};
if (demoNavs) {
    let activePage = window.location.pathname.split('/').pop();
    Object.entries(demoList).forEach(([key, value]) => {
        const btn = document.createElement('a');
        btn.textContent = key;
        btn.href = value;
        btn.classList.add('header-btn');
        if (typeof activePage !== 'undefined' && value === activePage) {
            btn.href = '#';
            btn.classList.add('active')
        };
        demoNavs.appendChild(btn);
    });
}

/**
 * Update the grouped toggle buttons to reflect the current preference.
 * The matching button receives the 'active' class; others are cleared.
 */
function updateToggleButtons(pref) {
    ['auto', 'dark', 'light'].forEach((mode) => {
        const btn = document.getElementById('toggle-' + mode);
        if (btn) btn.classList.toggle('active', mode === pref);
    });
}

// ── Initialise on load ──
function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'auto'; // default: auto
    const isDark = saved === 'dark' || (saved === 'auto' && osPrefersDark());
    displayMode = isDark ? 'dark' : 'light';
    applyTheme(isDark);
    updateToggleButtons(saved);
};

// ── OS theme-change listener (only active when preference is 'auto') ──
const mq = window.matchMedia('(prefers-color-scheme: dark)');
mq.addEventListener('change', (e) => {
    if ((localStorage.getItem(STORAGE_KEY) || 'auto') === 'auto') {
        applyTheme(e.matches);
    }
});

// ── Grouped toggle buttons: each directly sets its mode ──
['auto', 'dark', 'light'].forEach((mode) => {
    const btn = document.getElementById('toggle-' + mode);
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (mode === 'auto') {
            localStorage.removeItem(STORAGE_KEY); // let OS decide
        } else {
            localStorage.setItem(STORAGE_KEY, mode);
        }
        const isDark = mode === 'dark' || (mode === 'auto' && osPrefersDark());
        applyTheme(isDark);
        updateToggleButtons(mode);
    });
});

window.addEventListener("load", initTheme);
