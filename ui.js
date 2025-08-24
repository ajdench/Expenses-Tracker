// UI Rendering Logic

async function renderTrips(selectedTripId = null) {
  const trips = await getAllTrips();
  const app = document.getElementById('app');
  
  // Clear previous content
  app.innerHTML = '';

  // App Shell with Bootstrap classes
  app.innerHTML = `
    <div class="container mt-4">
      <div class="card text-center bg-primary text-white">
        <div class="card-header">
          <h1>Trip Expense Tracker</h1>
        </div>
      </div>

      <main id="trip-list-container" class="mt-4">
        <!-- Trips will be rendered here -->
      </main>

      <button id="add-trip-fab" type="button" class="btn btn-primary btn-lg rounded-circle position-fixed bottom-0 end-0 m-3" data-bs-toggle="modal" data-bs-target="#add-trip-modal">
        +
      </button>

      <!-- Add Trip Modal -->
      <div class="modal fade" id="add-trip-modal" tabindex="-1" aria-labelledby="addTripModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addTripModalLabel">Add New Trip</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="add-trip-form">
                <div class="mb-3">
                  <label for="trip-name" class="form-label">Trip Name</label>
                  <input type="text" class="form-control" id="trip-name" required>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" form="add-trip-form" class="btn btn-primary">Save Trip</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const tripListContainer = document.getElementById('trip-list-container');
  if (trips.length === 0) {
    tripListContainer.innerHTML = '<p class="text-center text-muted mt-5">No trips yet. Add one to get started!</p>';
  } else {
    trips.forEach(trip => {
      const tripElement = document.createElement('div');
      const isSelected = trip.id === selectedTripId;

      tripElement.className = `card mb-3 ${isSelected ? 'text-white bg-primary' : ''}`;
      tripElement.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${trip.name}</h5>
          <p class="card-text"><small class="${isSelected ? 'text-white-50' : 'text-muted'}">Status: ${trip.status}</small></p>
          ${isSelected ? '<button class="btn btn-light view-expenses-btn">View Expenses</button>' : ''}
        </div>
      `;

      if (isSelected) {
        tripElement.querySelector('.view-expenses-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          renderTripDetail(trip.id);
        });
      } else {
        tripElement.addEventListener('click', () => selectTrip(trip.id));
      }
      
      tripListContainer.appendChild(tripElement);
    });
  }

  // Event Listeners for Trip List page
  const form = document.getElementById('add-trip-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tripName = document.getElementById('trip-name').value;
    const newTrip = {
      id: Date.now().toString(),
      name: tripName,
      status: 'active'
    };
    await saveTrip(newTrip);
    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-trip-modal'));
    modal.hide();
    await renderTrips(); // Re-render the list
    showToast('Trip saved successfully!');
  });

  document.addEventListener('click', (e) => {
    const tripListContainer = document.getElementById('trip-list-container');
    if (tripListContainer && !tripListContainer.contains(e.target)) {
      renderTrips();
    }
  });
}

async function renderTripDetail(tripId) {
  const trip = await getTripById(tripId);
  const expenses = await getExpensesByTripId(tripId);
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="container mt-4">
      <div class="card bg-primary text-white">
        <div class="card-header d-flex justify-content-between align-items-center">
          <button id="back-to-trips" class="btn btn-light">🏠</button>
          <h1 class="mb-0">${trip.name}</h1>
          <div></div>
        </div>
      </div>

      <main id="expense-list-container" class="mt-4">
        <!-- Expenses will be rendered here -->
      </main>

      <button id="add-expense-fab" type="button" class="btn btn-success btn-lg rounded-circle position-fixed bottom-0 end-0 m-3" data-bs-toggle="modal" data-bs-target="#add-expense-modal">
        +
      </button>

      <!-- Add Expense Modal -->
      <div class="modal fade" id="add-expense-modal" tabindex="-1" aria-labelledby="addExpenseModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addExpenseModalLabel">Add New Expense</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="add-expense-form">
                <div class="mb-3">
                  <label for="expense-description" class="form-label">Description</label>
                  <input type="text" class="form-control" id="expense-description" required>
                </div>
                <div class="mb-3">
                  <label for="expense-amount" class="form-label">Amount (£)</label>
                  <input type="number" class="form-control" id="expense-amount" required step="0.01">
                </div>
                <div class="mb-3">
                  <label for="expense-date" class="form-label">Date</label>
                  <input type="date" class="form-control" id="expense-date" required>
                </div>
                <div class="mb-3">
                  <label for="expense-category" class="form-label">Category</label>
                  <select class="form-select" id="expense-category">
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Accommodation</option>
                    <option>Activities</option>
                    <option>Other</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="expense-notes" class="form-label">Notes</label>
                  <textarea class="form-control" id="expense-notes" rows="3"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" form="add-expense-form" class="btn btn-success">Save Expense</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const expenseListContainer = document.getElementById('expense-list-container');
  if (expenses.length === 0) {
    expenseListContainer.innerHTML = '<p class="text-center text-muted mt-5">No expenses recorded for this trip yet.</p>';
  } else {
    expenses.forEach(expense => {
      const expenseCard = document.createElement('div');
      expenseCard.className = 'card mb-3';
      expenseCard.innerHTML = `
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="card-title">${expense.description}</h5>
            <p class="card-text"><small class="text-muted">${expense.category} - ${new Date(expense.date).toLocaleDateString()}</small></p>
          </div>
          <p class="card-text fs-5 fw-bold">£${expense.amount.toFixed(2)}</p>
        </div>
      `;
      expenseListContainer.appendChild(expenseCard);
    });
  }

  // Event Listeners for Detail View
  document.getElementById('back-to-trips').addEventListener('click', renderTrips);
  
  const form = document.getElementById('add-expense-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const notes = document.getElementById('expense-notes').value;
    
    const newExpense = {
      id: Date.now().toString(),
      tripId: tripId,
      description: description,
      amount: amount,
      date: date,
      category: category,
      notes: notes
    };

    await saveExpense(newExpense);
    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-expense-modal'));
    modal.hide();
    await renderTripDetail(tripId); // Re-render the detail view
    showToast('Expense saved successfully!');
  });
}

function selectTrip(tripId) {
  renderTrips(tripId);
}
