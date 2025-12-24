import { SmartWizard, WizardOptions } from '@smartwizard/core';

export class SmartWizardDOM {
    private wizard: SmartWizard;

    constructor(container: HTMLElement | string, options: Partial<WizardOptions> = {}) {
        // Get the container element
        const element = typeof container === 'string'
            ? document.querySelector(container) as HTMLElement
            : container;

        if (!element) {
            throw new Error('SmartWizardDOM: Container element not found');
        }

        // Initialize the wizard
        this.wizard = new SmartWizard(element, options);
    }

    // Proxy all public methods to the core wizard
    public next(): void {
        this.wizard.next();
    }

    public prev(): void {
        this.wizard.prev();
    }

    public goToStep(index: number, force?: boolean): void {
        this.wizard.goToStep(index, force);
    }

    public reset(): void {
        this.wizard.reset();
    }

    public getStepInfo() {
        return this.wizard.getStepInfo();
    }

    public setState(steps: number[], state: any): void {
        this.wizard.setState(steps, state);
    }

    public unsetState(steps: number[], state: any): void {
        this.wizard.unsetState(steps, state);
    }

    public setOptions(options: Partial<WizardOptions>): void {
        this.wizard.setOptions(options);
    }

    public getOptions() {
        return this.wizard.getOptions();
    }

    public loader(action: 'show' | 'hide'): void {
        this.wizard.loader(action);
    }

    public fixHeight(): void {
        this.wizard.fixHeight();
    }
}
