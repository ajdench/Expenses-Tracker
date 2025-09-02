# ui.js Refactoring Plan: Incremental Application

This document outlines the step-by-step plan for refactoring `ui.js` to organize its top-level functions under a `window.UI` object and to correctly handle function calls. This plan will be applied incrementally using precise `replace` operations.

## 1. Objective

The primary objective is to refactor `ui.js` to ensure all its top-level functions are properly exposed under a `window.UI` object, resolving `ReferenceError` issues and improving global scope management.

## 2. Overall Strategy

The refactoring will be performed in several phases, each involving targeted `replace` operations. This incremental approach aims to minimize errors and allow for step-by-step verification.

## 3. Phase 1: Refactor Function Definitions

In this phase, all top-level function declarations in `ui.js` will be modified to become properties of the `window.UI` object. This will be done for both `function` and `async function` declarations.

**General Pattern:**

-   **From:** `function functionName(args) {`
-   **To:** `window.UI.functionName = function(args) {`

-   **From:** `async function functionName(args) {`
-   **To:** `window.UI.functionName = async function(args) {`

**Specific Functions to Refactor (and their original definitions):**

-   `async function renderShell()`
-   `window.renderTrips = async function(selectedTripId = null)` (This will become `window.UI.renderTrips = async function(...)`) 
-   `async function renderSettingsPage()`
-   `function buildTripCard(trip, isSelected)`
-   `function showContextMenu(x, y, actions)`
-   `function buildAddTripShadowCard()`
-   `async function syncTripOrderFromDOM()`
-   `async function renderArchivedTrips()`
-   `async function addArchivedTripSwipe(card, trip, onDeselect)`
-   `async function renderTripDetail(tripId)`
-   `async function loadCategoryColorMap()`
-   `async function loadIconSettings()`
-   `async function loadScanSettings()`
-   `async function colorizeCategorySelect(selectEl)`
-   `function pastelizeColor(color)`
-   `async function clearAppCache()`
-   `function buildExpenseCard(expense, isSelected, context = 'normal')`
-   `function startEditExpense(card, expense)`
-   `function buildAddExpenseShadowCard(tripId)`
-   `function attachLongPressToEdit(card, expense)`
-   `async function normalizeImageForSave(file)`
-   `function openReceiptPicker(expenseId, iconEl)`
-   `function openReceiptActionSheet(expenseId, iconEl)`
-   `function isIosSafari()`
-   `async function launchShortcutsScan(expenseId)`
-   `async function launchShortcutsScanToFiles(expenseId)`
-   `function buildScanFilename(expense, scan, trip)`
-   `function buildScanSubfolder(expense, scan, trip)`
-   `function applyTemplate(tpl, ctx)`
-   `function safeFilename(name)`
-   `function safePath(pathStr)`
-   `async function showReceiptModal(expenseId)`
-   `async function renderReceiptModalContent(modalEl, expenseId)`
-   `async function renderPdfToCanvas(blob, canvas)`
-   `async function renderPdfThumb(blob, canvas)`
-   `async function renderExpenseList(tripId, selectedExpenseId = null)`
-   `async function syncExpenseOrderFromDOM(tripId)`
-   `async function selectExpense(expenseId)`
-   `function selectTrip(tripId)`
-   `function escapeHTML(str)`
-   `function getModalInstance(modalId)`
-   `function hideModal(modalId)`
-   `async function renderArchivedExpenses(tripId)`
-   `async function loadReceiptViewerSettings()`
-   `async function openReceiptViewer(expenseId)`
-   `async function renderReceiptPage(expenseId)`
-   `async function blobToWhiteDataURL(blob)`
-   `async function blobToDataURL(blob)`
-   `window.showScannerView = function()` (This will become `window.UI.showScannerView = function(...)`) 
-   `window.hideScannerView = function()` (This will become `window.UI.hideScannerView = function(...)`) 
-   `window.addReceiptThumbnail = function()` (This will become `window.UI.addReceiptThumbnail = function(...)`) 
-   `window.removeReceiptThumbnail = function()` (This will become `window.UI.removeReceiptThumbnail = function(...)`) 

## 4. Phase 2: Refactor Function Calls

After all function definitions are updated, all internal calls within `ui.js` to these functions will be updated to use the `window.UI.` prefix.

**General Pattern:**

-   **From:** `functionName(args)`
-   **To:** `window.UI.functionName(args)`

## 5. Phase 3: Handle `dbg` Calls

All calls to the `dbg` function will be updated to use `window.App.dbg`.

**General Pattern:**

-   **From:** `dbg(args)`
-   **To:** `window.App.dbg(args)`

## 6. Phase 4: Remove Duplicated Scanner Functions

This phase will remove any duplicated scanner function blocks that might have been introduced during previous attempts.

**General Pattern:**

-   Locate and remove the duplicated `// --- Scanner View Functions ---` block (if present).

---