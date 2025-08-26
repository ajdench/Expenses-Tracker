// UI Rendering Logic

async function renderShell() {
  const app = document.getElementById('app');
  if (!app) return;
  dbg('renderShell');
  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height text-center btn-custom-blue text-white">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="receipt-icon" class="btn text-white btn-no-style header-btn-left" aria-label="Receipts"><i class="bi bi-receipt home-icon"></i></button>
          <h4 class="header-title">Expenses</h4>
          <button id="settings-btn" class="btn text-white btn-no-style header-btn-right" aria-label="Settings"><i class="bi bi-gear-fill home-icon"></i></button>
        </div>
      </div>

      <main id="trip-list-container">
        <section class="mb-4">
          <h5 class="mb-2 text-placeholder">Active</h5>
          <div id="active-trips-container"></div>
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
  const categories = Array.from(new Set([...Object.keys(DEFAULT_CATEGORY_COLORS), ...discovered]));

  const rows = categories.map(cat => {
    const color = colorMap[cat] || DEFAULT_CATEGORY_COLORS[cat] || DEFAULT_CATEGORY_COLORS['Other'];
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
          <button id="back-to-trips" class="btn text-white btn-no-style header-btn-left" aria-label="Back to trips"><i class="bi bi-house-door-fill home-icon"></i></button>
          <h4 class="header-title">Settings</h4>
        </div>
      </div>
      <main id="settings-container">
        <div class="card app-card">
          <div class="card-body">
            <h6 class="mb-2">Category Colours</h6>
            <div id="category-color-list" class="d-flex flex-column gap-2">${rows || '<p class="text-placeholder mb-0">No categories yet</p>'}</div>
            <div class="mt-3">
              <button id="reset-cat-colors" class="btn btn-secondary">Reset</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
  document.getElementById('back-to-trips').addEventListener('click', renderTrips);
  document.getElementById('reset-cat-colors').addEventListener('click', async () => {
    await saveCategoryColors({});
    renderSettingsPage();
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

  app.innerHTML = `
    <div class="container">
      <div class="card card-uniform-height text-white btn-custom-green">
        <div class="card-body d-flex justify-content-center align-items-center" style="position: relative;">
          <button id="back-to-trips" class="btn text-white btn-no-style header-btn-left" aria-label="Back to trips"><i class="bi bi-house-door-fill home-icon"></i></button>
          <h4 class="header-title">${escapeHTML(trip.name)}</h4>
          <button id="settings-btn" class="btn text-white btn-no-style header-btn-right" aria-label="Settings"><i class="bi bi-gear-fill home-icon"></i></button>
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

async function colorizeCategorySelect(selectEl) {
  if (!selectEl) return;
  const map = await loadCategoryColorMap();
  Array.from(selectEl.options).forEach(opt => {
    const name = opt.value || opt.textContent;
    const color = map[name];
    if (color) {
      opt.style.backgroundColor = color;
      opt.style.color = '#fff';
    }
  });
}

function buildExpenseCard(expense, isSelected) {
  const card = document.createElement('div');
  card.className = `card mb-3 card-uniform-height expense-card ${isSelected ? 'expense-card--selected' : ''}`;
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
      const receipts = await (typeof getReceiptsByExpenseId === 'function' ? getReceiptsByExpenseId(expense.id) : []);
      if (receipts && receipts.length) {
        card.querySelector('.expense-receipt-icon')?.classList.add('has-receipt');
      }
    } catch (e) {
      console.warn('Failed to apply category color', e);
    }
  });
  
  card.addEventListener('click', async (e) => {
    if (e.detail >= 2) {
      await selectExpense(expense.id);
      const fresh = document.querySelector(`[data-expense-id="${expense.id}"]`);
      if (fresh) startEditExpense(fresh, expense);
    } else {
      selectExpense(expense.id);
    }
  });

  // Mobile long-press to edit (no extra buttons)
  attachLongPressToEdit(card, expense);

  // Receipt icon click → open action sheet (add) or preview
  const icon = card.querySelector('.expense-receipt-icon');
  if (icon) {
    icon.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      if (icon.classList.contains('has-receipt')) {
        await showReceiptModal(expense.id);
      } else {
        openReceiptActionSheet(expense.id, icon);
      }
    });
    icon.addEventListener('keydown', async (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (icon.classList.contains('has-receipt')) await showReceiptModal(expense.id);
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
        <input type="number" class="form-control" placeholder="0.00" step="0.01" aria-label="Amount" id="exp-amount-edit" value="${expense.amount}">
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
            <input type="number" class="form-control" placeholder="0.00" step="0.01" aria-label="Amount" id="exp-amount">
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
        createdAt: new Date().toISOString()
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
        await saveReceiptForExpense(expenseId, file);
        iconEl?.classList.add('has-receipt');
        // If a modal is open for this expense, refresh it
        const modalId = `receipt-modal-${expenseId}`;
        const modalEl = document.getElementById(modalId);
        if (modalEl) await renderReceiptModalContent(modalEl, expenseId);
      } catch (e) {
        console.error('Failed to save receipt', e);
        alert('Failed to save receipt');
      }
    }
    document.body.removeChild(input);
  });
  input.click();
}

function openReceiptPickerFiles(expenseId, iconEl) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf,image/*';
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (file) {
      try {
        await saveReceiptForExpense(expenseId, file);
        iconEl?.classList.add('has-receipt');
        try {
          const receipts = await getReceiptsByExpenseId(expenseId);
          const badge = iconEl?.parentElement?.querySelector('.receipt-count-badge');
          if (badge) { badge.textContent = String(receipts.length); badge.classList.remove('d-none'); }
        } catch {}
        const modalId = `receipt-modal-${expenseId}`;
        const modalEl = document.getElementById(modalId);
        if (modalEl) await renderReceiptModalContent(modalEl, expenseId);
      } catch (e) {
        console.error('Failed to save receipt', e);
        alert('Failed to save receipt');
      }
    }
    document.body.removeChild(input);
  });
  input.click();
}

function openReceiptActionSheet(expenseId, iconEl) {
  const modalId = `receipt-action-${expenseId}`;
  let modalEl = document.getElementById(modalId);
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = modalId;
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class=\"modal-dialog modal-dialog-centered\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <h5 class=\"modal-title\">Add receipt</h5>\n            <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>\n          </div>\n          <div class=\"modal-body d-grid gap-2\">\n            <button type=\"button\" class=\"btn btn-outline-primary\" id=\"scan-docs\">Scan Document (Files)</button>\n            <button type=\"button\" class=\"btn btn-outline-secondary\" id=\"camera-photos\">Camera / Photos</button>\n          </div>\n        </div>\n      </div>`;
    document.body.appendChild(modalEl);
  }
  const modal = getModalInstance(modalId);
  modal?.show();
  modalEl.querySelector('#scan-docs').onclick = () => { modal?.hide(); openReceiptPickerFiles(expenseId, iconEl); };
  modalEl.querySelector('#camera-photos').onclick = () => { modal?.hide(); openReceiptPicker(expenseId, iconEl); };
}

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
  const makeCurrentBtn = document.createElement('button');
  makeCurrentBtn.type = 'button';
  makeCurrentBtn.className = 'btn btn-custom-green';
  makeCurrentBtn.id = 'make-current';
  makeCurrentBtn.textContent = 'Make Current';
  modalEl.querySelector('.modal-footer').insertBefore(makeCurrentBtn, modalEl.querySelector('[data-bs-dismiss="modal"]'));
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
  const thumbs = modalEl.querySelector('#receipt-thumbs');
  thumbs.innerHTML = '';
  const receipts = await getReceiptsByExpenseId(expenseId);
  if (!receipts.length) {
    mainImg.style.display = 'none';
    mainPdf.style.display = 'none';
    return;
  }
  const urls = receipts.map(r => ({ id: r.id, url: URL.createObjectURL(r.blob), mime: r.mime || '', current: !!r.current }));
  const setActive = (id) => {
    thumbs.querySelectorAll('.receipt-thumb').forEach(el => el.classList.toggle('receipt-thumb--active', el.dataset.id === id));
    const u = urls.find(x => x.id === id);
    if (!u) return;
    if ((u.mime || '').startsWith('application/pdf')) {
      mainImg.style.display = 'none';
      mainPdf.style.display = 'block';
      mainPdf.src = u.url;
    } else {
      mainPdf.style.display = 'none';
      mainImg.style.display = 'block';
      mainImg.src = u.url;
    }
  };
  urls.forEach((u, idx) => {
    const t = document.createElement('div');
    t.className = 'receipt-thumb';
    t.dataset.id = u.id;
    if ((u.mime || '').startsWith('application/pdf')) {
      t.classList.add('receipt-thumb--pdf');
      t.innerHTML = `<div style=\"height:64px;display:flex;align-items:center;justify-content:center;min-width:48px;\">PDF</div>`;
    } else {
      t.innerHTML = `<img src=\"${u.url}\" alt=\"Receipt ${idx+1}\">`;
    }
    t.addEventListener('click', () => setActive(u.id));
    thumbs.appendChild(t);
  });
  const current = urls.find(u => u.current) || urls[0];
  setActive(current.id);

  // Revoke object URLs when modal hides
  modalEl.addEventListener('hidden.bs.modal', () => {
    urls.forEach(u => URL.revokeObjectURL(u.url));
  }, { once: true });
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
  expenses.forEach(exp => container.appendChild(buildExpenseCard(exp, exp.id === currentSelectedExpenseId)));

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
