import { useState, useEffect, useRef, RefObject } from 'react';
import { SmartWizard, WizardOptions, StepInfo } from '@smartwizard/core';

export function useSmartWizard(
    containerRef: RefObject<HTMLElement>,
    options: Partial<WizardOptions>
) {
    const wizardRef = useRef<SmartWizard | null>(null);
    const [stepInfo, setStepInfo] = useState<StepInfo>({ currentStep: 0, totalSteps: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize wizard
        wizardRef.current = new SmartWizard(containerRef.current, options);

        // Listen to step changes
        const handleStepChange = () => {
            if (wizardRef.current) {
                setStepInfo(wizardRef.current.getStepInfo());
            }
        };

        containerRef.current.addEventListener('showStep', handleStepChange);
        containerRef.current.addEventListener('initialized', handleStepChange);

        // Initial update
        handleStepChange();

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('showStep', handleStepChange);
                containerRef.current.removeEventListener('initialized', handleStepChange);
            }
        };
    }, [containerRef, options]);

    return {
        stepInfo,
        next: () => wizardRef.current?.next(),
        prev: () => wizardRef.current?.prev(),
        goToStep: (index: number, force?: boolean) => wizardRef.current?.goToStep(index, force),
        reset: () => wizardRef.current?.reset(),
        wizard: wizardRef.current,
    };
}
