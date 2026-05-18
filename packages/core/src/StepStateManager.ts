import { WizardOptions, StepItem, StepState, StepDirection } from './types';
import { addClass, removeClass, hasClass } from './util';
import { STYLES, STEP_DIRECTION } from './constants';

/**
 * Manages step CSS state classes for SmartWizard.
 * All state changes (active, completed, disabled, etc.) are funnelled here.
 */
export class StepStateManager {
    constructor(private readonly stepItems: StepItem[]) { }

    /**
     * Clear all state classes from every step, then re-apply initial states
     * from the wizard options (completed, disabled, warning, error, hidden).
     * Also applies the 'default' class when navigation is controlled.
     */
    reset(options: WizardOptions): void {
        // Clear all state classes
        const allStates = [
            STYLES.STATES.COMPLETED, STYLES.STATES.ACTIVE, STYLES.STATES.DEFAULT,
            STYLES.STATES.DISABLED, STYLES.STATES.ERROR, STYLES.STATES.WARNING,
            STYLES.STATES.HIDDEN,
        ].join(' ');

        this.stepItems.forEach(({ step }) => removeClass(allStates, step));

        // Add 'default' when nav is controlled
        if (!options.navigation.alwaysClickable || !options.navigation.enabled) {
            this.stepItems.forEach(({ step }) => addClass(STYLES.STATES.DEFAULT, step));
        }

        // Apply initial states from options
        this.applyFromOptions(options.stepStates.completed, STYLES.STATES.COMPLETED);
        this.applyFromOptions(options.stepStates.disabled, STYLES.STATES.DISABLED);
        this.applyFromOptions(options.stepStates.warning, STYLES.STATES.WARNING);
        this.applyFromOptions(options.stepStates.error, STYLES.STATES.ERROR);
        this.applyFromOptions(options.stepStates.hidden, STYLES.STATES.HIDDEN);
    }

    /**
     * Update the active/completed state of the previously-active step and
     * mark the target step as active.
     */
    setAnchor(stepIdx: number, currentIdx: number, options: WizardOptions): void {
        if (currentIdx >= 0) {
            const currentStep = this.stepItems[currentIdx]?.step;
            let removeCss = `${STYLES.STATES.ACTIVE} ${STYLES.STATES.DEFAULT}`;
            let addCss = '';

            if (options.navigation.completed.enabled) {
                const dir = this.directionBetween(currentIdx, stepIdx);
                if (dir === STEP_DIRECTION.FORWARD && !options.navigation.completed.clearOnBack) {
                    addCss = STYLES.STATES.COMPLETED;
                } else if (dir === STEP_DIRECTION.BACKWARD && options.navigation.completed.clearOnBack) {
                    removeCss += ' ' + STYLES.STATES.COMPLETED;
                } else {
                    addCss = STYLES.STATES.COMPLETED;
                }
            }

            if (currentStep) {
                removeClass(removeCss, currentStep);
                if (addCss) addClass(addCss, currentStep);
            }
        }

        const targetStep = this.stepItems[stepIdx]?.step;
        if (targetStep) {
            removeClass(`${STYLES.STATES.COMPLETED} ${STYLES.STATES.DEFAULT}`, targetStep);
            addClass(STYLES.STATES.ACTIVE, targetStep);
        }
    }

    /** Add a state class to the given step indices. */
    setState(indices: number[], state: StepState): void {
        this.changeState(indices, state, true);
    }

    /** Remove a state class from the given step indices. */
    unsetState(indices: number[], state: StepState): void {
        this.changeState(indices, state, false);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private applyFromOptions(stepIndices: number[], cssClass: string): void {
        stepIndices.forEach(idx => {
            const item = this.stepItems[idx];
            if (item) addClass(cssClass, item.step);
        });
    }

    private changeState(indices: number[], state: StepState, add: boolean): void {
        const css = this.stateToClass(state);
        if (!css) return;
        indices.forEach(n => {
            const item = this.stepItems[n];
            if (!item) return;
            add ? addClass(css, item.step) : removeClass(css, item.step);
        });
    }

    private stateToClass(state: StepState): string {
        switch (state) {
            case 'default':   return STYLES.STATES.DEFAULT;
            case 'active':    return STYLES.STATES.ACTIVE;
            case 'completed': return STYLES.STATES.COMPLETED;
            case 'disabled':  return STYLES.STATES.DISABLED;
            case 'hidden':    return STYLES.STATES.HIDDEN;
            case 'error':     return STYLES.STATES.ERROR;
            case 'warning':   return STYLES.STATES.WARNING;
            default:          return '';
        }
    }

    private directionBetween(from: number, to: number): StepDirection {
        if (from < to) return STEP_DIRECTION.FORWARD;
        if (from > to) return STEP_DIRECTION.BACKWARD;
        return 'none';
    }
}
