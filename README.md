# SmartWizard

A modern, framework-agnostic wizard/stepper component library built with TypeScript.

## 🚀 Features

- ✅ **Framework Agnostic Core** - Use with any framework or vanilla JavaScript
- ✅ **Multiple Framework Adapters** - React, Vue 3, and Vanilla JS implementations
- ✅ **Rich Transitions** - Built-in animations (none, fade, slideHorizontal, slideVertical, CSS-based)
- ✅ **Keyboard Navigation** - Arrow keys support for easy navigation
- ✅ **URL Hash Support** - Browser back/forward button support
- ✅ **Progress Tracking** - Built-in progress bar
- ✅ **Customizable Toolbar** - Flexible toolbar positioning (top, bottom, both, none)
- ✅ **Step States** - Active, done, disabled, hidden, error, warning states
- ✅ **Auto Height Adjustment** - Smooth content height transitions
- ✅ **TypeScript** - Full TypeScript support with comprehensive type definitions
- ✅ **Monorepo Structure** - Organized with pnpm workspaces and Turborepo

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@smartwizard/core` | Core logic (framework-agnostic) | 0.1.0 |
| `@smartwizard/vanilla` | Vanilla JavaScript implementation | 0.1.0 |
| `@smartwizard/react` | React bindings | 0.1.0 |
| `@smartwizard/vue` | Vue 3 bindings | 0.1.0 |
| `@smartwizard/ui-bootstrap` | Bootstrap theme | 0.1.0 |
| `@smartwizard/ui-tailwind` | Tailwind CSS utilities | 0.1.0 |

## 🛠️ Development Setup

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

### Project Structure

```
smart-wizard/
├── packages/
│   ├── core/                    # Framework-agnostic core logic
│   ├── vanilla/                 # Vanilla JavaScript implementation
│   ├── react/                   # React bindings
│   ├── vue/                     # Vue bindings
│   ├── ui-bootstrap/            # Bootstrap theme
│   └── ui-tailwind/             # Tailwind utilities
├── examples/                    # Example applications
│   ├── vanilla/
│   ├── react/
│   └── vue/
├── pnpm-workspace.yaml          # pnpm workspace config
├── turbo.json                   # Turborepo config
└── tsconfig.base.json           # Base TypeScript config
```

## 📖 Usage

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/smartwizard.css">
</head>
<body>
  <div id="smartwizard">
    <ul class="nav">
      <li class="nav-item">
        <a class="nav-link" href="#step-1">
          <span class="num">1</span> Step 1
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#step-2">
          <span class="num">2</span> Step 2
        </a>
      </li>
    </ul>
    
    <div class="tab-content">
      <div id="step-1" class="tab-pane">Step 1 Content</div>
      <div id="step-2" class="tab-pane">Step 2 Content</div>
    </div>
    
    <div class="progress">
      <div class="progress-bar"></div>
    </div>
  </div>

  <script type="module">
    import { SmartWizard } from '@smartwizard/vanilla';

    const wizard = new SmartWizard('#smartwizard', {
      theme: 'default',
      transition: {
        animation: 'slideHorizontal',
        speed: '400'
      },
      toolbar: {
        position: 'bottom',
        showNextButton: true,
        showPreviousButton: true
      }
    });

    // Public methods
    wizard.next();
    wizard.prev();
    wizard.goToStep(2);
    wizard.reset();
    wizard.getStepInfo();
  </script>
</body>
</html>
```

### React

```tsx
import { useRef } from 'react';
import { useSmartWizard } from '@smartwizard/react';

function MyWizard() {
  const wizardRef = useRef<HTMLDivElement>(null);
  const { stepInfo, next, prev } = useSmartWizard(wizardRef, {
    transition: {
      animation: 'fade'
    }
  });

  return (
    <div ref={wizardRef}>
      {/* Wizard HTML structure */}
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <div ref="wizardRef">
    <!-- Wizard HTML structure -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSmartWizard } from '@smartwizard/vue';

const wizardRef = ref<HTMLElement | null>(null);
const { stepInfo, next, prev } = useSmartWizard(wizardRef, {
  transition: {
    animation: 'slideHorizontal'
  }
});
</script>
```

## ⚙️ Configuration Options

### Core Options

```typescript
{
  selected: 0,                    // Initial step index
  theme: 'default',               // Theme name
  justified: true,                // Justify step buttons
  autoAdjustHeight: true,         // Auto adjust content height
  backButtonSupport: true,        // Browser back button support
  enableUrlHash: true,            // Enable URL hash updates
  
  transition: {
    animation: 'none',            // none | fade | slideHorizontal | slideVertical | slideSwing | css
    speed: '400',                 // Animation speed in ms
    easing: '',                   // CSS easing function
    fwdShowCss: '',              // Forward show CSS class
    fwdHideCss: '',              // Forward hide CSS class
    bckShowCss: '',              // Backward show CSS class
    bckHideCss: ''               // Backward hide CSS class
  },
  
  toolbar: {
    position: 'bottom',           // none | top | bottom | both
    showNextButton: true,
    showPreviousButton: true,
    extraHtml: ''                 // Additional toolbar HTML
  },
  
  anchor: {
    enableNavigation: true,
    enableNavigationAlways: false,
    enableDoneState: true,
    markPreviousStepsAsDone: true,
    unDoneOnBackNavigation: false,
    enableDoneStateNavigation: true
  },
  
  keyboard: {
    keyNavigation: true,
    keyLeft: [37],                // Left arrow key code
    keyRight: [39]                // Right arrow key code
  },
  
  lang: {
    next: 'Next',
    previous: 'Previous'
  },
  
  disabledSteps: [],              // Array of step indices to disable
  errorSteps: [],                 // Array of step indices to mark as error
  warningSteps: [],               // Array of step indices to mark as warning
  hiddenSteps: []                 // Array of step indices to hide
}
```

## 🎯 Public Methods

| Method | Description |
|--------|-------------|
| `next()` | Navigate to next step |
| `prev()` | Navigate to previous step |
| `goToStep(index, force?)` | Navigate to specific step |
| `reset()` | Reset wizard to initial state |
| `getStepInfo()` | Get current step information |
| `setState(steps[], state)` | Set state for specific steps |
| `unsetState(steps[], state)` | Unset state for specific steps |
| `setOptions(options)` | Update wizard options |
| `getOptions()` | Get current options |
| `loader('show' \| 'hide')` | Show/hide loader |
| `fixHeight()` | Manually adjust content height |

## 🎨 Events

The wizard emits the following custom events:

- `initialized` - Fired when wizard is initialized
- `leaveStep` - Fired before leaving a step (cancelable)
- `showStep` - Fired after showing a step

```javascript
const wizardElement = document.getElementById('smartwizard');

wizardElement.addEventListener('showStep', (e) => {
  console.log('Step changed:', e.detail);
});
```

## 🎨 Themes

SmartWizard comes with built-in themes and supports custom themes:

- `default` - Clean, modern design
- `arrows` - Arrow-style navigation
- `dots` - Dot-style indicators
- Custom themes via CSS

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Documentation

For more detailed documentation, visit [https://techlaboratory.net/smartwizard](https://techlaboratory.net/smartwizard)

## 🙏 Credits

Based on the popular jQuery SmartWizard plugin, now rebuilt for modern JavaScript frameworks.
