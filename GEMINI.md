# Project Overview

This project is a production-ready offline-first Progressive Web App (PWA) for tracking and managing expenses related to trips. It is designed to work seamlessly offline by utilizing IndexedDB for local storage and a service worker for caching static assets. The user interface is built with HTML, CSS (Bootstrap), and vanilla JavaScript.

## Project Structure

```yaml
project_name: Trip Expense Tracker
type: Progressive Web App (PWA)
stack: Vanilla JS, Bootstrap 5, IndexedDB, SortableJS

structure:
  ui.js: Main UI rendering and interaction logic
  styles.css: CSS styling with custom properties
  app.js: Application coordinator and data flow
  db.js: IndexedDB database operations
  index.html: PWA entry point with service worker
  
key_features:
  - Trip management with swipe gestures for status changes (2px colored borders)
  - Expense cards with swipe-to-edit/archive functionality  
  - Receipt management with image editing capabilities
  - Drag/drop reordering with SortableJS, ghost element positioning
  - Double-click selection pattern for cards
  - Global color/UI constants system (COLORS, UI_CONSTANTS)
  - Placeholder cards for empty sections
  - Ghost element snap-to-placeholder positioning
  - Comprehensive ghost swipe prevention

status: FULLY RECOVERED & ENHANCED - All functionality working beyond baseline
```

## Building and Running

**1. Serve the project directory:**

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

## AI Agent Collaboration

This project uses a shared configuration file, `AGENTS.md`, to coordinate efforts between different AI coding assistants. This file outlines project-specific conventions and instructions to ensure consistency.

## To-Do

*   [ ] Implement Export/Import backup functionality.
*   [ ] Test the iOS "Scan Documents" feature using Shortcuts.
*   [ ] Test the image editor feature, including cropping, edge detection and warping.

