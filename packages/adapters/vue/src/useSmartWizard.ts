import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { SmartWizard, WizardOptions, StepInfo } from '@smartwizard/core';

export function useSmartWizard(
    containerRef: Ref<HTMLElement | null>,
    options: Partial<WizardOptions>
) {
    const wizard = ref<SmartWizard | null>(null);
    const stepInfo = ref<StepInfo>({ currentStep: 0, totalSteps: 0 });

    const handleStepChange = () => {
        if (wizard.value) {
            stepInfo.value = wizard.value.getStepInfo();
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
        stepInfo,
        next: () => wizard.value?.next(),
        prev: () => wizard.value?.prev(),
        goToStep: (index: number, force?: boolean) => wizard.value?.goToStep(index, force),
        reset: () => wizard.value?.reset(),
        wizard,
    };
}
