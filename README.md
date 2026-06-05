# SmartWizard

A modern, framework-agnostic wizard/stepper component library built with TypeScript.

## 🚀 Features

- ✅ **Framework Agnostic Core** — Use with any framework or vanilla JavaScript
- ✅ **Extension System** — Hook into any lifecycle point with `WizardExtension` objects
- ✅ **Custom Transitions** — Register your own transitions via `registerTransition()`
- ✅ **Rich Built-in Transitions** — `default`, `fade`, `slideHorizontal`, `slideVertical`, `slideSwing`, `css`
- ✅ **Async Navigation Guards** — Cancel step navigation with `async onBeforeShow()`
- ✅ **Keyboard Navigation** — Arrow key support out of the box
- ✅ **URL Hash & Browser History** — Back/forward button support
- ✅ **Progress Bars** — Built-in progress bar support
- ✅ **Step States** — `active`, `completed`, `disabled`, `hidden`, `error`, `warning`
- ✅ **Auto Height** — Smooth content height transitions
- ✅ **RTL Support** — Right-to-left layout via `dir="rtl"`
- ✅ **Touch / Swipe** — Optional swipe navigation for touch devices
- ✅ **TypeScript** — Full type definitions included
- ✅ **Monorepo** — Organized with pnpm workspaces and Turborepo

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@smart-wizard/core` | Framework-agnostic core logic | 0.1.0 |
| `@smart-wizard/vanilla` | Vanilla JavaScript implementation | 0.1.0 |
| `@smart-wizard/react` | React bindings | 0.1.0 |
| `@smart-wizard/vue` | Vue 3 bindings | 0.1.0 |

| `@smart-wizard/extension-url-hash` | URL hash + browser history navigation | 0.1.0 |
| `@smart-wizard/extension-keyboard` | Keyboard arrow-key navigation | 0.1.0 |
| `@smart-wizard/extension-swipe` | Touch swipe navigation | 0.1.0 |
| `@smart-wizard/extension-auto-height` | Auto content-height adjustment | 0.1.0 |

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode (watch mode)
pnpm dev
```

## 📖 Usage

### HTML Structure

Every SmartWizard instance requires this base structure. Class names are used to locate elements — IDs connect each nav item to its panel via `aria-controls`.

```html
<div id="wizard">
  <!-- Navigation -->
  <nav class="sw-nav">
    <a class="sw-nav-item" href="#step-1" aria-controls="step-1">
      <span>1</span> Step 1
    </a>
    <a class="sw-nav-item" href="#step-2" aria-controls="step-2">
      <span>2</span> Step 2
    </a>
    <a class="sw-nav-item" href="#step-3" aria-controls="step-3">
      <span>3</span> Step 3
    </a>
  </nav>

  <!-- Content panels -->
  <div class="sw-panels">
    <div id="step-1" class="sw-panel">Step 1 content</div>
    <div id="step-2" class="sw-panel">Step 2 content</div>
    <div id="step-3" class="sw-panel">Step 3 content</div>
  </div>

  <!-- Optional: progress bar -->
  <div class="sw-progress">
    <div class="sw-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
  </div>

  <!-- Optional: navigation buttons -->
  <div class="sw-toolbar sw-toolbar-bottom">
    <button class="sw-btn sw-btn-prev" type="button">Previous</button>
    <button class="sw-btn sw-btn-next" type="button">Next</button>
  </div>
</div>
```

### Vanilla JavaScript

```html
<link rel="stylesheet" href="path/to/smartwizard.css">
<script type="module">
  import { SmartWizard } from '@smart-wizard/core';

  const wizard = new SmartWizard('#wizard', {
    theme: 'default',
    layout: 'horizontal',
    transition: {
      effect: 'slideHorizontal',
      speed: 400,
    },
  });

  // Programmatic navigation
  wizard.next();
  wizard.prev();
  wizard.goToStep(2);
  wizard.reset();
</script>
```

### Data Attributes

Options can also be set directly on the wizard element and will override any JavaScript options:

