# Scanic Library Integration Documentation

## 1. Objective

This document details the implementation of the `scanic` JavaScript library for document scanning, replacing the previous receipt handling mechanism. The goal was to provide a rich, in-app document scanning experience for adding expense receipts, including support for multiple images, thumbnails, and deletion.

## 2. Architectural Overview

The integration was designed to be modular while accommodating the global, non-module nature of the `scanic` library loaded from a CDN.

-   **New File (`scanner.js`)**: All logic for initializing and controlling the `scanic` library is encapsulated in this new file.
-   **Global Functions**: To allow communication between `app.js`, `ui.js`, and `scanner.js` without using ES6 modules (due to the CDN script), key functions were attached to the `window` object, making them globally accessible.
-   **Dedicated Scanner View**: A new full-screen view (`#scanner-view`) was added to `index.html` to host the scanner and thumbnail previews, ensuring a clean user experience without interfering with existing views.

## 3. File-by-File Changes

The following is a comprehensive list of all modifications made to the project files.

### 3.1. `scanner.js` (New File)

A new file was created to handle the `scanic` library.

-   **Path**: `/scanner.js`
-   **Purpose**: Initializes the `scanic` instance, handles scan events, and provides simple functions (`initScanner`, `showScanner`, `hideScanner`) to be called from `app.js`.
-   **Content**:
    ```javascript
    // scanner.js
    let scanicInstance;

    function initScanner(container, onScanComplete) {
        if (scanicInstance) {
            scanicInstance.destroy();
        }
        const options = {
            container: container,
            showActions: true,
            quality: 0.8,
        };
        scanicInstance = new Scanic(options);
        scanicInstance.on('scan', (blob) => {
            onScanComplete(blob);
            hideScanner();
        });
        scanicInstance.on('cancel', () => {
            hideScanner();
        });
    }

    function showScanner() {
        if (scanicInstance) {
            scanicInstance.show();
        }
    }

    function hideScanner() {
        if (scanicInstance) {
            scanicInstance.hide();
        }
    }
    ```

### 3.2. `index.html`

The main HTML file was modified to include the new scanner view and the necessary scripts.

-   **Scanner View Added**: A new `div` with the ID `scanner-view` was added before the closing `</body>` tag.
    ```html
      <div id="scanner-view" class="hidden">
        <div id="scanic-container"></div>
        <div id="thumbnail-bar">
            <!-- Thumbnails will be dynamically added here -->
        </div>
        <div class="scanner-controls">
            <button id="add-another-receipt-btn" class="btn btn-secondary">Add Another</button>
            <button id="done-scanning-btn" class="btn btn-primary">Done</button>
        </div>
      </div>
    ```
-   **Script Loading Order Changed**: The script tags were updated to load the `scanic` library from the CDN and to load our local scripts as regular (non-module) scripts in the correct order.
    ```html
      <script src="https://unpkg.com/scanic/dist/scanic.js"></script>
      <script src="db.js?v=20250828-15"></script>
      <script src="scanner.js"></script>
      <script src="ui.js?v=20250829-EXPENSE-MOUSE-SWIPES"></script>
      <script src="app.js?v=20250829-PRESERVE-PARAMS"></script>
      <script src="register-sw.js?v=20250828-15"></script>
    ```

### 3.3. `styles.css`

New styles were appended to the end of the file to control the appearance of the scanner view, thumbnails, and controls.

-   **Appended Styles**:
    ```css
    /* Scanner View Styles */
    .hidden {
        display: none !important;
    }

    #scanner-view {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        z-index: 1050;
        display: flex;
        flex-direction: column;
    }

    #scanic-container {
        flex: 1;
        min-height: 0;
    }

    #thumbnail-bar {
        flex-shrink: 0;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        gap: 10px;
        overflow-x: auto;
        height: 100px;
    }

    .thumbnail {
        position: relative;
        width: 70px;
        height: 70px;
        border: 2px solid #fff;
        border-radius: 5px;
        overflow: hidden;
    }

    .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .delete-thumb-btn {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 20px;
        height: 20px;
        background-color: #dc3545;
        color: white;
        border: 1px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        cursor: pointer !important;
    }

    .scanner-controls {
        flex-shrink: 0;
        padding: 10px;
        background-color: #f8f9fa;
        text-align: center;
    }
    ```

### 3.4. `app.js`

This file was modified to remove module imports and expose functions globally.

-   **Removed ES6 Module Syntax**: The `import` and `export` keywords were removed.
-   **Global Functions**: The core functions for the scanning flow (`startReceiptScan`, `deleteReceipt`, `finishScanning`) were attached to the `window` object to make them globally accessible from `ui.js`.
    ```javascript
    // --- Scanic Integration ---

    let currentExpenseIdForScan = null;

    window.startReceiptScan = async function(expenseId) {
        // ... implementation ...
    }

    async function handleScanResult(imageBlob) {
        // ... implementation ...
    }

    window.deleteReceipt = async function(receiptId) {
        // ... implementation ...
    }

    window.finishScanning = function() {
        // ... implementation ...
    }
    ```

