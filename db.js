// IndexedDB abstraction using idb
let db;

async function initDB() {
  db = await idb.openDB('ExpenseTracker', 3, {
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
