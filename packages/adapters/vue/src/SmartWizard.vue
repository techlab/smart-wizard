<template>
  <div ref="containerRef">
    <slot
      :info="info"
      :next="next"
      :prev="prev"
      :first="first"
      :last="last"
      :goTo="goTo"
      :reset="reset"
      :destroy="destroy"
      :setOptions="setOptions"
      :wizard="wizard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { WizardOptions } from "@smart-wizard/core";
import { useSmartWizard } from "./useSmartWizard";

const props = defineProps<{
  options?: Partial<WizardOptions>;
}>();

const containerRef = ref<HTMLElement | null>(null);

const { info, next, prev, first, last, goTo, reset, destroy, setOptions, wizard } =
  useSmartWizard(containerRef, props.options ?? {});
</script>
