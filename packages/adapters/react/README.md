# @smart-wizard/react

**Official React adapter for SmartWizard.**  
React hooks (`useSmartWizard`) and Context API (`SmartWizardProvider`).

> This package is part of the **[SmartWizard](https://github.com/techlab/smart-wizard)** project, the next-generation continuation of the popular jQuery SmartWizard.

---

## 📖 Documentation & Links

* 📚 **Full React Documentation & Examples**: [GitHub Readme](https://github.com/techlab/smart-wizard#-react-adapter)
* 🌐 **Official Website & Demos**: [techlaboratory.net/smart-wizard](https://techlaboratory.net/smart-wizard)
* 🐙 **Repository**: [github.com/techlab/smart-wizard](https://github.com/techlab/smart-wizard)
* 🐛 **Issue Tracker**: [github.com/techlab/smart-wizard/issues](https://github.com/techlab/smart-wizard/issues)

---

## 📥 Installation

```bash
npm install @smart-wizard/react @smart-wizard/core @smart-wizard/ui
```

---

## ⚡ Quick Example

```tsx
import { useRef } from 'react';
import { useSmartWizard } from '@smart-wizard/react';
import '@smart-wizard/ui/full';
import '@smart-wizard/ui/themes/arrows.css';

export function Wizard() {
  const wizardRef = useRef<HTMLDivElement>(null);
  const { next, prev, stepInfo } = useSmartWizard(wizardRef, {
    theme: 'arrows',
    transition: { effect: 'slideHorizontal' },
  });

  return (
    <div ref={wizardRef} id="wizard">
      <nav className="sw-nav" role="tablist">
        <div className="sw-nav-item" role="tab"><span className="title">Step 1</span></div>
        <div className="sw-nav-item" role="tab"><span className="title">Step 2</span></div>
      </nav>
      <div className="sw-panels">
        <section className="sw-panel" id="step-1" role="tabpanel">Step 1 Content</section>
        <section className="sw-panel" id="step-2" role="tabpanel">Step 2 Content</section>
      </div>
      <div className="sw-toolbar">
        <button onClick={prev}>Back</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}
```

---

## 📝 License

Dual-licensed under [MIT](https://github.com/techlab/smart-wizard/blob/main/LICENSE) (open-source) and [Commercial License](https://techlaboratory.net/smart-wizard#license).