```html
<div id="wizard"
  data-theme="arrows"
  data-layout="vertical"
  data-transition="fade">
  ...
</div>
```

| Attribute | Values |
|-----------|--------|
| `data-theme` | any theme name string |
| `data-layout` | `horizontal` \| `vertical` |
| `data-transition` | any transition effect name |
| `data-color` | any color preset string |

---

## ⚙️ Configuration Options

```typescript
const wizard = new SmartWizard('#wizard', {
  // ── General ───────────────────────────────────────────────────────────
  initialStep: 0,          // Step index to start on (0-based)
  theme: 'default',        // Theme name — requires matching CSS to be loaded
  colorScheme: 'auto',     // 'auto' | 'dark' | 'light' | 'none'
  layout: 'horizontal',    // 'horizontal' | 'vertical'
  color: 'default',        // Color preset: 'default' | 'blue' | 'violet' | any string
  scrollToView: true,      // Scroll the active nav item into view on change

  // ── Behaviour ─────────────────────────────────────────────────────────
  behavior: {
    autoHeight: true,               // Animate content area height on step change
    useUrlHash: false,              // Select step from URL hash on load
    supportBrowserHistory: false,   // Push hash to browser history on step change
  },

  // ── Navigation ────────────────────────────────────────────────────────
  navigation: {
    enabled: true,          // Allow clicking nav items to jump steps
    alwaysClickable: false, // If true, all steps are always clickable
    completed: {
      enabled: true,                    // Mark visited steps as 'completed'
      completeAllPreviousSteps: true,   // Also mark all steps before initial as completed
      clearOnBack: false,               // Remove 'completed' when navigating backward
      clickable: true,                  // Allow clicking completed steps
    },
  },

  // ── Transition ────────────────────────────────────────────────────────
  transition: {
    effect: 'default',   // 'default' | 'fade' | 'slideHorizontal' | 'slideVertical' | 'slideSwing' | 'css' | custom
    speed: 400,          // Duration in milliseconds
    easing: '',          // CSS easing (used by css transition)
    css: {               // Class-based CSS transition settings
      prefix: '',
      forward:  { show: '', hide: '' },
      backward: { show: '', hide: '' },
    },
  },

  // ── Keyboard ──────────────────────────────────────────────────────────
  keyboardNavigation: {
    enabled: true,
    keys: {
      left:  [37],  // Key codes that navigate backward
      right: [39],  // Key codes that navigate forward
    },
  },

  // ── Swipe ─────────────────────────────────────────────────────────────
  swipeNavigation: {
    enabled: false,   // Enable swipe navigation on touch devices
    threshold: 50,    // Minimum px distance to count as a swipe
  },

  // ── Initial Step States ───────────────────────────────────────────────
  stepStates: {
    completed: [],  // Step indices to mark as completed on load
    disabled:  [],  // Step indices to disable on load
    hidden:    [],  // Step indices to hide on load
    error:     [],  // Step indices to mark as error on load
    warning:   [],  // Step indices to mark as warning on load
  },

  // ── Dynamic Content ───────────────────────────────────────────────────
  contentLoader: null,
  // A function called before each step is shown. Use to load remote content.
  // contentLoader: (stepIndex, direction, position, stepElement, callback) => {
  //   fetch(`/step/${stepIndex}`).then(r => r.text()).then(html => callback(html));
  // }
});
```

---

## 🎯 Public Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `next()` | `void` | Navigate to the next visible step |
| `prev()` | `void` | Navigate to the previous visible step |
| `goToStep(index, force?)` | `void` | Jump to a specific step; `force` skips showability checks |
| `reset()` | `void` | Reset the wizard to its initial state |
| `extend(...extensions)` | `this` | Register one or more extensions (fluent) |
| `destroy()` | `void` | Fire `onDestroy` on all extensions and clean up |
| `setState(steps[], state)` | `void` | Add a state class to given step indices |
| `unsetState(steps[], state)` | `void` | Remove a state class from given step indices |
| `setOptions(options)` | `void` | Merge new options and re-initialize |
| `getOptions()` | `WizardOptions` | Return the current resolved options |
| `getInfo()` | `WizardInfo` | Returns an aggregated snapshot of the wizard's current runtime state. |
| `getWidth()` | `number` | Return the content container width in px |
| `getHeight()` | `number` | Return the content container height in px |
| `loader('show' \| 'hide')` | `void` | Toggle the loading state class |
| `resetHeight()` | `void` | Manually recalculate and set the content height |

