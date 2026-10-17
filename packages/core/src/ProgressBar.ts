import { getFirstDescendant, setAttribute } from './util';
import { CSS_PROPERTIES, STYLES } from './constants';

/**
 * Manages progress bar DOM updates for SmartWizard.
 */
export class ProgressBar {
    constructor(private readonly bars: HTMLElement[]) { }

    /** Update all progress bars to reflect the current step index. */
    update(stepIdx: number, totalSteps: number): void {
        if (this.bars.length === 0) return;
        const percent = ((stepIdx + 1) / totalSteps) * 100;

        this.bars.forEach(bar => {
            bar.style.setProperty(CSS_PROPERTIES.PROGRESS_PERCENTAGE, `${percent}%`);
            const inner = getFirstDescendant(`.${STYLES.PROGRESSBAR.BAR}`, bar);
            if (inner) {
                inner.style.width = `${percent}%`;
                setAttribute(inner, 'aria-valuenow', Math.round(percent).toString());
            }
        });
    }
}
