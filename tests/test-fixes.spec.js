const { test, expect } = require('@playwright/test');

test.describe('Expense Tracker UX Fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('1. Header shows correct blue coloration', async ({ page }) => {
    const header = page.locator('.card.card-uniform-height').first();
    await expect(header).toHaveClass(/btn-custom-blue/);
    await expect(header).not.toHaveAttribute('style', /background-color.*yellow/);
  });

  test('2. Trip sections render in correct order', async ({ page }) => {
    const sections = page.locator('#trip-list-container section h5');
    await expect(sections.nth(0)).toHaveText('New');
    await expect(sections.nth(1)).toHaveText('Active');
    await expect(sections.nth(2)).toHaveText('Submitted');
    await expect(sections.nth(3)).toHaveText('Reimbursed');
  });

  test('3. Placeholder text shows with italics', async ({ page }) => {
    // Check placeholder texts with italics (no trips created yet)
    const activePlaceholder = page.locator('#active-trips-container p');
    await expect(activePlaceholder).toContainText('No Active Trips');
    await expect(activePlaceholder.locator('em')).toHaveText('Active');
    
    const submittedPlaceholder = page.locator('#submitted-trips-container p');
    await expect(submittedPlaceholder).toContainText('No Submitted Trips');
    await expect(submittedPlaceholder.locator('em')).toHaveText('Submitted');
  });

  test('4. Trip card single-click selection works', async ({ page }) => {
    // First add a trip
    await page.click('.add-trip-card input[readonly]');
    await page.fill('#new-trip-name', 'Test Trip');
    await page.click('#save-new-trip');
    
    const tripCard = page.locator('.trip-card').first();
    await expect(tripCard).not.toHaveClass(/btn-custom-blue/);
    
    await tripCard.click();
    await expect(tripCard).toHaveClass(/btn-custom-blue/);
  });

  test('5. Trip card double-click opens expenses', async ({ page }) => {
    // First add a trip
    await page.click('.add-trip-card input[readonly]');
    await page.fill('#new-trip-name', 'Test Trip');
    await page.click('#save-new-trip');
    
    const tripCard = page.locator('.trip-card').first();
    
    // First click selects the trip
    await tripCard.click();
    await expect(tripCard).toHaveClass(/btn-custom-blue/);
    
    // Double-click on selected card opens expenses
    await tripCard.dblclick();
    
    // Should navigate to expense view
    await expect(page.locator('#expense-list-container')).toBeVisible();
    await expect(page.locator('h4.header-title')).toHaveText('Test Trip');
  });

  test('6. Expense shadow card shows green background in edit mode', async ({ page }) => {
    // Navigate to expenses first
    await page.click('.add-trip-card input[readonly]');
    await page.fill('#new-trip-name', 'Test Trip');
    await page.click('#save-new-trip');
    
    const tripCard = page.locator('.trip-card').first();
    // First click selects the trip
    await tripCard.click();
    // Double-click on selected card opens expenses
    await tripCard.dblclick();
    
    // Wait for expense view
    await expect(page.locator('#expense-list-container')).toBeVisible();
    
    const shadowCard = page.locator('#add-expense-card');
    await expect(shadowCard).not.toHaveAttribute('style', /background-color.*248.*255.*248/);
    
    // Click to enter edit mode
    await shadowCard.locator('input[readonly]').first().click();
    await expect(shadowCard).toHaveAttribute('style', /background-color.*248.*255.*248/);
  });

  test('7. Field border thickness matches between shadow and edit modes', async ({ page }) => {
    // Navigate to expenses
    await page.click('.add-trip-card input[readonly]');
    await page.fill('#new-trip-name', 'Test Trip');
    await page.click('#save-new-trip');
    
    const tripCard = page.locator('.trip-card').first();
    // First click selects the trip
    await tripCard.click();
    // Double-click on selected card opens expenses
    await tripCard.dblclick();
    
    await expect(page.locator('#expense-list-container')).toBeVisible();
    
    const shadowCard = page.locator('#add-expense-card');
    await shadowCard.locator('input[readonly]').first().click();
    
    // Check that form controls have 2px border
    const formControls = shadowCard.locator('.form-control');
    const firstControl = formControls.first();
    
    const borderWidth = await firstControl.evaluate(el => 
      getComputedStyle(el).borderWidth
    );
    expect(borderWidth).toBe('2px');
  });

  test('8. Expense card edit mode preserves selection during field focus', async ({ page }) => {
    // Setup: Add trip and expense
    await page.click('.add-trip-card input[readonly]');
    await page.fill('#new-trip-name', 'Test Trip');
    await page.click('#save-new-trip');
    
    const tripCard = page.locator('.trip-card').first();
    // First click selects the trip
    await tripCard.click();
    // Double-click on selected card opens expenses
    await tripCard.dblclick();
    
    await expect(page.locator('#expense-list-container')).toBeVisible();
    
    // Add an expense first
    const shadowCard = page.locator('#add-expense-card');
    await shadowCard.locator('input[readonly]').first().click();
    await shadowCard.locator('#exp-desc').fill('Test Expense');
    await shadowCard.locator('#exp-amount').fill('10.00');
    await shadowCard.locator('#save-expense').click();
    
    // Now test editing the expense
    const expenseCard = page.locator('.expense-card').first();
    await expenseCard.click(); // Select
    await expect(expenseCard).toHaveClass(/expense-card--selected/);
    
    await expenseCard.dblclick(); // Enter edit mode
    
    // Focus on a form field
    await expenseCard.locator('#exp-desc-edit').click();
    
    // Card should still be selected
    await expect(expenseCard).toHaveClass(/expense-card--selected/);
  });

  test('9. Outside click deselection works but respects edit mode', async ({ page }) => {
    // Setup similar to previous test
    await page.click('.add-trip-card input[readonly]');
    await page.fill('#new-trip-name', 'Test Trip');
    await page.click('#save-new-trip');
    
    const tripCard = page.locator('.trip-card').first();
    // First click selects the trip
    await tripCard.click();
    // Double-click on selected card opens expenses
    await tripCard.dblclick();
    
    // Add expense
    const shadowCard = page.locator('#add-expense-card');
    await shadowCard.locator('input[readonly]').first().click();
    await shadowCard.locator('#exp-desc').fill('Test Expense');
    await shadowCard.locator('#exp-amount').fill('10.00');
    await shadowCard.locator('#save-expense').click();
    
    const expenseCard = page.locator('.expense-card').first();
    await expenseCard.click();
    await expect(expenseCard).toHaveClass(/expense-card--selected/);
    
    // Outside click should deselect
    await page.click('body', { position: { x: 50, y: 50 } });
    await expect(expenseCard).not.toHaveClass(/expense-card--selected/);
    
    // But not when in edit mode
    await expenseCard.click();
    await expenseCard.dblclick();
    await expect(expenseCard).toHaveClass(/expense-card--selected/);
    
    // Outside click shouldn't deselect in edit mode
    await page.click('body', { position: { x: 50, y: 50 } });
    await expect(expenseCard).toHaveClass(/expense-card--selected/);
  });

  test('10. Auto-scroll works when entering expense edit mode', async ({ page }) => {
    // Setup with multiple expenses to ensure scrolling is needed
    await page.click('.add-trip-card input[readonly]');
    await page.fill('#new-trip-name', 'Test Trip');
    await page.click('#save-new-trip');
    
    const tripCard = page.locator('.trip-card').first();
    // First click selects the trip
    await tripCard.click();
    // Double-click on selected card opens expenses
    await tripCard.dblclick();
    
    // Add several expenses
    for (let i = 0; i < 5; i++) {
      const shadowCard = page.locator('#add-expense-card');
      await shadowCard.locator('input[readonly]').first().click();
      await shadowCard.locator('#exp-desc').fill(`Test Expense ${i + 1}`);
      await shadowCard.locator('#exp-amount').fill('10.00');
      await shadowCard.locator('#save-expense').click();
    }
    
    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Select the last expense (should be out of view)
    const lastExpense = page.locator('.expense-card').last();
    await lastExpense.dblclick();
    
    // Should scroll into view (we can't easily test the exact scroll position,
    // but we can check if the element is visible)
    await expect(lastExpense).toBeInViewport();
  });
});