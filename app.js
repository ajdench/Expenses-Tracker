// Main app logic
window.DEBUG = true;
function dbg(...args) {
  if (!window.DEBUG) return;
  const ts = new Date().toISOString();
  console.log(`[DBG ${ts}]`, ...args);
}

window.debugTools = {
  enable() { window.DEBUG = true; console.info('DEBUG enabled'); },
  disable() { window.DEBUG = false; console.info('DEBUG disabled'); },
  async forceRender(reason = 'manual') { dbg('forceRender called:', reason); await renderTrips(); }
};

document.addEventListener('DOMContentLoaded', async () => {
  dbg('DOMContentLoaded start');
  await initDB();
  await handleScanCallbackIfPresent();
  await renderTrips();
  dbg('DOMContentLoaded complete');
});

function showToast(message) {
  // Toast UI removed from index; this remains for compatibility if needed.
  const toast = document.getElementById('toast');
  if (!toast) { dbg('showToast called but no toast element:', message); return; }
  toast.textContent = message;
  toast.classList.remove('d-none');
  setTimeout(() => toast.classList.add('d-none'), 3000);
}

async function handleScanCallbackIfPresent() {
  const params = new URLSearchParams(location.search);
  const scan = params.get('scan');
  if (!scan) return;
  try {
    if (scan === 'done') {
      const id = params.get('result');
      const pendingRaw = localStorage.getItem('scan:pending');
      const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
      if (!id || !pending || !pending.expenseId) {
        console.warn('Scan done but missing id or pending session');
      } else {
        // Fetch file from API and save as receipt
        const scanSettings = await (typeof getScanSettings === 'function' ? getScanSettings() : {});
        const base = scanSettings.apiBaseUrl;
        if (!base) { console.warn('Scan API base URL not set'); }
        else {
          const res = await fetch(`${base.replace(/\/$/, '')}/files/${encodeURIComponent(id)}`);
          if (!res.ok) throw new Error('Failed to fetch scanned file');
          const blob = await res.blob();
          const file = new File([blob], `scan-${id}.pdf`, { type: blob.type || 'application/pdf' });
          const rid = await saveReceiptForExpense(pending.expenseId, file);
          try { await setCurrentReceipt(pending.expenseId, rid); } catch {}
        }
      }
    }
    if (scan === 'files-done') {
      const pendingRaw = localStorage.getItem('scan:pending-files');
      const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
      if (pending?.expenseId) {
        showScanFilesPrompt(pending.expenseId, pending.filename);
      }
    }
    if (scan === 'cancel') {
      console.info('Scan cancelled');
    }
    if (scan === 'error') {
      console.warn('Scan error');
    }
  } catch (e) {
    console.error('Failed handling scan callback', e);
  } finally {
    // Clear pending and strip query
    try { localStorage.removeItem('scan:pending'); } catch {}
    try { localStorage.removeItem('scan:pending-files'); } catch {}
    history.replaceState(null, '', location.pathname);
  }
}

function showScanFilesPrompt(expenseId, filename) {
  const id = 'scan-files-prompt';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.className = 'modal fade';
    el.id = id;
    el.tabIndex = -1;
    el.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Select scanned PDF</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Open the Files picker and choose your scanned PDF${filename ? `: <strong>${filename}</strong>` : ''}. Look in <em>Files → Shortcuts → ExpenseTracker</em>.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-custom-green" id="scan-files-select">Select scanned PDF</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
  } else {
    const p = el.querySelector('.modal-body p');
    if (p) p.innerHTML = `Open the Files picker and choose your scanned PDF${filename ? `: <strong>${filename}</strong>` : ''}. Look in <em>Files → Shortcuts → ExpenseTracker</em>.`;
  }
  const modal = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
  el.querySelector('#scan-files-select')?.addEventListener('click', () => {
    // Open file picker (user gesture)
    modal.hide();
    if (typeof openReceiptPicker === 'function') {
      openReceiptPicker(expenseId, null);
    }
  }, { once: true });
  modal.show();
}
