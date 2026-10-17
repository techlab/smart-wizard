import { StepItem, WizardLayout } from './types';
import { getAllDescendants } from './util';
import { STYLES, LAYOUT } from './constants';

/**
 * Nav-scroll module for SmartWizard
 */
export class NavScroll {
    constructor(
        private readonly nav: HTMLElement,
        private readonly getLayout: () => WizardLayout,
        private readonly getStepItems: () => StepItem[]
    ) { }

    /**
     * Inject scroll-arrow buttons into the nav and run an initial visibility check.
     * Removes any previously injected buttons first so it is safe to call on re-init.
     */
    create(): void {
        // Remove existing buttons to prevent duplicates on re-init
        this.destroy();

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = STYLES.BUTTONS.SCROLL;
        prevBtn.setAttribute('aria-label', 'Scroll left');
        prevBtn.dataset.scrollAction = 'prev';

        const nextBtn = prevBtn.cloneNode(true) as HTMLButtonElement;
        nextBtn.setAttribute('aria-label', 'Scroll right');
        nextBtn.dataset.scrollAction = 'next';

        this.nav.prepend(prevBtn);
        this.nav.append(nextBtn);

        this.check();
    }

    /**
     * Show or hide the scroll buttons based on whether the nav overflows.
     */
    check(): void {
        const buttons = getAllDescendants(`.${STYLES.BUTTONS.SCROLL}`, this.nav);
        const isVertical = this.getLayout() === LAYOUT.VERTICAL;
        const canScroll = isVertical
            ? this.nav.scrollHeight > this.nav.clientHeight
            : this.nav.scrollWidth > this.nav.clientWidth;

        buttons.forEach(btn => {
            btn.style.display = canScroll ? '' : 'none';
        });
    }

    /**
     * Smoothly scroll the nav by half its visible size in the given direction.
     */
    scroll(direction: 'prev' | 'next'): void {
        const isHorizontal = this.getLayout() === LAYOUT.HORIZONTAL;

        const scrollAmount = isHorizontal
            ? this.nav.clientWidth / 2
            : this.nav.clientHeight / 2;

        const maxScroll = isHorizontal
            ? this.nav.scrollWidth - this.nav.clientWidth
            : this.nav.scrollHeight - this.nav.clientHeight;

        let target = isHorizontal ? this.nav.scrollLeft : this.nav.scrollTop;
        target += direction === 'next' ? scrollAmount : -scrollAmount;
        target = Math.max(0, Math.min(target, maxScroll));

        this.nav.scrollTo({
            [isHorizontal ? 'left' : 'top']: target,
            behavior: 'smooth',
        });
    }

    /**
     * Scroll the nav so that the step at the given index is centered in view.
     */
    scrollToStep(stepIdx: number): void {
        const items = this.getStepItems();
        const stepEl = items[stepIdx]?.step;
        if (!stepEl) return;

        const isHorizontal = this.getLayout() === LAYOUT.HORIZONTAL;

        const itemStart = isHorizontal ? stepEl.offsetLeft : stepEl.offsetTop;
        const itemSize = isHorizontal ? stepEl.offsetWidth : stepEl.offsetHeight;
        const navSize = isHorizontal ? this.nav.clientWidth : this.nav.clientHeight;
        const maxScroll = isHorizontal
            ? this.nav.scrollWidth - this.nav.clientWidth
            : this.nav.scrollHeight - this.nav.clientHeight;

        const center = itemStart + itemSize / 2 - navSize / 2;
        const clamped = Math.max(0, Math.min(center, maxScroll));

        this.nav.scrollTo({
            [isHorizontal ? 'left' : 'top']: clamped,
            behavior: 'smooth',
        });
    }

    /**
     * Remove all injected scroll-button elements from the nav.
     * Called during wizard destroy().
     */
    destroy(): void {
        getAllDescendants(`.${STYLES.BUTTONS.SCROLL}`, this.nav)
            .forEach(btn => btn.parentNode?.removeChild(btn));
    }
}
