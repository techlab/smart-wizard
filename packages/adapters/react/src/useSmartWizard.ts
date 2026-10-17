import { useState, useEffect, useRef, RefObject } from 'react';
import { SmartWizard, WizardOptions, WizardInfo } from '@smart-wizard/core';

export function useSmartWizard(
    containerRef: RefObject<HTMLElement>,
    options: Partial<WizardOptions>
) {
    const wizardRef = useRef<SmartWizard | null>(null);
    // Capture initial options in a ref so inline object literals don't
    // cause the effect to re-run on every render.
    const optionsRef = useRef<Partial<WizardOptions>>(options);

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

        // Initialize wizard once using the captured initial options
        wizardRef.current = new SmartWizard(containerRef.current, optionsRef.current);

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
                wizardRef.current.destroy();
                wizardRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef]); // options intentionally omitted — use wizard.setOptions() to update

    return {
        info,
        stepInfo: info.stepInfo,
        next:          () => wizardRef.current?.next(),
        prev:          () => wizardRef.current?.prev(),
        first:         () => wizardRef.current?.first(),
        last:          () => wizardRef.current?.last(),
        goTo:          (index: number, force?: boolean) => wizardRef.current?.goTo(index, { force }),
        reset:         () => wizardRef.current?.reset(),
        destroy:       () => wizardRef.current?.destroy(),
        setOptions:    (opts: Parameters<NonNullable<typeof wizardRef.current>['setOptions']>[0]) => wizardRef.current?.setOptions(opts),
        getOptions:    () => wizardRef.current?.getOptions(),
        updateHeight:  () => wizardRef.current?.updateHeight(),
        loader: {
            show: () => wizardRef.current?.loader.show(),
            hide: () => wizardRef.current?.loader.hide(),
        },
        wizard:        wizardRef.current,
    };
}