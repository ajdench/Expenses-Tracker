// UI Rendering Logic

async function renderShell() {
  const app = document.getElementById('app');
  if (!app) return;
  dbg('renderShell');
  const icons = await loadIconSettings();
  const scan = await loadScanSettings();
  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height text-center btn-custom-blue text-white">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="receipt-icon" class="btn text-white btn-no-style header-btn-left" aria-label="Receipts"><i class="bi ${icons.receipt} home-icon"></i></button>
          <h4 class="header-title">Expenses</h4>
          <button id="settings-btn" class="btn text-white btn-no-style header-btn-right" aria-label="Settings"><i class="bi ${icons.cog} home-icon"></i></button>
        </div>
      </div>

      <main id="trip-list-container">
        <section class="mb-4">
          <h5 class="mb-2 text-placeholder">Active</h5>
          <div id="active-trips-container"></div>
        </section>
        <section class="settings-icons-row">
          <div class="card app-card">
            <div class="card-body">
              <h6 class="mb-2">Trip Swipes</h6>
              <div class="d-flex align-items-center gap-2">
                <input type="checkbox" id="trip-swipes-enable" ${(((await getTripSwipeSettings())?.enable) !== false) ? 'checked' : ''}>
                <label for="trip-swipes-enable" class="mb-0">Enable swipe actions on Active trips</label>
              </div>
              <small class="text-muted">Swipe right → Submitted, left → Reimbursed (Active only).</small>
            </div>
          </div>
        </section>
        <section class="mb-4">
          <h5 class="mb-2 text-placeholder">Submitted</h5>
          <div id="submitted-trips-container"></div>
        </section>
        <section class="mb-4">
          <h5 class="mb-2 text-placeholder">Reimbursed</h5>
          <div id="reimbursed-trips-container"></div>
        </section>
      </main>
    </div>
  `;
  document.getElementById('settings-btn').addEventListener('click', renderSettingsPage);
}

async function renderSettingsPage() {
  const app = document.getElementById('app');
  const allExpenses = await getAllExpenses();
  const discovered = Array.from(new Set(allExpenses.map(e => e.category))).filter(Boolean);
  const colorMap = await loadCategoryColorMap();
  const icons = await loadIconSettings();
  const scan = await loadScanSettings();
  const categories = Array.from(new Set([...Object.keys(DEFAULT_CATEGORY_COLORS), ...discovered]));

  const rows = categories.map(cat => {
    const base = colorMap[cat] || DEFAULT_CATEGORY_COLORS[cat] || DEFAULT_CATEGORY_COLORS['Other'];
    const color = typeof pastelizeColor === 'function' ? pastelizeColor(base) : base;
    const safeId = `cat-${cat.replace(/[^a-z0-9]/gi, '_')}`;
    return `<div class="category-grid">
      <button type="button" class="btn badge expense-category-pill" data-cat="${escapeHTML(cat)}" id="${safeId}"
        style="align-self:center; background-color:${color}; color:#fff;">${escapeHTML(cat)}</button>
    </div>`;
  }).join('');

  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height bg-secondary text-white">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="back-to-trips" class="btn text-white btn-no-style header-btn-left" aria-label="Back to trips"><i class="bi ${icons.home} home-icon"></i></button>
          <h4 class="header-title">Settings</h4>
        </div>
      </div>
      <main id="settings-container" class="settings-grid">
        <section class="settings-left">
          <div class="card app-card h-100">
            <div class="card-body">
              <h6 class="mb-2">Category Colours</h6>
              <div id="category-color-list" class="d-flex flex-column gap-2">${rows || '<p class="text-placeholder mb-0">No categories yet</p>'}</div>
              <div class="mt-3">
                <button id="reset-cat-colors" class="btn btn-secondary w-100">Reset</button>
              </div>
            </div>
          </div>
        </section>
        <section class="settings-right">
          <div class="card app-card">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h6 class="mb-2">Cache and Offline</h6>
                <p class="mb-1 text-placeholder">Clear cached assets and unregister Service Workers</p>
              </div>
              <div class="d-flex">
                <button id="clear-app-cache" class="btn btn-dashed-gold w-100">Clear cache</button>
              </div>
            </div>
          </div>
          <div class="card app-card">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h6 class="mb-2">Delete Content</h6>
                <p class="mb-1 text-placeholder">Delete all Trips, Expenses and Receipts</p>
              </div>
              <div class="d-flex">
                <button id="delete-all-content" class="btn btn-dashed-orange w-100">Delete content</button>
              </div>
            </div>
          </div>
        </section>
        <section class="settings-icons-row">
          <div class="settings-icons-grid">
            <div class="card app-card">
              <div class="card-body d-flex flex-column justify-content-between">
                <div>
                  <h6 class="mb-2">Receipt Icon</h6>
                  <div class="d-flex flex-column gap-2">
                    <label class="settings-icon-option">
                      <input type="radio" name="icon-receipt" value="bi-receipt" ${icons.receipt === 'bi-receipt' ? 'checked' : ''}>
                      <i class="bi bi-receipt settings-icon-preview"></i>
                      <span>Receipt (current)</span>
                    </label>
                    <label class="settings-icon-option">
                      <input type="radio" name="icon-receipt" value="bi-receipt-cutoff" ${icons.receipt === 'bi-receipt-cutoff' ? 'checked' : ''}>
                      <i class="bi bi-receipt-cutoff settings-icon-preview"></i>
                      <span>Receipt cutoff (stylised)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="card app-card">
              <div class="card-body d-flex flex-column justify-content-between">
                <div>
                  <h6 class="mb-2">Header Icons</h6>
                  <div class="d-flex flex-column gap-2">
                    <div>
                      <div class="mb-1 text-placeholder">Home icon</div>
                      <label class="settings-icon-option">
                        <input type="radio" name="icon-home" value="bi-house-door-fill" ${icons.home === 'bi-house-door-fill' ? 'checked' : ''}>
                        <i class="bi bi-house-door-fill settings-icon-preview"></i>
                        <span>House door (current)</span>
                      </label>
                      <label class="settings-icon-option">
                        <input type="radio" name="icon-home" value="bi-house-fill" ${icons.home === 'bi-house-fill' ? 'checked' : ''}>
                        <i class="bi bi-house-fill settings-icon-preview"></i>
                        <span>House (alternative)</span>
                      </label>
                    </div>
                    <div class="mt-2">
                      <div class="mb-1 text-placeholder">Settings icon</div>
                      <label class="settings-icon-option">
                        <input type="radio" name="icon-cog" value="bi-gear-fill" ${icons.cog === 'bi-gear-fill' ? 'checked' : ''}>
                        <i class="bi bi-gear-fill settings-icon-preview"></i>
                        <span>Gear (current)</span>
                      </label>
                      <label class="settings-icon-option">
                        <input type="radio" name="icon-cog" value="bi-sliders" ${icons.cog === 'bi-sliders' ? 'checked' : ''}>
                        <i class="bi bi-sliders settings-icon-preview"></i>
                        <span>Sliders (alternative)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="settings-icons-row">
          <div class="card app-card">
            <div class="card-body">
              <h6 class="mb-2">iOS Shortcuts</h6>
              <div class="d-flex flex-column gap-2">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" id="scan-enable" ${scan.enable ? 'checked' : ''}>
                  <label for="scan-enable" class="mb-0">Enable “Scan Documents” integration</label>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label for="scan-api-base" class="mb-0" style="min-width:120px;">API base URL</label>
                  <input type="url" class="form-control" id="scan-api-base" placeholder="https://api.your.app" value="${scan.apiBaseUrl || ''}">
                </div>
                <div class="d-flex">
                  <button id="scan-test" class="btn btn-secondary ms-auto">Test Shortcut link</button>
                </div>
                <hr class="my-2">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" id="scan-files-enable" ${scan.filesEnable ? 'checked' : ''}>
                  <label for="scan-files-enable" class="mb-0">Enable Files mode (save PDF locally)</label>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label for="scan-filename-template" class="mb-0" style="min-width:120px;">Filename</label>
                  <input type="text" class="form-control" id="scan-filename-template" value="${scan.filenameTemplate || ''}" placeholder="{vendor}-{date}-{time}-{currency}-{amount}.pdf">
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label for="scan-subfolder-template" class="mb-0" style="min-width:120px;">Subfolder</label>
                  <input type="text" class="form-control" id="scan-subfolder-template" value="${scan.subfolderTemplate || ''}" placeholder="Trip-{trip}">
                </div>
                <small class="text-muted">Vars: {vendor} {date} {time} {currency} {amount} {trip}. Date=YYYYMMDD, Time=HHmm</small>
                <small class="text-muted">Shortcut name: “Scan to Files”. App passes filename and optional subfolder.</small>
                <div class="mt-2 p-2 border rounded" style="border-color: var(--light-grey) !important;">
                  <div class="text-muted mb-1">Preview</div>
                  <code id="scan-template-preview">Shortcuts/ExpenseTracker/${scan.subfolderTemplate ? scan.subfolderTemplate + '/' : ''}${scan.filenameTemplate}</code>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="settings-icons-row">
          <div class="card app-card">
            <div class="card-body">
              <h6 class="mb-2">Receipt Viewer</h6>
              <div class="d-flex flex-column gap-2">
                <label><input type="radio" name="viewer-mode" value="modal"> Modal (default)</label>
                <label><input type="radio" name="viewer-mode" value="page"> Full page</label>
                <small class="text-muted">Choose how receipts open after adding or when tapping the icon.</small>
              </div>
            </div>
          </div>
        </section>
        <section class="settings-icons-row">
          <div class="card app-card">
            <div class="card-body">
              <h6 class="mb-2">Receipt Sources</h6>
              <div class="d-flex flex-column gap-2">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" id="src-camera" checked>
                  <label for="src-camera" class="mb-0">Camera / Photos (file picker)</label>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" id="src-scan-web">
                  <label for="src-scan-web" class="mb-0">Scan with iOS Shortcuts (Web upload)</label>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" id="src-scan-files">
                  <label for="src-scan-files" class="mb-0">Scan (Shortcuts → Files)</label>
                </div>
                <small class="text-muted">Only enabled sources appear in the Add/Retake menu.</small>
              </div>
            </div>
          </div>
        </section>
        <section class="settings-icons-row">
          <div class="card app-card">
            <div class="card-body">
              <h6 class="mb-2">Image Adjust</h6>
              <div class="d-flex flex-column gap-2">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" id="img-enable-experimental" ${(((await getImageAdjustSettings())?.enableExperimental) ? 'checked' : '')}>
                  <label for="img-enable-experimental" class="mb-0">Enable Crop/Skew (experimental)</label>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label for="img-auto-detect" class="mb-0" style="min-width:140px;">Auto-detect</label>
                  <input type="checkbox" id="img-auto-detect" ${((await getImageAdjustSettings())?.autoDetect ?? true) ? 'checked' : ''}>
                  <small class="text-muted">OpenCV edge detection</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label for="img-drag-engine" class="mb-0" style="min-width:140px;">Drag engine</label>
                  <select id="img-drag-engine" class="form-select" style="max-width:220px;">
                    <option value="pointer">Pointer Events</option>
                    <option value="interact">Interact.js</option>
                  </select>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label for="img-warp-engine" class="mb-0" style="min-width:140px;">Warp engine</label>
                  <select id="img-warp-engine" class="form-select" style="max-width:220px;">
                    <option value="opencv">OpenCV (perspective)</option>
                    <option value="canvas">Canvas (axis-aligned)</option>
                  </select>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label for="img-max-side" class="mb-0" style="min-width:140px;">Max long side (px)</label>
                  <input id="img-max-side" type="number" class="form-control" style="max-width:220px;" value="${((await getImageAdjustSettings())?.maxLongSide || 2000)}">
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
  document.getElementById('back-to-trips').addEventListener('click', renderTrips);
  document.getElementById('reset-cat-colors').addEventListener('click', async () => {
    await saveCategoryColors({});
    renderSettingsPage();
  });
  document.getElementById('clear-app-cache')?.addEventListener('click', clearAppCache);
  document.getElementById('delete-all-content')?.addEventListener('click', async () => {
    const proceed = confirm('Delete all Trips, Expenses and Receipts? This cannot be undone.');
    if (!proceed) return;
    try {
      await deleteAllContent();
      alert('All content deleted');
      await renderTrips();
    } catch (e) {
      console.error('Failed to delete content', e);
      alert('Failed to delete content');
    }
  });
  // Scan settings handlers
  document.getElementById('scan-enable')?.addEventListener('change', async (e) => {
    const current = await getScanSettings();
    current.enable = !!e.target.checked;
    await saveScanSettings(current);
  });
  const apiBaseEl = document.getElementById('scan-api-base');
  apiBaseEl?.addEventListener('change', async (e) => {
    const current = await getScanSettings();
    current.apiBaseUrl = e.target.value.trim();
    await saveScanSettings(current);
  });
  document.getElementById('scan-test')?.addEventListener('click', async () => {
    const s = await getScanSettings();
    const ok = !!(s.enable && s.apiBaseUrl);
    alert(ok ? 'Shortcuts appears enabled and API base is set' : 'Enable Shortcuts and set API base URL');
  });
  // Image adjust settings handlers
  (async () => {
    const current = await getImageAdjustSettings();
    const dragSel = document.getElementById('img-drag-engine');
    const warpSel = document.getElementById('img-warp-engine');
    if (dragSel) dragSel.value = current.dragEngine || 'pointer';
    if (warpSel) warpSel.value = current.warpEngine || 'opencv';
  })();
  // Receipt viewer mode init + handlers
  (async () => {
    const set = await (typeof getReceiptViewerSettings==='function' ? getReceiptViewerSettings() : {});
    const mode = set.mode || 'modal';
    const radios = document.querySelectorAll('input[name="viewer-mode"]');
    radios.forEach(r => { r.checked = (r.value === mode); r.addEventListener('change', async (e)=>{
      const cur = await getReceiptViewerSettings();
      cur.mode = e.target.value; await saveReceiptViewerSettings(cur);
    }); });
  })();
  document.getElementById('img-enable-experimental')?.addEventListener('change', async (e) => {
    const cur = await getImageAdjustSettings();
    cur.enableExperimental = !!e.target.checked; await saveImageAdjustSettings(cur);
  });
  document.getElementById('img-auto-detect')?.addEventListener('change', async (e) => {
    const cur = await getImageAdjustSettings();
    cur.autoDetect = !!e.target.checked; await saveImageAdjustSettings(cur);
  });
  document.getElementById('img-drag-engine')?.addEventListener('change', async (e) => {
    const cur = await getImageAdjustSettings();
    cur.dragEngine = e.target.value; await saveImageAdjustSettings(cur);
  });
  document.getElementById('img-warp-engine')?.addEventListener('change', async (e) => {
    const cur = await getImageAdjustSettings();
    cur.warpEngine = e.target.value; await saveImageAdjustSettings(cur);
  });
  document.getElementById('img-max-side')?.addEventListener('change', async (e) => {
    const cur = await getImageAdjustSettings();
    const v = parseInt(e.target.value,10); cur.maxLongSide = Number.isFinite(v) && v>200 ? v : 2000; await saveImageAdjustSettings(cur);
  });
  // Capture sources
  (async () => {
    const cap = await getCaptureSettings();
    const cam = document.getElementById('src-camera');
    const web = document.getElementById('src-scan-web');
    const files = document.getElementById('src-scan-files');
    if (cam) cam.checked = cap.camera !== false; // default true
    if (web) web.checked = !!cap.scanWeb;
    if (files) files.checked = !!cap.scanFiles;
    cam?.addEventListener('change', async (e)=>{ const c=await getCaptureSettings(); c.camera = !!e.target.checked; await saveCaptureSettings(c); });
    web?.addEventListener('change', async (e)=>{ const c=await getCaptureSettings(); c.scanWeb = !!e.target.checked; await saveCaptureSettings(c); });
    files?.addEventListener('change', async (e)=>{ const c=await getCaptureSettings(); c.scanFiles = !!e.target.checked; await saveCaptureSettings(c); });
  })();
  // Files mode toggle
  document.getElementById('scan-files-enable')?.addEventListener('change', async (e) => {
    const current = await getScanSettings();
    current.filesEnable = !!e.target.checked;
    await saveScanSettings(current);
  });
  // Trip swipes toggle
  document.getElementById('trip-swipes-enable')?.addEventListener('change', async (e) => {
    const cur = await getTripSwipeSettings();
    cur.enable = !!e.target.checked;
    await saveTripSwipeSettings(cur);
  });
  document.getElementById('scan-filename-template')?.addEventListener('change', async (e) => {
    const current = await getScanSettings();
    current.filenameTemplate = e.target.value;
    await saveScanSettings(current);
    updateScanPreview();
  });
  document.getElementById('scan-subfolder-template')?.addEventListener('change', async (e) => {
    const current = await getScanSettings();
    current.subfolderTemplate = e.target.value;
    await saveScanSettings(current);
    updateScanPreview();
  });
  // Initialize preview
  updateScanPreview();

  async function updateScanPreview() {
    const scan = await getScanSettings();
    let exp = null;
    // Prefer currently selected expense if available
    try {
      if (window.currentSelectedExpenseId && typeof getExpenseById === 'function') {
        exp = await getExpenseById(window.currentSelectedExpenseId);
      }
    } catch {}
    // Fallback: most recent expense by date
    try {
      if (!exp && typeof getAllExpenses === 'function') {
        const all = await getAllExpenses();
        exp = all && all.length ? all.slice().sort((a,b)=> new Date(b.date)-new Date(a.date))[0] : null;
      }
    } catch {}
    // Final fallback: sample data
    if (!exp) {
      exp = { description: 'Vendor', date: new Date().toISOString(), currency: '£', amount: 12.34, tripId: null };
    }
    let trip = null;
    try { if (exp?.tripId && typeof getTripById === 'function') trip = await getTripById(exp.tripId); } catch {}
    if (!trip) trip = { name: 'Trip Name' };
    const fn = buildScanFilename(exp, scan, trip);
    const sf = buildScanSubfolder(exp, scan, trip);
    const code = document.getElementById('scan-template-preview');
    if (code) code.textContent = `Shortcuts/ExpenseTracker/${sf ? sf + '/' : ''}${fn}`;
  }
  // Icon radio handlers
  document.querySelectorAll('input[name="icon-receipt"]').forEach(el => {
    el.addEventListener('change', async (e) => {
      const current = await getIconSettings();
      current.receipt = e.target.value;
      await saveIconSettings(current);
      await renderSettingsPage();
    });
  });
  document.querySelectorAll('input[name="icon-home"]').forEach(el => {
    el.addEventListener('change', async (e) => {
      const current = await getIconSettings();
      current.home = e.target.value;
      await saveIconSettings(current);
      await renderSettingsPage();
    });
  });
  document.querySelectorAll('input[name="icon-cog"]').forEach(el => {
    el.addEventListener('change', async (e) => {
      const current = await getIconSettings();
      current.cog = e.target.value;
      await saveIconSettings(current);
      await renderSettingsPage();
    });
  });
  // Inline color picking on pill click (auto-save)
  document.querySelectorAll('#category-color-list .expense-category-pill').forEach(pill => {
    pill.addEventListener('click', async () => {
      const cat = pill.getAttribute('data-cat');
      const current = pill.style.backgroundColor;
      const input = document.createElement('input');
      input.type = 'color';
      // Attempt to convert rgb to hex if needed
      try {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = current;
        const hex = ctx.fillStyle;
        input.value = /^#/.test(hex) ? hex : '#6c757d';
      } catch { input.value = '#6c757d'; }
      input.style.position = 'fixed'; input.style.left = '-9999px';
      document.body.appendChild(input);
      input.addEventListener('change', async () => {
        const newColor = input.value;
        try {
          const map = await loadCategoryColorMap();
          map[cat] = newColor;
          await saveCategoryColors(map);
          pill.style.backgroundColor = newColor;
        } finally {
          document.body.removeChild(input);
        }
      }, { once: true });
      input.click();
    });
  });
}

async function clearAppCache() {
  const proceed = confirm('Clear cached assets and unregister Service Worker? You may need to hard reload after this.');
  if (!proceed) return;
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    alert('Cache cleared and Service Workers unregistered. Please hard reload (Option + Command + R).');
  } catch (e) {
    console.error('Failed to clear app cache:', e);
    alert('Failed to clear app cache. Check the console for details.');
  }
}

function buildTripCard(trip, isSelected) {
  const card = document.createElement('div');
  card.className = `card mb-3 trip-card card-uniform-height ${isSelected ? 'text-white btn-custom-blue' : ''}`;
  card.dataset.tripId = trip.id;
  card.innerHTML = `
    <div class="card-body d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">${escapeHTML(trip.name)}</h5>
    </div>
  `;
  // Swipe gestures for status change (Active only): right→Submitted (green), left→Reimbursed (purple)
  try {
    (async () => {
      const sw = await (typeof getTripSwipeSettings === 'function' ? getTripSwipeSettings() : {});
      const enabled = sw.enable !== false; // default ON
      if (!enabled) return;
    const content = card.querySelector('.card-body');
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
      card.style.touchAction = 'pan-y';
      const reveal = document.createElement('div');
      reveal.style.position = 'absolute'; reveal.style.inset='0'; reveal.style.zIndex='0';
      reveal.style.borderRadius = getComputedStyle(card).borderRadius || '0.25rem';
      reveal.style.overflow = 'hidden';
      const left = document.createElement('div');
      left.style.position='absolute'; left.style.left='0'; left.style.top='0'; left.style.bottom='0'; left.style.width='50%'; left.style.background='#7aa992';
      const li=document.createElement('i'); li.className='bi bi-check2'; li.style.color='#fff'; li.style.position='absolute'; li.style.left='12px'; li.style.top='50%'; li.style.transform='translateY(-50%)'; left.appendChild(li);
      const right = document.createElement('div');
      right.style.position='absolute'; right.style.right='0'; right.style.top='0'; right.style.bottom='0'; right.style.width='50%'; right.style.background='#a78bfa';
      const ri=document.createElement('i'); ri.className='bi bi-coin'; ri.style.color='#fff'; ri.style.position='absolute'; ri.style.right='12px'; ri.style.top='50%'; ri.style.transform='translateY(-50%)'; right.appendChild(ri);
      reveal.append(left,right);
      reveal.style.opacity='0'; reveal.style.transition='opacity 100ms ease';
      card.prepend(reveal);
      content.style.position='relative'; content.style.zIndex='1'; content.style.background='transparent';
      let startX=0, curX=0, swiping=false;
      const onTouchStart = (e)=>{ const t=e.touches?.[0]; if(!t) return; startX=curX=t.clientX; swiping=true; content.style.transition='none'; reveal.style.opacity='1'; };
      const onTouchMove = (e)=>{ if(!swiping) return; const t=e.touches?.[0]; if(!t) return; curX=t.clientX; let dx=curX-startX; const max=Math.round(card.offsetWidth*0.3); if(dx>max) dx=max; if(dx<-max) dx=-max; content.style.transform=`translateX(${dx}px)`; e.preventDefault(); };
      const onTouchEnd = async ()=>{ if(!swiping) return; swiping=false; const dx=curX-startX; content.style.transition='transform 150ms ease';
        const parentId = card.parentElement && card.parentElement.id || '';
        if (parentId==='active-trips-container') {
          const thresh = Math.round(card.offsetWidth*0.2);
          if (dx>thresh) { content.style.transform='translateX(0)'; reveal.style.opacity='0'; try { trip.status='submitted'; await saveTrip(trip); await renderTripLists(trip.id); } catch (e) {} }
          else if (dx<-thresh) { content.style.transform='translateX(0)'; try { trip.status='reimbursed'; await saveTrip(trip); await renderTripLists(trip.id); } catch (e) {} finally { reveal.style.opacity='0'; } }
          else { content.style.transform='translateX(0)'; reveal.style.opacity='0'; }
        } else { content.style.transform='translateX(0)'; reveal.style.opacity='0'; }
      };
      card.addEventListener('touchstart', onTouchStart, { passive:true });
      card.addEventListener('touchmove', onTouchMove, { passive:false });
      card.addEventListener('touchend', onTouchEnd);
    })();
  } catch (e) {}
  card.addEventListener('click', (e) => {
    // If already selected, navigate to details on tap (mobile-friendly)
    if (card.classList.contains('btn-custom-blue')) {
      renderTripDetail(trip.id);
    } else if (e.detail >= 2) {
      renderTripDetail(trip.id);
    } else {
      selectTrip(trip.id);
    }
  });
  return card;
}

function buildAddTripShadowCard() {
  const card = document.createElement('div');
  card.className = 'card mb-3 add-trip-card card-uniform-height';
  card.id = 'add-trip-card';

  let editing = false;

  const renderShadow = () => {
    editing = false;
    card.classList.remove('editing');
    card.innerHTML = `
      <div class="card-body edit-row w-100">
        <input type="text" class="form-control" value="Trip" aria-label="Trip name" readonly 
               style="color: var(--light-grey) !important; -webkit-text-fill-color: var(--light-grey) !important; border: 2px dashed var(--light-grey) !important; background-color: #ffffff !important;">
        <button class="btn btn-dashed-blue btn-equal" id="add-new-trip">Add</button>
      </div>
    `;
    const startEdit = () => { if (!editing) { editing = true; renderEditor(); } };
    card.querySelectorAll('input, button').forEach(el => el.addEventListener('click', startEdit));
  };

  const renderEditor = () => {
    card.classList.add('editing');
    card.innerHTML = `
      <div class="card-body edit-row w-100">
        <input type="text" class="form-control" aria-label="Trip name" id="new-trip-name">
        <button class="btn btn-custom-blue btn-equal" id="save-new-trip">Save</button>
      </div>
    `;
    const input = card.querySelector('#new-trip-name');
    const saveBtn = card.querySelector('#save-new-trip');
    if (input) { input.value = ''; input.focus(); }

    const onDocClick = (ev) => {
      if (!(ev.target instanceof Node) || !card.contains(ev.target)) {
        document.removeEventListener('click', onDocClick, true);
        renderShadow();
      }
    };
    document.addEventListener('click', onDocClick, true);

    const save = async () => {
      const name = (input?.value || '').trim();
      if (!name) {
        input?.focus();
        input?.classList.add('is-invalid');
        return;
      }
      document.removeEventListener('click', onDocClick, true);
      // Determine next position at the end of Active column
      let position = 0;
      try {
        const all = await getAllTrips(true);
        const actives = all.filter(t => t.status === 'active');
        const maxPos = Math.max(-1, ...actives.map(t => Number.isFinite(t.position) ? t.position : -1));
        position = (maxPos >= 0 ? maxPos + 1 : actives.length);
      } catch {}
      const newTrip = { id: Date.now().toString(), name, status: 'active', position, createdAt: new Date().toISOString() };
      await saveTrip(newTrip);
      await renderTripLists();
    };

    saveBtn.addEventListener('click', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') renderShadow();
    });
  };

  renderShadow();
  return card;
}

async function renderTripLists(selectedTripId = null) {
  dbg('renderTripLists:start', { selectedTripId });
  const trips = await getAllTrips();
  let active = document.getElementById('active-trips-container');
  let submitted = document.getElementById('submitted-trips-container');
  let reimbursed = document.getElementById('reimbursed-trips-container');
  if (!active || !submitted || !reimbursed) {
    console.warn('[UI] Trip containers missing; re-rendering shell');
    await renderShell();
    active = document.getElementById('active-trips-container');
    submitted = document.getElementById('submitted-trips-container');
    reimbursed = document.getElementById('reimbursed-trips-container');
    if (!active || !submitted || !reimbursed) {
      console.error('[UI] Trip containers still missing after shell render');
      return;
    }
  }

  active.innerHTML = '';
  submitted.innerHTML = '';
  reimbursed.innerHTML = '';

  const addCard = buildAddTripShadowCard();
  active.appendChild(addCard);

  const byPos = (a, b) => {
    const ap = Number.isFinite(a.position) ? a.position : Number.POSITIVE_INFINITY;
    const bp = Number.isFinite(b.position) ? b.position : Number.POSITIVE_INFINITY;
    if (ap !== bp) return ap - bp;
    const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ad - bd;
  };

  const activeTrips = trips.filter(t => t.status === 'active').sort(byPos);
  activeTrips.forEach(trip => active.appendChild(buildTripCard(trip, trip.id === selectedTripId)));

  const submittedTrips = trips.filter(t => t.status === 'submitted').sort(byPos);
  if (submittedTrips.length > 0) {
    submittedTrips.forEach(trip => submitted.appendChild(buildTripCard(trip, trip.id === selectedTripId)));
  } else {
    submitted.innerHTML = '<p class="text-center text-placeholder">No submitted trips</p>';
  }

  const reimbursedTrips = trips.filter(t => t.status === 'reimbursed').sort(byPos);
  if (reimbursedTrips.length > 0) {
    reimbursedTrips.forEach(trip => reimbursed.appendChild(buildTripCard(trip, trip.id === selectedTripId)));
  } else {
    reimbursed.innerHTML = '<p class="text-center text-placeholder">No reimbursed trips</p>';
  }

  [active, submitted, reimbursed].forEach(container => {
    try {
      new Sortable(container, {
        group: 'shared',
        animation: 150,
        ghostClass: 'ghost-card',
        draggable: '.trip-card',
        filter: '.add-trip-card',
        delay: 150,
        delayOnTouchOnly: true,
        direction: 'vertical',
        onEnd: async () => {
          await syncTripOrderFromDOM();
          await renderTripLists();
        }
      });
    } catch (e) {
      console.error('[UI] Failed to init Sortable for container', container?.id, e);
    }
  });
}

async function syncTripOrderFromDOM() {
  const containers = [
    { id: 'active-trips-container', status: 'active' },
    { id: 'submitted-trips-container', status: 'submitted' },
    { id: 'reimbursed-trips-container', status: 'reimbursed' }
  ];
  for (const { id, status } of containers) {
    const el = document.getElementById(id);
    if (!el) continue;
    const items = Array.from(el.querySelectorAll('.trip-card'));
    for (let i = 0; i < items.length; i++) {
      const tripId = items[i].dataset.tripId;
      const trip = await getTripById(tripId);
      if (!trip) continue;
      trip.status = status;
      trip.position = i;
      await saveTrip(trip);
    }
  }
}

async function renderTrips(selectedTripId = null) {
  // Clean up any expense deselect handler when leaving expense view
  if (expenseDeselectHandler) {
    document.removeEventListener('click', expenseDeselectHandler, true);
    expenseDeselectHandler = null;
  }
  if (!document.getElementById('trip-list-container')) {
    await renderShell();
  }
  await renderTripLists(selectedTripId);
}

async function renderTripDetail(tripId) {
  const trip = await getTripById(tripId);
  const app = document.getElementById('app');
  const icons = await loadIconSettings();

  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height text-white btn-custom-green">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="back-to-trips" class="btn text-white btn-no-style header-btn-left" aria-label="Back to trips"><i class="bi ${icons.home} home-icon"></i></button>
          <h4 class="header-title">${escapeHTML(trip.name)}</h4>
          <button id="settings-btn" class="btn text-white btn-no-style header-btn-right" aria-label="Settings"><i class="bi ${icons.cog} home-icon"></i></button>
        </div>
      </div>
      <main id="expense-list-container" data-trip-id="${tripId}"></main>
    </div>
  `;

  await renderExpenseList(tripId);
  document.getElementById('back-to-trips').addEventListener('click', renderTrips);
  document.getElementById('settings-btn').addEventListener('click', renderSettingsPage);
}

