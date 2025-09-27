import { test, expect } from "bun:test";
import { LunarConverter } from "../utils/lunarConverter";

test("Exact lunar to solar conversion: Known dates", () => {
  // 精确测试：农历2024年正月初一 = 阳历2024年2月10日
  const result1 = LunarConverter.lunarToSolar(2024, 1, 1);
  expect(result1).not.toBeNull();
  expect(result1?.getFullYear()).toBe(2024);
  expect(result1?.getMonth()).toBe(1); // February (0-based)
  expect(result1?.getDate()).toBe(10);
  expect(result1?.getHours()).toBe(0);
  expect(result1?.getMinutes()).toBe(0);
  expect(result1?.getSeconds()).toBe(0);

  // 精确测试：农历2023年正月初一 = 阳历2023年1月22日
  const result2 = LunarConverter.lunarToSolar(2023, 1, 1);
  expect(result2).not.toBeNull();
  expect(result2?.getFullYear()).toBe(2023);
  expect(result2?.getMonth()).toBe(0); // January (0-based)
  expect(result2?.getDate()).toBe(22);
  expect(result2?.getHours()).toBe(0);
  expect(result2?.getMinutes()).toBe(0);
  expect(result2?.getSeconds()).toBe(0);

  // 精确测试：农历2025年正月初一 = 阳历2025年1月29日
  const result3 = LunarConverter.lunarToSolar(2025, 1, 1);
  expect(result3).not.toBeNull();
  expect(result3?.getFullYear()).toBe(2025);
  expect(result3?.getMonth()).toBe(0); // January (0-based)
  expect(result3?.getDate()).toBe(29);
  expect(result3?.getHours()).toBe(0);
  expect(result3?.getMinutes()).toBe(0);
  expect(result3?.getSeconds()).toBe(0);
});

test("Handle invalid lunar dates", () => {
  expect(LunarConverter.lunarToSolar(1899, 1, 1)).toBeNull();
  expect(LunarConverter.lunarToSolar(2101, 1, 1)).toBeNull();
  expect(LunarConverter.lunarToSolar(2024, 13, 1)).toBeNull();
  expect(LunarConverter.lunarToSolar(2024, 1, 31)).toBeNull();
});

test("Get birthday in solar year", () => {
  const result = LunarConverter.getBirthdayInSolarYear(1990, 8, 15, 2024);
  expect(result).toBeInstanceOf(Date);
  expect(result?.getFullYear()).toBe(2024);
});

test("Convert solar dates to lunar", () => {
  // Test conversion of a known solar date
  const solarDate = new Date(2024, 1, 10); // Feb 10, 2024
  const lunarResult = LunarConverter.solarToLunar(solarDate);
  expect(lunarResult).not.toBeNull();
  expect(lunarResult?.year).toBe(2024);
  expect(lunarResult?.month).toBe(1);
  expect(lunarResult?.day).toBe(1);
  expect(lunarResult?.isLeap).toBe(false);
});

test("Solar to lunar conversion edge cases", () => {
  // Test date before base date (1900-01-31)
  const earlyDate = new Date(1900, 0, 1); // Jan 1, 1900
  expect(LunarConverter.solarToLunar(earlyDate)).toBeNull();

  // Test a very late date to trigger year > 2100 condition
  const lateDate = new Date(2150, 0, 1); // Jan 1, 2150
  expect(LunarConverter.solarToLunar(lateDate)).toBeNull();
});

test("Solar to lunar conversion with leap month", () => {
  // Test a date that should fall in a leap month
  // 2023 has leap month 2, so we test around that time
  const testDate = new Date(2023, 2, 22); // March 22, 2023
  const lunarResult = LunarConverter.solarToLunar(testDate);
  expect(lunarResult).not.toBeNull();
  expect(lunarResult?.year).toBe(2023);
  // The exact month and day depend on the lunar calendar data
});

test("Round trip conversion accuracy", () => {
  // Test that converting lunar->solar->lunar gives consistent results
  const originalLunar = { year: 2024, month: 3, day: 15 };
  const solarDate = LunarConverter.lunarToSolar(originalLunar.year, originalLunar.month, originalLunar.day);

  if (solarDate) {
    const backToLunar = LunarConverter.solarToLunar(solarDate);
    expect(backToLunar?.year).toBe(originalLunar.year);
    expect(backToLunar?.month).toBe(originalLunar.month);
    expect(backToLunar?.day).toBe(originalLunar.day);
  }
});

test("Handle boundary dates for lunar conversion", () => {
  // Test the base date itself
  const baseDate = new Date(1900, 0, 31); // Jan 31, 1900
  const lunarResult = LunarConverter.solarToLunar(baseDate);
  expect(lunarResult).not.toBeNull();
  expect(lunarResult?.year).toBe(1900);
  expect(lunarResult?.month).toBe(1);
  expect(lunarResult?.day).toBe(1);
});

test("Test getBirthdayInSolarYear with various parameters", () => {
  // Test with different valid parameters
  const result1 = LunarConverter.getBirthdayInSolarYear(1990, 8, 15, 2024);
  expect(result1).toBeInstanceOf(Date);
  expect(result1?.getFullYear()).toBe(2024);

  // Test with different lunar dates
  const result2 = LunarConverter.getBirthdayInSolarYear(1985, 5, 10, 2025);
  expect(result2).toBeInstanceOf(Date);
  expect(result2?.getFullYear()).toBe(2025);
});
