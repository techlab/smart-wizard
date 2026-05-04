import { STEP_DIRECTION } from './constants';
import { TransitionHandler, TransitionCallback, StepDirection, WizardInterface } from './types';
import { showElement, hideElement, isSafeCssClass } from './util';

export const transitions: Record<string, TransitionHandler> = {
    /**
     * Default transition: simple show/hide
     */
    default: (
        next: HTMLElement,
        current: HTMLElement | null,
        _stepDirection: StepDirection,
        _wizard: WizardInterface,
        callback: TransitionCallback
    ): void => {
        if (current) hideElement(current);
        showElement(next);
        callback();
    },

    /**
     * Fade transition
     */
    fade: (
        next: HTMLElement,
        current: HTMLElement | null,
        stepDirection: StepDirection,
        wizard: WizardInterface,
        callback: TransitionCallback
    ): void => {
        const { speed } = wizard.options.transition;

        const fadeIn = (el: HTMLElement, dur: number, done: () => void) => {
            el.style.opacity = '0';
            showElement(el);
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.opacity = String(p);
                if (p < 1) requestAnimationFrame(tick);
                else { el.style.opacity = ''; done(); }
            };
            requestAnimationFrame(tick);
        };

        const fadeOut = (el: HTMLElement, dur: number, done: () => void) => {
            const start = performance.now();
            el.style.opacity = '1';
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.opacity = String(1 - p);
                if (p < 1) requestAnimationFrame(tick);
                else { el.style.opacity = ''; hideElement(el); done(); }
            };
            requestAnimationFrame(tick);
        };

        const show = () => { if (next) { fadeIn(next, speed, callback) } };
        if (current) {
            fadeOut(current, speed, show);
        } else {
            show();
        }
    },

    /**
     * Horizontal slide transition
     */
    slideHorizontal: (
        next: HTMLElement,
        current: HTMLElement | null,
        stepDirection: StepDirection,
        wizard: WizardInterface,
        callback: TransitionCallback
    ): void => {
        if (!next) {
            transitions.default(next, current, stepDirection, wizard, callback);
            return;
        }
        const { speed } = wizard.options.transition;
        const container = next.parentElement;
        const containerOffsetWidth = container ? container.offsetWidth : 400;

        // Read the container's padding so we can position pages exactly where they
        // appear in normal flow (left = padL, width = content area width).
        const cs = container ? getComputedStyle(container) : null;
        const padL = cs ? parseFloat(cs.paddingLeft) || 0 : 0;
        const padR = cs ? parseFloat(cs.paddingRight) || 0 : 0;
        const padT = cs ? parseFloat(cs.paddingTop) || 0 : 0;
        const contentWidth = container ? container.clientWidth - padL - padR : containerOffsetWidth;

        // Pin the container so it doesn't collapse when children become position:absolute
        if (container) {
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.style.width = `${containerOffsetWidth}px`;
        }

        let pending = current ? 2 : 1;
        const cleanup = () => {
            if (--pending > 0) return;
            if (container) {
                container.style.position = '';
                container.style.overflow = '';
                container.style.width = '';
            }
            callback();
        };

        // 'from' and 'to' are relative offsets from the natural resting position (padL).
        const animate = (el: HTMLElement, from: number, to: number, dur: number, done: () => void) => {
            el.style.position = 'absolute';
            el.style.top = `${padT}px`;
            el.style.width = `${contentWidth}px`;
            el.style.left = `${padL + from}px`;
            showElement(el);
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.left = `${padL + from + (to - from) * p}px`;
                if (p < 1) requestAnimationFrame(tick);
                else {
                    el.style.left = '';
                    el.style.top = '';
                    el.style.width = '';
                    el.style.position = '';
                    done();
                }
            };
            requestAnimationFrame(tick);
        };

        if (current) {
            const finalCurrent = contentWidth * (stepDirection === 'backward' ? 1 : -1);
            animate(current, 0, finalCurrent, speed, () => { hideElement(current); cleanup(); });
        }

        const initialNext = contentWidth * (stepDirection === 'backward' ? -1 : 1);
        animate(next, initialNext, 0, speed, cleanup);
    },

    /**
     * Vertical slide transition
     */
    slideVertical: (
        next: HTMLElement,
        current: HTMLElement | null,
        stepDirection: StepDirection,
        wizard: WizardInterface,
        callback: TransitionCallback
    ): void => {
        if (!next) {
            transitions.default(next, current, stepDirection, wizard, callback);
            return;
        }
        const { speed } = wizard.options.transition;
        const container = next.parentElement;
        const containerOffsetWidth = container ? container.offsetWidth : 400;
        const containerOffsetHeight = container ? container.offsetHeight : 400;

        // Read the container's padding so we can position pages exactly where they
        // appear in normal flow (top = padT, left = padL, size = content area).
        const cs = container ? getComputedStyle(container) : null;
        const padL = cs ? parseFloat(cs.paddingLeft) || 0 : 0;
        const padR = cs ? parseFloat(cs.paddingRight) || 0 : 0;
        const padT = cs ? parseFloat(cs.paddingTop) || 0 : 0;
        const padB = cs ? parseFloat(cs.paddingBottom) || 0 : 0;
        const contentWidth = container ? container.clientWidth - padL - padR : containerOffsetWidth;
        const contentHeight = container ? container.clientHeight - padT - padB : containerOffsetHeight;

        // Pin the container so it doesn't collapse when children become position:absolute
        if (container) {
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.style.width = `${containerOffsetWidth}px`;
            container.style.height = `${containerOffsetHeight}px`;
        }

        let pending = current ? 2 : 1;
        const cleanup = () => {
            if (--pending > 0) return;
            if (container) {
                container.style.position = '';
                container.style.overflow = '';
                container.style.width = '';
                container.style.height = '';
            }
            callback();
        };

        // 'from' and 'to' are relative offsets from the natural resting position (padT).
        const animate = (el: HTMLElement, from: number, to: number, dur: number, done: () => void) => {
            el.style.position = 'absolute';
            el.style.left = `${padL}px`;
            el.style.width = `${contentWidth}px`;
            el.style.top = `${padT + from}px`;
            showElement(el);
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.top = `${padT + from + (to - from) * p}px`;
                if (p < 1) requestAnimationFrame(tick);
                else {
                    el.style.top = '';
                    el.style.left = '';
                    el.style.width = '';
                    el.style.position = '';
                    done();
                }
            };
            requestAnimationFrame(tick);
        };

        if (current) {
            const finalCurrent = contentHeight * (stepDirection === 'backward' ? 1 : -1);
            animate(current, 0, finalCurrent, speed, () => { hideElement(current); cleanup(); });
        }

        const initialNext = contentHeight * (stepDirection === 'backward' ? -1 : 1);
        animate(next, initialNext, 0, speed, cleanup);
    },

    /**
     * Swing slide transition (slide up/down)
     */
    slideSwing: (
        next: HTMLElement,
        current: HTMLElement | null,
        stepDirection: StepDirection,
        wizard: WizardInterface,
        callback: TransitionCallback
    ): void => {
        if (!next) {
            transitions.default(next, current, stepDirection, wizard, callback);
            return;
        }
        const { speed } = wizard.options.transition;

        const slideUp = (el: HTMLElement, dur: number, done: () => void) => {
            const startH = el.offsetHeight;
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.height = `${startH * (1 - p)}px`;
                el.style.overflow = 'hidden';
                if (p < 1) requestAnimationFrame(tick);
                else { el.style.height = ''; el.style.overflow = ''; hideElement(el); done(); }
            };
            requestAnimationFrame(tick);
        };

        const slideDown = (el: HTMLElement, dur: number, done: () => void) => {
            showElement(el);
            const targetH = el.scrollHeight;
            el.style.height = '0';
            el.style.overflow = 'hidden';
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.height = `${targetH * p}px`;
                if (p < 1) requestAnimationFrame(tick);
                else { el.style.height = ''; el.style.overflow = ''; done(); }
            };
            requestAnimationFrame(tick);
        };

        const show = () => slideDown(next, speed, callback);
        if (current) {
            slideUp(current, speed, show);
        } else {
            show();
        }
    },

    /**
     * CSS animation transition
     */
    css: (
        next: HTMLElement,
        current: HTMLElement | null,
        stepDirection: StepDirection,
        wizard: WizardInterface,
        callback: TransitionCallback
    ): void => {
        if (!next) {
            transitions.default(next, current, stepDirection, wizard, callback);
            return;
        }
        const { css, speed } = wizard.options.transition;
        const { prefix, forward, backward } = css;
        const isForward = stepDirection === STEP_DIRECTION.FORWARD;
        const rawShow = (prefix ? prefix + ' ' : '') + (isForward ? forward.show : backward.show);
        const rawHide = (prefix ? prefix + ' ' : '') + (isForward ? forward.hide : backward.hide);

        // Guard against CSS class name injection
        const safeShow = rawShow.split(' ').filter(isSafeCssClass).join(' ');
        const safeHide = rawHide.split(' ').filter(isSafeCssClass).join(' ');

        if (!safeShow.trim()) {
            transitions.default(next, current, stepDirection, wizard, callback);
            return;
        }

        const animateCss = (el: HTMLElement, animation: string, done: (reason?: string) => void) => {
            if (!animation || !animation.trim()) { done(); return; }
            showElement(el);
            let called = false;
            const finish = (reason?: string) => {
                if (called) return;
                called = true;
                animation.split(' ').filter(Boolean).forEach(c => el.classList.remove(c));
                done(reason);
            };
            animation.split(' ').filter(Boolean).forEach(c => el.classList.add(c));
            el.addEventListener('animationend', () => finish(), { once: true });
            el.addEventListener('animationcancel', () => finish('cancel'), { once: true });
            // Fallback timeout
            setTimeout(() => finish('timeout'), speed + 100);
        };

        const show = () => {
            animateCss(next, safeShow, () => callback());
        };

        if (current && safeHide.trim()) {
            animateCss(current, safeHide, () => {
                hideElement(current);
                show();
            });
        } else {
            if (current) hideElement(current);
            show();
        }
    }
};

/**
 * Register a custom transition effect.
 *
 * @param name    - Unique transition name used in `options.transition.effect`.
 * @param handler - The transition function to execute.
 *
 * @example
 * import { registerTransition } from '@smartwizard/core';
 *
 * registerTransition('myFlip', (next, current, direction, wizard, done) => {
 *   // your animation logic
 *   done();
 * });
 *
 * new SmartWizard('#wz', { transition: { effect: 'myFlip' } });
 */
export function registerTransition(name: string, handler: TransitionHandler): void {
    if (typeof name !== 'string' || !name.trim()) {
        throw new Error('SmartWizard: transition name must be a non-empty string');
    }
    if (typeof handler !== 'function') {
        throw new Error(`SmartWizard: transition handler for "${name}" must be a function`);
    }
    if (transitions[name]) {
        console.warn(`SmartWizard: overwriting existing transition "${name}"`);
    }
    transitions[name] = handler;
}
