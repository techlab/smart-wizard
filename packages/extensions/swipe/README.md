# @smart-wizard/extension-swipe

**Official touch swipe navigation extension for SmartWizard.**  
Enables mobile and touch swipe gestures without interfering with vertical page scrolling.

> This package is part of the **[SmartWizard](https://github.com/techlab/smart-wizard)** project, the next-generation continuation of the popular [jQuery SmartWizard](https://github.com/techlab/jquery-smartwizard).

---

## 📖 Documentation & Links

* 📚 **Full Documentation & Guides**: [GitHub Readme](https://github.com/techlab/smart-wizard#-extension-system)
* 🌐 **Official Website & Demos**: [techlaboratory.net/smart-wizard](https://techlaboratory.net/smart-wizard)
* 🐙 **Repository**: [github.com/techlab/smart-wizard](https://github.com/techlab/smart-wizard)
* 🐛 **Issue Tracker**: [github.com/techlab/smart-wizard/issues](https://github.com/techlab/smart-wizard/issues)

---

## 📥 Installation

```bash
npm install @smart-wizard/extension-swipe @smart-wizard/core
```

---

## ⚡ Quick Example

```typescript
import { SmartWizard } from '@smart-wizard/core';
import { createSwipeExtension } from '@smart-wizard/extension-swipe';

const wizard = new SmartWizard('#wizard', options)
  .extend(createSwipeExtension({ threshold: 50 })); // threshold in px (default: 50)
```

---

## 📝 License

**Smart Wizard** is dual-licensed:

**[GNU General Public License v3.0 (GPLv3)](https://github.com/techlab/smart-wizard/blob/main/LICENSE)** - free and open-source under the GNU General Public License v3.0

**[Commercial License](https://techlaboratory.net/smart-wizard#license)** — Required for **proprietary (closed-source) application, commercial SaaS, or client project** without releasing your application's source code under the GPLv3.

Commercial licenses help support continued development, maintenance, and new features.
