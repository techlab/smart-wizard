import { ref, computed, onMounted, onUnmounted, Ref } from "vue";
import { SmartWizard, WizardOptions, WizardInfo } from "@smart-wizard/core";

export function useSmartWizard(
    containerRef: Ref<HTMLElement | null>,
    options: Partial<WizardOptions>
) {
    const wizard = ref<SmartWizard | null>(null);
    const info = ref<WizardInfo>({
        stepInfo: { currentStep: 0, totalSteps: 0 },
        contentDirection: "ltr",
        layout: "horizontal",
        colorScheme: "none",
        width: 0,
        height: 0,
    });

    // Reactive convenience alias
    const stepInfo = computed(() => info.value.stepInfo);

    const handleStepChange = () => {
        if (wizard.value) {
            info.value = wizard.value.info;
        }
    };

    onMounted(() => {
        if (!containerRef.value) return;

        wizard.value = new SmartWizard(containerRef.value, options);

        wizard.value.on("showStep", handleStepChange);
        wizard.value.on("initialized", handleStepChange);

        // Initial update
        handleStepChange();
    });

    onUnmounted(() => {
        if (wizard.value) {
            wizard.value.off("showStep", handleStepChange);
            wizard.value.off("initialized", handleStepChange);
            wizard.value.destroy();
            wizard.value = null;
        }
    });

    return {
        info,
        stepInfo,
        next:         () => wizard.value?.next(),
        prev:         () => wizard.value?.prev(),
        first:        () => wizard.value?.first(),
        last:         () => wizard.value?.last(),
        goTo:         (index: number, force?: boolean) => wizard.value?.goTo(index, { force }),
        reset:        () => wizard.value?.reset(),
        destroy:      () => wizard.value?.destroy(),
        setOptions:   (opts: Parameters<NonNullable<typeof wizard.value>["setOptions"]>[0]) => wizard.value?.setOptions(opts),
        getOptions:   () => wizard.value?.getOptions(),
        updateHeight: () => wizard.value?.updateHeight(),
        loader: {
            show: () => wizard.value?.loader.show(),
            hide: () => wizard.value?.loader.hide(),
        },
        wizard,
    };
}