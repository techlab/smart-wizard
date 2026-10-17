# @smart-wizard/core

**The framework-agnostic engine for SmartWizard.**  
Zero dependencies · TypeScript · Accessible · Extensible · Themeable

> This package is part of the **[SmartWizard](https://github.com/techlab/smart-wizard)** project, the next-generation continuation of the popular [jQuery SmartWizard](https://github.com/techlab/jquery-smartwizard).

---

## 📖 Documentation & Links

* 📚 **Full Documentation & Guides**: [GitHub Readme](https://github.com/techlab/smart-wizard#readme)
* 🌐 **Official Website & Demos**: [techlaboratory.net/smart-wizard](https://techlaboratory.net/smart-wizard)
* 🐙 **Repository**: [github.com/techlab/smart-wizard](https://github.com/techlab/smart-wizard)
* 🐛 **Issue Tracker**: [github.com/techlab/smart-wizard/issues](https://github.com/techlab/smart-wizard/issues)

---

## 📥 Installation

```bash
npm install @smart-wizard/core @smart-wizard/ui
```

---

## ⚡ Quick Example

```javascript
import { SmartWizard } from '@smart-wizard/core';
import '@smart-wizard/ui/full';
import '@smart-wizard/ui/themes/arrows.css'; // optional theme

const wizard = new SmartWizard('#wizard', {
  theme: 'arrows',
  transition: { effect: 'slideHorizontal', speed: 400 },
});
```

---

## 📝 License

Dual-licensed under [MIT](https://github.com/techlab/smart-wizard/blob/main/LICENSE) (open-source) and [Commercial License](https://techlaboratory.net/smart-wizard#license).
