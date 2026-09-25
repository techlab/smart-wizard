# SmartWizard

**A modern, framework-agnostic wizard / multi-step component.**
Zero dependencies · TypeScript · React & Vue adapters · Accessible · Themeable

---

## Table of Contents

1. [Packages](#-packages)
2. [Installation](#-installation)
3. [Quick Start — Vanilla JS](#-quick-start--vanilla-js)
4. [HTML Structure](#-html-structure)
5. [Options](#-options)
6. [Methods](#-methods)
7. [Step Fluent API](#-step-fluent-api)
8. [Events](#-events)
9. [Extension System](#-extension-system)
10. [Loader](#-loader)
11. [Custom Transitions](#-custom-transitions)
12. [Themes](#-themes)
13. [Color Schemes & Color Presets](#-color-schemes--color-presets)
14. [Layouts](#-layouts)
15. [React Adapter](#-react-adapter)
16. [Vue Adapter](#-vue-adapter)
17. [Security Notes](#-security-notes)
18. [Contributing](#-contributing)

---

## 📦 Packages

| Package | Description |
|---------|-------------|
| `@smart-wizard/core` | Framework-agnostic engine (TypeScript) |
| `@smart-wizard/ui` | CSS styles, themes, and design tokens (SCSS) |
| `@smart-wizard/react` | React hooks + context adapter |
| `@smart-wizard/vue` | Vue 3 composable adapter |

---

## 📥 Installation

```bash
# Core + styles
npm install @smart-wizard/core @smart-wizard/ui

# Framework adapters (pick one or both)
npm install @smart-wizard/react
npm install @smart-wizard/vue
```

---

## ⚡ Quick Start — Vanilla JS

```html
<!-- 1. Load styles -->
<link rel="stylesheet" href="node_modules/@smart-wizard/ui/dist/smartwizard-full.css" />
<!-- Optional theme -->
<link rel="stylesheet" href="node_modules/@smart-wizard/ui/dist/themes/arrows.css" />

<!-- 2. Wizard markup -->
<div id="wizard">
  <nav class="sw-nav" role="tablist">
    <div class="sw-nav-item" role="tab">
      <div class="badge">1</div>
      <div class="info">
        <span class="title">Account</span>
        <span class="desc">Your details</span>
      </div>
    </div>
    <div class="sw-nav-item" role="tab">
      <div class="badge">2</div>
      <div class="info">
        <span class="title">Address</span>
        <span class="desc">Location info</span>
      </div>
    </div>
    <div class="sw-nav-item" role="tab">
      <div class="badge">3</div>
      <div class="info">
        <span class="title">Finish</span>
        <span class="desc">Done!</span>
      </div>
    </div>
  </nav>

  <div class="sw-panels">
    <section class="sw-panel" id="panel-1" role="tabpanel" hidden>
      <div class="sw-title">Welcome</div>
      <div class="sw-desc">Fill in your account details.</div>
    </section>
    <section class="sw-panel" id="panel-2" role="tabpanel" hidden>
      <div class="sw-title">Address</div>
    </section>
    <section class="sw-panel" id="panel-3" role="tabpanel" hidden>
      <div class="sw-title">All Done!</div>
    </section>
  </div>

  <div class="sw-toolbar sw-toolbar-bottom">
    <div class="sw-toolbar-group">
      <button class="sw-btn sw-btn-outline sw-btn-prev">← Back</button>
    </div>
    <div class="sw-toolbar-group">
      <button class="sw-btn sw-btn-primary sw-btn-next">Next →</button>
    </div>
  </div>
</div>

<!-- 3. Initialize -->
<script type="module">
  import { SmartWizard } from '@smart-wizard/core';

  const wizard = new SmartWizard('#wizard', {
    theme: 'arrows',
    transition: { effect: 'slideHorizontal', speed: 400 },
  });
</script>
```

---

## 🏗 HTML Structure

SmartWizard uses a `sw-*` CSS class convention. The full reference markup:

```html
<div id="wizard"
  data-theme="arrows"
  data-layout="horizontal"
  data-color="default"
  data-color-scheme="auto">

  <!-- Optional Toolbar (can have multiple: top + bottom) -->
  <div class="sw-toolbar sw-toolbar-top">
    <div class="sw-toolbar-group">
      <span class="sw-badge sw-badge-primary">Step 1 of 4</span>
      <span class="sw-badge sw-badge-warn">⚠ Unsaved</span>
    </div>
    <div class="sw-toolbar-group">
      <button type="button" class="sw-btn sw-btn-danger  sw-btn-reset">Reset</button>
      <button type="button" class="sw-btn sw-btn-outline sw-btn-prev">← Back</button>
      <button type="button" class="sw-btn sw-btn-primary sw-btn-next">Next →</button>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="sw-nav" role="tablist" aria-label="Wizard steps">
    <div class="sw-nav-item" role="tab" aria-controls="panel-1">
      <div class="badge">1</div>
      <div class="info">
        <span class="title">Account</span>
        <span class="desc">Personal details</span>
      </div>
    </div>
    <!-- Repeat for each step -->
  </nav>

  <!-- Optional Progress Bar -->
  <div class="sw-progress">
    <div class="sw-progress-bar" role="progressbar"
         style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
    </div>
  </div>

  <!-- Content Panels -->
  <div class="sw-panels">
    <section class="sw-panel" id="panel-1" role="tabpanel" hidden>
      <div class="sw-title">Account</div>
      <div class="sw-desc">Fill in your account details.</div>
      <!-- Your content here -->
    </section>
    <!-- Repeat for each step -->
  </div>

  <!-- Optional Bottom Toolbar -->
  <div class="sw-toolbar sw-toolbar-bottom">
    <div class="sw-toolbar-group">
      <button type="button" class="sw-btn sw-btn-outline sw-btn-prev">← Back</button>
    </div>
    <div class="sw-toolbar-group">
      <button type="button" class="sw-btn sw-btn-primary sw-btn-next">Next →</button>
    </div>
  </div>
</div>
```

### `data-*` Attribute Configuration

All options can be set via `data-*` attributes on the root element:

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-theme` | `default` \| `arrows` \| `pills` | Visual theme |
| `data-layout` | `horizontal` \| `vertical` | Navigation layout |
| `data-color` | `default` \| `blue` \| `violet` \| … | Color preset |
| `data-color-scheme` | `auto` \| `dark` \| `light` \| `none` | Color scheme override |

---

## ⚙️ Options

All fields are optional — defaults shown:

```typescript
new SmartWizard('#wizard', {
  initialStep: 0,           // Starting step index (0-based)
  theme: 'default',         // 'default' | 'arrows' | 'pills'
  colorScheme: 'auto',      // 'auto' | 'dark' | 'light' | 'none'
  layout: 'horizontal',     // 'horizontal' | 'vertical'
  color: 'default',         // 'default' | 'blue' | 'violet' | any string

  behavior: {
    autoHeight: true,               // Auto-adjust panel container height on step change
    useUrlHash: false,              // Sync active step with URL hash
    supportBrowserHistory: false,   // Sync browser back/forward with steps
  },

  navigation: {
    enabled: true,              // Enable nav-item click navigation
    alwaysClickable: false,     // Allow clicking any nav-item at any time
    completed: {
      enabled: true,                    // Mark visited steps as 'completed'
      completeAllPreviousSteps: true,   // Mark all previous steps completed on hash nav
      clearOnBack: false,               // Remove 'completed' when navigating back
      clickable: true,                  // Allow clicking completed nav-items
    },
  },

  transition: {
    effect: 'default',  // 'default'|'fade'|'slideHorizontal'|'slideVertical'|'slideSwing'|'css'
    speed: 400,         // Duration in ms
    easing: '',         // CSS easing string
    css: {              // Only used when effect: 'css'
      prefix: '',
      forward:  { show: '', hide: '' },
      backward: { show: '', hide: '' },
    },
  },

  keyboardNavigation: {
    enabled: true,
    keys: {
      left:  ['ArrowLeft'],
      right: ['ArrowRight'],
    },
  },

  swipeNavigation: {
    enabled: false,   // Touch-swipe navigation
    threshold: 50,    // Minimum px distance to trigger
  },

  stepStates: {
    completed: [],  // Pre-mark steps as completed (by index)
    disabled:  [],  // Pre-disable steps
    hidden:    [],  // Pre-hide steps
    error:     [],  // Pre-mark steps as error
    warning:   [],  // Pre-mark steps as warning
  },

  scrollToView: true,   // Scroll active nav item into view on step change
  contentLoader: null,  // Dynamic content loading callback (see below)
});
```

### Dynamic Content Loading

```typescript
new SmartWizard('#wizard', {
  contentLoader(stepIndex, direction, position, panelElement, done) {
    fetch(`/api/step/${stepIndex}`)
      .then(r => r.text())
      .then(html => done(html));
  },
});
```

---

## 🔧 Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `next()` | `void` | Go to the next available step |
| `prev()` | `void` | Go to the previous available step |
| `first()` | `void` | Go to the first step |
| `last()` | `void` | Go to the last step |
| `goTo(index, { force? })` | `void` | Navigate to a specific step; `force` bypasses disabled/hidden checks |
| `reset()` | `void` | Reset to `initialStep`, clear all step states |
| `setOptions(opts)` | `void` | Merge and apply new options (re-initializes) |
| `getOptions()` | `WizardOptions` | Return the current resolved options |
| `updateHeight()` | `void` | Manually recalculate the panel container height |
| `extend(...exts)` | `this` | Register one or more extensions (fluent) |
| `step(index)` | `WizardStep` | Fluent API wrapper for a single step |
| `steps(indices?)` | `WizardStepCollection` | Fluent API wrapper for multiple (or all) steps |
| `destroy()` | `void` | Tear down event listeners and DOM modifications |
| `on(event, cb)` | `void` | Add a typed event listener |
| `off(event, cb)` | `void` | Remove a typed event listener |
| `once(event, cb)` | `void` | Add a one-time event listener |

### Read-only Properties

| Property | Type | Description |
|----------|------|-------------|
| `activeIndex` | `number` | Zero-based index of the currently active step |
| `activeStep` | `WizardStep` | Fluent step wrapper for the active step |
| `stepLength` | `number` | Total number of steps |
| `progress` | `number` | Progress percentage (0–100) |
| `canGoNext` | `boolean` | Whether there is a navigable next step |
| `canGoPrev` | `boolean` | Whether there is a navigable previous step |
| `info` | `WizardInfo` | Snapshot: `{ stepInfo, layout, colorScheme, width, height, contentDirection }` |
| `loader` | `WizardLoader` | Loader overlay controller |
| `options` | `WizardOptions` | Current resolved options (read-only) |
| `id` | `string` | Auto-generated unique instance ID |
| `main` | `HTMLElement` | Root wizard element |
| `container` | `HTMLElement` | `.sw-panels` content container |

---

## 🪜 Step Fluent API

```typescript
// Single step
wizard.step(0).complete();
wizard.step(1).disable();
wizard.step(2).error();
wizard.step(3).warning();
wizard.step(4).hide();

// State queries
wizard.step(0).isActive();       // → boolean
wizard.step(0).isCompleted();    // → boolean
wizard.step(0).isDisabled();     // → boolean
wizard.step(0).hasState('error'); // → boolean

// Chaining
wizard.step(2).removeState('error').enable().complete();

// Bulk — all steps
wizard.steps().disable();
wizard.steps().reset();

// Bulk — specific steps
wizard.steps([1, 2, 3]).error();
wizard.steps([0]).enable();

// Access DOM elements
const { element, page } = wizard.step(0);
// element → nav item element
// page    → panel element
```

### Step States

| State | CSS class | Effect |
|-------|-----------|--------|
| `active` | `sw-state-active` | Current step (auto-managed) |
| `completed` | `sw-state-completed` | Marks step as visited |
| `disabled` | `sw-state-disabled` | Prevents navigation to this step |
| `hidden` | `sw-state-hidden` | Hides the step from the nav |
| `error` | `sw-state-error` | Marks step with an error indicator |
| `warning` | `sw-state-warning` | Marks step with a warning indicator |

---

## 🎨 Events

```typescript
// Typed listener via the wizard API (preferred)
wizard.on('showStep', (e) => {
  const { stepIndex, stepElement, stepDirection, stepPosition } = e.detail;
  console.log(`Now on step ${stepIndex} going ${stepDirection}`);
});

wizard.once('loaded', () => console.log('Wizard ready!'));
wizard.off('showStep', myHandler);

// Or via native DOM events (bubble up)
document.getElementById('wizard')!.addEventListener('leaveStep', (e) => {
  if (!validateStep((e as CustomEvent).detail.stepIndex)) e.preventDefault();
});
```

### Event Reference

| Event | Cancelable | `event.detail` |
|-------|-----------|----------------|
| `initialized` | No | `{ wizard }` |
| `loaded` | No | `{ wizard }` |
| `showStep` | No | `{ stepIndex, stepElement, stepDirection, stepPosition }` |
| `leaveStep` | **Yes** | `{ stepIndex, nextStepIndex, stepElement, stepDirection, stepPosition }` |
| `stepChanged` | No | `{ currentStep, previousStep }` |

---

## 🔌 Extension System

Extensions are plain objects that hook into the wizard lifecycle.

```typescript
import type { WizardExtension } from '@smart-wizard/core';

const validationExtension: WizardExtension = {
  name: 'validation', // Unique — duplicate names are silently skipped

  onInstall(wizard) {},     // Once, when registered
  onInit(wizard) {},        // On every init() (construction, reset, setOptions)
  onLoad(wizard) {},        // After the first step is shown
  onDestroy(wizard) {},     // When destroy() is called

  // Return false (or Promise<false>) to cancel navigation
  async onBeforeShow(wizard, { stepIdx, activeIndex, direction }) {
    if (direction !== 'forward') return;
    const ok = await validateStep(activeIndex);
    if (!ok) {
      wizard.step(activeIndex).error();
      return false; // cancels the transition
    }
    wizard.step(activeIndex).removeState('error').complete();
  },

  onAfterShow(wizard, { stepIdx, direction }) {
    console.log(`Arrived at step ${stepIdx}`);
  },
};

const wizard = new SmartWizard('#wizard', options)
  .extend(validationExtension);

// Or after construction:
wizard.extend(anotherExtension);
```

### Safety Guarantees

- A crashing extension **never breaks** the wizard — each hook is wrapped in `try/catch`.
- Registering the same `name` twice is **silently skipped**.
- All hooks fire in **registration order**.

---

## ⏳ Loader

```typescript
wizard.loader.show();   // Adds 'sw-loading' class to root element
wizard.loader.hide();   // Removes it

// Example: async step submission with loading feedback
wizard.on('leaveStep', async (e) => {
  e.preventDefault();
  wizard.loader.show();
  try {
    const ok = await submitStep(e.detail.stepIndex);
    if (ok) wizard.goTo(e.detail.nextStepIndex, { force: true });
  } finally {
    wizard.loader.hide();
  }
});
```

---

## 🎬 Custom Transitions

```typescript
import { SmartWizard, registerTransition } from '@smart-wizard/core';

registerTransition('flipX', (next, current, direction, wizard, done) => {
  const speed = wizard.options.transition.speed;
  // Your animation logic
  done(); // Always call done() when animation completes
});

const wizard = new SmartWizard('#wizard', {
  transition: { effect: 'flipX', speed: 600 },
});
```

### Built-in Transition Effects

| Effect | Description |
|--------|-------------|
| `default` | Instant show/hide |
| `fade` | Cross-fade between steps |
| `slideHorizontal` | Slide left/right |
| `slideVertical` | Slide up/down |
| `slideSwing` | Collapse current, expand next |
| `css` | CSS class-driven — supply your own animation classes |

### CSS Transition (Animate.css example)

```javascript
new SmartWizard('#wizard', {
  transition: {
    effect: 'css',
    speed: 500,
    css: {
      prefix:   'animate__animated',
      forward:  { show: 'animate__fadeInRight',  hide: 'animate__fadeOutLeft'  },
      backward: { show: 'animate__fadeInLeft',   hide: 'animate__fadeOutRight' },
    },
  },
});
```

---

## 🎨 Themes

| Theme | CSS file | Description |
|-------|----------|-------------|
| `default` | _(included in full bundle)_ | Clean, minimal design |
| `arrows` | `dist/themes/arrows.css` | Arrow-chevron step connectors |
| `pills` | `dist/themes/pills.css` | Pill / capsule style steps |

```html
<link rel="stylesheet" href="@smart-wizard/ui/dist/smartwizard-full.css" />
<link rel="stylesheet" href="@smart-wizard/ui/dist/themes/arrows.css" />
```

```javascript
// Switch theme at runtime
wizard.setOptions({ theme: 'pills' });
```

---

## 🌗 Color Schemes & Color Presets

### Color Scheme

| Value | Behaviour |
|-------|-----------|
| `auto` | Follows `prefers-color-scheme` media query |
| `dark` | Always dark |
| `light` | Always light |
| `none` | No class applied — inherits from the page |

```javascript
wizard.setOptions({ colorScheme: 'dark' });
```

### Color Presets

Built-in: `default`, `blue`, `violet`. Any string is accepted for custom presets.

```javascript
wizard.setOptions({ color: 'blue' });
```

Custom preset via CSS custom properties:

```css
[data-color="ocean"] {
  --sw-primary: #006994;
  --sw-primary-light: #e0f4fb;
  --sw-on-primary: #ffffff;
  --sw-accent: #00b4d8;
}
```

---

## 📐 Layouts

| Layout | Description |
|--------|-------------|
| `horizontal` | Nav tabs displayed across the top (default) |
| `vertical` | Nav tabs displayed on the left side |

```javascript
wizard.setOptions({ layout: 'vertical' });
```

---

## ⚛️ React Adapter

```bash
npm install @smart-wizard/react @smart-wizard/core @smart-wizard/ui
```

```tsx
import { useRef } from 'react';
import { useSmartWizard } from '@smart-wizard/react';

function MyWizard() {
  const wizardRef = useRef<HTMLDivElement>(null);

  const {
    info,         // Full WizardInfo snapshot (re-renders on step change)
    stepInfo,     // Shorthand: { currentStep, totalSteps }
    next, prev, first, last,
    goTo,         // (index: number, force?: boolean) => void
    reset,
    destroy,
    setOptions,   // (opts: Partial<WizardOptions>) => void
    getOptions,
    updateHeight,
    loader,       // { show(), hide() }
    wizard,       // Raw SmartWizard instance (escape hatch)
  } = useSmartWizard(wizardRef, {
    theme: 'arrows',
    transition: { effect: 'slideHorizontal', speed: 400 },
  });

  return (
    <div ref={wizardRef} id="wizard">
      <nav className="sw-nav" role="tablist">
        <div className="sw-nav-item" role="tab">
          <div className="badge">1</div>
          <div className="info"><span className="title">Step One</span></div>
        </div>
        <div className="sw-nav-item" role="tab">
          <div className="badge">2</div>
          <div className="info"><span className="title">Step Two</span></div>
        </div>
      </nav>

      <div className="sw-panels">
        <section className="sw-panel" id="panel-1" role="tabpanel" hidden>
          <div className="sw-title">Welcome</div>
          <p>Step {stepInfo.currentStep + 1} of {stepInfo.totalSteps}</p>
        </section>
        <section className="sw-panel" id="panel-2" role="tabpanel" hidden>
          <div className="sw-title">Done!</div>
        </section>
      </div>

      <div className="sw-toolbar sw-toolbar-bottom">
        <div className="sw-toolbar-group">
          <button className="sw-btn sw-btn-outline" onClick={prev}>← Back</button>
        </div>
        <div className="sw-toolbar-group">
          <button className="sw-btn sw-btn-primary" onClick={next}>Next →</button>
        </div>
      </div>
    </div>
  );
}
```

> **Note:** Options passed to `useSmartWizard` are captured at mount time to prevent
> infinite re-renders from inline object literals. To update options after mount, use
> the returned `setOptions()` function.

### SmartWizardProvider (Context API)

```tsx
import { SmartWizardProvider, useWizardContext } from '@smart-wizard/react';

function App() {
  return (
    <SmartWizardProvider options={{ theme: 'pills' }}>
      <WizardRoot />
      <WizardControls />
    </SmartWizardProvider>
  );
}

function WizardControls() {
  const { next, prev, stepInfo } = useWizardContext();
  return (
    <div>
      Step {stepInfo.currentStep + 1} of {stepInfo.totalSteps}
      <button onClick={prev}>Back</button>
      <button onClick={next}>Next</button>
    </div>
  );
}
```

---

## 💚 Vue Adapter

```bash
npm install @smart-wizard/vue @smart-wizard/core @smart-wizard/ui
```

```vue
<template>
  <div ref="wizardRef" id="wizard">
    <nav class="sw-nav" role="tablist">
      <div class="sw-nav-item" role="tab">
        <div class="badge">1</div>
        <div class="info"><span class="title">Step One</span></div>
      </div>
      <div class="sw-nav-item" role="tab">
        <div class="badge">2</div>
        <div class="info"><span class="title">Step Two</span></div>
      </div>
    </nav>

    <div class="sw-panels">
      <section class="sw-panel" id="panel-1" role="tabpanel" hidden>
        <div class="sw-title">Welcome</div>
        <p>Step {{ stepInfo.currentStep + 1 }} of {{ stepInfo.totalSteps }}</p>
      </section>
      <section class="sw-panel" id="panel-2" role="tabpanel" hidden>
        <div class="sw-title">Done!</div>
      </section>
    </div>

    <div class="sw-toolbar sw-toolbar-bottom">
      <div class="sw-toolbar-group">
        <button class="sw-btn sw-btn-outline" @click="prev">← Back</button>
      </div>
      <div class="sw-toolbar-group">
        <button class="sw-btn sw-btn-primary" @click="next">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSmartWizard } from '@smart-wizard/vue';

const wizardRef = ref<HTMLElement | null>(null);

const {
  info,         // Ref<WizardInfo> — reactive, updates on step change
  stepInfo,     // ComputedRef<{ currentStep, totalSteps }>
  next, prev, first, last,
  goTo, reset, destroy,
  setOptions, getOptions,
  updateHeight,
  wizard,       // Ref<SmartWizard | null> — escape hatch
} = useSmartWizard(wizardRef, {
  theme: 'arrows',
  transition: { effect: 'slideHorizontal', speed: 400 },
});
</script>
```

> **Note:** `stepInfo` is a `ComputedRef` — use `stepInfo.value.currentStep` in `<script>` blocks
> and `stepInfo.currentStep` directly in templates (Vue auto-unwraps computed refs in templates).

---

## 🔐 Security Notes

- **XSS** — The core never sets `innerHTML` with untrusted data. Use `setContent(el, string | Node)`
  (exported from `@smart-wizard/core`) in extensions instead of `innerHTML`.
- **CSP** — No `eval` or dynamic script injection. Transitions mutate inline `style` properties,
  so `style-src 'self'` is required in strict CSP environments.
- **Prototype Pollution** — All internal deep-merge operations guard against `__proto__`,
  `constructor`, and `prototype` keys.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

```bash
# Clone and install
git clone https://github.com/techlaboratory/smart-wizard
cd smart-wizard
pnpm install

# Dev servers (each starts the adapter watcher + Vite example)
pnpm run dev:vanilla   # Vanilla JS example
pnpm run dev:react     # React adapter + example
pnpm run dev:vue       # Vue adapter + example

# Build everything
pnpm run build
```

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

Based on the popular [jQuery SmartWizard](https://techlaboratory.net/smartwizard) plugin,
rebuilt from the ground up for modern, framework-agnostic JavaScript.