const DEFAULT_CATEGORY_COLORS = {
  'Breakfast': '#f59e0b',
  'Lunch': '#22c55e',
  'Dinner': '#ef4444',
  'Accommodation': '#3b82f6',
  'Taxi': '#6b7280',
  'Train': '#8b5cf6',
  'Flight': '#0ea5e9',
  'Baggage': '#a16207',
  'Miscellaneous': '#14b8a6',
  'Other': '#64748b'
};

async function loadCategoryColorMap() {
  const saved = await (typeof getCategoryColors === 'function' ? getCategoryColors() : Promise.resolve({}));
  return { ...DEFAULT_CATEGORY_COLORS, ...(saved || {}) };
}

const DEFAULT_ICONS = {
  receipt: 'bi-receipt',
  home: 'bi-house-door-fill',
  cog: 'bi-gear-fill'
};

async function loadIconSettings() {
  const saved = await (typeof getIconSettings === 'function' ? getIconSettings() : Promise.resolve({}));
  return { ...DEFAULT_ICONS, ...(saved || {}) };
}

const DEFAULT_SCAN = {
  enable: false,
  apiBaseUrl: '',
  filesEnable: false,
  filenameTemplate: '{vendor}-{date}-{time}-{currency}-{amount}.pdf',
  subfolderTemplate: ''
};

