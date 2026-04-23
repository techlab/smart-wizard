## 2025-05-14 - [CSS Variable Standardization]
**Learning:** Standardizing CSS variables with a consistent prefix (--sw-) and categorizing them into Brand, Functional, and Component tokens significantly improves maintainability and simplifies theme-wide changes (e.g., changing primary color).
**Action:** Always start a UI refactor by defining a clear, categorized variable structure in a root file.

## 2025-05-14 - [Keyboard Accessibility & Focus States]
**Learning:** High-contrast :focus-visible styles are essential for accessibility but often overlooked. Using standardized focus ring variables ensures a consistent and pleasant experience for keyboard users.
**Action:** Implement :focus-visible styles as a standard part of component development, not an afterthought.

## 2025-05-14 - [Mobile Navigation Layouts]
**Learning:** Horizontal wizards often require complex stacking logic on mobile. Ensuring the active step is visually prominent and using vertical stacking with clear borders improves usability on small screens.
**Action:** Use media queries to switch from horizontal to vertical navigation structures at standard breakpoints for wizards with more than 3 steps.