### Step States

Valid values for `setState` / `unsetState`:

| State | CSS class applied | Effect |
|-------|-------------------|--------|
| `'active'` | `active` | Current step (managed automatically) |
| `'completed'` | `completed` | Marks step as visited |
| `'disabled'` | `disabled` | Prevents navigation to this step |
| `'hidden'` | `hidden` | Hides the step from the nav |
| `'error'` | `error` | Marks step with an error indicator |
| `'warning'` | `warning` | Marks step with a warning indicator |

```javascript
wizard.setState([1, 2], 'error');     // mark steps 1 and 2 as error
wizard.unsetState([1], 'error');      // clear error on step 1
wizard.setState([0], 'disabled');     // disable step 0
```

---

## 🎨 Events

All events are dispatched on the wizard root element and bubble up the DOM.

| Event | Cancelable | `event.detail` |
|-------|-----------|----------------|
| `initialized` | No | `{ wizard }` |
| `loaded` | No | `{ wizard }` |
| `leaveStep` | **Yes** | `{ stepIndex, nextStepIndex, stepElement, stepDirection, stepPosition }` |
| `showStep` | No | `{ stepIndex, stepElement, stepDirection, stepPosition }` |

```javascript
const el = document.getElementById('wizard');

// Fired after every step change
el.addEventListener('showStep', (e) => {
  const { stepIndex, stepDirection, stepPosition } = e.detail;
  console.log(`Now on step ${stepIndex} (${stepPosition})`);
});

// Cancelable — return false to block navigation
el.addEventListener('leaveStep', (e) => {
  const isValid = validateStep(e.detail.stepIndex);
  if (!isValid) e.preventDefault();
});
```

---

## 🔌 Extension System

Extensions are plain objects that hook into the wizard lifecycle. Register them with `wizard.extend()`.
Official extensions live in `packages/extensions/` and are published as separate opt-in packages —
install only what you need.

### Official Extensions

| Package | What it does |
|---------|-------------|
| `@smart-wizard/extension-url-hash` | Syncs steps with `window.location.hash`; handles browser back/forward |
| `@smart-wizard/extension-keyboard` | Left / right arrow key navigation |
| `@smart-wizard/extension-swipe` | Horizontal touch swipe navigation |
| `@smart-wizard/extension-auto-height` | Adjusts content container height on step change and window resize |

```ts
import { SmartWizard } from '@smart-wizard/core';
import { createUrlHashExtension }   from '@smart-wizard/extension-url-hash';
import { createKeyboardExtension }  from '@smart-wizard/extension-keyboard';
import { createSwipeExtension }     from '@smart-wizard/extension-swipe';
import { createAutoHeightExtension } from '@smart-wizard/extension-auto-height';

const wizard = new SmartWizard('#wizard', options)
  .extend(
    createUrlHashExtension({ supportHistory: true }),
    createKeyboardExtension(),
    createSwipeExtension({ threshold: 60 }),
    createAutoHeightExtension(),
  );
```

### `WizardExtension` Interface

```typescript
import type { WizardExtension } from '@smart-wizard/core';

const myExtension: WizardExtension = {
  name: 'my-extension',   // Required: unique identifier

  onInstall(wizard) {},   // Called once when registered
  onInit(wizard) {},      // Called on init() — construction, reset, setOptions
  onLoad(wizard) {},      // Called after the first step is shown
  onDestroy(wizard) {},   // Called when destroy() is invoked

  // Sync or async — return false to cancel navigation
  onBeforeShow(wizard, { stepIdx, currentIdx, direction }) {},
  onAfterShow(wizard, { stepIdx, direction }) {},
};
```

