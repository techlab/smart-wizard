import { SmartWizard, WizardOptions, StepState, StepInfo, ContentDirection } from '@smartwizard/core';

export class SmartWizardDOM {
    private wizard: SmartWizard;

    constructor(container: HTMLElement | string, options: Partial<WizardOptions> = {}) {
        const element = typeof container === 'string'
            ? document.querySelector(container) as HTMLElement
            : container;

        if (!element) {
            throw new Error('SmartWizardDOM: Container element not found');
        }

        this.wizard = new SmartWizard(element, options);
    }

    public next(): void { this.wizard.next(); }
    public prev(): void { this.wizard.prev(); }
    public goToStep(index: number, force?: boolean): void { this.wizard.goToStep(index, force); }
    public reset(): void { this.wizard.reset(); }
    public getStepInfo(): StepInfo { return this.wizard.getStepInfo(); }
    public setState(steps: number[], state: StepState): void { this.wizard.setState(steps, state); }
    public unsetState(steps: number[], state: StepState): void { this.wizard.unsetState(steps, state); }
    public setOptions(options: Partial<WizardOptions>): void { this.wizard.setOptions(options); }
    public getOptions(): WizardOptions { return this.wizard.getOptions(); }
    public loader(action: 'show' | 'hide'): void { this.wizard.loader(action); }
    public adjustHeight(): void { this.wizard.adjustHeight(); }
    public resetHeight(): void { this.wizard.resetHeight(); }
    public getWidth(): number { return this.wizard.getWidth(); }
    public getCurrentIndex(): number { return this.wizard.getCurrentIndex(); }
    public getContentDirection(): ContentDirection { return this.wizard.getContentDirection(); }
}
