import { TransitionHandler, TransitionCallback, StepDirection, WizardInterface } from './types';
import {
    showElement, hideElement, getElementHeight, setElementHeight, setElementWidth, getElementWidth
} from './util';

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

        const show = () => fadeIn(next, speed, callback);
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
        const { speed } = wizard.options.transition;
        const containerWidth = wizard.options ? getElementWidth(wizard.pages[0]?.parentElement ?? document.body) : 400;

        const animate = (el: HTMLElement, from: number, to: number, dur: number, done: () => void) => {
            el.style.position = 'absolute';
            el.style.left = `${from}px`;
            showElement(el);
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.left = `${from + (to - from) * p}px`;
                if (p < 1) requestAnimationFrame(tick);
                else { el.style.left = ''; el.style.position = ''; done(); }
            };
            requestAnimationFrame(tick);
        };

        if (current) {
            const finalCurrent = containerWidth * (stepDirection === 'backward' ? 1 : -1);
            animate(current, 0, finalCurrent, speed, () => hideElement(current));
        }

        const initialNext = containerWidth * (stepDirection === 'backward' ? -1 : 1);
        animate(next, initialNext, 0, speed, callback);
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
        const { speed } = wizard.options.transition;
        const containerHeight = wizard.pages[0]?.parentElement?.offsetHeight ?? 400;

        const animate = (el: HTMLElement, from: number, to: number, dur: number, done: () => void) => {
            el.style.position = 'absolute';
            el.style.top = `${from}px`;
            showElement(el);
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                el.style.top = `${from + (to - from) * p}px`;
                if (p < 1) requestAnimationFrame(tick);
                else { el.style.top = ''; el.style.position = ''; done(); }
            };
            requestAnimationFrame(tick);
        };

        if (current) {
            const finalCurrent = containerHeight * (stepDirection === 'backward' ? 1 : -1);
            animate(current, 0, finalCurrent, speed, () => hideElement(current));
        }

        const initialNext = containerHeight * (stepDirection === 'backward' ? -1 : 1);
        animate(next, initialNext, 0, speed, callback);
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
        const { css, speed } = wizard.options.transition;
        const { prefix, forward, backward } = css;
        const isForward = stepDirection === 'forward';
        const showClass = (prefix ? prefix + ' ' : '') + (isForward ? forward.show : backward.show);
        const hideClass = (prefix ? prefix + ' ' : '') + (isForward ? forward.hide : backward.hide);

        if (!showClass.trim()) {
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
            animateCss(next, showClass, () => callback());
        };

        if (current && hideClass.trim()) {
            animateCss(current, hideClass, () => {
                hideElement(current);
                show();
            });
        } else {
            if (current) hideElement(current);
            show();
        }
    }
};
