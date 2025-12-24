import { TransitionCallback, Transitions, WizardInterface } from './types';
import { hideElement, showElement } from './util';

const createFadeAnimation = (element: HTMLElement, fadeIn: boolean, callback?: TransitionCallback): void => {
    const duration = 400;
    const startOpacity = fadeIn ? 0 : 1;
    const endOpacity = fadeIn ? 1 : 0;

    element.style.opacity = startOpacity.toString();
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    // Trigger reflow
    requestAnimationFrame(() => {
        element.style.opacity = endOpacity.toString();
    });

    setTimeout(() => {
        if (!fadeIn) {
            element.style.display = 'none';
        }
        element.style.transition = '';
        if (callback) callback();
    }, duration);
};

export const transitions: Transitions = {
    none: (elmToShow: HTMLElement, elmToHide: HTMLElement | null, _stepDirection: string, _wizard: WizardInterface, callback: TransitionCallback): void => {
        if (elmToHide) {
            hideElement(elmToHide);
        }
        showElement(elmToShow);
        callback();
    },

    fade: (elmToShow: HTMLElement, elmToHide: HTMLElement | null, _stepDirection: string, _wizard: WizardInterface, callback: TransitionCallback): void => {
        if (elmToHide) {
            createFadeAnimation(elmToHide, false, () => {
                createFadeAnimation(elmToShow, true, callback);
            });
        } else {
            createFadeAnimation(elmToShow, true, callback);
        }
    },

    slideHorizontal: (elmToShow: HTMLElement, elmToHide: HTMLElement | null, stepDirection: string, _wizard: WizardInterface, callback: TransitionCallback): void => {
        const duration = 400;
        const isForward = stepDirection === 'forward';

        if (!elmToHide) {
            showElement(elmToShow);
            callback();
            return;
        }

        const container = elmToHide.parentElement;
        if (!container) {
            callback();
            return;
        }

        // Setup initial styles
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        const setupElement = (el: HTMLElement, initial: boolean): void => {
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.width = '100%';
            el.style.transition = `transform ${duration}ms ease-in-out`;
            el.style.transform = `translateX(${initial ? '0' : (isForward ? '100%' : '-100%')})`;
            el.style.display = 'block';
        };

        setupElement(elmToHide, true);
        setupElement(elmToShow, false);

        // Force reflow
        requestAnimationFrame(() => {
            // Trigger animation
            elmToHide.style.transform = `translateX(${isForward ? '-100%' : '100%'})`;
            elmToShow.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            // Cleanup
            [elmToHide, elmToShow].forEach(el => {
                el.style.position = '';
                el.style.top = '';
                el.style.width = '';
                el.style.transition = '';
                el.style.transform = '';
            });
            container.style.position = '';
            container.style.overflow = '';

            hideElement(elmToHide);
            showElement(elmToShow);
            callback();
        }, duration);
    },

    slideVertical: (elmToShow: HTMLElement, elmToHide: HTMLElement | null, stepDirection: string, _wizard: WizardInterface, callback: TransitionCallback): void => {
        const duration = 400;
        const isForward = stepDirection === 'forward';

        if (!elmToHide) {
            showElement(elmToShow);
            callback();
            return;
        }

        const container = elmToHide.parentElement;
        if (!container) {
            callback();
            return;
        }

        // Setup initial styles
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        const setupElement = (el: HTMLElement, initial: boolean) => {
            el.style.position = 'absolute';
            el.style.left = '0';
            el.style.width = '100%';
            el.style.transition = `transform ${duration}ms ease-in-out`;
            el.style.transform = `translateY(${initial ? '0' : (isForward ? '100%' : '-100%')})`;
            el.style.display = 'block';
        };

        setupElement(elmToHide, true);
        setupElement(elmToShow, false);

        // Force reflow
        requestAnimationFrame(() => {
            // Trigger animation
            elmToHide.style.transform = `translateY(${isForward ? '-100%' : '100%'})`;
            elmToShow.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            // Cleanup
            [elmToHide, elmToShow].forEach(el => {
                el.style.position = '';
                el.style.left = '';
                el.style.width = '';
                el.style.transition = '';
                el.style.transform = '';
            });
            container.style.position = '';
            container.style.overflow = '';

            hideElement(elmToHide);
            showElement(elmToShow);
            callback();
        }, duration);
    },

    slideSwing: (elmToShow: HTMLElement, elmToHide: HTMLElement | null, stepDirection: string, wizard: WizardInterface, callback: TransitionCallback): void => {
        // Similar to slideHorizontal but with swing easing
        transitions.slideHorizontal(elmToShow, elmToHide, stepDirection, wizard, callback);
    },

    css: (elmToShow: HTMLElement, elmToHide: HTMLElement | null, stepDirection: string, wizard: WizardInterface, callback: TransitionCallback): void => {
        const { transition } = wizard.options;
        const isForward = stepDirection === 'forward';
        const showClass = isForward ? transition.fwdShowCss : transition.bckShowCss;
        const hideClass = isForward ? transition.fwdHideCss : transition.bckHideCss;
        const speed = parseInt(transition.speed || '400');

        if (elmToHide && hideClass) {
            elmToHide.classList.add(hideClass);
            setTimeout(() => {
                hideElement(elmToHide);
                elmToHide.classList.remove(hideClass);
            }, speed);
        } else if (elmToHide) {
            hideElement(elmToHide);
        }

        if (showClass) {
            elmToShow.classList.add(showClass);
        }
        showElement(elmToShow);

        setTimeout(() => {
            if (showClass) {
                elmToShow.classList.remove(showClass);
            }
            callback();
        }, speed);
    }
};