async function loadScanSettings() {
  const saved = await (typeof getScanSettings === 'function' ? getScanSettings() : Promise.resolve({}));
  return { ...DEFAULT_SCAN, ...(saved || {}) };
}

async function colorizeCategorySelect(selectEl) {
  if (!selectEl) return;
  const map = await loadCategoryColorMap();
  Array.from(selectEl.options).forEach(opt => {
    const name = opt.value || opt.textContent;
    const base = map[name];
    const color = typeof pastelizeColor === 'function' ? pastelizeColor(base) : base;
    if (color) {
      opt.style.backgroundColor = color;
      opt.style.color = '#fff';
    }


function pastelizeColor(color) {
  // Accept hex like #RRGGBB; return hsl with reduced saturation and higher lightness
  try {
    let r=0,g=0,b=0;
    if (/^#?[0-9a-fA-F]{6}$/.test(color)) {
      const hex = color.replace('#','');
      r = parseInt(hex.slice(0,2),16)/255; g = parseInt(hex.slice(2,4),16)/255; b = parseInt(hex.slice(4,6),16)/255;
    } else {
      // Fallback: let browser parse and read back
      const tmp = document.createElement('div'); tmp.style.color = color; document.body.appendChild(tmp); const cs = getComputedStyle(tmp).color; document.body.removeChild(tmp);
      const m = cs.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/); if (m) { r = +m[1]/255; g = +m[2]/255; b = +m[3]/255; } else { return color; }
    }
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0,s=0,l=(max+min)/2;
    if (max!==min) {
      const d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch (max) { case r: h=(g-b)/d + (g<b?6:0); break; case g: h=(b-r)/d + 2; break; case b: h=(r-g)/d + 4; break; }
      h/=6;
    }
    s = Math.max(0, s*0.6); // reduce saturation
    l = Math.min(1, l*1.1); // increase lightness
    const hs = Math.round(h*360), ss = Math.round(s*100), ls = Math.round(l*100);
    return `hsl(${hs} ${ss}% ${ls}%)`;
  } catch { return color; }
}

  });
}

