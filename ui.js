// UI Rendering Logic

async function renderTrips(selectedTripId = null) {
  const trips = await getAllTrips();
  const app = document.getElementById('app');
  
  // Clear previous content
  app.innerHTML = '';

  // App Shell with Bootstrap classes
  app.innerHTML = `
    <div class="container mt-4">
      <div class="card text-center btn-custom-blue text-white">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div></div>
          <h1>Expenses Tracker</h1>
          <div></div>
        </div>
      </div>

      <main id="trip-list-container" class="mt-4">
        <h2 class="h4">Active</h2>
        <div id="active-trips-container"></div>
        <h2 class="h4 mt-4">Submitted</h2>
        <div id="submitted-trips-container"></div>
        <h2 class="h4 mt-4">Reimbursed</h2>
        <div id="reimbursed-trips-container"></div>
      </main>

      <button id="add-trip-fab" type="button" class="btn btn-custom-blue btn-lg rounded-circle position-fixed bottom-0 end-0 m-3" data-bs-toggle="modal" data-bs-target="#add-trip-modal">
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

  const activeTripsContainer = document.getElementById('active-trips-container');
  const submittedTripsContainer = document.getElementById('submitted-trips-container');
  const reimbursedTripsContainer = document.getElementById('reimbursed-trips-container');

  const activeTrips = trips.filter(trip => trip.status === 'active');
  const submittedTrips = trips.filter(trip => trip.status === 'submitted');
  const reimbursedTrips = trips.filter(trip => trip.status === 'reimbursed');

  if (trips.length === 0) {
    activeTripsContainer.innerHTML = '<p class="text-center text-muted mt-5">No trips yet. Add one to get started</p>';
  } else {
    if (activeTrips.length === 0) {
      activeTripsContainer.innerHTML = '<p class="text-center text-muted">No active trips</p>';
    } else {
      activeTrips.forEach(trip => {
        const tripElement = document.createElement('div');
        const isSelected = trip.id === selectedTripId;

        tripElement.className = `card mb-3 ${isSelected ? 'text-white btn-custom-blue' : ''}`;
        tripElement.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${trip.name}</h5>
          </div>
        `;

        tripElement.dataset.tripId = trip.id; // Add tripId to dataset

        tripElement.addEventListener('click', () => selectTrip(trip.id));
        tripElement.addEventListener('dblclick', () => renderTripDetail(trip.id));
        
        activeTripsContainer.appendChild(tripElement);
      });
    }

    if (submittedTrips.length === 0) {
      submittedTripsContainer.innerHTML = '<p class="text-center text-muted">No submitted trips</p>';
    } else {
      submittedTrips.forEach(trip => {
        const tripElement = document.createElement('div');
        const isSelected = trip.id === selectedTripId;

        tripElement.className = `card mb-3 ${isSelected ? 'text-white btn-custom-blue' : ''}`;
        tripElement.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${trip.name}</h5>
          </div>
        `;
        tripElement.dataset.tripId = trip.id; // Add tripId to dataset

        tripElement.addEventListener('click', () => selectTrip(trip.id));
        tripElement.addEventListener('dblclick', () => renderTripDetail(trip.id));
        
        submittedTripsContainer.appendChild(tripElement);
      });
    }

    if (reimbursedTrips.length === 0) {
      reimbursedTripsContainer.innerHTML = '<p class="text-center text-muted">No reimbursed trips</p>';
    } else {
      reimbursedTrips.forEach(trip => {
        const tripElement = document.createElement('div');
        const isSelected = trip.id === selectedTripId;

        tripElement.className = `card mb-3 ${isSelected ? 'text-white btn-custom-blue' : ''}`;
        tripElement.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${trip.name}</h5>
          </div>
        `;
        tripElement.dataset.tripId = trip.id; // Add tripId to dataset

        tripElement.addEventListener('click', () => selectTrip(trip.id));
        tripElement.addEventListener('dblclick', () => renderTripDetail(trip.id));
        
        reimbursedTripsContainer.appendChild(tripElement);
      });
    }
  }

  const containers = [activeTripsContainer, submittedTripsContainer, reimbursedTripsContainer];
  containers.forEach(container => {
    new Sortable(container, {
      group: 'shared',
      animation: 150,
      ghostClass: 'ghost-card',
      onEnd: async (evt) => {
        const tripId = evt.item.dataset.tripId;
        let newStatus = evt.to.id.replace('-trips-container', '');
        // The containers are active, submitted, reimbursed. So the new status should be active, submitted, or reimbursed.
        if (newStatus === 'active') {
          newStatus = 'active';
        } else if (newStatus === 'submitted') {
          newStatus = 'submitted';
        } else if (newStatus === 'reimbursed') {
          newStatus = 'reimbursed';
        }
        await updateTripStatus(tripId, newStatus);
        await renderTrips(); // Re-render to update 'No trips' messages
      }
    });
  });

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
      <div class="card bg-success text-white">
        <div class="card-header d-flex justify-content-between align-items-center">
          <button id="back-to-trips" class="btn text-white btn-no-style"><i class="bi bi-house-door-fill home-icon"></i></button>
          <h1>${trip.name}</h1>
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
                <input type="hidden" id="expense-id">
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
              <button type="submit" form="add-expense-form" class="btn btn-success" id="save-expense-btn">Save Expense</button>
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
            <h5>${expense.description}</h5>
            <p><small class="text-muted">${expense.category} - ${new Date(expense.date).toLocaleDateString()}</small></p>
          </div>
          <div class="d-flex align-items-center">
            <p class="fs-5 fw-bold mb-0 me-3">£${expense.amount.toFixed(2)}</p>
            <button class="btn btn-sm btn-outline-primary edit-expense-btn" data-expense-id="${expense.id}" data-bs-toggle="modal" data-bs-target="#add-expense-modal">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </div>
      `;
      expenseListContainer.appendChild(expenseCard);
    });

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-expense-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const expenseId = e.currentTarget.dataset.expenseId;
        const expenseToEdit = expenses.find(exp => exp.id === expenseId);
        if (expenseToEdit) {
          document.getElementById('expense-id').value = expenseToEdit.id;
          document.getElementById('expense-description').value = expenseToEdit.description;
          document.getElementById('expense-amount').value = expenseToEdit.amount;
          document.getElementById('expense-date').value = expenseToEdit.date;
          document.getElementById('expense-category').value = expenseToEdit.category;
          document.getElementById('expense-notes').value = expenseToEdit.notes;

          document.getElementById('addExpenseModalLabel').textContent = 'Edit Expense';
          document.getElementById('save-expense-btn').textContent = 'Update Expense';
        }
      });
    });
  }

  // Event Listeners for Detail View
  document.getElementById('back-to-trips').addEventListener('click', renderTrips);
  
  const form = document.getElementById('add-expense-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const expenseId = document.getElementById('expense-id').value;
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const notes = document.getElementById('expense-notes').value;
    
    const expense = {
      id: expenseId || Date.now().toString(), // Use existing ID or generate new
      tripId: tripId,
      description: description,
      amount: amount,
      date: date,
      category: category,
      notes: notes
    };

    await saveExpense(expense);
    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-expense-modal'));
    modal.hide();
    await renderTripDetail(tripId); // Re-render the detail view
    showToast(expenseId ? 'Expense updated successfully!' : 'Expense saved successfully!');
  });

  // Reset modal when hidden
  const addExpenseModal = document.getElementById('add-expense-modal');
  addExpenseModal.addEventListener('hidden.bs.modal', () => {
    form.reset();
    document.getElementById('expense-id').value = ''; // Clear hidden ID
    document.getElementById('addExpenseModalLabel').textContent = 'Add New Expense';
    document.getElementById('save-expense-btn').textContent = 'Save Expense';
  });
}

function selectTrip(tripId) {
  renderTrips(tripId);
}
