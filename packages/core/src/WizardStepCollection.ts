import { StepState, IWizardStepCollection } from './types';
import { WizardStep } from './WizardStep';

/**
 * A collection of `WizardStep` objects that supports bulk state operations.
 * All mutating methods return `this` for fluent chaining.
 *
 * @example
 * wizard.steps([1, 2, 3]).disable();
 * wizard.steps().reset();           // reset ALL steps
 * wizard.steps([0, 1]).complete().show();
 */
export class WizardStepCollection implements IWizardStepCollection {
    constructor(private readonly _steps: WizardStep[]) { }

    /** Number of steps in this collection. */
    get length(): number {
        return this._steps.length;
    }

    /**
     * Iterate over every step in the collection.
     * Returns `this` for fluent chaining.
     */
    forEach(callback: (step: WizardStep, index: number) => void): this {
        this._steps.forEach(callback);
        return this;
    }

    // ── State mutations (all return `this` for fluent chaining) ────────────

    /**
     * Add a state class to every step in the collection.
     * @example wizard.steps([0, 1]).state('disabled');
     */
    state(s: StepState): this {
        this._steps.forEach(step => step.state(s));
        return this;
    }

    /**
     * Remove a state class from every step in the collection.
     * @example wizard.steps([0, 1]).removeState('disabled');
     */
    removeState(s: StepState): this {
        this._steps.forEach(step => step.removeState(s));
        return this;
    }

    /**
     * Clear all state classes from every step in the collection.
     * @example wizard.steps().reset();
     */
    reset(): this {
        this._steps.forEach(step => step.reset());
        return this;
    }

    // ── Shorthand mutators ─────────────────────────────────────────────────

    /** Disable every step in the collection. */
    disable(): this { return this.state('disabled'); }

    /** Enable (un-disable) every step in the collection. */
    enable(): this { return this.removeState('disabled'); }

    /** Mark every step in the collection as completed. */
    complete(): this { return this.state('completed'); }

    /** Mark every step in the collection with a warning. */
    warning(): this { return this.state('warning'); }

    /** Mark every step in the collection with an error. */
    error(): this { return this.state('error'); }

    /** Make every step in the collection visible. */
    show(): this { return this.removeState('hidden'); }

    /** Hide every step in the collection. */
    hide(): this { return this.state('hidden'); }
}
