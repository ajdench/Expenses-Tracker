# ui.js Recovery Plan

This document provides instructions on how to revert the refactoring changes made to `ui.js` if necessary.

## 1. Reverting Function Definitions

For each function that was changed from `function functionName(...) {` to `window.UI.functionName = function(...) {`, revert the change.

**Example:**

-   **From:** `window.UI.renderShell = async function() {`
-   **To:** `async function renderShell() {`

Similarly for `async function` and `window.` prefixed functions.

## 2. Reverting Function Calls

For each function call that was changed from `window.UI.functionName(args)` to `functionName(args)`, revert the change.

**Example:**

-   **From:** `window.UI.renderShell()`
-   **To:** `renderShell()`

## 3. Reverting `dbg` Calls

For each `dbg` call that was changed from `window.App.dbg(args)` to `dbg(args)`, revert the change.

**Example:**

-   **From:** `window.App.dbg('message')`
-   **To:** `dbg('message')`

## 4. Reverting Scanner Functions

If the scanner functions were modified or duplicated, revert them to their original state before the `scanic` integration. Refer to `scanicImplementation.md` for the original state of these functions.

## 5. Remove `window.UI = {};`

Remove the line `window.UI = {};` from the top of the file.

---

**Important Note:** This recovery plan assumes that the changes were applied incrementally as described in `ui-js-refactor-plan.md`. If the file has been modified in other ways, manual intervention might be required.