### Registration

```javascript
import { SmartWizard } from '@smart-wizard/core';

const wizard = new SmartWizard('#wizard', options)
  .extend(myExtension, anotherExtension);

// Or after construction:
wizard.extend(lateExtension);
```

### Example: Async Validation Extension

```javascript
const validationExtension = {
  name: 'validation',

  async onBeforeShow(wizard, { stepIdx, currentIdx, direction }) {
    // Only validate when moving forward
    if (direction !== 'forward') return;

    const form = wizard.stepItems[currentIdx]?.page.querySelector('form');
    if (!form) return;

    const isValid = await validateForm(form);
    if (!isValid) {
      wizard.setState([currentIdx], 'error');
      return false;   // ← cancels the navigation
    }

    wizard.unsetState([currentIdx], 'error');
    wizard.setState([currentIdx], 'completed');
  },
};

wizard.extend(validationExtension);
```

### Example: Analytics Extension

```javascript
const analyticsExtension = {
  name: 'analytics',

  onAfterShow(wizard, { stepIdx }) {
    gtag('event', 'wizard_step_view', {
      step_index: stepIdx,
      total_steps: wizard.stepItems.length,
    });
  },

  onDestroy(wizard) {
    console.log('Wizard destroyed after reaching step', wizard.currentIndex);
  },
};
```

### Safety Guarantees

- A crashing extension **never breaks** the wizard — each hook call is wrapped in `try/catch`.
- Registering the same `name` twice is silently **skipped** (no override).
- Invalid names (`__proto__`, empty string, non-string) are **rejected** with a console warning.
- All hooks fire in **registration order**.

---

## 🎬 Custom Transitions

Register your own transition effect with `registerTransition()`. Use it by setting `transition.effect` to your chosen name.

```javascript
import { SmartWizard, registerTransition } from '@smart-wizard/core';

registerTransition('flipX', (next, current, direction, wizard, done) => {
  const speed = wizard.options.transition.speed;
  // ... your animation logic ...
  done();  // ← always call done() when the animation completes
});

const wizard = new SmartWizard('#wizard', {
  transition: { effect: 'flipX', speed: 500 },
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
| `css` | Fully CSS-driven — supply your own animation class names via `transition.css` |

### CSS Transition Example

```javascript
const wizard = new SmartWizard('#wizard', {
  transition: {
    effect: 'css',
    speed: 500,
    css: {
      prefix: 'animate__animated',
      forward:  { show: 'animate__fadeInRight', hide: 'animate__fadeOutLeft' },
      backward: { show: 'animate__fadeInLeft',  hide: 'animate__fadeOutRight' },
    },
  },
});
```

---

## 🎨 Themes

Set via `theme` option or `data-theme` attribute. Requires matching CSS to be loaded.

| Theme | Description |
|-------|-------------|
| `default` | Clean, minimal design |
| `arrows` | Arrow-chevron step connectors |
| `dots` | Dot-style step indicators |
| `progress` | Progress-bar style |

Custom themes can be created by targeting the `sw-theme-{name}` class on the root element.

---

## 🔐 Security Notes

- **XSS** — The extension API never accepts raw HTML. Use `setContent(el, string | Node)` (exported from `@smart-wizard/core`) instead of `innerHTML` in your extensions.
- **CSP** — The core uses no `eval` or dynamic script injection. Transition animations mutate inline `style` properties, so `style-src 'self'` is required in strict CSP environments.
- **Prototype Pollution** — All internal merge operations guard against `__proto__`, `constructor`, and `prototype` keys.

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Documentation

Full documentation: [https://techlaboratory.net/smartwizard](https://techlaboratory.net/smartwizard)

## 🙏 Credits

Based on the popular jQuery SmartWizard plugin, now rebuilt for modern JavaScript frameworks.
