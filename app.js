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
