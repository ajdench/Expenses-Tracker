# Expense Tracker PWA

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen?style=for-the-badge)
![Made with](https://img.shields.io/badge/Made%20with-Bootstrap-blueviolet?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

This is a production-ready offline-first Progressive Web App (PWA) for tracking and managing expenses related to trips. It is designed to work seamlessly offline by utilizing IndexedDB for local storage and a service worker for caching static assets. The user interface is built with HTML, CSS (Bootstrap), and vanilla JavaScript.

## Building and Running

This is a static web project and does not require a build process. To run the application, you need to serve the files in the project root directory using a local web server.

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
