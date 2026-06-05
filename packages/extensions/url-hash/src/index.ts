import type { WizardExtension, WizardInterface } from '@smart-wizard/core';

export interface UrlHashOptions {
    /**
     * Push step changes to browser history so back/forward buttons work.
     * Set to `false` to use `location.hash` (replaces history instead).
     * @default true
     */
    supportHistory?: boolean;
}

/**
 * URL Hash Extension for SmartWizard.
 *
 * - Reads `window.location.hash` on load and navigates to the matching step.
 * - Updates the URL hash after every step change.
 * - Listens to `hashchange` so the browser back/forward buttons work.
 *
 * @example
 * ```ts
 * import { SmartWizard } from '@smart-wizard/core';
 * import { createUrlHashExtension } from '@smart-wizard/extension-url-hash';
 *
 * const wizard = new SmartWizard('#wizard', options)
 *   .extend(createUrlHashExtension({ supportHistory: true }));
 * ```
 */
export function createUrlHashExtension(options: UrlHashOptions = {}): WizardExtension {
    const { supportHistory = true } = options;

    let hashChangeHandler: (() => void) | null = null;

    /** Find the step index whose nav-item `href` matches the given hash string. */
    function findStepByHash(wizard: WizardInterface, hash: string): number | null {
        for (let i = 0; i < wizard.stepItems.length; i++) {
            if (wizard.stepItems[i].step.getAttribute('href') === hash) return i;
        }
        return null;
    }

    /** Write the current step's href to the URL, using pushState or location.hash. */
    function updateUrl(wizard: WizardInterface, stepIdx: number): void {
        const href = wizard.stepItems[stepIdx]?.step.getAttribute('href');
        if (!href) return;

        if (supportHistory && window.history?.pushState) {
            window.history.pushState(null, '', href);
        } else {
            // Avoid polluting history — only update the fragment
            window.location.replace(
                window.location.pathname + window.location.search + href
            );
        }
    }

    return {
        name: 'url-hash',

        onLoad(wizard) {
            // On first load, jump to the hash-targeted step if the URL has one.
            const hash = window.location.hash;
            if (hash) {
                const idx = findStepByHash(wizard, hash);
                if (idx !== null && idx !== wizard.currentIndex) {
                    wizard.goToStep(idx);
                }
            }

            // Set up the hashchange listener for browser back/forward navigation.
            // Guard against double-registration (e.g. after setOptions / reset).
            if (hashChangeHandler) return;

            hashChangeHandler = () => {
                const h = window.location.hash;
                if (!h) return;
                const i = findStepByHash(wizard, h);
                if (i !== null && i !== wizard.currentIndex) {
                    wizard.goToStep(i);
                }
            };

            window.addEventListener('hashchange', hashChangeHandler);
        },

        onAfterShow(wizard, { stepIdx }) {
            updateUrl(wizard, stepIdx);
        },

        onDestroy() {
            if (hashChangeHandler) {
                window.removeEventListener('hashchange', hashChangeHandler);
                hashChangeHandler = null;
            }
        },
    };
}
