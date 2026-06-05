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
            info.value = wizard.value.getInfo();
        }
    };

    onMounted(() => {
        if (!containerRef.value) return;

        wizard.value = new SmartWizard(containerRef.value, options);

        containerRef.value.addEventListener('showStep', handleStepChange);
        containerRef.value.addEventListener('initialized', handleStepChange);

        // Initial update
        handleStepChange();
    });

    onUnmounted(() => {
        if (containerRef.value) {
            containerRef.value.removeEventListener('showStep', handleStepChange);
            containerRef.value.removeEventListener('initialized', handleStepChange);
        }
    });

    return {
        info,
        next: () => wizard.value?.next(),
        prev: () => wizard.value?.prev(),
        goToStep: (index: number, force?: boolean) => wizard.value?.goToStep(index, force),
        reset: () => wizard.value?.reset(),
        wizard,
    };
}
