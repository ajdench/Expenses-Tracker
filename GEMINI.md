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

*   **Database:** The application uses IndexedDB for all local data storage. The `db.js` file provides a simple abstraction layer for database operations.
*   **UI:** The user interface is dynamically rendered using vanilla JavaScript in `ui.js`.
*   **Styling:** The project uses Bootstrap for styling.
*   **Offline First:** The service worker in `service-worker.js` is configured to cache all static assets, ensuring the application is available offline.
*   **Modularity:** The code is organized into separate files with distinct responsibilities:
    *   `app.js`: Main application logic and initialization.
    *   `ui.js`: DOM manipulation and UI rendering.
    *   `db.js`: IndexedDB interactions.
    *   `service-worker.js`: Offline caching and PWA functionality.
    *   `register-sw.js`: Service worker registration.

## To-Do

*   [ ] Implement Archive Logic (soft delete) for trips.
*   [ ] Implement Export/Import backup functionality.
*   [ ] Refine the drag-and-drop animation to be smoother.
*   [x] Fix the home button icon color in the trip detail view.
*   [x] Implement Expense Editing.
*   [x] Remove unnecessary padding from text within cards.
*   [x] Implement dynamic "No trips" messages.
*   [x] Implement dynamic service worker paths for local and GitHub Pages environments.
*   [x] Resolve `favicon.png` 404 on GitHub Pages.
*   [x] Resolve `ReferenceError: Can't find variable: window` in service worker.
*   [ ] **CRITICAL:** Fix "Save Trip" functionality on `localhost` and GitHub Pages (input value is empty during form submission).