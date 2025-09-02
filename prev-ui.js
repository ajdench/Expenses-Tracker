// UI Rendering Logic

// Global swipe configuration
const SWIPE_DISTANCE = 45.2; // 12px (edge) + 19.2px (icon) + 12px (gap) optimized for UX

// Global color constants (with fallbacks)
const COLORS = {
  GREEN: '#7aa992',
  PURPLE: '#b89bc7', 
  BLUE_DUSTY: '#89a5c9',
  GREY: '#b8c1c9',
  RED: '#c87a7a'
};

// Global UI constants  
const UI_CONSTANTS = {
  DOUBLE_CLICK_DELAY: 300,
  DEBUG_Z_INDEX: 9999,
  ICON_Z_INDEX: 0,
  CONTENT_Z_INDEX: 2,
  BORDER_RADIUS: '6px',
  SHOW_DEBUG_BUTTON: true // Set to true to show debug controls
};

window.renderTrips = async function(selectedTripId = null) {
  const app = document.getElementById('app');
  if (!app) return;
  dbg('renderShell');
  const icons = await loadIconSettings();
  const scan = await loadScanSettings();
  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height text-white btn-custom-blue">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="receipt-icon" class="btn text-white btn-no-style header-btn-left" aria-label="Receipts"><i class="bi ${icons.receipt} home-icon"></i></button>
          <h4 class="header-title">Expenses</h4>
          <button id="settings-btn" class="btn text-white btn-no-style header-btn-right" aria-label="Settings"><i class="bi ${icons.cog} home-icon"></i></button>
        </div>
      </div>
      ${UI_CONSTANTS.SHOW_DEBUG_BUTTON ? `<button id="debug-control" onclick="
        if (!window.debugTripCards) window.debugTripCards = {isMonitoring: false, intervals: new Set()};
        window.debugTripCards.isMonitoring = !window.debugTripCards.isMonitoring;
        if (window.debugTripCards.isMonitoring) {
          this.innerHTML = 'Stop Debug';
          this.style.backgroundColor = '#dc3545';
          console.clear();
          console.log('🔴 DEBUG STARTED - Trip card layer tracking');
        } else {
          this.innerHTML = 'Start Debug';
          this.style.backgroundColor = '#007bff';
          console.log('🔴 DEBUG STOPPED');
          window.debugTripCards.intervals.forEach(id => clearInterval(id));
          window.debugTripCards.intervals.clear();
        }
      " style="position:fixed;top:10px;right:10px;z-index:${UI_CONSTANTS.DEBUG_Z_INDEX};padding:10px;background:var(--debug-bg-color);color:white;border:none;border-radius:5px;cursor:pointer;">Start Debug</button>` : ''}

      <main id="trip-list-container">
        <section class="mb-4">
          <h6 class="mb-2 text-placeholder">New</h6>
          <div id="new-trips-container"></div>
        </section>
        <section class="mb-4">
          <h6 class="mb-2 text-placeholder">Active</h6>
          <div id="active-trips-container"></div>
        </section>
        <section class="mb-4">
          <h6 class="mb-2 text-placeholder">Submitted</h6>
          <div id="submitted-trips-container"></div>
        </section>
        <section class="mb-4">
          <h6 class="mb-2 text-placeholder">Reimbursed</h6>
          <div id="reimbursed-trips-container"></div>
        </section>
        <section class="mb-4">
          <h6 class="mb-2 text-placeholder"><span id="archive-trips-open">Archived</span></h6>
          <div id="trip-archive-drop" class="drop-zone drop-zone--archive">Archive&thinsp;<em>Trip</em></div>
        </section>
      </main>
    </div>
  `;
  document.getElementById('settings-btn').addEventListener('click', renderSettingsPage);
  document.getElementById('archive-trips-open')?.addEventListener('click', renderArchivedTrips);
  document.getElementById('trip-archive-drop')?.addEventListener('click', renderArchivedTrips);
}

// ... (The rest of the file content up to buildExpenseCard)

function buildExpenseCard(expense, isSelected, context = 'normal') {
  const card = document.createElement('div');
  card.className = `card mb-3 card-uniform-height expense-card ${isSelected ? 'expense-card--selected' : ''}`;
  card.draggable = true;
  card.dataset.expenseId = expense.id;
  
  // ... (rest of the function)

  // Receipt icon click → open scanner view
  const icon = card.querySelector('.expense-receipt-icon');
  if (icon) {
    icon.addEventListener('click', (ev) => {
      ev.stopPropagation();
      startReceiptScan(expense.id);
    });
    icon.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        startReceiptScan(expense.id);
      }
    });
  }
  return card;
}

// ... (The rest of the file content up to the end)

// --- Scanner View Functions ---

window.showScannerView = function() {
    document.getElementById('trip-list-container').classList.add('hidden');
    const scannerView = document.getElementById('scanner-view');
    scannerView.classList.remove('hidden');
    document.getElementById('thumbnail-bar').innerHTML = ''; // Clear old thumbnails

    document.getElementById('add-another-receipt-btn').onclick = () => {
        
    };
    document.getElementById('done-scanning-btn').onclick = () => {
        finishScanning();
    };
}

window.hideScannerView = function() {
    document.getElementById('scanner-view').classList.add('hidden');
    document.getElementById('trip-list-container').classList.remove('hidden');
}

window.addReceiptThumbnail = function(receiptId, imageBlob) {
    const thumbBar = document.getElementById('thumbnail-bar');
    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'thumbnail';
    thumbContainer.dataset.receiptId = receiptId;

    const img = document.createElement('img');
    img.src = URL.createObjectURL(imageBlob);
    thumbContainer.appendChild(img);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-thumb-btn';
    deleteBtn.innerHTML = '&times;'; // A simple 'X'
    deleteBtn.onclick = () => {
        deleteReceipt(receiptId);
    };
    thumbContainer.appendChild(deleteBtn);

    thumbBar.appendChild(thumbContainer);
}

window.removeReceiptThumbnail = function(receiptId) {
    const thumbToRemove = document.querySelector(`.thumbnail[data-receipt-id="${receiptId}"]`);
    if (thumbToRemove) {
        const img = thumbToRemove.querySelector('img');
        if (img) URL.revokeObjectURL(img.src);
        thumbToRemove.remove();
    }
}