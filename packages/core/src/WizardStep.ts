import { StepState, IWizardStep, StepItem } from './types';
import { addClass, removeClass, hasClass } from './util';
import { STYLES } from './constants';

/**
 * A first-class wrapper around a single wizard step.
 * All mutating methods return `this` for fluent chaining.
 *
 * @example
 * wizard.step(2).disable();
 * wizard.step(3).state('error').state('warning'); // chain multiple states
 */
export class WizardStep implements IWizardStep {
    constructor(
        private readonly _index: number,
        private readonly _item: StepItem,
        /** Accessor so isActive() always reflects the live wizard state. */
        private readonly _getActiveIndex: () => number
    ) { }

    // ── Accessors ──────────────────────────────────────────────────────────

    /** Zero-based index of this step in the wizard. */
    get index(): number {
        return this._index;
    }

    /** The nav anchor element for this step. */
    get element(): HTMLElement {
        return this._item.step;
    }

    /** The content panel element for this step. */
    get page(): HTMLElement {
        return this._item.page;
    }

    // ── State queries ──────────────────────────────────────────────────────

    /** Returns `true` if the given state class is currently applied to this step. */
    hasState(state: StepState): boolean {
        const css = this._stateToClass(state);
        return css ? hasClass(css, this._item.step) : false;
    }

    /** Returns `true` if this is the currently active step. */
    isActive(): boolean {
        return this._getActiveIndex() === this._index;
    }

    /** Returns `true` if the step has the `disabled` state. */
    isDisabled(): boolean {
        return hasClass(STYLES.STATES.DISABLED, this._item.step);
    }

    /** Returns `true` if the step has the `completed` state. */
    isCompleted(): boolean {
        return hasClass(STYLES.STATES.COMPLETED, this._item.step);
    }

    /** Returns `true` if the step has the `hidden` state. */
    isHidden(): boolean {
        return hasClass(STYLES.STATES.HIDDEN, this._item.step);
    }

    // ── State mutations (all return `this` for fluent chaining) ────────────

    /**
     * Add a state class to this step.
     * @example wizard.step(2).state('error');
     */
    state(s: StepState): this {
        const css = this._stateToClass(s);
        if (css) addClass(css, this._item.step);
        return this;
    }

    /**
     * Remove a state class from this step.
     * @example wizard.step(2).removeState('disabled');
     */
    removeState(s: StepState): this {
        const css = this._stateToClass(s);
        if (css) removeClass(css, this._item.step);
        return this;
    }

    /**
     * Remove **all** state classes from this step, returning it to a blank slate.
     * @example wizard.step(2).reset();
     */
    reset(): this {
        const allStates = [
            STYLES.STATES.COMPLETED, STYLES.STATES.ACTIVE, STYLES.STATES.DEFAULT,
            STYLES.STATES.DISABLED, STYLES.STATES.ERROR, STYLES.STATES.WARNING,
            STYLES.STATES.HIDDEN,
        ].join(' ');
        removeClass(allStates, this._item.step);
        return this;
    }

    // ── Shorthand mutators ─────────────────────────────────────────────────

    /** Mark this step as disabled (prevents navigation). */
    disable(): this { return this.state('disabled'); }

    /** Remove the `disabled` state from this step. */
    enable(): this { return this.removeState('disabled'); }

    /** Mark this step as completed. */
    complete(): this { return this.state('completed'); }

    /** Mark this step with a warning. */
    warning(): this { return this.state('warning'); }

    /** Mark this step with an error. */
    error(): this { return this.state('error'); }

    /** Make this step visible (removes the `hidden` state). */
    show(): this { return this.removeState('hidden'); }

    /** Hide this step (adds the `hidden` state). */
    hide(): this { return this.state('hidden'); }

    // ── Private helpers ────────────────────────────────────────────────────

    private _stateToClass(state: StepState): string {
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
}
