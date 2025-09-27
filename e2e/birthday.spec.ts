import { test, expect } from '@playwright/test';

test.describe('Birthday Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Ensure we're on the birthday tab
    const birthdayTab = page.locator('button:has-text("🎂 添加生日")');
    await expect(birthdayTab).toHaveClass(/active/);
  });

  test('should show birthday form fields', async ({ page }) => {
    // Test that all form fields are visible
    await expect(page.locator('#personName')).toBeVisible();
    await expect(page.locator('button:has-text("☀️ 阳历")')).toBeVisible();
    await expect(page.locator('button:has-text("🌙 农历")')).toBeVisible();
    await expect(page.locator('#birthDate')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("添加生日")')).toBeVisible();
  });

  test('should fill birthday form fields', async ({ page }) => {
    // Test filling form fields
    await page.fill('#personName', 'Test Name');
    await page.fill('#birthDate', '1990-01-01');

    // Verify values were set
    await expect(page.locator('#personName')).toHaveValue('Test Name');
    await expect(page.locator('#birthDate')).toHaveValue('1990-01-01');
  });

  test('should add solar birthday and show in event list', async ({ page }) => {
    // Verify generate button is not visible initially
    const generateButton = page.locator('button:has-text("⬇️ 生成并下载 ICS 文件")');
    await expect(generateButton).not.toBeVisible();

    // Fill and submit birthday form
    await page.fill('#personName', 'John Doe');
    await page.click('button:has-text("☀️ 阳历")');
    await page.fill('#birthDate', '1990-03-15');
    await page.click('button[type="submit"]:has-text("添加生日")');

    // Verify the event appears in the list
    await expect(page.locator('.event-item h4')).toContainText('John Doe生日');

    // Verify generate button appears
    await expect(generateButton).toBeVisible();
  });

  test('should add lunar birthday', async ({ page }) => {
    // Fill and submit lunar birthday form
    await page.fill('#personName', 'Jane Smith');
    await page.click('button:has-text("🌙 农历")');
    await page.fill('#birthDate', '1990-08-15');
    await page.click('button[type="submit"]:has-text("添加生日")');

    // Verify the lunar birthday appears in the list
    await expect(page.locator('.event-item h4')).toContainText('Jane Smith生日');
  });

  test('should delete birthday event', async ({ page }) => {
    // First add a birthday
    await page.fill('#personName', 'Bob Wilson');
    await page.fill('#birthDate', '1990-12-25');
    await page.click('button[type="submit"]:has-text("添加生日")');

    // Verify birthday was added
    await expect(page.locator('.event-item h4')).toContainText('Bob Wilson生日');

    // Click delete button
    await page.click('.event-item button:has-text("删除")');

    // Verify birthday was deleted
    await expect(page.locator('.event-item')).toHaveCount(0);

    // Verify generate button is no longer visible
    const generateButton = page.locator('button:has-text("⬇️ 生成并下载 ICS 文件")');
    await expect(generateButton).not.toBeVisible();
  });
});