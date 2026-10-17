# @smart-wizard/extension-url-hash

**Official URL hash and browser history navigation extension for SmartWizard.**  
Synchronizes active steps with `window.location.hash` and integrates with browser back/forward buttons.

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
npm install @smart-wizard/extension-url-hash @smart-wizard/core
```

---

## ⚡ Quick Example

```typescript
import { SmartWizard } from '@smart-wizard/core';
import { createUrlHashExtension } from '@smart-wizard/extension-url-hash';

const wizard = new SmartWizard('#wizard', options)
  .extend(createUrlHashExtension({ supportHistory: true })); // pushState vs location.hash
```

---

## 📝 License

Dual-licensed under [MIT](https://github.com/techlab/smart-wizard/blob/main/LICENSE) (open-source) and [Commercial License](https://techlaboratory.net/smart-wizard#license).
