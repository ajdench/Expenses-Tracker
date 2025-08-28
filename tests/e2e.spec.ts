import { test, expect } from '@playwright/test';

// Helper selectors
const activeContainer = '#active-trips-container';
const addTripCard = '#add-trip-card';

// Build a unique trip/expense to avoid collisions across runs
const uniq = Date.now().toString().slice(-6);
const tripName = `Trip ${uniq}`;
const expenseDesc = `Lunch ${uniq}`;

// Navigate to baseURL from config which already includes ?nosw and version
async function gotoBase(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

test.describe('Trips shadow add card and inline editor', () => {
  test('Add a new trip via shadow card inline editor', async ({ page }) => {
    await gotoBase(page);

  // Ensure Active container and shadow card exist
  await expect(page.locator(activeContainer)).toBeVisible();
  await expect(page.locator(addTripCard)).toBeVisible();

  // Shadow state: read-only input (aria-label "Trip name") with value "Trip"
  const shadowInput = page.locator(`${addTripCard} input[aria-label="Trip name"]`);
  await expect(shadowInput).toHaveAttribute('readonly', '');
  await expect(shadowInput).toHaveValue('Trip');

  // Enter edit mode by clicking input (same as pressing Add)
  await shadowInput.click();

  // Editor appears: input enabled, Save/Cancel buttons present
  const editorInput = page.locator(`${addTripCard} input#new-trip-name`);
  await expect(editorInput).toBeEditable();
  await editorInput.fill(tripName);

    const saveBtn = page.locator(`${addTripCard} button`, { hasText: 'Save' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // After save, the lists re-render and the new trip card should appear
    const newTripCard = page.locator(`${activeContainer} .trip-card .card-title`, { hasText: tripName });
    await expect(newTripCard).toBeVisible();
  });
});

test.describe('Expenses shadow add card and inline editor', () => {
  test('Open trip detail, add expense via shadow editor', async ({ page }) => {
    await gotoBase(page);

    // Ensure the trip exists; if not, create it through the UI quickly
    const tripTitle = page.locator(`${activeContainer} .trip-card .card-title`, { hasText: tripName });
    const exists = await tripTitle.count();
    if (exists === 0) {
      // Create the trip again if needed for isolated runs
      const si = page.locator(`${addTripCard} input#new-trip-name`);
      await si.click();
      const ei = page.locator(`${addTripCard} input#new-trip-name`);
      await ei.fill(tripName);
      await page.locator(`${addTripCard} button`, { hasText: 'Save' }).click();
      await expect(page.locator(`${activeContainer} .trip-card .card-title`, { hasText: tripName })).toBeVisible();
    }

    // Open detail via double-click and wait for expense container
    const tripCard = page.locator(`${activeContainer} .trip-card:has(.card-title:has-text(\"${tripName}\"))`);
    await tripCard.dblclick();
    // Wait for trip detail header to appear
    await expect(page.locator('.header-title', { hasText: tripName })).toBeVisible();
    await expect(page.locator('#expense-list-container')).toBeVisible();

    // Shadow expense card at top
    const addExpenseCard = page.locator('#add-expense-card');
    await expect(addExpenseCard).toBeVisible();

    // Click description (disabled) to enter edit mode
    const shadowDesc = addExpenseCard.locator('input[aria-label="Description"]');
    await shadowDesc.click();

    // Fill editor fields
    await page.fill('#exp-desc', expenseDesc);
    await page.fill('#exp-amount', '12.50');

    // date already defaulted to today; category default is fine, set notes
    await page.fill('#exp-notes', 'Test note');

    await page.click('#save-expense');

    // Verify expense card appears
    const expenseCard = page.locator('.expense-description', { hasText: expenseDesc });
    await expect(expenseCard).toBeVisible();
  });
});
