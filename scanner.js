// scanner.js

/**
 * Initializes the Scanic scanner and starts the scanning process.
 * @param {HTMLElement} container - The DOM element to host the scanner (though scanDocument might not use it directly).
 * @param {function(Blob)} onScanComplete - Callback that receives the scanned image Blob.
 */
window.initScanner = async function(container, onScanComplete) {
    const options = {
        container: container, // Pass container, though scanDocument might manage its own UI
        showActions: true, // Use scanic's built-in crop/confirm UI
        quality: 0.8,
    };
    try {
        // Call the global scanDocument function
        const blob = await window.scanDocument(options);
        onScanComplete(blob);
    } catch (e) {
        // Handle cancellation or error
        console.error('Scan failed or cancelled:', e);
        // If scanDocument throws on cancel, we need to hide the view
        // Assuming hideScannerView is global from ui.js
        if (window.hideScannerView) {
            window.hideScannerView();
        }
    }
}