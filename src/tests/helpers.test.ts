import { test, expect } from "bun:test";
import { parseReminderString, formatReminder, generateId } from "../utils/helpers";

test("Parse reminder strings", () => {
  expect(parseReminderString("1w")).toEqual({ value: 1, unit: "weeks" });
  expect(parseReminderString("3d")).toEqual({ value: 3, unit: "days" });
  expect(parseReminderString("2h")).toEqual({ value: 2, unit: "hours" });
  expect(parseReminderString("30m")).toEqual({ value: 30, unit: "minutes" });
  expect(parseReminderString("0")).toEqual({ value: 0, unit: "minutes" });
  expect(parseReminderString("60")).toEqual({ value: 60, unit: "minutes" });
  expect(parseReminderString("invalid")).toBeNull();
});

test("Format reminder display", () => {
  expect(formatReminder({ value: 1, unit: "weeks" })).toBe("提前1周");
  expect(formatReminder({ value: 3, unit: "days" })).toBe("提前3天");
  expect(formatReminder({ value: 0, unit: "minutes" })).toBe("事件发生时");
});

test("Generate unique IDs", () => {
  const id1 = generateId();
  const id2 = generateId();
  expect(id1).not.toBe(id2);
  expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
});
