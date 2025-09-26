import { test, expect } from "bun:test";
import { ICSGenerator } from "../utils/icsGenerator";
import { Calendar } from "../types";
import { generateId } from "../utils/helpers";

test("Generate ICS content", () => {
  const calendar: Calendar = {
    id: generateId(),
    name: "Test Calendar",
    description: "Test Description",
    timezone: "Asia/Shanghai",
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  expect(content).toContain("BEGIN:VCALENDAR");
  expect(content).toContain("END:VCALENDAR");
  expect(content).toContain("X-WR-CALNAME:Test Calendar");
  expect(content).toContain("X-WR-CALDESC:Test Description");
  expect(content).toContain("X-WR-TIMEZONE:Asia/Shanghai");
});

test("ICS content includes timezone definition", () => {
  const calendar: Calendar = {
    id: generateId(),
    name: "Test",
    timezone: "Asia/Shanghai",
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  expect(content).toContain("BEGIN:VTIMEZONE");
  expect(content).toContain("TZID:Asia/Shanghai");
  expect(content).toContain("END:VTIMEZONE");
});
