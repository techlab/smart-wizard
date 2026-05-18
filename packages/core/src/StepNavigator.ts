import { StepItem, WizardOptions, StepDirection, StepPosition } from './types';
import { hasClass } from './util';
import { STYLES, STEP_DIRECTION, STEP_POSITION } from './constants';

/**
 * Pure navigation logic for SmartWizard.
 * Determines which step can be shown, in which direction, and at which position.
 * Contains no DOM side-effects — all reads are through injected accessors.
 */
export class StepNavigator {
    constructor(
        private readonly getStepItems: () => StepItem[],
        private readonly getCurrentIndex: () => number,
        private readonly getOptions: () => WizardOptions
    ) { }

    /**
     * Walk from `fromIndex` in `direction` and return the first enabled step index,
     * or `null` if none exists.
     */
    nextShowable(fromIndex: number, direction: StepDirection): number | null {
        const items = this.getStepItems();
        const isForward = direction === STEP_DIRECTION.FORWARD;
        let idx = fromIndex + (isForward ? 1 : -1);

        while (isForward ? idx < items.length : idx >= 0) {
            if (this.isEnabled(items[idx].step)) return idx;
            idx += isForward ? 1 : -1;
        }
        return null;
    }

    /**
     * Returns `true` if the step at `idx` can be navigated to,
     * taking completion rules and clickability options into account.
     */
    isShowable(idx: number): boolean {
        const items = this.getStepItems();
        const item = items[idx];
        if (!item) return false;
        if (!this.isEnabled(item.step)) return false;

        const options = this.getOptions();
        const isCompleted = hasClass(STYLES.STATES.COMPLETED, item.step);

        if (options.navigation.completed.enabled === false && isCompleted) return false;
        if (options.navigation.completed.clickable === false && isCompleted) return false;
        if (options.navigation.alwaysClickable === false && !isCompleted) return false;

        return true;
    }

    /** Returns `true` if the step is neither disabled nor hidden. */
    isEnabled(step: HTMLElement): boolean {
        return !hasClass(STYLES.STATES.DISABLED, step) && !hasClass(STYLES.STATES.HIDDEN, step);
    }

    /** Returns the navigation direction from the current index to `stepIdx`. */
    getDirection(stepIdx: number): StepDirection {
        const current = this.getCurrentIndex();
        if (current < stepIdx) return STEP_DIRECTION.FORWARD;
        if (current > stepIdx) return STEP_DIRECTION.BACKWARD;
        return 'none';
    }

    /** Returns whether `idx` is the first, last, or a middle step. */
    getPosition(idx: number): StepPosition {
        const total = this.getStepItems().length;
        if (idx === 0) return STEP_POSITION.FIRST;
        if (idx === total - 1) return STEP_POSITION.LAST;
        return STEP_POSITION.MIDDLE;
    }
}
