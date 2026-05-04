import type { WizardExtension } from '@smartwizard/core';

export interface SwipeOptions {
    /**
     * Minimum horizontal distance in pixels to register as a swipe.
     * @default 50
     */
    threshold?: number;
}

/**
 * Touch Swipe Navigation Extension for SmartWizard.
 *
 * Attaches `touchstart` / `touchend` listeners to the wizard's content
 * container and calls `wizard.next()` / `wizard.prev()` on a horizontal swipe.
 * Vertical swipes are ignored so normal page scrolling is not affected.
 *
 * @example
 * ```ts
 * import { SmartWizard } from '@smartwizard/core';
 * import { createSwipeExtension } from '@smartwizard/extension-swipe';
 *
 * const wizard = new SmartWizard('#wizard', options)
 *   .extend(createSwipeExtension({ threshold: 60 }));
 * ```
 */
export function createSwipeExtension(options: SwipeOptions = {}): WizardExtension {
    const { threshold = 50 } = options;

    let touchStartX = 0;
    let touchStartY = 0;
    let onTouchStart: ((e: TouchEvent) => void) | null = null;
    let onTouchEnd: ((e: TouchEvent) => void) | null = null;

    return {
        name: 'swipe',

        onInstall(wizard) {
            onTouchStart = (e: TouchEvent) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            };

            onTouchEnd = (e: TouchEvent) => {
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;

                // Ignore swipes that are more vertical than horizontal
                if (Math.abs(deltaX) < Math.abs(deltaY)) return;
                // Ignore swipes shorter than the threshold
                if (Math.abs(deltaX) < threshold) return;

                if (deltaX < 0) {
                    wizard.next(); // swipe left → forward
                } else {
                    wizard.prev(); // swipe right → backward
                }
            };

            wizard.container.addEventListener('touchstart', onTouchStart);
            wizard.container.addEventListener('touchend', onTouchEnd);
        },

        onDestroy(wizard) {
            if (onTouchStart) {
                wizard.container.removeEventListener('touchstart', onTouchStart);
                onTouchStart = null;
            }
            if (onTouchEnd) {
                wizard.container.removeEventListener('touchend', onTouchEnd);
                onTouchEnd = null;
            }
        },
    };
}
