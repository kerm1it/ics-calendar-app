import { test, expect } from "bun:test";
import { LunarConverter } from "../utils/lunarConverter";

test("Convert known lunar dates to solar", () => {
  const testCases = [
    { lunar: { year: 2024, month: 1, day: 1 }, expected: new Date(2024, 1, 10) },
    { lunar: { year: 2023, month: 1, day: 1 }, expected: new Date(2023, 0, 22) },
  ];

  testCases.forEach(({ lunar, expected }) => {
    const result = LunarConverter.lunarToSolar(lunar.year, lunar.month, lunar.day);
    expect(result?.toDateString()).toBe(expected.toDateString());
  });
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