function buildExpenseCard(expense, isSelected) {
  const card = document.createElement('div');
  card.className = `card mb-3 card-uniform-height expense-card ${isSelected ? 'expense-card--selected' : ''}`;
  card.draggable = true;
  card.dataset.expenseId = expense.id;
  const expenseDate = new Date(expense.date);
  const dateOptions = { day: '2-digit', month: 'short', year: '2-digit' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const displayDateOnly = expenseDate.toLocaleDateString('en-GB', dateOptions);
  const displayTimeOnly = expenseDate.toLocaleTimeString('en-GB', timeOptions);

  card.innerHTML = `
    <div class="card-body expense-grid">
      <div class="col-left">
        <p class="expense-description">${escapeHTML(expense.description)}</p>
        <span class="badge expense-category-pill">${escapeHTML(expense.category)}</span>
      </div>
      <div class="col-datetime">
        <small class="expense-date text-muted">${displayDateOnly}</small>
        <small class="expense-time text-muted">${displayTimeOnly}</small>
      </div>
      <div class="col-amount text-end">
        <p class="fw-bold mb-0">${escapeHTML(expense.currency)}${Number(expense.amount).toFixed(2)}</p>
      </div>
      <div class="col-icon text-end" aria-hidden="true">
        <i class="bi bi-receipt expense-receipt-icon" role="button" tabindex="0" title="Add receipt"></i>
      </div>
    </div>
  `;

  // Apply category color and receipt indicator
  queueMicrotask(async () => {
    try {
      const map = await loadCategoryColorMap();
      const color = map[expense.category] || DEFAULT_CATEGORY_COLORS['Other'];
      const pill = card.querySelector('.expense-category-pill');
      if (pill) {
        pill.style.backgroundColor = color;
        pill.style.color = '#ffffff';
      }
      const icons = await loadIconSettings();
      const iconEl = card.querySelector('.expense-receipt-icon');
      if (iconEl) {
        const had = iconEl.classList.contains('has-receipt');
        iconEl.className = `bi ${icons.receipt} expense-receipt-icon${had ? ' has-receipt' : ''}`;
      }
      const receipts = await (typeof getReceiptsByExpenseId === 'function' ? getReceiptsByExpenseId(expense.id) : []);
      if (receipts && receipts.length) {
        card.querySelector('.expense-receipt-icon')?.classList.add('has-receipt');
      }
    } catch (e) {
      console.warn('Failed to apply category color', e);
    }
  });
  
  // Desktop double-click to edit; single click = select
  card.addEventListener('dblclick', async (e) => {
    e.preventDefault();
    await selectExpense(expense.id);
    const fresh = document.querySelector(`[data-expense-id=\"${expense.id}\"]`);
    if (fresh) startEditExpense(fresh, expense);
  });
  card.addEventListener('click', () => selectExpense(expense.id));

  // Swipe gestures: right→edit (green), left→archive (orange)
  card.style.position = 'relative';
  card.style.touchAction = 'pan-y';
  const reveal = document.createElement('div');
  reveal.style.position = 'absolute'; reveal.style.inset = '0'; reveal.style.zIndex = '0';
  reveal.style.borderRadius = getComputedStyle(card).borderRadius || '0.25rem';
  reveal.style.background = 'linear-gradient(90deg, #198754 0 50%, #fd7e14 50% 100%)';
  card.prepend(reveal);
  const content = card.querySelector('.card-body') || card;
  content.style.position = 'relative'; content.style.zIndex = '1';
  let startX=0, curX=0, swiping=false;
  const onTouchStart = (e)=>{ const t=e.touches?.[0]; if(!t) return; startX = curX = t.clientX; swiping=true; content.style.transition='none'; reveal.style.opacity='1'; };
  const onTouchMove = (e)=>{ if(!swiping) return; const t=e.touches?.[0]; if(!t) return; curX=t.clientX; const dx=curX-startX; content.style.transform = `translateX(${dx}px)`; };
  const onTouchEnd = async ()=>{ if(!swiping) return; swiping=false; const dx=curX-startX; content.style.transition='transform 150ms ease'; if(dx>80){ content.style.transform='translateX(0)'; reveal.style.opacity='0'; await selectExpense(expense.id); const fresh=document.querySelector(`[data-expense-id=\"${expense.id}\"]`); if(fresh) startEditExpense(fresh, expense);} else if(dx<-80){ content.style.transform='translateX(-100%)'; try{ expense.archived=true; await saveExpense(expense); const c=document.getElementById('expense-list-container'); const tripId=c?.dataset.tripId; if(tripId) await renderExpenseList(tripId,null);}catch{} finally { reveal.style.opacity='0'; } } else { content.style.transform='translateX(0)'; reveal.style.opacity='0'; } };
  card.addEventListener('touchstart', onTouchStart, { passive:true });
  card.addEventListener('touchmove', onTouchMove, { passive:true });
  card.addEventListener('touchend', onTouchEnd);

  // Mobile long-press to edit (no extra buttons)
  attachLongPressToEdit(card, expense);
  // Drag to archive support
  card.addEventListener('dragstart', (e) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData('text/expense-id', expense.id);
    e.dataTransfer.effectAllowed = 'move';
  });

  // Receipt icon click → add (camera/photos) or preview
  const icon = card.querySelector('.expense-receipt-icon');
  if (icon) {
    icon.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      if (icon.classList.contains('has-receipt')) {
        await openReceiptViewer(expense.id);
      } else {
        openReceiptActionSheet(expense.id, icon);
      }
    });
    icon.addEventListener('keydown', async (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (icon.classList.contains('has-receipt')) await openReceiptViewer(expense.id);
        else openReceiptActionSheet(expense.id, icon);
      }
    });
  }
  return card;
}

function startEditExpense(card, expense) {
  const cardBody = card.querySelector('.card-body');
  const hadUniform = card.classList.contains('card-uniform-height');
  if (hadUniform) card.classList.remove('card-uniform-height');
  const originalContent = cardBody.innerHTML;

  cardBody.innerHTML = `
    <div class="d-flex flex-column gap-2 w-100">
      <input type="text" class="form-control" placeholder="Vendor" aria-label="Description" id="exp-desc-edit" value="${escapeHTML(expense.description)}">
      <div class="grid-2-col">
        <select class="form-select" aria-label="Currency" id="exp-currency-edit">
          <option>£</option>
          <option>$</option>
          <option>€</option>
          <option>zł</option>
        </select>
        <input type="number" class="form-control" placeholder="0.00" step="0.01" aria-label="Amount" id="exp-amount-edit" value="${expense.amount}" inputmode="decimal">
      </div>
      <div class="grid-2-col">
        <input type="date" class="form-control" aria-label="Date" id="exp-date-edit" value="${expense.date.slice(0,10)}">
        <input type="time" class="form-control" aria-label="Time" id="exp-time-edit" value="${expense.date.slice(11,16)}">
      </div>
      <div id="category-wrapper-edit">
        <select class="form-select" aria-label="Category" id="exp-cat-edit">
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Accommodation</option>
          <option>Taxi</option>
          <option>Train</option>
          <option>Flight</option>
          <option>Baggage</option>
          <option>Miscellaneous</option>
          <option>Other</option>
        </select>
      </div>
      <textarea class="form-control single-line-notes" rows="1" placeholder="Notes" id="exp-notes-edit">${escapeHTML(expense.notes)}</textarea>
      <button class="btn btn-custom-green w-100 btn-uniform-height" id="save-expense-edit">Save</button>
    </div>
  `;

  const currencySelect = card.querySelector('#exp-currency-edit');
  currencySelect.value = expense.currency;
  const categorySelect = card.querySelector('#exp-cat-edit');
  categorySelect.value = expense.category;

  const onDocClick = (ev) => {
    if (!(ev.target instanceof Node) || !card.contains(ev.target)) {
      document.removeEventListener('click', onDocClick, true);
      // Restore original structure to keep alignment classes
      cardBody.innerHTML = originalContent;
      if (hadUniform) card.classList.add('card-uniform-height');
    }
  };
  document.addEventListener('click', onDocClick, true);

  // Colorize category dropdown options in edit mode
  colorizeCategorySelect(card.querySelector('#exp-cat-edit'));

  const saveBtn = card.querySelector('#save-expense-edit');
  saveBtn.addEventListener('click', async () => {
    document.removeEventListener('click', onDocClick, true);
    const updatedExpense = { ...expense };
    updatedExpense.description = card.querySelector('#exp-desc-edit').value;
    updatedExpense.currency = card.querySelector('#exp-currency-edit').value;
    updatedExpense.amount = parseFloat(card.querySelector('#exp-amount-edit').value);
    const date = card.querySelector('#exp-date-edit').value;
    const time = card.querySelector('#exp-time-edit').value;
    updatedExpense.date = `${date}T${time || '00:00'}`;
    updatedExpense.category = card.querySelector('#exp-cat-edit').value;
    updatedExpense.notes = card.querySelector('#exp-notes-edit').value;

    await saveExpense(updatedExpense);
    await renderExpenseList(expense.tripId, expense.id);
  });
}

function buildAddExpenseShadowCard(tripId) {
  const card = document.createElement('div');
  card.className = 'card mb-3 add-expense-card';
  card.id = 'add-expense-card';

  let editing = false;

  const renderShadow = () => {
    editing = false;
    card.classList.remove('editing');
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5);

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex flex-column gap-2">
          <input type="text" class="form-control shadow-input" value="Vendor" readonly aria-label="Description">
          <div class="grid-2-col">
            <select class="form-select shadow-input" readonly aria-label="Currency">
              <option>CUR</option>
            </select>
            <input type="number" class="form-control shadow-input" value="0.00" readonly aria-label="Amount">
          </div>
          <div class="grid-2-col">
            <input type="date" class="form-control shadow-input" value="${today}" readonly aria-label="Date">
            <input type="time" class="form-control shadow-input" value="${currentTime}" readonly aria-label="Time">
          </div>
          <select class="form-select shadow-input" readonly aria-label="Category">
            <option>Category</option>
          </select>
          <textarea class="form-control single-line-notes shadow-input" rows="1" placeholder="Notes" readonly aria-label="Notes"></textarea>
          <button class="btn btn-dashed-green w-100" id="add-expense">Add</button>
        </div>
      </div>
    `;
    const triggerEdit = () => { if (!editing) { editing = true; renderEditor(); } };
    card.querySelectorAll('input[readonly], select[readonly], textarea[readonly]').forEach(el => {
      el.addEventListener('click', triggerEdit);
      el.addEventListener('focus', triggerEdit);
    });
    card.querySelector('#add-expense')?.addEventListener('click', triggerEdit);
  };

  const renderEditor = () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5);
    card.classList.add('editing');
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex flex-column gap-2">
          <input type="text" class="form-control" placeholder="Vendor" aria-label="Description" id="exp-desc">
          <div class="grid-2-col">
            <select class="form-select" aria-label="Currency" id="exp-currency">
              <option selected disabled hidden>CUR</option>
              <option>£</option>
              <option>$</option>
              <option>€</option>
              <option>zł</option>
            </select>
            <input type="number" class="form-control" placeholder="0.00" step="0.01" aria-label="Amount" id="exp-amount" inputmode="decimal">
          </div>
          <div class="grid-2-col">
            <input type="date" class="form-control is-default" value="${today}" aria-label="Date" id="exp-date">
            <input type="time" class="form-control is-default" value="${currentTime}" aria-label="Time" id="exp-time">
          </div>
          <div id="category-wrapper">
            <select class="form-select" aria-label="Category" id="exp-cat">
              <option selected disabled hidden>Category</option>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Accommodation</option>
              <option>Taxi</option>
              <option>Train</option>
              <option>Flight</option>
              <option>Baggage</option>
              <option>Miscellaneous</option>
              <option>Other</option>
            </select>
          </div>
          <textarea class="form-control single-line-notes" rows="1" placeholder="Notes" id="exp-notes"></textarea>
          <button class="btn btn-custom-green w-100 btn-uniform-height" id="save-expense">Save</button>
        </div>
      </div>
    `;
    const saveBtn = card.querySelector('#save-expense');
    const desc = card.querySelector('#exp-desc');
    const currency = card.querySelector('#exp-currency');
    const amount = card.querySelector('#exp-amount');
    const date = card.querySelector('#exp-date');
    const time = card.querySelector('#exp-time');
    const categoryWrapper = card.querySelector('#category-wrapper');
    const notes = card.querySelector('#exp-notes');
    
    desc?.focus();

    const onDocClick = (ev) => {
      if (!(ev.target instanceof Node) || !card.contains(ev.target)) {
        document.removeEventListener('click', onDocClick, true);
        renderShadow();
      }
    };
    document.addEventListener('click', onDocClick, true);

    const currencySelect = card.querySelector('#exp-currency');
    const catSelect = card.querySelector('#exp-cat');
    currencySelect.classList.add('is-placeholder');
    catSelect.classList.add('is-placeholder');
    currencySelect.addEventListener('change', () => currencySelect.classList.remove('is-placeholder'));

    date.addEventListener('input', () => date.classList.remove('is-default'), { once: true });
    time.addEventListener('input', () => time.classList.remove('is-default'), { once: true });

    categoryWrapper.addEventListener('change', (e) => {
      if (e.target.id === 'exp-cat') {
        e.target.classList.remove('is-placeholder');
        if (e.target.value === 'Other') {
          const textInput = document.createElement('input');
          textInput.type = 'text';
          textInput.className = 'form-control';
          textInput.placeholder = 'Specify category';
          textInput.id = 'exp-cat-other';
          categoryWrapper.innerHTML = '';
          categoryWrapper.appendChild(textInput);
          textInput.focus();
        }
      }
    });

    if (notes) {
      const initialHeight = parseInt(getComputedStyle(notes).height, 10);
      const autoSize = () => {
        notes.style.height = 'auto';
        const newHeight = Math.max(initialHeight, notes.scrollHeight);
        notes.style.height = `${newHeight}px`;
      };
      notes.addEventListener('input', autoSize);
    }

    // Colorize category dropdown options
    colorizeCategorySelect(card.querySelector('#exp-cat'));

    const save = async () => {
      document.removeEventListener('click', onDocClick, true);
      const catSelect = categoryWrapper.querySelector('#exp-cat');
      const catOtherInput = categoryWrapper.querySelector('#exp-cat-other');
      let categoryValue = catSelect ? catSelect.value : (catOtherInput ? catOtherInput.value.trim() || 'Other' : '');

      let isValid = true;
      [desc, currency, amount, date].forEach(field => {
        if (!field.value || field.value === 'CUR') {
          field.classList.add('is-invalid');
          isValid = false;
        } else {
          field.classList.remove('is-invalid');
        }
      });
      if (!categoryValue || categoryValue === 'Category') {
        (catSelect || catOtherInput)?.classList.add('is-invalid');
        isValid = false;
      } else {
        (catSelect || catOtherInput)?.classList.remove('is-invalid');
      }
      if (!isValid) {
        document.addEventListener('click', onDocClick, true);
        return;
      }

      const expense = {
        id: Date.now().toString(),
        tripId,
        description: desc.value,
        currency: currency.value,
        amount: parseFloat(amount.value),
        date: `${date.value}T${time.value || '00:00'}`,
        category: categoryValue,
        notes: notes?.value?.trim() || '',
        createdAt: new Date().toISOString(),
        position: (await (async()=>{ try{ const ex = await getExpensesByTripId(tripId); const act = ex.filter(e=>!e.archived); const maxPos = Math.max(-1, ...act.map(e=>Number.isFinite(e.position)?e.position:-1)); return (maxPos>=0?maxPos+1:act.length);} catch (e) { return 0; } })())
      };
      await saveExpense(expense);
      await renderExpenseList(tripId);
    };

    saveBtn.addEventListener('click', save);
  };

  renderShadow();
  return card;
}

