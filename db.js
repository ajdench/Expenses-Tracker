// IndexedDB abstraction using idb
let db;

async function initDB() {
  db = await idb.openDB('ExpenseTracker', 4, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('trips', { keyPath: 'id' });
        db.createObjectStore('expenses', { keyPath: 'id' });
      }
      // Use the upgrade transaction to access existing stores during upgrade
      const expensesStore = transaction.objectStore('expenses');
      if (!expensesStore.indexNames.contains('by_tripId')) {
        expensesStore.createIndex('by_tripId', 'tripId');
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      }
      if (oldVersion < 4) {
        if (!db.objectStoreNames.contains('receipts')) {
          const receipts = db.createObjectStore('receipts', { keyPath: 'id' });
          receipts.createIndex('by_expenseId', 'expenseId');
        }
      }
    }
  });
}

async function saveTrip(trip) {
  if (window.DEBUG) console.debug('[DB] saveTrip', trip);
  try {
    const result = await db.put('trips', trip);
    if (window.DEBUG) console.debug('[DB] saveTrip ok', result);
    return result;
  } catch (error) {
    console.error('[DB] saveTrip error', error);
    throw error;
  }
}

async function saveExpense(expense) {
  if (window.DEBUG) console.debug('[DB] saveExpense', expense);
  try {
    return await db.put('expenses', expense);
  } catch (e) {
    console.error('[DB] saveExpense error', e);
    throw e;
  }
}

async function getAllTrips(includeArchived = false) {
  const allTrips = await db.getAll('trips');
  if (window.DEBUG) console.debug('[DB] getAllTrips count', allTrips.length, 'includeArchived:', includeArchived);
  if (includeArchived) {
    return allTrips;
  }
  return allTrips.filter(trip => trip.status !== 'archived');
}

async function archiveTrip(tripId) {
  const trip = await getTripById(tripId);
  if (trip) {
    trip.status = 'archived';
    return db.put('trips', trip);
  }
}

async function getAllExpenses() {
  return db.getAll('expenses');
}

async function getTripById(id) {
  return db.get('trips', id);
}

async function getExpensesByTripId(tripId) {
  try {
    return await db.getAllFromIndex('expenses', 'by_tripId', tripId);
  } catch (e) {
    // Fallback for users who haven't upgraded yet
    const allExpenses = await getAllExpenses();
    return allExpenses.filter(expense => expense.tripId === tripId);
  }
}

async function getExpenseById(id) {
  return db.get('expenses', id);
}

async function updateTripStatus(tripId, newStatus) {
  if (window.DEBUG) console.debug('[DB] updateTripStatus', { tripId, newStatus });
  const trip = await getTripById(tripId);
  if (trip) {
    trip.status = newStatus;
    return db.put('trips', trip);
  }
}

// Settings helpers
async function getCategoryColors() {
  try {
    const record = await db.get('settings', 'categoryColors');
    return record?.value || {};
  } catch (e) {
    if (window.DEBUG) console.warn('[DB] getCategoryColors failed', e);
    return {};
  }
}

async function saveCategoryColors(map) {
  try {
    await db.put('settings', { key: 'categoryColors', value: map });
  } catch (e) {
    console.error('[DB] saveCategoryColors error', e);
    throw e;
  }
}

// Icon settings helpers
async function getIconSettings() {
  try {
    const record = await db.get('settings', 'icons');
    return record?.value || {};
  } catch (e) {
    if (window.DEBUG) console.warn('[DB] getIconSettings failed', e);
    return {};
  }
}

async function saveIconSettings(map) {
  try {
    await db.put('settings', { key: 'icons', value: map });
  } catch (e) {
    console.error('[DB] saveIconSettings error', e);
    throw e;
  }
}

// Scan (Shortcuts) settings helpers
async function getScanSettings() {
  try {
    const record = await db.get('settings', 'scan');
    return record?.value || {};
  } catch (e) {
    if (window.DEBUG) console.warn('[DB] getScanSettings failed', e);
    return {};
  }
}

async function saveScanSettings(map) {
  try {
    await db.put('settings', { key: 'scan', value: map });
  } catch (e) {
    console.error('[DB] saveScanSettings error', e);
    throw e;
  }
}

// Receipt helpers
async function saveReceiptForExpense(expenseId, file) {
  const id = `${expenseId}-${Date.now()}`;
  const record = {
    id,
    expenseId,
    name: file.name || 'receipt',
    mime: file.type || 'application/octet-stream',
    size: file.size || 0,
    createdAt: new Date().toISOString(),
    blob: file
  };
  return db.put('receipts', record);
}

// Image adjust settings
async function getImageAdjustSettings() {
  try {
    const record = await db.get('settings', 'imageAdjust');
    return record?.value || {};
  } catch (e) { return {}; }
}
async function saveImageAdjustSettings(map) {
  try { await db.put('settings', { key: 'imageAdjust', value: map }); } catch (e) { console.error(e); }
}

async function getReceiptsByExpenseId(expenseId) {
  try {
    return await db.getAllFromIndex('receipts', 'by_expenseId', expenseId);
  } catch (e) {
    return [];
  }
}

async function setCurrentReceipt(expenseId, receiptId) {
  const tx = db.transaction('receipts', 'readwrite');
  const store = tx.objectStore('receipts');
  const idx = store.index('by_expenseId');
  const all = await idx.getAll(expenseId);
  for (const r of all) {
    r.current = (r.id === receiptId);
    await store.put(r);
  }
  await tx.done;
}

// Danger: Delete all domain content (trips, expenses, receipts)
async function deleteAllContent() {
  try {
    const stores = ['trips', 'expenses', 'receipts'];
    const tx = db.transaction(stores, 'readwrite');
    await Promise.all(stores.map(name => tx.objectStore(name).clear()))
      .catch(e => { throw e; });
    await tx.done;
  } catch (e) {
    console.error('[DB] deleteAllContent error', e);
    throw e;
  }
}
