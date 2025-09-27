import { test, expect } from '@playwright/test';

test.describe('Regular Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Switch to the event tab by finding the button with specific class or attributes
    const eventTab = page.locator('button').nth(1); // Second tab button (events tab)
    await eventTab.click();
    await expect(eventTab).toHaveClass(/active/);
  });

  test('should show event form fields', async ({ page }) => {
    // Test that all form fields are visible
    await expect(page.locator('#summary')).toBeVisible();
    await expect(page.locator('#location')).toBeVisible();
    await expect(page.locator('#startDate')).toBeVisible();
    await expect(page.locator('#startTime')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible(); // all-day checkbox
    await expect(page.locator('button[type="submit"]').last()).toBeVisible(); // submit button
  });

  test('should fill event form fields', async ({ page }) => {
    // Test filling form fields
    await page.fill('#summary', 'Test Event');
    await page.fill('#location', 'Test Location');
    await page.fill('#startDate', '2024-12-25');
    await page.fill('#startTime', '14:00');

    // Verify values were set
    await expect(page.locator('#summary')).toHaveValue('Test Event');
    await expect(page.locator('#location')).toHaveValue('Test Location');
    await expect(page.locator('#startDate')).toHaveValue('2024-12-25');
    await expect(page.locator('#startTime')).toHaveValue('14:00');
  });

  test('should add regular event and show in event list', async ({ page }) => {
    // Verify generate button is not visible initially
    const generateButton = page.locator('.generate-btn');
    await expect(generateButton).not.toBeVisible();

    // Fill and submit event form
    await page.fill('#summary', 'Team Meeting');
    await page.fill('#location', 'Conference Room');
    await page.fill('#startDate', '2024-12-25');
    await page.fill('#startTime', '14:00');
    await page.click('button[type="submit"]');

    // Verify the event appears in the list
    await expect(page.locator('.event-item h4')).toContainText('Team Meeting');

    // Verify generate button appears
    await expect(generateButton).toBeVisible();
  });

  test('should add all-day event', async ({ page }) => {
    // Check all-day checkbox (first checkbox is all-day)
    await page.check('input[type="checkbox"]');

    // Fill and submit all-day event form
    await page.fill('#summary', 'Holiday');
    await page.fill('#startDate', '2024-12-25');
    await page.click('button[type="submit"]');

    // Verify the event appears in the list
    await expect(page.locator('.event-item h4')).toContainText('Holiday');
  });

  test('should delete event', async ({ page }) => {
    // First add an event
    await page.fill('#summary', 'Test Event to Delete');
    await page.fill('#startDate', '2024-12-25');
    await page.click('button[type="submit"]');

    // Verify event was added
    await expect(page.locator('.event-item h4')).toContainText('Test Event to Delete');

    // Click delete button
    await page.click('.delete-btn');

    // Verify event was deleted
    await expect(page.locator('.event-item')).toHaveCount(0);

    // Verify generate button is no longer visible
    const generateButton = page.locator('.generate-btn');
    await expect(generateButton).not.toBeVisible();
  });
});