// Long-press (touch) to open editor on mobile without extra UI
function attachLongPressToEdit(card, expense) {
  let pressTimer = null;
  let moved = false;
  const start = (e) => {
    moved = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(async () => {
      await selectExpense(expense.id);
      startEditExpense(card, expense);
    }, 500);
  };
  const cancel = () => { clearTimeout(pressTimer); };
  const onMove = (e) => { moved = true; clearTimeout(pressTimer); };

  card.addEventListener('touchstart', start, { passive: true });
  card.addEventListener('touchend', cancel);
  card.addEventListener('touchcancel', cancel);
  card.addEventListener('touchmove', onMove, { passive: true });
}

// Open camera/gallery, save to IndexedDB, and mark icon
async function normalizeImageForSave(file) {
  try {
    const bmp = await (window.createImageBitmap ? createImageBitmap(file) : Promise.reject('no cib'));
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width; canvas.height = bmp.height;
    const ctx = canvas.getContext('2d');
    // Fill white to avoid black where source has transparency
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
    if (blob) return new File([blob], (file.name || 'receipt') + '.jpg', { type: 'image/jpeg' });
  } catch {}
  return file;
}

function openReceiptPicker(expenseId, iconEl) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (file) {
      try {
        const toSave = await normalizeImageForSave(file);
        const newId = await saveReceiptForExpense(expenseId, toSave);
        iconEl?.classList.add('has-receipt');
        try { await setCurrentReceipt(expenseId, newId); } catch {}
        // If a modal is open for this expense, refresh; otherwise open it now
        const modalId = `receipt-modal-${expenseId}`;
        let modalEl = document.getElementById(modalId);
        if (modalEl) {
          await renderReceiptModalContent(modalEl, expenseId);
        } else {
          await openReceiptViewer(expenseId);
        }
      } catch (e) {
        console.error('Failed to save receipt', e);
        // Non-blocking notice; do not freeze the flow
        try { console.warn('Save failed, attempting to open modal for diagnostics'); await showReceiptModal(expenseId); } catch {}
      }
    }
    document.body.removeChild(input);
  });
  input.click();
}

// Action sheet: choose Photos/Camera or iOS Shortcuts Scan
function openReceiptActionSheet(expenseId, iconEl) {
  const id = `receipt-action-${expenseId}`;
  let modalEl = document.getElementById(id);
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = id;
    modalEl.tabIndex = -1;
  modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add receipt</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex flex-column gap-2">
            <button type="button" class="btn btn-secondary" id="pick-photo">Camera / Photos</button>
            <button type="button" class="btn btn-secondary" id="scan-shortcuts">Scan with iOS Shortcuts</button>
            <button type="button" class="btn btn-secondary" id="scan-files">Scan (Shortcuts → Files)</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalEl);
  }
  const modal = getModalInstance(id);
  modal?.show();
  const onHide = () => {
    modalEl.removeEventListener('hidden.bs.modal', onHide);
    modalEl.querySelector('#pick-photo')?.removeEventListener('click', pickHandler);
    modalEl.querySelector('#scan-shortcuts')?.removeEventListener('click', scanHandler);
    modalEl.querySelector('#scan-files')?.removeEventListener('click', scanFilesHandler);
  };
  modalEl.addEventListener('hidden.bs.modal', onHide, { once: true });

  const pickHandler = () => { modal?.hide(); openReceiptPicker(expenseId, iconEl); };
  const scanHandler = async () => { modal?.hide(); await launchShortcutsScan(expenseId); };
  const scanFilesHandler = async () => { modal?.hide(); await launchShortcutsScanToFiles(expenseId); };

  // Enable/disable Shortcuts based on settings + environment
  modalEl.querySelector('#pick-photo')?.addEventListener('click', pickHandler);
  (async () => {
    const cap = await (typeof getCaptureSettings==='function' ? getCaptureSettings() : {});
    const camOn = cap.camera !== false;
    const webOn = !!cap.scanWeb;
    const filesOn = !!cap.scanFiles;
    const btnCam = modalEl.querySelector('#pick-photo');
    const btnWeb = modalEl.querySelector('#scan-shortcuts');
    const btnFiles = modalEl.querySelector('#scan-files');
    if (btnCam) btnCam.style.display = camOn ? '' : 'none';
    if (btnWeb) {
      const s = await loadScanSettings();
      const ok = s.enable && !!s.apiBaseUrl && isIosSafari();
      btnWeb.style.display = (webOn && ok) ? '' : 'none';
      if (webOn && ok) btnWeb.addEventListener('click', scanHandler);
    }
    if (btnFiles) {
      const s = await loadScanSettings();
      const ok = !!isIosSafari() && !!s.filesEnable;
      btnFiles.style.display = (filesOn && ok) ? '' : 'none';
      if (filesOn && ok) btnFiles.addEventListener('click', scanFilesHandler);
    }
  })();
}

function isIosSafari() {
  const ua = navigator.userAgent || navigator.vendor || '';
  const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|crios|fxios|android).)*safari/i.test(ua);
  return isiOS && isSafari;
}

async function launchShortcutsScan(expenseId) {
  const scan = await loadScanSettings();
  if (!scan.enable || !scan.apiBaseUrl) { alert('Enable Shortcuts and set API base URL in Settings'); return; }
  const session = `sess_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const auth = `dev_${Math.random().toString(36).slice(2,6)}`; // replace with server-minted token in production
  try {
    localStorage.setItem('scan:pending', JSON.stringify({ session, expenseId, at: Date.now() }));
  } catch {}
  const payload = encodeURIComponent(JSON.stringify({ session, auth, expenseId }));
  const success = encodeURIComponent(`${location.origin}${location.pathname}?scan=done`);
  const cancel = encodeURIComponent(`${location.origin}${location.pathname}?scan=cancel`);
  const error = encodeURIComponent(`${location.origin}${location.pathname}?scan=error`);
  const shortcutName = encodeURIComponent('Scan to Web');
  const url = `shortcuts://x-callback-url/run-shortcut?name=${shortcutName}&input=text&text=${payload}&x-success=${success}&x-cancel=${cancel}&x-error=${error}`;
  // Attempt to open Shortcuts
  location.href = url;
}

async function launchShortcutsScanToFiles(expenseId) {
  // Build a filename from expense details: vendor-date-time-currency-value.pdf
  try {
    const expense = await (typeof getExpenseById === 'function' ? getExpenseById(expenseId) : null);
    const scan = await loadScanSettings();
    const trip = expense?.tripId ? await getTripById(expense.tripId) : null;
    const fn = buildScanFilename(expense, scan, trip);
    const sf = buildScanSubfolder(expense, scan, trip);
    try {
      localStorage.setItem('scan:pending-files', JSON.stringify({ expenseId, filename: fn, subfolder: sf, at: Date.now() }));
    } catch {}
    const payload = encodeURIComponent(JSON.stringify({ expenseId, filename: fn, subfolder: sf }));
    const success = encodeURIComponent(`${location.origin}${location.pathname}?scan=files-done`);
    const cancel = encodeURIComponent(`${location.origin}${location.pathname}?scan=cancel`);
    const error = encodeURIComponent(`${location.origin}${location.pathname}?scan=error`);
    const shortcutName = encodeURIComponent('Scan to Files');
    const url = `shortcuts://x-callback-url/run-shortcut?name=${shortcutName}&input=text&text=${payload}&x-success=${success}&x-cancel=${cancel}&x-error=${error}`;
    location.href = url;
  } catch (e) {
    console.error('Failed to launch Shortcuts (Files mode)', e);
    alert('Unable to launch Shortcuts for Files mode');
  }
}

