import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { SmartWizard, WizardOptions, WizardInfo } from '@smart-wizard/core';

export function useSmartWizard(
    containerRef: Ref<HTMLElement | null>,
    options: Partial<WizardOptions>
) {
    const wizard = ref<SmartWizard | null>(null);
    const info = ref<WizardInfo>({
        stepInfo: { currentStep: 0, totalSteps: 0 },
        contentDirection: 'ltr',
        layout: 'horizontal',
        colorScheme: 'none',
        width: 0,
        height: 0,
    });

    const handleStepChange = () => {
        if (wizard.value) {
            info.value = wizard.value.info;
        }
    };

    onMounted(() => {
        if (!containerRef.value) return;

        wizard.value = new SmartWizard(containerRef.value, options);

        wizard.value.on('showStep', handleStepChange);
        wizard.value.on('initialized', handleStepChange);

        // Initial update
        handleStepChange();
    });

    onUnmounted(() => {
        if (wizard.value) {
            wizard.value.off('showStep', handleStepChange);
            wizard.value.off('initialized', handleStepChange);
        }
    });

    return {
        info,
        next: () => wizard.value?.next(),
        prev: () => wizard.value?.prev(),
        goTo: (index: number, force?: boolean) => wizard.value?.goTo(index, { 'force': force }),
        reset: () => wizard.value?.reset(),
        wizard,
    };
}
