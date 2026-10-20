# @smart-wizard/vue

**Official Vue 3 adapter for SmartWizard.**  
Composable (`useSmartWizard`) with reactive step info, controls, and loading state.

> This package is part of the **[SmartWizard](https://github.com/techlab/smart-wizard)** project, the next-generation continuation of the popular jQuery SmartWizard.

---

## 📖 Documentation & Links

* 📚 **Full Vue Documentation & Examples**: [GitHub Readme](https://github.com/techlab/smart-wizard#-vue-adapter)
* 🌐 **Official Website & Demos**: [techlaboratory.net/smart-wizard](https://techlaboratory.net/smart-wizard)
* 🐙 **Repository**: [github.com/techlab/smart-wizard](https://github.com/techlab/smart-wizard)
* 🐛 **Issue Tracker**: [github.com/techlab/smart-wizard/issues](https://github.com/techlab/smart-wizard/issues)

---

## 📥 Installation

```bash
npm install @smart-wizard/vue @smart-wizard/core @smart-wizard/ui
```

---

## ⚡ Quick Example

```vue
<template>
  <div ref="wizardRef" id="wizard">
    <nav class="sw-nav" role="tablist">
      <div class="sw-nav-item" role="tab"><span class="title">Step 1</span></div>
      <div class="sw-nav-item" role="tab"><span class="title">Step 2</span></div>
    </nav>
    <div class="sw-panels">
      <section class="sw-panel" id="step-1" role="tabpanel">Step 1 Content</section>
      <section class="sw-panel" id="step-2" role="tabpanel">Step 2 Content</section>
    </div>
    <div class="sw-toolbar">
      <button @click="prev">Back</button>
      <button @click="next">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSmartWizard } from '@smart-wizard/vue';
import '@smart-wizard/ui/full';
import '@smart-wizard/ui/themes/arrows.css';

const wizardRef = ref<HTMLElement | null>(null);
const { next, prev, stepInfo } = useSmartWizard(wizardRef, {
  theme: 'arrows',
  transition: { effect: 'slideHorizontal' },
});
</script>
```

---

## 📝 License

**Smart Wizard** is dual-licensed:

**[GNU General Public License v3.0 (GPLv3)](https://github.com/techlab/smart-wizard/blob/main/LICENSE)** - free and open-source under the GNU General Public License v3.0

**[Commercial License](https://techlaboratory.net/smart-wizard#license)** — Required for **proprietary (closed-source) application, commercial SaaS, or client project** without releasing your application's source code under the GPLv3.

Commercial licenses help support continued development, maintenance, and new features.