function buildScanFilename(expense, scan, trip) {
  const safe = (s) => String(s || '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9\-_.\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const desc = safe(expense?.description || 'receipt');
  const d = expense?.date ? new Date(expense.date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  const date = `${y}${m}${day}`;
  const time = `${hh}${mm}`;
  const cur = safe(expense?.currency || '');
  const amt = (Number(expense?.amount) || 0).toFixed(2).replace(/\./g,'-');
  const tpl = scan?.filenameTemplate || '{vendor}-{date}-{time}-{currency}-{amount}.pdf';
  const ctx = {
    vendor: desc,
    date,
    time,
    currency: cur,
    amount: amt,
    trip: safe(trip?.name || '')
  };
  return safeFilename(applyTemplate(tpl, ctx));
}

function buildScanSubfolder(expense, scan, trip) {
  const tpl = scan?.subfolderTemplate || '';
  if (!tpl) return '';
  const d = expense?.date ? new Date(expense.date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  const ctx = {
    vendor: expense?.description || 'receipt',
    date: `${y}${m}${day}`,
    time: `${hh}${mm}`,
    currency: expense?.currency || '',
    amount: (Number(expense?.amount) || 0).toFixed(2),
    trip: trip?.name || ''
  };
  return safePath(applyTemplate(tpl, ctx));
}

function applyTemplate(tpl, ctx) {
  return String(tpl).replace(/\{(vendor|date|time|currency|amount|trip)\}/g, (_, k) => ctx[k] ?? '');
}

function safeFilename(name) {
  // Keep extension, sanitize base
  const parts = String(name || '').split('.');
  const ext = parts.length > 1 ? '.' + parts.pop() : '';
  const base = parts.join('.')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9\-_.\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return (base || 'receipt') + (ext || '.pdf');
}

function safePath(pathStr) {
  return String(pathStr || '')
    .split('/')
    .map(seg => seg
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9\-_.\s]/g, '')
      .trim()
      .replace(/\s+/g, '-'))
    .filter(Boolean)
    .join('/');
}

// (Scan Documents via Files is not supported directly in web; see README.)

async function showReceiptModal(expenseId) {
  const modalId = `receipt-modal-${expenseId}`;
  let modalEl = document.getElementById(modalId);
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = modalId;
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Receipts</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="receipt-viewer">
              <img id="receipt-main-img" alt="Receipt" style="display:none;" />
              <iframe id="receipt-main-pdf" title="Receipt PDF" style="display:none; width:100%; height:60vh; border:0;"></iframe>
            </div>
            <div class="receipt-thumbs mt-2" id="receipt-thumbs"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="retake-receipt">Retake / Add</button>
            <button type="button" class="btn btn-secondary" id="crop-image">Crop</button>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalEl);
  }

  await renderReceiptModalContent(modalEl, expenseId);

  const modal = getModalInstance(modalId);
  modal?.show();

  const retakeBtn = modalEl.querySelector('#retake-receipt');
  retakeBtn.onclick = () => openReceiptActionSheet(expenseId, document.querySelector(`[data-expense-id="${expenseId}"] .expense-receipt-icon`) );
  // Crop (axis-aligned, stable)
  modalEl.querySelector('#crop-image').onclick = async () => {
    try {
      const activeThumb = modalEl.querySelector('.receipt-thumb.receipt-thumb--active');
      if (!activeThumb) return;
      const rid = activeThumb.dataset.id;
      const receipts = await getReceiptsByExpenseId(expenseId);
      const rec = receipts.find(r => r.id === rid);
      if (!rec || (rec.mime||'').startsWith('application/pdf')) { alert('Crop is for images only'); return; }
      // Build crop UI inside modal
      const body = modalEl.querySelector('.modal-body');
      const viewer = body.querySelector('.receipt-viewer');
      const thumbs = body.querySelector('#receipt-thumbs');
      const wrap = document.createElement('div'); wrap.id = 'cropper-wrap'; wrap.className = 'edge-embed';
      const toolbar = document.createElement('div'); toolbar.className = 'edge-embed-toolbar';
      const btnCancel = document.createElement('button'); btnCancel.className = 'btn btn-secondary'; btnCancel.textContent = 'Cancel';
      const btnApply = document.createElement('button'); btnApply.className = 'btn btn-custom-green'; btnApply.textContent = 'Apply';
      toolbar.append(btnCancel, btnApply);
      const stage = document.createElement('div'); stage.className = 'edge-embed-stage';
      const img = document.createElement('img'); img.style.maxWidth = '100%'; img.style.maxHeight = '100%';
      img.src = URL.createObjectURL(rec.blob);
      stage.appendChild(img);
      wrap.append(toolbar, stage);
      body.insertBefore(wrap, thumbs);
      viewer.style.display = 'none'; thumbs.style.display = 'none';
      let cropper = null;
      const startCrop = () => {
        try { if (cropper) cropper.destroy(); } catch {}
        cropper = new Cropper(img, { viewMode: 1, background: false, autoCropArea: 1, movable: false, zoomable: true, scalable: false, rotatable: false });
      };
      img.onload = startCrop; if (img.complete) startCrop();
      const cleanup = () => { try { cropper?.destroy(); } catch {}; wrap.remove(); viewer.style.display=''; thumbs.style.display=''; };
      btnCancel.onclick = () => cleanup();
      btnApply.onclick = async () => {
        try {
          const canvas = cropper.getCroppedCanvas({ fillColor: '#fff' });
          const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
          if (blob) {
            const newId = await saveReceiptForExpense(expenseId, new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
            try { await setCurrentReceipt(expenseId, newId); } catch {}
            await renderReceiptModalContent(modalEl, expenseId);
          }
        } finally { cleanup(); }
      };
    } catch (e) { console.error('Cropper failed', e); }
  };
  const viewer = modalEl.querySelector('.receipt-viewer');
  const thumbs = modalEl.querySelector('#receipt-thumbs');
  // Enable/disable experimental buttons based on settings
  try {
    const imgAdjust = await (typeof getImageAdjustSettings === 'function' ? getImageAdjustSettings() : {});
    const enable = !!imgAdjust.enableExperimental;
    const cropBtn = modalEl.querySelector('#crop-image');
    const skewBtn = modalEl.querySelector('#skew-image');
    if (enable) { cropBtn?.classList.remove('d-none'); skewBtn?.classList.remove('d-none'); }
    else { cropBtn?.classList.add('d-none'); skewBtn?.classList.add('d-none'); }
  } catch {}

  function editorActive() { return !!modalEl.querySelector('#embedded-crop'); }
  function showWorking() {
    let w = modalEl.querySelector('.modal-working');
    if (!w) {
      w = document.createElement('div');
      w.className = 'modal-working';
      w.innerHTML = '<div class="spinner-border text-secondary" role="status" aria-label="Working"></div>';
      modalEl.querySelector('.modal-content')?.appendChild(w);
    }
    w.style.display = 'flex';
    return w;
  }
  function hideWorking() {
    const w = modalEl.querySelector('.modal-working');
    if (w) w.style.display = 'none';
  }
  function hideViewerForEditor() {
    viewer.dataset.prevDisplay = viewer.style.display || '';
    thumbs.dataset.prevDisplay = thumbs.style.display || '';
    viewer.style.display = 'none'; thumbs.style.display = 'none';
  }
  function restoreViewer() {
    viewer.style.display = viewer.dataset.prevDisplay || '';
    thumbs.style.display = thumbs.dataset.prevDisplay || '';
  }
  function removeEmbeddedEditor() {
    const holder = modalEl.querySelector('#embedded-crop');
    if (holder) holder.remove();
  }

  modalEl.querySelector('#crop-image').onclick = async () => {
    try {
      if (editorActive()) return; // guard 
      const activeThumb = modalEl.querySelector('.receipt-thumb.receipt-thumb--active');
      if (!activeThumb) return;
      const rid = activeThumb.dataset.id;
      const receipts = await getReceiptsByExpenseId(expenseId);
      const rec = receipts.find(r => r.id === rid);
      if (!rec || (rec.mime||'').startsWith('application/pdf')) { alert('Crop is for images only'); return; }
      const imgAdjust = await (typeof getImageAdjustSettings === 'function' ? getImageAdjustSettings() : {});
      const cfg = { autoDetect: imgAdjust.autoDetect ?? true, dragEngine: imgAdjust.dragEngine || 'pointer', warpEngine: imgAdjust.warpEngine || 'opencv', maxLongSide: imgAdjust.maxLongSide || 2000 };
      // Embed editor inside modal body
      const body = modalEl.querySelector('.modal-body');
      const holder = document.createElement('div'); holder.id = 'embedded-crop';
      body.insertBefore(holder, thumbs);
      hideViewerForEditor();
      const blob = await window.openReceiptEdgeEditorEmbedded(holder, rec.blob, cfg);
      removeEmbeddedEditor(); restoreViewer();
      if (blob) {
        const newId = await saveReceiptForExpense(expenseId, new File([blob], 'cropped.jpg', { type: blob.type || 'image/jpeg' }));
        try { await setCurrentReceipt(expenseId, newId); } catch {}
        await renderReceiptModalContent(modalEl, expenseId);
      }
    } catch (e) { console.error('Crop failed', e); }
  };
  const skewButton = modalEl.querySelector('#skew-image');
  if (skewButton) skewButton.onclick = async () => {
    try {
      if (editorActive()) { alert('Finish Crop first'); return; }
      const activeThumb = modalEl.querySelector('.receipt-thumb.receipt-thumb--active');
      if (!activeThumb) return;
      const rid = activeThumb.dataset.id;
      const receipts = await getReceiptsByExpenseId(expenseId);
      const rec = receipts.find(r => r.id === rid);
      if (!rec || (rec.mime||'').startsWith('application/pdf')) { alert('Skew works on images only'); return; }
      const imgAdjust = await (typeof getImageAdjustSettings === 'function' ? getImageAdjustSettings() : {});
      const cfg = { maxLongSide: imgAdjust.maxLongSide || 2000 };
      // Auto-detect + warp without manual edit
      const working = showWorking();
      try { await (window._libLoaders?.loadOpenCV?.()); } catch {}
      if (!window.cv) { hideWorking(); alert('Skew requires OpenCV (enable SW or be online)'); return; }
      // Build a canvas from current image
      const tmp = document.createElement('canvas');
      const imgObj = await (async () => { if (window.createImageBitmap) return await createImageBitmap(rec.blob); return await new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=URL.createObjectURL(rec.blob); }); })();
      tmp.width = imgObj.width; tmp.height = imgObj.height; tmp.getContext('2d').drawImage(imgObj,0,0);
      const fit = (w,h)=>{ const long=Math.max(w,h); const s=(imgAdjust.maxLongSide||2000)/long; return { w: Math.round(w*s), h: Math.round(h*s)}; };
      const detPts = await (async ()=>{ const down = document.createElement('canvas'); const f=fit(tmp.width,tmp.height); down.width=f.w; down.height=f.h; down.getContext('2d').drawImage(tmp,0,0,down.width,down.height); const pts = await (async ()=>{ const d=await detectQuadOpenCV(down); if (!d) return null; // map back to original scale
        const sx = tmp.width/down.width, sy = tmp.height/down.height; return d.map(p=>({ x:p.x*sx, y:p.y*sy })); })(); return pts; })();
      if (!detPts) { hideWorking(); alert('Could not detect edges'); return; }
      const outCanvas = await (async ()=>{ const w = await warpOpenCV(tmp, detPts, cfg.maxLongSide); return w; })();
      const blob = await new Promise(r=>outCanvas.toBlob(r, 'image/jpeg', 0.9));
      const newId = await saveReceiptForExpense(expenseId, new File([blob], 'deskewed.jpg', { type: blob.type || 'image/jpeg' }));
      try { await setCurrentReceipt(expenseId, newId); } catch {}
      await renderReceiptModalContent(modalEl, expenseId);
      hideWorking();
    } catch (e) { console.error('Skew failed', e); }
  };
  const makeCurrentBtn = document.createElement('button');
  makeCurrentBtn.type = 'button';
  makeCurrentBtn.className = 'btn btn-custom-green';
  makeCurrentBtn.id = 'make-current';
  makeCurrentBtn.textContent = 'Make Current';
  const footer = modalEl.querySelector('.modal-footer');
  const dismissBtn = modalEl.querySelector('[data-bs-dismiss="modal"]');
  if (footer) {
    if (dismissBtn) footer.insertBefore(makeCurrentBtn, dismissBtn);
    else footer.appendChild(makeCurrentBtn);
  }
  makeCurrentBtn.onclick = async () => {
    const active = modalEl.querySelector('.receipt-thumb.receipt-thumb--active');
    if (!active) return;
    const id = active.dataset.id;
    try {
      await setCurrentReceipt(expenseId, id);
      makeCurrentBtn.textContent = 'Current ✓';
      setTimeout(() => (makeCurrentBtn.textContent = 'Make Current'), 1200);
    } catch (e) {
      console.error('Failed to set current receipt', e);
    }
  };
}

