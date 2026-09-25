<template>
  <div class="app">
    <div class="container">
      <h1>SmartWizard — Vue Example</h1>
      <p class="subtitle">Built with Vue 3 Composition API and TypeScript</p>

      <div class="info-card">
        <p><strong>Current Step:</strong> {{ stepInfo.currentStep + 1 }} of {{ stepInfo.totalSteps }}</p>
        <p><strong>Transition:</strong> {{ transitionType }}</p>
      </div>

      <div class="transition-selector">
        <button
          v-for="type in transitions"
          :key="type"
          :class="[`transition-btn`, { active: transitionType === type }]"
          @click="changeTransition(type)"
        >
          {{ type }}
        </button>
      </div>

      <!-- SmartWizard: core-compatible markup -->
      <div ref="wizardRef" id="smartwizard" class="sw-wizard">

        <nav class="sw-nav" role="tablist">
          <div class="sw-nav-item" data-step="1" role="tab">
            <div class="badge">1</div>
            <div class="info"><span class="title">Vue</span><span class="desc">Setup</span></div>
          </div>
          <div class="sw-nav-item" data-step="2" role="tab">
            <div class="badge">2</div>
            <div class="info"><span class="title">Composition</span><span class="desc">API pattern</span></div>
          </div>
          <div class="sw-nav-item" data-step="3" role="tab">
            <div class="badge">3</div>
            <div class="info"><span class="title">Reactive</span><span class="desc">State mgmt</span></div>
          </div>
          <div class="sw-nav-item" data-step="4" role="tab">
            <div class="badge">4</div>
            <div class="info"><span class="title">Complete</span><span class="desc">Done!</span></div>
          </div>
        </nav>

        <div class="sw-panels">
          <section class="sw-panel active" id="panel-1" role="tabpanel" hidden>
            <div class="sw-title">Welcome to Vue Integration!</div>
            <div class="sw-desc">SmartWizard integrates seamlessly with Vue 3 using the Composition API.</div>
            <ul class="feature-list">
              <li>useSmartWizard composable</li>
              <li>Reactive state with refs</li>
              <li>Lifecycle hooks integration</li>
              <li>Full TypeScript support</li>
            </ul>
          </section>
          <section class="sw-panel" id="panel-2" role="tabpanel" hidden>
            <div class="sw-title">Composition API Pattern</div>
            <div class="sw-desc">The useSmartWizard composable provides a clean API.</div>
            <pre class="code-block">const { stepInfo, next, prev, wizard } =
  useSmartWizard(wizardRef, options);</pre>
          </section>
          <section class="sw-panel" id="panel-3" role="tabpanel" hidden>
            <div class="sw-title">Reactive State Management</div>
            <div class="sw-desc">Vue reactivity system works perfectly with SmartWizard.</div>
            <ul class="feature-list">
              <li>Automatic UI updates on state changes</li>
              <li>Computed properties support</li>
              <li>Watch for step changes</li>
              <li>Template refs for DOM access</li>
            </ul>
          </section>
          <section class="sw-panel" id="panel-4" role="tabpanel" hidden>
            <div class="sw-title">Ready to Build!</div>
            <div class="sw-desc">You are all set to use SmartWizard in your Vue application.</div>
            <div class="action-buttons">
              <button class="sw-btn sw-btn-outline" @click="reset">Reset Wizard</button>
              <button class="sw-btn sw-btn-primary" @click="handleComplete">Complete</button>
            </div>
          </section>
        </div>

        <div class="sw-toolbar sw-toolbar-bottom">
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-outline sw-btn-prev" data-action="prev">← Back</button>
          </div>
          <div class="sw-toolbar-group">
            <div class="sw-progress">
              <div class="sw-progress-bar" role="progressbar"
                :style="{ width: `${progress}%` }"
                :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
          <div class="sw-toolbar-group">
            <button class="sw-btn sw-btn-primary sw-btn-next" data-action="next">Next →</button>
          </div>
        </div>

      </div>

      <div class="external-controls">
        <h3>External Controls</h3>
        <div class="button-group">
          <button @click="prev" :disabled="stepInfo.currentStep === 0">← Previous</button>
          <button @click="next" :disabled="stepInfo.currentStep === stepInfo.totalSteps - 1">Next →</button>
          <button @click="reset">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useSmartWizard } from "@smart-wizard/vue";

const wizardRef = ref<HTMLElement | null>(null);
const transitionType = ref("slideHorizontal");
const transitions = ["none", "fade", "slideHorizontal", "slideVertical"];

const { stepInfo, next, prev, reset, wizard } = useSmartWizard(wizardRef, {
  transition: { effect: transitionType.value as any, speed: 400 },
});

const progress = computed(() =>
  stepInfo.value.totalSteps > 0
    ? ((stepInfo.value.currentStep + 1) / stepInfo.value.totalSteps) * 100
    : 0
);

const changeTransition = (type: string) => {
  transitionType.value = type;
  wizard.value?.setOptions({ transition: { effect: type as any, speed: 400 } });
};

const handleComplete = () => alert("Wizard completed! 🎉");
</script>

<style scoped></style>