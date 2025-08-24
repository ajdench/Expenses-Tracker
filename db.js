// IndexedDB abstraction using idb
let db;

async function initDB() {
  db = await idb.openDB('ExpenseTracker', 1, {
    upgrade(db) {
      db.createObjectStore('trips', { keyPath: 'id' });
      db.createObjectStore('expenses', { keyPath: 'id' });
    }
  });
}

async function saveTrip(trip) {
  return db.put('trips', trip);
}

async function saveExpense(expense) {
  return db.put('expenses', expense);
}

async function getAllTrips() {
  return db.getAll('trips');
}

async function getAllExpenses() {
  return db.getAll('expenses');
}

async function getTripById(id) {
  return db.get('trips', id);
}

async function getExpensesByTripId(tripId) {
  const allExpenses = await getAllExpenses();
  return allExpenses.filter(expense => expense.tripId === tripId);
}

async function updateTripStatus(tripId, newStatus) {
  const trip = await getTripById(tripId);
  if (trip) {
    trip.status = newStatus;
    return db.put('trips', trip);
  }
}
