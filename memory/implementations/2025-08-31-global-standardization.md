# 2025-08-31-global-standardization.md

## Status: COMPLETED

## Feature: Global Variable Standardization & Constants

**User Request:** "Try 45px. And make this a global variable will you. Always think global variables!"

## Implementation:

### ✅ Global Swipe Distance
```javascript
const SWIPE_DISTANCE = 45.2; // 12px (edge) + 19.2px (icon) + 12px (gap) optimized for UX
```
- Replaced all hardcoded `43` values with `SWIPE_DISTANCE`
- User iteratively adjusted: 45 → 44 → 44.5 → 45.2px

### ✅ Global Color Constants
```javascript
const COLORS = {
  GREEN: '#7aa992',
  PURPLE: '#a78bfa', 
  BLUE_DUSTY: '#89a5c9',
  GREY: '#b8c1c9',
  RED: '#c87a7a'
};
```
- Replaced all duplicate local color constants throughout ui.js
- Consolidated trip card gradient colors
- Unified expense card swipe colors

### ✅ Global UI Constants
```javascript
const UI_CONSTANTS = {
  DOUBLE_CLICK_DELAY: 300,
  DEBUG_Z_INDEX: 9999,
  ICON_Z_INDEX: 0,
  CONTENT_Z_INDEX: 2,
  BORDER_RADIUS: '6px'
};
```

### ✅ CSS Custom Properties Added
```css
:root {
  --theme-color-purple: #a78bfa;
  --theme-color-red: #c87a7a;
  --theme-color-grey: #b8c1c9;
  --border-radius-standard: 6px;
  --debug-bg-color: #007bff;
  --debug-stop-bg-color: #dc3545;
  /* ... plus z-index and timing constants */
}
```

## Files Modified:
- `ui.js`: Global constants and ~15 local constant replacements
- `styles.css`: Added comprehensive CSS custom properties

## Impact:
- Single source of truth for all constants
- Easier maintenance and consistency
- Preparation for theming system

## Testing:
- All swipe distances now use global 45.2px value
- All color references consolidated
- Cache-busting URL: `http://localhost:3000?v=20250831-GLOBAL-STANDARDS`