import { useState, useEffect, useRef, RefObject } from 'react';
import { SmartWizard, WizardOptions, WizardInfo } from '@smart-wizard/core';

export function useSmartWizard(
    containerRef: RefObject<HTMLElement>,
    options: Partial<WizardOptions>
) {
    const wizardRef = useRef<SmartWizard | null>(null);
    const [info, setInfo] = useState<WizardInfo>({
        stepInfo: { currentStep: 0, totalSteps: 0 },
        contentDirection: 'ltr',
        layout: 'horizontal',
        colorScheme: 'none',
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize wizard
        wizardRef.current = new SmartWizard(containerRef.current, options);

        // Listen to step changes
        const handleStepChange = () => {
            if (wizardRef.current) {
                setInfo(wizardRef.current.info);
            }
        };

        wizardRef.current.on('showStep', handleStepChange);
        wizardRef.current.on('initialized', handleStepChange);

        // Initial update
        handleStepChange();

        return () => {
            if (wizardRef.current) {
                wizardRef.current.off('showStep', handleStepChange);
                wizardRef.current.off('initialized', handleStepChange);
            }
        };
    }, [containerRef, options]);

    return {
        info,
        next: () => wizardRef.current?.next(),
        prev: () => wizardRef.current?.prev(),
        goTo: (index: number, force?: boolean) => wizardRef.current?.goTo(index, { 'force': force }),
        reset: () => wizardRef.current?.reset(),
        wizard: wizardRef.current,
    };
}
