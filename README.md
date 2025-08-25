# Expense Tracker PWA

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen?style=for-the-badge)
![Made with](https://img.shields.io/badge/Made%20with-Bootstrap-blueviolet?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

This is a production-ready offline-first Progressive Web App (PWA) for tracking and managing expenses related to trips. It is designed to work seamlessly offline by utilizing IndexedDB for local storage and a service worker for caching static assets. The user interface is built with HTML, CSS (Bootstrap), and vanilla JavaScript.

## Features

*   **Offline-First:** Works seamlessly offline with IndexedDB for data and a service worker for caching assets.
*   **Trip Management:** Create, view, and categorize trips (Active, Submitted, Reimbursed) with drag-and-drop functionality.
*   **Dynamic UI:** "No trips" messages dynamically appear/disappear based on category content.
*   **Expense Tracking:** Add, view, and **edit** expenses for each trip, including description, amount, date, category, and notes.
*   **Responsive Design:** Built with Bootstrap for a mobile-first, responsive user experience.
*   **Custom Styling:** Enhanced visual consistency with custom blue theme (`#1663bb`), unified title card sizing, and refined home icon styling.
*   **Global Padding:** Consistent 16px horizontal padding across the main container for improved aesthetics.

## Building and Running

This project now includes a simple build script to manage environment-specific configurations (like the base URL for GitHub Pages).

**1. Prepare for local development or deployment:**

*   **For local development:**
    ```bash
    npm run build:local
    ```
*   **For GitHub Pages deployment:**
    ```bash
    npm run build:deploy
    ```

**2. Serve the project directory (for local development):**

After running `npm run build:local`, you can serve the files using a local web server:

*   **Using Node.js `serve` package:**
    ```bash
    npx serve
    ```

*   **Using Python's built-in HTTP server:**
    ```bash
    python3 -m http.server
    ```

**3. Access the application:**

Open your web browser and navigate to the local address provided by the server (e.g., `http://localhost:3000` or `http://localhost:8000`).

**4. Verify PWA functionality:**

*   Open your browser's developer tools.
*   Go to the "Application" tab.
*   Check that the service worker is registered and running.
*   Verify that the application files are cached under "Cache Storage".
*   Confirm that an "ExpenseTracker" database has been created in "IndexedDB".
*   To test offline functionality, disconnect from the internet and reload the page. The application should continue to work as expected.