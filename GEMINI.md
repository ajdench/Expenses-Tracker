# Project Overview

This project is a production-ready offline-first Progressive Web App (PWA) for tracking and managing expenses related to trips. It is designed to work seamlessly offline by utilizing IndexedDB for local storage and a service worker for caching static assets. The user interface is built with HTML, CSS (Bootstrap), and vanilla JavaScript.

## Building and Running

This project now includes a simple build script (`build.sh`) to manage environment-specific configurations (like the base URL for GitHub Pages). Use `npm run build:local` for local development and `npm run build:deploy` for preparing the application for GitHub Pages deployment.

**1. Serve the project directory:**

You can use any simple web server. Here are two common options:

*   **Using Node.js `serve` package:**
    ```bash
    npx serve
    ```

*   **Using Python's built-in HTTP server:**
    ```bash
    python3 -m http.server
    ```

**2. Access the application:**

Open your web browser and navigate to the local address provided by the server (e.g., `http://localhost:3000` or `http://localhost:8000`).

**3. Verify PWA functionality:**

*   Open your browser's developer tools.
*   Go to the "Application" tab.
*   Check that the service worker is registered and running.
*   Verify that the application files are cached under "Cache Storage".
*   Confirm that an "ExpenseTracker" database has been created in "IndexedDB".
*   To test offline functionality, disconnect from the internet and reload the page. The application should continue to work as expected.

## Development Conventions

*   **Database:** The application uses IndexedDB for all local data storage, with the schema managed in `db.js`. The database includes object stores for `trips`, `expenses`, `settings` (for category colors, icons, Shortcuts configuration, and image editor settings), and `receipts`.
*   **UI:** The user interface is dynamically rendered using vanilla JavaScript in `ui.js`. PDF receipts are rendered using `PDF.js`.
*   **Image Editing:** The application includes an image editor (`image-editor.js`) for adjusting receipt images, with features like edge detection and perspective warping, powered by OpenCV.js and Cropper.js.
*   **Styling:** The project uses Bootstrap for styling, with customizations in `styles.css`.
*   **Offline First:** The service worker in `service-worker.js` is configured to cache all static assets, including the image editor libraries, ensuring the application is available offline.
*   **iOS Shortcuts Integration:** The app can launch the iOS Shortcuts app to scan documents and attach them as receipts. This feature is configurable in the settings page.
*   **Modularity:** The code is organized into separate files with distinct responsibilities:
    *   `app.js`: Main application logic and initialization.
    *   `ui.js`: DOM manipulation and UI rendering.
    *   `db.js`: IndexedDB interactions.
    *   `service-worker.js`: Offline caching and PWA functionality.
    *   `register-sw.js`: Service worker registration.
    *   `image-editor.js`: Image editing functionality.

## To-Do

*   [ ] **CRITICAL:** Fix the main application rendering failure, as documented in `bug-log.md`. This prevents trip and expense cards from being displayed.
*   [x] Implement Archive Logic (soft delete) for trips and expenses.
*   [ ] Implement Export/Import backup functionality.
*   [ ] Refine the drag-and-drop animation to be smoother.
*   [ ] Test the iOS "Scan Documents" feature using Shortcuts, as outlined in `resources/scan-to-pwa-shortcuts.md`.
*   [ ] Test the image editor feature, including cropping, edge detection and warping.
*   [x] Fix the home button icon color in the trip detail view.
*   [x] Implement Expense Editing.
*   [x] Remove unnecessary padding from text within cards.
*   [x] Implement dynamic "No trips" messages.
*   [x] Implement dynamic service worker paths for local and GitHub Pages environments.
*   [x] Resolve `favicon.png` 404 on GitHub Pages.
*   [x] Resolve `ReferenceError: Can't find variable: window` in service worker.
*   [x] Fix Bootstrap modal not hiding on GitHub Pages (re-implemented with a new modal).