### 3.5. `ui.js`

This file was also modified to remove module syntax and to update the event listener on the receipt icon.

-   **Removed ES6 Module Syntax**: The `import` statement was removed.
-   **Updated Event Listener**: In the `buildExpenseCard` function, the `click` and `keydown` event listeners for the `.expense-receipt-icon` were changed to call the new global `startReceiptScan(expense.id)` function.
    ```javascript
    // Old code that was replaced:
    // if (icon.classList.contains('has-receipt')) {
    //   await openReceiptViewer(expense.id);
    // } else {
    //   openReceiptActionSheet(expense.id, icon);
    // }

    // New code:
    startReceiptScan(expense.id);
    ```
-   **Global Functions Added**: New functions for managing the scanner UI (`showScannerView`, `hideScannerView`, `addReceiptThumbnail`, `removeReceiptThumbnail`) were added to the end of the file and attached to the `window` object to make them globally accessible.

## 4. Recovery Plan

If this implementation causes issues or needs to be reverted, follow these steps:

1.  **`index.html`**:
    *   Remove the `<script src="https://unpkg.com/scanic/dist/scanic.js"></script>` line.
    *   Remove the `<script src="scanner.js"></script>` line.
    *   Remove the `<div id="scanner-view" ...>...</div>` block.
    *   (Optional) Re-add `type="module"` to the `app.js` and `ui.js` script tags if you revert them to be modules.

2.  **`scanner.js`**:
    *   Delete the file `/scanner.js`.

3.  **`styles.css`**:
    *   Remove the CSS code block titled `/* Scanner View Styles */` from the end of the file.

4.  **`app.js`**:
    *   Remove the code block titled `// --- Scanic Integration ---`.
    *   Remove the `window.` prefix from any functions that were made global.

5.  **`ui.js`**:
    *   In `buildExpenseCard`, revert the event listener for `.expense-receipt-icon` to its previous state (which called `openReceiptViewer` or `openReceiptActionSheet`).
    *   Remove the code block titled `// --- Scanner View Functions ---` from the end of the file.
    *   Remove the `window.` prefix from any functions that were made global.

## 5. Debugging and Corrections

Following the initial implementation, the application failed to load correctly. This section documents the debugging process and the corrective actions taken.

### 5.1. Initial Problem

The application was unresponsive at `http://localhost:3000` after the initial integration of the `scanic` library.

### 5.2. Investigation and Diagnosis

The root cause of the failure was a series of issues related to JavaScript execution order and scope, arising from the move from ES6 modules to traditional global scripts to accommodate the CDN-hosted `scanic` library.

1.  **Incorrect Script Execution Order**: The initial script loading order in `index.html` was incorrect, causing functions to be called before they were defined.
2.  **Missing Global Functions**: The functions in `scanner.js` were not attached to the `window` object, making them inaccessible to `app.js` and `ui.js`.
3.  **Tooling Errors**: Repeated attempts to fix the issues with the `replace` tool were unreliable due to the size and complexity of the `ui.js` file, leading to further errors like duplicated code.

### 5.3. Corrective Actions

A systematic approach was taken to correct the files and ensure the application's stability.

1.  **`scanner.js` Correction**: The functions `initScanner`, `showScanner`, and `hideScanner` were correctly attached to the `window` object to make them globally accessible.

    ```javascript
    // scanner.js (Corrected)
    window.initScanner = function(container, onScanComplete) { /* ... */ };
    window.showScanner = function() { /* ... */ };
    window.hideScanner = function() { /* ... */ };
    ```

2.  **`index.html` Correction**: The script loading order was corrected to ensure dependencies are met before they are called. The final, correct order is:
    ```html
      <script src="https://unpkg.com/scanic/dist/scanic.js"></script>
      <script src="db.js?v=20250828-15"></script>
      <script src="scanner.js"></script>
      <script src="app.js?v=20250829-PRESERVE-PARAMS"></script>
      <script src="ui.js?v=20250829-EXPENSE-MOUSE-SWIPES"></script>
      <script src="register-sw.js?v=20250828-15"></script>
    ```
    *Note: `app.js` is now loaded before `ui.js` to ensure its functions are available when `ui.js` attaches event listeners.*

3.  **`ui.js` Overwrite**: Due to the issues with the `replace` tool, the entire `ui.js` file was overwritten with a fully corrected version. This ensured that:
    *   The `import` statement was removed.
    *   The `.expense-receipt-icon` event listener correctly calls the global `startReceiptScan()` function.
    *   All duplicated code was removed.
    *   The necessary UI functions (`showScannerView`, `hideScannerView`, etc.) were correctly defined on the `window` object.

4.  **`app.js` Correction**: This file was also corrected to remove the `import` statement and ensure its functions (`startReceiptScan`, `deleteReceipt`, `finishScanning`) were properly exposed on the `window` object for `ui.js` to use.

These corrections restored the application to a working state with the new `scanic` functionality fully integrated.
