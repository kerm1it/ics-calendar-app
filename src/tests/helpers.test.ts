import { test, expect } from "bun:test";
import {
  parseReminderString,
  formatReminder,
  generateId,
  formatDateForInput,
  formatTimeForInput,
  parseDateTimeInput,
  getTimezones,
  isValidEmail,
  getChineseZodiac,
  getLunarMonthName,
  getLunarDayName
} from "../utils/helpers";

test("Parse reminder strings", () => {
  expect(parseReminderString("1w")).toEqual({ value: 1, unit: "weeks" });
  expect(parseReminderString("3d")).toEqual({ value: 3, unit: "days" });
  expect(parseReminderString("2h")).toEqual({ value: 2, unit: "hours" });
  expect(parseReminderString("30m")).toEqual({ value: 30, unit: "minutes" });
  expect(parseReminderString("0")).toEqual({ value: 0, unit: "minutes" });
  expect(parseReminderString("60")).toEqual({ value: 60, unit: "minutes" });
  expect(parseReminderString("invalid")).toBeNull();

  // Test edge cases
  expect(parseReminderString("")).toBeNull();
  expect(parseReminderString("  ")).toBeNull();
  expect(parseReminderString("1x")).toBeNull(); // Invalid unit
  expect(parseReminderString("abc")).toBeNull();
  expect(parseReminderString("10")).toEqual({ value: 10, unit: "minutes" }); // Test number without unit defaults to minutes
});

test("Format reminder display", () => {
  expect(formatReminder({ value: 1, unit: "weeks" })).toBe("提前1周");
  expect(formatReminder({ value: 3, unit: "days" })).toBe("提前3天");
  expect(formatReminder({ value: 2, unit: "hours" })).toBe("提前2小时");
  expect(formatReminder({ value: 30, unit: "minutes" })).toBe("提前30分钟");
  expect(formatReminder({ value: 0, unit: "minutes" })).toBe("事件发生时");
});

test("Generate IDs with exact format and uniqueness", () => {
  // 生成多个ID验证唯一性
  const id1 = generateId();
  const id2 = generateId();
  const id3 = generateId();

  // 验证ID唯一性
  expect(id1).not.toBe(id2);
  expect(id2).not.toBe(id3);
  expect(id1).not.toBe(id3);

  // 验证ID格式精确性
  expect(id1).toMatch(/^\d{13}-[a-z0-9]{9}$/);
  expect(id2).toMatch(/^\d{13}-[a-z0-9]{9}$/);
  expect(id3).toMatch(/^\d{13}-[a-z0-9]{9}$/);

  // 验证时间戳部分在合理范围内（2025年左右）
  const timestamp1 = parseInt(id1.split('-')[0]);
  expect(timestamp1).toBeGreaterThan(1700000000000); // 大于2023年
  expect(timestamp1).toBeLessThan(1800000000000);    // 小于2027年

  // 验证随机部分不同
  const random1 = id1.split('-')[1];
  const random2 = id2.split('-')[1];
  expect(random1).not.toBe(random2);
  expect(random1).toMatch(/^[a-z0-9]{9}$/);
  expect(random2).toMatch(/^[a-z0-9]{9}$/);
});

test("Format date for input", () => {
  const date = new Date(2024, 2, 15); // March 15, 2024
  expect(formatDateForInput(date)).toBe("2024-03-15");

  const date2 = new Date(2023, 11, 1); // December 1, 2023
  expect(formatDateForInput(date2)).toBe("2023-12-01");
});

test("Format time for input", () => {
  const date = new Date(2024, 0, 1, 14, 30); // 14:30
  expect(formatTimeForInput(date)).toBe("14:30");

  const date2 = new Date(2024, 0, 1, 9, 5); // 09:05
  expect(formatTimeForInput(date2)).toBe("09:05");
});

test("Parse date time input", () => {
  // Date only
  const result1 = parseDateTimeInput("2024-03-15");
  expect(result1).toBeInstanceOf(Date);
  expect(result1?.getFullYear()).toBe(2024);
  expect(result1?.getMonth()).toBe(2); // March is month 2
  expect(result1?.getDate()).toBe(15);
  expect(result1?.getHours()).toBe(0);

  // Date with time
  const result2 = parseDateTimeInput("2024-03-15", "14:30");
  expect(result2?.getHours()).toBe(14);
  expect(result2?.getMinutes()).toBe(30);

  // Invalid date
  expect(parseDateTimeInput("")).toBeNull();
  expect(parseDateTimeInput("invalid-date")).toBeNull();

  // Invalid time (should still work with valid date)
  const result3 = parseDateTimeInput("2024-03-15", "invalid-time");
  expect(result3?.getHours()).toBe(0); // Should default to 00:00
});

test("Get timezones", () => {
  const timezones = getTimezones();
  expect(timezones).toHaveLength(7);
  expect(timezones[0]).toEqual({ value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' });
  expect(timezones[1]).toEqual({ value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' });
});

test("Validate email", () => {
  expect(isValidEmail("test@example.com")).toBe(true);
  expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
  expect(isValidEmail("invalid-email")).toBe(false);
  expect(isValidEmail("@domain.com")).toBe(false);
  expect(isValidEmail("user@")).toBe(false);
  expect(isValidEmail("")).toBe(false);
});

test("Get Chinese zodiac", () => {
  expect(getChineseZodiac(2024)).toBe("龙");
  expect(getChineseZodiac(2023)).toBe("兔");
  expect(getChineseZodiac(2022)).toBe("虎");
  expect(getChineseZodiac(1990)).toBe("马");
});

test("Get lunar month name", () => {
  expect(getLunarMonthName(1)).toBe("正");
  expect(getLunarMonthName(8)).toBe("八");
  expect(getLunarMonthName(12)).toBe("腊");
  expect(getLunarMonthName(13)).toBe(""); // Invalid month
  expect(getLunarMonthName(0)).toBe(""); // Invalid month
});

test("Get lunar day name", () => {
  expect(getLunarDayName(1)).toBe("初一");
  expect(getLunarDayName(10)).toBe("初十");
  expect(getLunarDayName(15)).toBe("十五");
  expect(getLunarDayName(25)).toBe("廿五");
  expect(getLunarDayName(30)).toBe("三十");
});

test.skip("Download file function (DOM-dependent, skipped in test environment)", () => {
  // This function depends on DOM APIs (document, URL) which are not available in the test environment
  // In a real browser environment, this function would create a download link and trigger a download
  // The function is covered by manual testing and E2E tests instead
});
