<template>
  <div class="sw-wizard">
    <div class="sw-nav">
      <button
        v-for="(step, index) in state.steps"
        :key="step.id"
        @click="goToStep(index)"
        :class="{ active: index === state.currentStepIndex }"
      >
        {{ step.title }}
      </button>
    </div>
    <div class="sw-content">
      <slot :step="state.steps[state.currentStepIndex]" />
    </div>
    <div class="sw-toolbar">
      <button @click="previous" :disabled="state.currentStepIndex === 0">
        Previous
      </button>
      <button @click="next" :disabled="state.currentStepIndex === state.steps.length - 1">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WizardOptions } from '@smart-wizard/core';
import { useSmartWizard } from './useSmartWizard';

const props = defineProps<{
  options: WizardOptions;
}>();

const { state, next, previous, goToStep } = useSmartWizard(props.options);
</script>