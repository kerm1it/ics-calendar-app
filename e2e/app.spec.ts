import { test, expect } from '@playwright/test';

test.describe('ICS Calendar App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示页面标题和logo', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/ICS 日历生成器/);

    // 检查应用标题和logo
    const heading = page.locator('h1');
    await expect(heading).toContainText('ICS 日历生成器');

    // 检查logo图片存在
    const logo = page.locator('h1 img');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('alt', 'ICS Calendar');
  });

  test('应该显示默认的日历设置', async ({ page }) => {
    // 检查日历名称输入框
    const calendarNameInput = page.locator('#calendarName');
    await expect(calendarNameInput).toBeVisible();
    await expect(calendarNameInput).toHaveValue('家人生日');

    // 检查时区选择器
    const timezoneSelect = page.locator('#timezone');
    await expect(timezoneSelect).toBeVisible();
    await expect(timezoneSelect).toHaveValue('Asia/Shanghai');
  });

  test('应该默认显示生日标签页', async ({ page }) => {
    // 检查生日标签页是激活状态
    const birthdayTab = page.locator('button:has-text("🎂 添加生日")');
    await expect(birthdayTab).toHaveClass(/active/);

    // 检查生日表单是可见的
    const birthdayForm = page.locator('form').filter({ hasText: '姓名' });
    await expect(birthdayForm).toBeVisible();
  });

  test('应该能切换到事件标签页', async ({ page }) => {
    // 点击事件标签页
    const eventTab = page.locator('button:has-text("📌 添加事件")');
    await eventTab.click();

    // 检查事件标签页是激活状态
    await expect(eventTab).toHaveClass(/active/);

    // 检查事件表单是可见的
    const eventForm = page.locator('form').filter({ hasText: '事件名称' });
    await expect(eventForm).toBeVisible();
  });

  test('应该显示年份范围设置', async ({ page }) => {
    // 检查年份范围说明
    await expect(page.locator('h3:has-text("生日重复年份设置")')).toBeVisible();

    // 检查往前生成年份输入
    const pastYearsInput = page.locator('input[type="number"]').first();
    await expect(pastYearsInput).toBeVisible();
    await expect(pastYearsInput).toHaveValue('0');

    // 检查往后生成年份输入
    const futureYearsInput = page.locator('input[type="number"]').last();
    await expect(futureYearsInput).toBeVisible();
    await expect(futureYearsInput).toHaveValue('5');
  });

  test('应该在没有事件时不显示生成按钮', async ({ page }) => {
    // 生成按钮应该不存在（因为没有事件）
    const generateButton = page.locator('button:has-text("生成并下载 ICS 文件")');
    await expect(generateButton).not.toBeVisible();
  });

  test('应该能修改日历名称', async ({ page }) => {
    const calendarNameInput = page.locator('#calendarName');

    // 清空并输入新名称
    await calendarNameInput.clear();
    await calendarNameInput.fill('测试日历');

    // 验证值已更新
    await expect(calendarNameInput).toHaveValue('测试日历');
  });

  test('应该能修改时区设置', async ({ page }) => {
    const timezoneSelect = page.locator('#timezone');

    // 选择不同的时区
    await timezoneSelect.selectOption('Asia/Tokyo');

    // 验证值已更新
    await expect(timezoneSelect).toHaveValue('Asia/Tokyo');
  });

  test('应该能修改年份范围', async ({ page }) => {
    const pastYearsInput = page.locator('input[type="number"]').first();
    const futureYearsInput = page.locator('input[type="number"]').last();

    // 修改往前生成年份
    await pastYearsInput.clear();
    await pastYearsInput.fill('1');
    await expect(pastYearsInput).toHaveValue('1');

    // 修改往后生成年份
    await futureYearsInput.clear();
    await futureYearsInput.fill('10');
    await expect(futureYearsInput).toHaveValue('10');

    // 检查年份范围示例是否更新
    const currentYear = new Date().getFullYear();
    const yearRangeExample = page.locator('.year-range-example');
    await expect(yearRangeExample).toContainText(`${currentYear - 1} 年 - ${currentYear + 10} 年`);
  });
});