async function renderReceiptModalContent(modalEl, expenseId) {
  const mainImg = modalEl.querySelector('#receipt-main-img');
  const mainPdf = modalEl.querySelector('#receipt-main-pdf');
  const viewer = modalEl.querySelector('.receipt-viewer');
  let mainCanvas = viewer.querySelector('#receipt-main-canvas');
  if (!mainCanvas) {
    mainCanvas = document.createElement('canvas');
    mainCanvas.id = 'receipt-main-canvas';
    mainCanvas.style.display = 'none';
    mainCanvas.style.maxWidth = '100%';
    mainCanvas.style.maxHeight = '60vh';
    viewer.appendChild(mainCanvas);
  }
  const thumbs = modalEl.querySelector('#receipt-thumbs');
  thumbs.innerHTML = '';
  const receipts = await getReceiptsByExpenseId(expenseId);
  if (!receipts.length) {
    mainImg.style.display = 'none';
    mainPdf.style.display = 'none';
    if (mainCanvas) mainCanvas.style.display = 'none';
    return;
  }
  const urls = receipts.map(r => ({ id: r.id, url: URL.createObjectURL(r.blob), mime: r.mime || '', current: !!r.current, blob: r.blob }));
  const setActive = (id) => {
    thumbs.querySelectorAll('.receipt-thumb').forEach(el => el.classList.toggle('receipt-thumb--active', el.dataset.id === id));
    const u = urls.find(x => x.id === id);
    if (!u) return;
    if ((u.mime || '').startsWith('application/pdf')) {
      if (window.pdfjsLib) {
        mainImg.style.display = 'none';
        mainPdf.style.display = 'none';
        mainCanvas.style.display = 'block';
        renderPdfToCanvas(u.blob, mainCanvas).catch(()=>{
          mainCanvas.style.display = 'none';
          mainPdf.style.display = 'block';
          mainPdf.src = u.url;
        });
      } else {
        mainCanvas.style.display = 'none';
        mainImg.style.display = 'none';
        mainPdf.style.display = 'block';
        mainPdf.src = u.url;
      }
    } else {
      // Draw image onto canvas with white background to avoid black transparency
      mainPdf.style.display = 'none';
      mainImg.style.display = 'none';
      mainCanvas.style.display = 'block';
      (async () => {
        try {
          const bmp = await (window.createImageBitmap ? createImageBitmap(u.blob) : Promise.reject('no cib'));
          mainCanvas.width = bmp.width; mainCanvas.height = bmp.height;
          const ctx = mainCanvas.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0,0,mainCanvas.width, mainCanvas.height);
          ctx.drawImage(bmp, 0, 0);
        } catch (e) {
          // Fallback to <img>
          mainCanvas.style.display = 'none';
          mainImg.style.display = 'block';
          mainImg.src = u.url;
        }
      })();
    }
  };
  urls.forEach((u, idx) => {
    const t = document.createElement('div');
    t.className = 'receipt-thumb';
    t.dataset.id = u.id;
    if ((u.mime || '').startsWith('application/pdf')) {
      t.classList.add('receipt-thumb--pdf');
      if (window.pdfjsLib) {
        const c = document.createElement('canvas');
        c.height = 64; c.width = 48;
        renderPdfThumb(u.blob, c).catch(()=>{ c.replaceWith(document.createTextNode('PDF')); });
        t.appendChild(c);
      } else {
        const ph = document.createElement('div');
        ph.style.cssText = 'height:64px;display:flex;align-items:center;justify-content:center;min-width:48px;';
        ph.textContent = 'PDF';
        t.appendChild(ph);
      }
    } else {
      const imgEl = document.createElement('img');
      imgEl.alt = `Receipt ${idx+1}`;
      imgEl.src = u.url;
      imgEl.onerror = async () => {
        try {
          // Fallback: decode and re-encode to data URL
          const bmp = await (window.createImageBitmap ? createImageBitmap(u.blob) : Promise.reject('no cib'));
          const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
          const cctx = c.getContext('2d');
          cctx.fillStyle = '#fff'; cctx.fillRect(0,0,c.width,c.height);
          cctx.drawImage(bmp,0,0);
          imgEl.src = c.toDataURL('image/png');
        } catch {
          imgEl.replaceWith(document.createTextNode('Image failed'));
        }
      };
      t.appendChild(imgEl);
    }
    // Delete button
    const del = document.createElement('div');
    del.className = 'receipt-thumb-delete';
    del.title = 'Delete';
    del.textContent = '×';
    del.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const ok = confirm('Delete this receipt?');
      if (!ok) return;
      try {
        await deleteReceiptById(u.id);
        await renderReceiptModalContent(modalEl, expenseId);
      } catch (e) {
        console.error('Delete failed', e);
      }
    });
    t.appendChild(del);
    t.addEventListener('click', () => setActive(u.id));
    thumbs.appendChild(t);
  });
  const current = urls.find(u => u.current) || urls[0];
  setActive(current.id);

  // Revoke object URLs when modal hides
  modalEl.addEventListener('hide.bs.modal', () => {
    // Proactively detach sources before revoking to avoid WebKitBlobResource errors
    try {
      mainImg.src = '';
      mainPdf.src = '';
      if (mainCanvas) { const ctx = mainCanvas.getContext('2d'); ctx && ctx.clearRect(0,0,mainCanvas.width, mainCanvas.height); }
    } catch {}
  });
  modalEl.addEventListener('hidden.bs.modal', () => {
    // Revoke after hide, allowing any pending loads to cancel
    try { setTimeout(() => urls.forEach(u => URL.revokeObjectURL(u.url)), 0); } catch {}
    // If no receipts remain, reset icon state to grey
    (async () => {
      try {
        const remaining = await getReceiptsByExpenseId(expenseId);
        if (!remaining || !remaining.length) {
          document.querySelector(`[data-expense-id="${expenseId}"] .expense-receipt-icon`)?.classList.remove('has-receipt');
        }
      } catch {}
    })();
  }, { once: true });
}

async function renderPdfToCanvas(blob, canvas) {
  const ab = await blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  const page = await pdf.getPage(1);
  const containerW = canvas.parentElement ? canvas.parentElement.clientWidth : 600;
  const viewport = page.getViewport({ scale: 1 });
  const scale = containerW / viewport.width;
  const vp = page.getViewport({ scale });
  canvas.width = vp.width; canvas.height = vp.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
}

async function renderPdfThumb(blob, canvas) {
  const ab = await blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const scale = Math.min(canvas.width / viewport.width, canvas.height / viewport.height);
  const vp = page.getViewport({ scale });
  canvas.width = vp.width; canvas.height = vp.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
}
let currentSelectedExpenseId = null;
let expenseDeselectHandler = null;

async function renderExpenseList(tripId, selectedExpenseId = null) {
  currentSelectedExpenseId = selectedExpenseId;
  const container = document.getElementById('expense-list-container');
  if (!container) return;
  container.dataset.tripId = tripId;
  container.innerHTML = '';

  container.appendChild(buildAddExpenseShadowCard(tripId));

  const expenses = await getExpensesByTripId(tripId);
  if (!expenses.length) {
    // Ensure deselect handler still installed even with empty list
    if (expenseDeselectHandler) document.removeEventListener('click', expenseDeselectHandler, true);
    expenseDeselectHandler = (ev) => {
      const inContainer = ev.target instanceof Node && container.contains(ev.target);
      const inExpenseCard = inContainer && ev.target.closest('[data-expense-id]');
      const inEditor = inContainer && ev.target.closest('#add-expense-card');
      if (currentSelectedExpenseId && (!inContainer || (!inExpenseCard && !inEditor))) {
        currentSelectedExpenseId = null;
        renderExpenseList(tripId, null);
      }
    };
    document.addEventListener('click', expenseDeselectHandler, true);
    return;
  }
  const byPos = (a,b) => {
    const ap = Number.isFinite(a.position) ? a.position : Number.POSITIVE_INFINITY;
    const bp = Number.isFinite(b.position) ? b.position : Number.POSITIVE_INFINITY;
    if (ap !== bp) return ap - bp;
    const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ad - bd;
  };
  expenses.filter(e=>!e.archived).sort(byPos).forEach(exp => container.appendChild(buildExpenseCard(exp, exp.id === currentSelectedExpenseId)));

  // Archive drop zone
  const archiveSection = document.createElement('section');
  archiveSection.className = 'mt-3';
  archiveSection.innerHTML = `
    <h6 class="mb-2 text-placeholder" id="archive-open" style="cursor:pointer;">Archived</h6>
    <div id="archive-drop" class="drop-zone drop-zone--archive">Drop here to archive</div>
  `;
  container.appendChild(archiveSection);
  archiveSection.querySelector('#archive-open').addEventListener('click', ()=> renderArchivedExpenses(tripId));
  const drop = archiveSection.querySelector('#archive-drop');
  drop.addEventListener('dragover', (e)=>{ e.preventDefault(); drop.style.background='#f8f9fa'; });
  drop.addEventListener('dragleave', ()=>{ drop.style.background=''; });
  drop.addEventListener('drop', async (e)=>{
    e.preventDefault(); drop.style.background='';
    const id = e.dataTransfer.getData('text/expense-id');
    if (!id) return;
    const exp = (await getExpensesByTripId(tripId)).find(x=>x.id===id);
    if (!exp) return;
    exp.archived = true;
    await saveExpense(exp);
    await renderExpenseList(tripId, null);
  });

  // Install outside-click deselect handler
  if (expenseDeselectHandler) document.removeEventListener('click', expenseDeselectHandler, true);
  expenseDeselectHandler = (ev) => {
    const inContainer = ev.target instanceof Node && container.contains(ev.target);
    const inExpenseCard = inContainer && ev.target.closest('[data-expense-id]');
    const inEditor = inContainer && ev.target.closest('#add-expense-card');
    if (currentSelectedExpenseId && (!inContainer || (!inExpenseCard && !inEditor))) {
      currentSelectedExpenseId = null;
      renderExpenseList(tripId, null);
    }
  };
  document.addEventListener('click', expenseDeselectHandler, true);

  // Enable SortableJS for expenses (supports iOS long-press drag)
  try {
    new Sortable(container, {
      animation: 150,
      handle: undefined,
      draggable: '.expense-card',
      filter: '#add-expense-card, section',
      delay: 150,
      delayOnTouchOnly: true,
      onEnd: async () => { await syncExpenseOrderFromDOM(tripId); }
    });
  } catch (e) { console.warn('Sortable init failed for expenses', e); }
}

async function syncExpenseOrderFromDOM(tripId) {
  const container = document.getElementById('expense-list-container');
  if (!container) return;
  const items = Array.from(container.querySelectorAll('.expense-card'));
  for (let i=0;i<items.length;i++) {
    const id = items[i].dataset.expenseId;
    if (!id) continue;
    try {
      const all = await getExpensesByTripId(tripId);
      const exp = all.find(e=>e.id===id);
      if (!exp) continue;
      exp.position = i;
      await saveExpense(exp);
    } catch {}
  }
}

async function selectExpense(expenseId) {
  const card = document.querySelector(`[data-expense-id="${expenseId}"]`);
  if (!card) return;
  const container = card.closest('#expense-list-container');
  if (!container) return;
  const tripId = container.dataset.tripId;
  await renderExpenseList(tripId, expenseId);
}

function selectTrip(tripId) {
  // Clean up any expense deselect handler when leaving expense view
  if (expenseDeselectHandler) {
    document.removeEventListener('click', expenseDeselectHandler, true);
    expenseDeselectHandler = null;
  }
  renderTrips(tripId);
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getModalInstance(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    return bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  }
  return null;
}

function hideModal(modalId) {
  const modal = getModalInstance(modalId);
  if (modal) {
    modal.hide();
  }
}

