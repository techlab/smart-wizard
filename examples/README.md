# SmartWizard Examples

This directory contains comprehensive examples for using SmartWizard in different frameworks.

## 📁 Examples

### Vanilla JavaScript

Located in `vanilla/` directory:

1. **index.html** - Complete working example with all features
   - Keyboard navigation
   - Progress tracking
   - External controls
   - Event handling
   
2. **transitions.html** - Interactive transitions demo
   - Switch between animation types
   - Live transition preview
   - Beautiful gradient UI

**To run:**
```bash
# Open directly in browser
open vanilla/index.html

# Or use a local server
cd vanilla
python3 -m http.server 8000
# Visit: http://localhost:8000
```

### React Example

Located in `react/` directory:

**Features:**
- ✅ React 18 with hooks
- ✅ TypeScript support
- ✅ Vite for fast development
- ✅ useSmartWizard hook integration
- ✅ Reactive state management
- ✅ Modern gradient UI

**To run:**
```bash
cd react
pnpm install
pnpm dev
# Visit: http://localhost:3000
```

**Build for production:**
```bash
pnpm build
pnpm preview
```

### Vue Example

Located in `vue/` directory:

**Features:**
- ✅ Vue 3 Composition API
- ✅ TypeScript support
- ✅ Vite for fast development
- ✅ useSmartWizard composable
- ✅ Reactive refs and computed
- ✅ Beautiful pink/purple theme

**To run:**
```bash
cd vue
pnpm install
pnpm dev
# Visit: http://localhost:3001
```

**Build for production:**
```bash
pnpm build
pnpm preview
```

## 🎨 Example Features

All examples demonstrate:

- ✅ Step navigation (next, prev, goToStep)
- ✅ Keyboard navigation (arrow keys)
- ✅ Progress bar tracking
- ✅ Transition animations
- ✅ External controls
- ✅ Event handling
- ✅ Step state management
- ✅ Responsive design
- ✅ Modern UI with gradients

## 🚀 Quick Start

### Vanilla JS (Fastest)
```html
<script type="module">
  import { SmartWizard } from '../../packages/core/dist/index.mjs';
  
  const wizard = new SmartWizard('#wizard', {
    transition: { animation: 'slideHorizontal' }
  });
</script>
```

### React
```tsx
import { useRef } from 'react';
import { useSmartWizard } from '@smart-wizard/react';

function MyWizard() {
  const wizardRef = useRef<HTMLDivElement>(null);
  const { stepInfo, next, prev } = useSmartWizard(wizardRef, {
    transition: { animation: 'fade' }
  });
  
  return <div ref={wizardRef}>{/* wizard HTML */}</div>;
}
```

### Vue
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useSmartWizard } from '@smart-wizard/vue';

const wizardRef = ref<HTMLElement | null>(null);
const { stepInfo, next, prev } = useSmartWizard(wizardRef, {
  transition: { animation: 'slideHorizontal' }
});
</script>

<template>
  <div ref="wizardRef">{/* wizard HTML */}</div>
</template>
```

## 📝 HTML Structure

All examples use the same HTML structure:

```html
<div id="smartwizard">
  <!-- Navigation -->
  <ul class="nav">
    <li class="nav-item">
      <a class="nav-link" href="#step-1">
        <span class="num">1</span>
        Step Title
      </a>
    </li>
    <!-- More steps... -->
  </ul>

  <!-- Content -->
  <div class="tab-content">
    <div id="step-1" class="tab-pane">
      Step 1 Content
    </div>
    <!-- More content... -->
  </div>

  <!-- Progress Bar (optional) -->
  <div class="progress">
    <div class="progress-bar"></div>
  </div>
</div>
```

## 🎯 Configuration Options

Common options used in examples:

```javascript
{
  // Initial step (0-based index)
  selected: 0,
  
  // Transition animation
  transition: {
    animation: 'slideHorizontal', // none, fade, slideVertical, slideSwing, css
    speed: '400'
  },
  
  // Toolbar configuration
  toolbar: {
    position: 'bottom', // none, top, bottom, both
    showNextButton: true,
    showPreviousButton: true
  },
  
  // Keyboard navigation
  keyboard: {
    keyNavigation: true,
    keyLeft: [37],  // Left arrow
    keyRight: [39]  // Right arrow
  }
}
```

## 🎨 Customization

Each example has its own theme:

- **Vanilla Basic** - Clean blue theme
- **Vanilla Transitions** - Purple gradient
- **React** - Blue/purple gradient
- **Vue** - Pink/purple gradient

Feel free to customize the CSS in each example!

## 📚 Learn More

- [Main README](../README.md) - Full documentation
- [API Reference](../README.md#-public-methods) - All methods and options
- [Build Guide](../BUILD_FIXES.md) - Build configuration

## 🐛 Troubleshooting

### Module not found errors
Make sure you've built the packages first:
```bash
cd ..
pnpm build
```

### React/Vue examples won't start
Install dependencies in the example directory:
```bash
cd react  # or vue
pnpm install
```

### Styles not loading
Check that the CSS files are properly imported in the example.

## 💡 Tips

1. **Use keyboard navigation** - Arrow keys work in all examples
2. **Check the console** - Event logs show wizard state changes
3. **Try different transitions** - Each animation has a unique feel
4. **Customize the theme** - Edit the CSS to match your brand
5. **Add validation** - Use the `leaveStep` event to validate before navigation

## 🎉 Have Fun!

These examples are a great starting point for your own wizard implementations. Feel free to copy and modify them for your projects!
