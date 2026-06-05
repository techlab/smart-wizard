<template>
  <div class="app">
    <div class="container">
      <h1>⚡ SmartWizard Vue Example</h1>
      <p class="subtitle">Built with Vue 3 Composition API and TypeScript</p>

      <div class="info-card">
        <p><strong>Current Step:</strong> {{ stepInfo.currentStep + 1 }} of {{ stepInfo.totalSteps }}</p>
        <p><strong>Transition:</strong> {{ transitionType }}</p>
      </div>

      <div class="transition-selector">
        <button
          v-for="type in transitions"
          :key="type"
          :class="['transition-btn', { active: transitionType === type }]"
          @click="changeTransition(type)"
        >
          {{ type }}
        </button>
      </div>

      <div ref="wizardRef" id="smartwizard">
        <ul class="nav">
          <li class="nav-item">
            <a class="nav-link" href="#step-1">
              <span class="num">1</span>
              <span>Vue</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#step-2">
              <span class="num">2</span>
              <span>Composition</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#step-3">
              <span class="num">3</span>
              <span>Reactive</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#step-4">
              <span class="num">4</span>
              <span>Complete</span>
            </a>
          </li>
        </ul>

        <div class="tab-content">
          <div id="step-1" class="tab-pane">
            <h3>Welcome to Vue Integration!</h3>
            <p>SmartWizard integrates seamlessly with Vue 3 using the Composition API.</p>
            <ul class="feature-list">
              <li>useSmartWizard composable</li>
              <li>Reactive state with refs</li>
              <li>Lifecycle hooks integration</li>
              <li>Full TypeScript support</li>
            </ul>
          </div>
          <div id="step-2" class="tab-pane">
            <h3>Composition API Pattern</h3>
            <p>The useSmartWizard composable provides a clean API:</p>
            <pre class="code-block">const { stepInfo, next, prev, wizard } = 
  useSmartWizard(wizardRef, options);</pre>
            <p>All wizard functionality is available through the composable return value.</p>
          </div>
          <div id="step-3" class="tab-pane">
            <h3>Reactive State Management</h3>
            <p>Vue's reactivity system works perfectly with SmartWizard:</p>
            <ul class="feature-list">
              <li>Automatic UI updates on state changes</li>
              <li>Computed properties support</li>
              <li>Watch for step changes</li>
              <li>Template refs for DOM access</li>
            </ul>
          </div>
          <div id="step-4" class="tab-pane">
            <h3>Ready to Build!</h3>
            <p>You're all set to use SmartWizard in your Vue application.</p>
            <div class="action-buttons">
              <button class="btn-secondary" @click="reset">
                Reset Wizard
              </button>
              <button class="btn-primary" @click="handleComplete">
                Complete
              </button>
            </div>
          </div>
        </div>

        <div class="progress">
          <div 
            class="progress-bar" 
            :style="{ width: `${((stepInfo.currentStep + 1) / stepInfo.totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="external-controls">
        <h3>External Controls</h3>
        <div class="button-group">
          <button @click="prev" :disabled="stepInfo.currentStep === 0">
            ← Previous
          </button>
          <button @click="next" :disabled="stepInfo.currentStep === stepInfo.totalSteps - 1">
            Next →
          </button>
          <button @click="reset">
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSmartWizard } from '@smart-wizard/vue';

const wizardRef = ref<HTMLElement | null>(null);
const transitionType = ref('slideHorizontal');
const transitions = ['none', 'fade', 'slideHorizontal', 'slideVertical'];

const { stepInfo, next, prev, reset, wizard } = useSmartWizard(wizardRef, {
  transition: {
    animation: transitionType.value as any,
    speed: '400'
  },
  toolbar: {
    position: 'bottom'
  }
});

const changeTransition = (type: string) => {
  transitionType.value = type;
  wizard.value?.setOptions({
    transition: {
      animation: type as any,
      speed: '400'
    }
  });
};

const handleComplete = () => {
  alert('Wizard completed! 🎉');
};
</script>

<style scoped>
/* Component-specific styles can go here */
</style>