async function renderArchivedExpenses(tripId) {
  const trip = await getTripById(tripId);
  const app = document.getElementById('app');
  const icons = await loadIconSettings();
  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height text-white btn-custom-green">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="back-to-trip" class="btn text-white btn-no-style header-btn-left" aria-label="Back"><i class="bi ${icons.home} home-icon"></i></button>
          <h4 class="header-title">${escapeHTML(trip.name)}</h4>
          <button id="settings-btn" class="btn text-white btn-no-style header-btn-right" aria-label="Settings"><i class="bi ${icons.cog} home-icon"></i></button>
        </div>
      </div>
      <main id="archived-list-container" data-trip-id="${tripId}">
        <section class="mb-3">
          <h6 class="mb-2 text-placeholder">Archived</h6>
          <div id="archived-expenses"></div>
        </section>
      </main>
    </div>
  `;
  const container = document.getElementById('archived-expenses');
  const all = await getExpensesByTripId(tripId);
  const archived = all.filter(e=>e.archived);
  if (!archived.length) {
    container.innerHTML = '<p class="text-center text-placeholder">No archived expenses</p>';
  } else {
    archived.forEach(exp => {
      const card = buildExpenseCard(exp, false);
      card.draggable = true;
      card.addEventListener('dragstart', (e)=>{ e.dataTransfer?.setData('text/archived-expense-id', exp.id); e.dataTransfer.effectAllowed='move'; });
      container.appendChild(card);
    });
    const dzWrap = document.createElement('div'); dzWrap.className='mt-3';
    dzWrap.innerHTML = `
      <div class="drop-zone drop-zone--unarchive" id="unarchive-drop">Drop here to unarchive</div>
      <div class="mt-2 drop-zone drop-zone--delete" id="delete-drop">Drop here to delete</div>
    `;
    container.parentElement.appendChild(dzWrap);
    const unDz = document.getElementById('unarchive-drop');
    const delDz = document.getElementById('delete-drop');
    [unDz, delDz].forEach(dz => {
      dz.addEventListener('dragover', (e)=>{ e.preventDefault(); dz.style.background='#f8f9fa'; });
      dz.addEventListener('dragleave', ()=>{ dz.style.background=''; });
    });
    unDz.addEventListener('drop', async (e)=>{
      e.preventDefault(); unDz.style.background='';
      const id = e.dataTransfer.getData('text/archived-expense-id'); if (!id) return;
      const all = await getExpensesByTripId(tripId); const exp = all.find(x=>x.id===id); if (!exp) return;
      exp.archived = false; await saveExpense(exp); await renderArchivedExpenses(tripId);
    });
    delDz.addEventListener('drop', async (e)=>{
      e.preventDefault(); delDz.style.background='';
      const id = e.dataTransfer.getData('text/archived-expense-id'); if (!id) return;
      if (!confirm('Delete this expense and its receipts?')) return;
      await deleteReceiptsByExpenseId(id); await deleteExpenseById(id); await renderArchivedExpenses(tripId);
    });
  }
  document.getElementById('back-to-trip').addEventListener('click', ()=>renderTripDetail(tripId));
  document.getElementById('settings-btn').addEventListener('click', renderSettingsPage);
}
async function loadReceiptViewerSettings() {
  const saved = await (typeof getReceiptViewerSettings==='function' ? getReceiptViewerSettings() : {});
  const defaultMode = (window.FEATURES && window.FEATURES.RECEIPT_VIEWER_MODE) || 'modal';
  return { mode: defaultMode, ...(saved||{}) };
}

async function openReceiptViewer(expenseId) {
  const set = await loadReceiptViewerSettings();
  if (set.mode === 'page') {
    await renderReceiptPage(expenseId);
  } else {
    await showReceiptModal(expenseId);
  }
}

async function renderReceiptPage(expenseId) {
  // Find parent trip via expense
  let tripId = null;
  let expenseRef = null;
  try { expenseRef = await (typeof getExpenseById==='function' ? getExpenseById(expenseId) : null); tripId = expenseRef?.tripId || null; } catch {}
  const trip = tripId ? await getTripById(tripId) : { name: 'Receipts' };
  const app = document.getElementById('app');
  const icons = await loadIconSettings();
  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height text-white btn-custom-green">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="back-to-trip" class="btn text-white btn-no-style header-btn-left" aria-label="Back"><i class="bi ${icons.home} home-icon"></i></button>
          <h4 class="header-title">${escapeHTML(trip?.name || 'Receipts')}</h4>
          <button id="settings-btn" class="btn text-white btn-no-style header-btn-right" aria-label="Settings"><i class="bi ${icons.cog} home-icon"></i></button>
        </div>
      </div>
      <main id="receipt-page" class="mt-3" data-expense-id="${expenseId}">
        <div class="receipt-viewer" style="background:#fff;">
          <img id="rp-main-img" alt="Receipt" style="display:none;" />
          <iframe id="rp-main-pdf" title="Receipt PDF" style="display:none; width:100%; height:60vh; border:0;"></iframe>
        </div>
        <div class="receipt-thumbs mt-2" id="rp-thumbs"></div>
        <div class="d-flex gap-2 mt-2">
          <button type="button" class="btn btn-secondary" id="rp-retake">Retake / Add</button>
          <button type="button" class="btn btn-secondary" id="rp-crop">Crop</button>
          <button type="button" class="btn btn-custom-green" id="rp-make-current">Make Current</button>
        </div>
      </main>
    </div>
  `;
  document.getElementById('back-to-trip').addEventListener('click', ()=>tripId?renderTripDetail(tripId):renderTrips());
  document.getElementById('settings-btn').addEventListener('click', renderSettingsPage);

  // Reuse modal content logic adapted for page IDs
  const mainImg = document.getElementById('rp-main-img');
  const mainPdf = document.getElementById('rp-main-pdf');
  const viewer = document.querySelector('#receipt-page .receipt-viewer');
  let mainCanvas = viewer.querySelector('#rp-main-canvas');
  if (!mainCanvas) { mainCanvas = document.createElement('canvas'); mainCanvas.id='rp-main-canvas'; mainCanvas.style.display='none'; mainCanvas.style.maxWidth='100%'; mainCanvas.style.maxHeight='60vh'; viewer.appendChild(mainCanvas); }
  const thumbs = document.getElementById('rp-thumbs');
  thumbs.innerHTML='';
  const receipts = await getReceiptsByExpenseId(expenseId);
  if (!receipts.length) { mainImg.style.display='none'; mainPdf.style.display='none'; mainCanvas.style.display='none'; thumbs.innerHTML='<p class=\"text-placeholder\">No receipts yet</p>'; return; }
  const urls = await Promise.all(receipts.map(async r => {
    const mime = r.mime || '';
    if (mime.startsWith('application/pdf')) {
      return { id: r.id, url: URL.createObjectURL(r.blob), mime, current: !!r.current, blob: r.blob };
    } else {
      const dataUrl = await blobToWhiteDataURL(r.blob).catch(async ()=> await blobToDataURL(r.blob));
      return { id: r.id, url: dataUrl, mime, current: !!r.current, blob: r.blob };
    }
  }));
  const setActive = (id)=>{
    thumbs.querySelectorAll('.receipt-thumb').forEach(el=>el.classList.toggle('receipt-thumb--active', el.dataset.id===id));
    const u = urls.find(x=>x.id===id); if(!u) return;
    if ((u.mime||'').startsWith('application/pdf')) {
      mainImg.style.display='none'; mainPdf.style.display='none'; mainCanvas.style.display='block';
      renderPdfToCanvas(u.blob, mainCanvas).catch(()=>{ mainCanvas.style.display='none'; mainPdf.style.display='block'; mainPdf.src=u.url; });
    } else {
      mainPdf.style.display='none'; mainImg.style.display='none'; mainCanvas.style.display='block';
      (async()=>{ try{ const bmp= await (window.createImageBitmap?createImageBitmap(u.blob):Promise.reject('no cib')); mainCanvas.width=bmp.width; mainCanvas.height=bmp.height; const ctx=mainCanvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height); ctx.drawImage(bmp,0,0);} catch(e){ mainCanvas.style.display='none'; mainImg.style.display='block'; mainImg.src=u.url; } })();
    }
  };
  urls.forEach((u,idx)=>{
    const t=document.createElement('div'); t.className='receipt-thumb'; t.dataset.id=u.id;
    if ((u.mime||'').startsWith('application/pdf')) { t.classList.add('receipt-thumb--pdf'); const c=document.createElement('canvas'); c.height=64; c.width=48; renderPdfThumb(u.blob,c).catch(()=>{ c.replaceWith(document.createTextNode('PDF')); }); t.appendChild(c);} else { const imgEl=document.createElement('img'); imgEl.alt=`Receipt ${idx+1}`; imgEl.src=u.url; imgEl.onerror=async()=>{ try{ const bmp= await (window.createImageBitmap?createImageBitmap(u.blob):Promise.reject('no cib')); const c=document.createElement('canvas'); c.width=bmp.width; c.height=bmp.height; const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(bmp,0,0); imgEl.src=c.toDataURL('image/png'); } catch { imgEl.replaceWith(document.createTextNode('Image failed')); } }; t.appendChild(imgEl);} 
    const del=document.createElement('div'); del.className='receipt-thumb-delete'; del.title='Delete'; del.textContent='×'; del.addEventListener('click', async(ev)=>{ ev.stopPropagation(); if(!confirm('Delete this receipt?')) return; await deleteReceiptById(u.id); await renderReceiptPage(expenseId); }); t.appendChild(del);
    t.addEventListener('click', ()=> setActive(u.id)); thumbs.appendChild(t);
  });
  const current = urls.find(u=>u.current) || urls[0]; setActive(current.id);
  document.getElementById('rp-make-current').onclick = async ()=>{
    const btn = document.getElementById('rp-make-current');
    btn.disabled = true;
    try {
      const active=thumbs.querySelector('.receipt-thumb.receipt-thumb--active');
      if(!active) return;
      await setCurrentReceipt(expenseId, active.dataset.id);
      // Exit viewer after making current
      if (tripId) await renderTripDetail(tripId); else await renderTrips();
    } catch (e) {
      console.error('Make Current failed', e);
    } finally {
      btn.disabled = false;
    }
  };
  document.getElementById('rp-retake').onclick = ()=> openReceiptActionSheet(expenseId, document.querySelector(`[data-expense-id="${expenseId}"] .expense-receipt-icon`));
  document.getElementById('rp-crop').onclick = async ()=>{
    const active=thumbs.querySelector('.receipt-thumb.receipt-thumb--active'); if(!active) return; const rec=(await getReceiptsByExpenseId(expenseId)).find(r=>r.id===active.dataset.id); if(!rec || (rec.mime||'').startsWith('application/pdf')) { alert('Crop is for images only'); return; }
    // Simple CropperJS inline
    const stage = viewer; const img=document.createElement('img'); img.style.maxWidth='100%'; img.style.maxHeight='60vh'; img.src=URL.createObjectURL(rec.blob); stage.innerHTML=''; stage.appendChild(img); const bar=document.createElement('div'); bar.className='mt-2 d-flex gap-2'; const cancel=document.createElement('button'); cancel.className='btn btn-secondary'; cancel.textContent='Cancel'; const autoBtn=document.createElement('button'); autoBtn.className='btn btn-secondary'; autoBtn.textContent='Auto'; const apply=document.createElement('button'); apply.className='btn btn-custom-green'; apply.textContent='Apply'; bar.append(cancel,autoBtn,apply); stage.parentElement.insertBefore(bar, thumbs);
    let cropper=null; const start=()=>{ try{ cropper&&cropper.destroy(); }catch{} cropper=new Cropper(img,{viewMode:1,background:false,autoCropArea:1,movable:false,zoomable:true,scalable:false,rotatable:false}); }; img.onload=start; if(img.complete) start();
    const cleanup=()=>{ try{ cropper&&cropper.destroy(); }catch{} bar.remove(); stage.innerHTML=''; const canvas=document.createElement('canvas'); canvas.id='rp-main-canvas'; canvas.style.maxWidth='100%'; canvas.style.maxHeight='60vh'; stage.appendChild(canvas); };
    cancel.onclick= async ()=>{ cleanup(); await renderReceiptPage(expenseId); };
    autoBtn.onclick = async ()=>{
      try {
        await (window._libLoaders?.loadOpenCV?.());
        if (!(window.cv && window.cv.Mat)) throw new Error('OpenCV not loaded');
        // Draw full-size image to canvas for detection
        const dc=document.createElement('canvas');
        const tmpImg = new Image();
        tmpImg.onload=async()=>{
          dc.width=tmpImg.naturalWidth; dc.height=tmpImg.naturalHeight; const dctx=dc.getContext('2d'); dctx.drawImage(tmpImg,0,0);
          // Detect quad
          const src = cv.imread(dc);
          try {
            const gray=new cv.Mat(); cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);
            const blur=new cv.Mat(); cv.GaussianBlur(gray,blur,new cv.Size(5,5),0);
            const edges=new cv.Mat(); cv.Canny(blur,edges,50,150);
            const contours=new cv.MatVector(); const hierarchy=new cv.Mat();
            cv.findContours(edges,contours,hierarchy,cv.RETR_LIST,cv.CHAIN_APPROX_SIMPLE);
            let best=null, bestArea=0; const approx=new cv.Mat();
            for(let i=0;i<contours.size();i++){ const c=contours.get(i); const peri=cv.arcLength(c,true); cv.approxPolyDP(c,approx,0.02*peri,true); if(approx.rows===4){ const area=cv.contourArea(approx); if(area>bestArea){ bestArea=area; best=[]; for(let j=0;j<4;j++) best.push({x: approx.intPtr(j,0)[0], y: approx.intPtr(j,0)[1]}); } } c.delete(); }
            approx.delete(); contours.delete(); hierarchy.delete(); edges.delete(); blur.delete(); gray.delete();
            if (best) {
              // Compute bounding box and set crop box
              const xs=best.map(p=>p.x), ys=best.map(p=>p.y);
              const x=Math.max(0,Math.min(...xs)), y=Math.max(0,Math.min(...ys));
              const w=Math.min(dc.width,Math.max(...xs))-x, h=Math.min(dc.height,Math.max(...ys))-y;
              cropper.setData({ x, y, width: w, height: h });
            } else {
              alert('No edges detected');
            }
          } finally { src.delete(); }
        };
        tmpImg.src = img.src;
      } catch (e) { console.warn('Auto detect failed', e); alert('Auto detect unavailable'); }
    };
    apply.onclick=async()=>{ try{ const c= cropper.getCroppedCanvas({ fillColor:'#fff' }); const blob= await new Promise(res=>c.toBlob(res,'image/jpeg',0.92)); if(blob){ const newId= await saveReceiptForExpense(expenseId, new File([blob],'cropped.jpg',{type:'image/jpeg'})); await setCurrentReceipt(expenseId, newId); } } finally { await renderReceiptPage(expenseId); } };
  };
}


async function blobToWhiteDataURL(blob) {
  const bmp = await (window.createImageBitmap ? createImageBitmap(blob) : Promise.reject('no createImageBitmap'));
  const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(bmp,0,0);
  return c.toDataURL('image/png');
}
async function blobToDataURL(blob) {
  return await new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(blob); });
}
