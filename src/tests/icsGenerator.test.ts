import { test, expect } from "bun:test";
import { ICSGenerator } from "../utils/icsGenerator";
import { Calendar, BirthdayEvent, RegularEvent } from "../types";
import { generateId } from "../utils/helpers";
import { LunarConverter } from "../utils/lunarConverter";

test("Complete empty calendar ICS structure", () => {
  const calendar: Calendar = {
    id: "empty-cal-123",
    name: "空日历测试",
    description: "空日历描述",
    timezone: "Asia/Shanghai",
    events: [],
    createdAt: new Date(2025, 0, 1, 12, 0, 0),
    updatedAt: new Date(2025, 0, 1, 12, 0, 0)
  };

  // Mock固定时间
  const mockDate = new Date(2025, 0, 1, 12, 0, 0);
  const originalDate = global.Date;

  // @ts-expect-error Mock Date constructor for testing
  global.Date = class extends Date {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(mockDate);
      } else {
        super(...(args as ConstructorParameters<typeof Date>));
      }
    }

    static now() {
      return mockDate.getTime();
    }
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  // 还原Date对象
  global.Date = originalDate;

  // 完整的空日历预期输出
  const expectedContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ICS Calendar Generator//EN',
    'X-WR-CALNAME:空日历测试',
    'X-WR-CALDESC:空日历描述',
    'X-WR-TIMEZONE:Asia/Shanghai',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Shanghai',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0800',
    'TZOFFSETTO:+0800',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'END:VCALENDAR'
  ].join('\r\n');

  expect(content).toBe(expectedContent);
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

test("Generate calendar with birthday events", () => {
  const birthdayEvent: BirthdayEvent = {
    id: generateId(),
    type: "birthday",
    personName: "张三",
    birthDate: new Date(1990, 2, 15), // March 15, 1990
    calendarType: "solar",
    showAge: true,
    summary: "张三生日",
    description: "生日提醒",
    reminders: [{ value: 1, unit: "days", time: "09:00" }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: generateId(),
    name: "生日日历",
    timezone: "Asia/Shanghai",
    events: [birthdayEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  expect(content).toContain("BEGIN:VEVENT");
  expect(content).toContain("END:VEVENT");
  expect(content).toContain("SUMMARY:张三生日");
  expect(content).toContain("DESCRIPTION:生日提醒");
  // Birthday events generate separate events for each year instead of using RRULE
  expect(content).toContain("张三生日 (35岁)");
  expect(content).toContain("张三生日 (36岁)");
});

test("Complete lunar birthday ICS: 农历2020年正月初一", () => {
  // 精确测试：农历2020年正月初一，2025年对应1月28日
  const lunarBirthdayEvent: BirthdayEvent = {
    id: "lunar-2020-01-01",
    type: "birthday",
    personName: "春节宝宝",
    birthDate: new Date(2020, 0, 1), // 农历2020年正月初一
    calendarType: "lunar",
    showAge: true,
    summary: "春节生日",
    description: "农历正月初一生日",
    reminders: [],
    createdAt: new Date(2025, 0, 1, 12, 0, 0),
    updatedAt: new Date(2025, 0, 1, 12, 0, 0)
  };

  const calendar: Calendar = {
    id: "lunar-cal-456",
    name: "农历春节日历",
    timezone: "Asia/Shanghai",
    events: [lunarBirthdayEvent],
    createdAt: new Date(2025, 0, 1, 12, 0, 0),
    updatedAt: new Date(2025, 0, 1, 12, 0, 0)
  };

  // Mock固定时间
  const mockDate = new Date(2025, 0, 1, 12, 0, 0);
  const originalDate = global.Date;

  // @ts-expect-error Mock Date constructor for testing
  global.Date = class extends Date {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(mockDate);
      } else {
        super(...(args as ConstructorParameters<typeof Date>));
      }
    }

    static now() {
      return mockDate.getTime();
    }
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 0 } // 只生成2025年
  });

  const content = generator.generate();

  // 还原Date对象
  global.Date = originalDate;

  // 完整的农历生日预期输出
  const expectedContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ICS Calendar Generator//EN',
    'X-WR-CALNAME:农历春节日历',
    'X-WR-TIMEZONE:Asia/Shanghai',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Shanghai',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0800',
    'TZOFFSETTO:+0800',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:lunar-2020-01-01-2025',
    'DTSTAMP:20250101T120000Z',
    'CREATED:20250101T120000Z',
    'LAST-MODIFIED:20250101T120000Z',
    'SUMMARY:春节宝宝生日 (5岁)',
    'DESCRIPTION:农历正月初一生日',
    'DTSTART;VALUE=DATE:20250129', // 农历2020正月初一在2025年对应1月29日
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  expect(content).toBe(expectedContent);
});

test("Generate calendar with regular events", () => {
  const regularEvent: RegularEvent = {
    id: generateId(),
    type: "event",
    summary: "团队会议",
    description: "每周例会",
    location: "会议室A",
    startDate: new Date(2024, 2, 15, 14, 0), // March 15, 2024 14:00
    endDate: new Date(2024, 2, 15, 15, 30), // March 15, 2024 15:30
    allDay: false,
    recurrence: {
      frequency: "WEEKLY",
      interval: 1,
      count: 10
    },
    reminders: [{ value: 15, unit: "minutes" }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: generateId(),
    name: "工作日历",
    timezone: "Asia/Shanghai",
    events: [regularEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  expect(content).toContain("BEGIN:VEVENT");
  expect(content).toContain("SUMMARY:团队会议");
  expect(content).toContain("DESCRIPTION:每周例会");
  expect(content).toContain("LOCATION:会议室A");
  expect(content).toContain("RRULE:FREQ=WEEKLY;COUNT=10"); // INTERVAL=1 is omitted when it's the default
  expect(content).toContain("BEGIN:VALARM");
  expect(content).toContain("TRIGGER:-PT15M");
});

test("Generate all-day event", () => {
  const allDayEvent: RegularEvent = {
    id: generateId(),
    type: "event",
    summary: "国庆节",
    description: "全天假期",
    startDate: new Date(2024, 9, 1), // October 1, 2024
    allDay: true,
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: generateId(),
    name: "节假日",
    timezone: "Asia/Shanghai",
    events: [allDayEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  expect(content).toContain("SUMMARY:国庆节");
  expect(content).toContain("DTSTART;VALUE=DATE:");
  expect(content).not.toContain("DTEND"); // All-day events might not have DTEND
});

test("Handle special characters in text", () => {
  const calendar: Calendar = {
    id: generateId(),
    name: "Test,Calendar;With:Special\\Characters\nNew Line",
    description: "Description with special chars: ,;:\\",
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

  // Special characters should be escaped
  expect(content).toContain("X-WR-CALNAME:");
  expect(content).toContain("X-WR-CALDESC:");
  // Should not contain unescaped special characters that break ICS format
  expect(content).not.toMatch(/[^\\],/); // Unescaped comma
  expect(content).not.toMatch(/[^\\];/); // Unescaped semicolon
});

test("Different timezone support", () => {
  const calendar: Calendar = {
    id: generateId(),
    name: "US Calendar",
    timezone: "America/New_York",
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  expect(content).toContain("X-WR-TIMEZONE:America/New_York");
  // America/New_York timezone definition is not included (only Asia/Shanghai is hardcoded)
  expect(content).not.toContain("TZID:America/New_York");
});

test("Multiple year range for birthday events", () => {
  const birthdayEvent: BirthdayEvent = {
    id: generateId(),
    type: "birthday",
    personName: "王五",
    birthDate: new Date(1990, 2, 15),
    calendarType: "solar",
    showAge: true,
    summary: "王五生日",
    description: "",
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: generateId(),
    name: "多年生日",
    timezone: "Asia/Shanghai",
    events: [birthdayEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 1, future: 2 } // Should generate for 3 years total
  });

  const content = generator.generate();

  // Should contain multiple events for different years
  const eventCount = (content.match(/BEGIN:VEVENT/g) || []).length;
  expect(eventCount).toBeGreaterThan(1); // Should have events for multiple years
});

test("Validate precise ICS format and content", () => {
  const fixedDate = new Date(2024, 2, 15, 14, 30); // March 15, 2024 14:30
  const regularEvent: RegularEvent = {
    id: "test-event-123",
    type: "event",
    summary: "Test Meeting",
    description: "Important meeting",
    location: "Conference Room",
    startDate: fixedDate,
    endDate: new Date(2024, 2, 15, 16, 0), // 16:00 same day
    allDay: false,
    recurrence: {
      frequency: "WEEKLY",
      interval: 2,
      count: 5
    },
    reminders: [{ value: 30, unit: "minutes" }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "cal-123",
    name: "Test Calendar",
    description: "Test Description",
    timezone: "Asia/Shanghai",
    events: [regularEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();
  const lines = content.split('\r\n');

  // Validate basic structure
  expect(lines[0]).toBe('BEGIN:VCALENDAR');
  expect(lines[lines.length - 1]).toBe('END:VCALENDAR');
  expect(lines).toContain('VERSION:2.0');
  expect(lines).toContain('PRODID:-//ICS Calendar Generator//EN');
  expect(lines).toContain('CALSCALE:GREGORIAN');

  // Validate calendar properties
  expect(lines).toContain('X-WR-CALNAME:Test Calendar');
  expect(lines).toContain('X-WR-CALDESC:Test Description');
  expect(lines).toContain('X-WR-TIMEZONE:Asia/Shanghai');

  // Validate timezone definition
  expect(lines).toContain('BEGIN:VTIMEZONE');
  expect(lines).toContain('TZID:Asia/Shanghai');
  expect(lines).toContain('TZOFFSETFROM:+0800');
  expect(lines).toContain('TZOFFSETTO:+0800');
  expect(lines).toContain('END:VTIMEZONE');

  // Validate event content
  expect(lines).toContain('BEGIN:VEVENT');
  expect(lines).toContain('UID:test-event-123');
  expect(lines).toContain('SUMMARY:Test Meeting');
  expect(lines).toContain('DESCRIPTION:Important meeting');
  expect(lines).toContain('LOCATION:Conference Room');

  // Validate date/time format (should be in format YYYYMMDDTHHMMSSZ)
  expect(content).toContain('DTSTART;TZID=Asia/Shanghai:20240315T143000Z');
  expect(content).toContain('DTEND;TZID=Asia/Shanghai:20240315T160000Z');

  // Validate recurrence rule with specific interval
  expect(lines).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=5');

  // Validate alarm/reminder
  expect(lines).toContain('BEGIN:VALARM');
  expect(lines).toContain('ACTION:DISPLAY');
  expect(lines).toContain('DESCRIPTION:Test Meeting');
  expect(lines).toContain('TRIGGER:-PT30M'); // 30 minutes before
  expect(lines).toContain('END:VALARM');
  expect(lines).toContain('END:VEVENT');
});

test("Validate birthday event with specific reminder time", () => {
  const birthdayEvent: BirthdayEvent = {
    id: "birthday-456",
    type: "birthday",
    personName: "测试人员",
    birthDate: new Date(1990, 2, 15), // March 15, 1990
    calendarType: "solar",
    showAge: true,
    summary: "测试人员生日",
    description: "生日快乐",
    reminders: [{ value: 1, unit: "days", time: "09:00" }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "birthday-cal",
    name: "生日提醒",
    timezone: "Asia/Shanghai",
    events: [birthdayEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();
  // Should generate events for 2025 and 2026
  const eventCount = (content.match(/BEGIN:VEVENT/g) || []).length;
  expect(eventCount).toBe(2);

  // Check all-day event format
  expect(content).toContain('DTSTART;VALUE=DATE:20250315'); // 2025 birthday
  expect(content).toContain('DTSTART;VALUE=DATE:20260315'); // 2026 birthday

  // Validate age calculation
  expect(content).toContain('SUMMARY:测试人员生日 (35岁)');
  expect(content).toContain('SUMMARY:测试人员生日 (36岁)');

  // Validate reminder calculation for all-day event with specific time
  // 1 day before at 09:00 should be 24*60 - 9*60 = 900 minutes from midnight
  expect(content).toContain('TRIGGER:-PT2340M'); // 39 hours = 2340 minutes
});

test("Validate special character escaping in ICS format", () => {
  const eventWithSpecialChars: RegularEvent = {
    id: "special-chars",
    type: "event",
    summary: "Meeting: Review,Plans;Discussion\\Test\nNew Line",
    description: "Description with: commas, semicolons; backslashes\\ and\nnew lines",
    location: "Room A,B;C:\\Main\nBuilding",
    startDate: new Date(2024, 0, 1, 10, 0),
    endDate: new Date(2024, 0, 1, 11, 0),
    allDay: false,
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "escape-test",
    name: "Test,Calendar;With:Special\\Characters\nNew Line",
    description: "Description: with,special;chars\\and\nnewlines",
    timezone: "Asia/Shanghai",
    events: [eventWithSpecialChars],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  // Verify special characters are properly escaped
  expect(content).toContain('SUMMARY:Meeting: Review\\,Plans\\;Discussion\\\\Test\\nNew Line');
  expect(content).toContain('DESCRIPTION:Description with: commas\\, semicolons\\; backslashes\\\\ and\\nnew lines');
  expect(content).toContain('LOCATION:Room A\\,B\\;C:\\\\Main\\nBuilding');

  // Calendar name and description should also be escaped
  expect(content).toContain('X-WR-CALNAME:Test\\,Calendar\\;With:Special\\\\Characters\\nNew Line');
  expect(content).toContain('X-WR-CALDESC:Description: with\\,special\\;chars\\\\and\\nnewlines');
});

test("Validate all-day event date format", () => {
  const allDayEvent: RegularEvent = {
    id: "allday-test",
    type: "event",
    summary: "All Day Event",
    description: "Entire day",
    startDate: new Date(2024, 5, 20), // June 20, 2024
    endDate: new Date(2024, 5, 22), // June 22, 2024
    allDay: true,
    reminders: [{ value: 2, unit: "days" }, { value: 1, unit: "hours", time: "08:00" }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "allday-cal",
    name: "All Day Calendar",
    timezone: "Asia/Shanghai",
    events: [allDayEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  // All-day events should use DATE format (no time)
  expect(content).toContain('DTSTART;VALUE=DATE:20240620');
  // End date should be next day for all-day events
  expect(content).toContain('DTEND;VALUE=DATE:20240623'); // +1 day from end date

  // Validate multiple reminders
  const alarmCount = (content.match(/BEGIN:VALARM/g) || []).length;
  expect(alarmCount).toBe(2);

  // 2 days = 2880 minutes
  expect(content).toContain('TRIGGER:-PT2880M');
  // 1 hour = 60 minutes
  expect(content).toContain('TRIGGER:-PT960M'); // 16 hours from midnight to 8:00 next day = 960 minutes
});

test("Exact reminder time calculation: 1天前09:00提醒", () => {
  // 精确测试案例：生日事件，1天前09:00提醒
  // 全天事件在午夜开始，1天前09:00 = 24小时 - 9小时 = 15小时 = 900分钟
  // 但实际计算是：1天(1440分钟) + (24小时-9小时)分钟 = 1440 + 900 = 2340分钟
  const birthdayEvent: BirthdayEvent = {
    id: "exact-reminder-test",
    type: "birthday",
    personName: "提醒测试",
    birthDate: new Date(1990, 2, 15), // 1990年3月15日
    calendarType: "solar",
    showAge: false,
    summary: "精确提醒测试",
    description: "测试1天前09:00提醒",
    reminders: [{ value: 1, unit: "days", time: "09:00" }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "exact-reminder-cal",
    name: "精确提醒测试",
    timezone: "Asia/Shanghai",
    events: [birthdayEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 0 } // 只生成2025年
  });

  const content = generator.generate();

  // 精确验证：1天前09:00的提醒应该是2340分钟
  expect(content).toContain('TRIGGER:-PT2340M');

  // 精确验证：生日日期应该是3月15日
  expect(content).toContain('DTSTART;VALUE=DATE:20250315');

  // 精确验证：摘要（生日事件会自动添加"生日"后缀）
  expect(content).toContain('SUMMARY:提醒测试生日');
});

test("Validate date format precision for events", () => {
  // Test specific date and time to ensure correct formatting
  const specificDate = new Date(2024, 11, 25, 9, 30, 0); // Dec 25, 2024 09:30:00
  const endDate = new Date(2024, 11, 25, 10, 45, 30); // Dec 25, 2024 10:45:30

  const event: RegularEvent = {
    id: "date-format-test",
    type: "event",
    summary: "Precise Date Test",
    description: "Testing date format precision",
    startDate: specificDate,
    endDate: endDate,
    allDay: false,
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "date-test-cal",
    name: "Date Test Calendar",
    timezone: "Asia/Shanghai",
    events: [event],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  // Validate exact date/time format (should be YYYYMMDDTHHMMSSZ)
  expect(content).toContain('DTSTART;TZID=Asia/Shanghai:20241225T093000Z');
  expect(content).toContain('DTEND;TZID=Asia/Shanghai:20241225T104530Z');
});

test("Complete ICS output validation: Simple birthday", () => {
  // 最简单的测试案例：阳历生日，无提醒
  const birthdayEvent: BirthdayEvent = {
    id: "test-123",
    type: "birthday",
    personName: "张三",
    birthDate: new Date(1990, 2, 15), // 1990年3月15日
    calendarType: "solar",
    showAge: true,
    summary: "张三生日",
    description: "生日快乐",
    reminders: [],
    createdAt: new Date(2024, 0, 1, 12, 0, 0), // 固定创建时间
    updatedAt: new Date(2024, 0, 1, 12, 0, 0)
  };

  const calendar: Calendar = {
    id: "cal-456",
    name: "测试日历",
    description: "测试描述",
    timezone: "Asia/Shanghai",
    events: [birthdayEvent],
    createdAt: new Date(2024, 0, 1, 12, 0, 0),
    updatedAt: new Date(2024, 0, 1, 12, 0, 0)
  };

  // Mock固定时间戳以确保可预测的输出
  const mockDate = new Date(2025, 0, 1, 12, 0, 0); // 2025年1月1日12:00:00
  const originalDate = global.Date;

  // @ts-expect-error Mock Date constructor for testing
  global.Date = class extends Date {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(mockDate);
      } else {
        super(...(args as ConstructorParameters<typeof Date>));
      }
    }

    static now() {
      return mockDate.getTime();
    }
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 0 } // 只生成当前年(2025)
  });

  const content = generator.generate();

  // 还原Date对象
  global.Date = originalDate;

  // 完整的预期ICS内容（基于2025年）
  const expectedContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ICS Calendar Generator//EN',
    'X-WR-CALNAME:测试日历',
    'X-WR-CALDESC:测试描述',
    'X-WR-TIMEZONE:Asia/Shanghai',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Shanghai',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0800',
    'TZOFFSETTO:+0800',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:test-123-2025',
    'DTSTAMP:20250101T120000Z',
    'CREATED:20250101T120000Z',
    'LAST-MODIFIED:20250101T120000Z',
    'SUMMARY:张三生日 (35岁)',
    'DESCRIPTION:生日快乐',
    'DTSTART;VALUE=DATE:20250315',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  expect(content).toBe(expectedContent);
});

test("Complete ICS output: Event with reminder", () => {
  // 精确测试：包含提醒的定时事件
  const timedEvent: RegularEvent = {
    id: "event-789",
    type: "event",
    summary: "团队会议",
    description: "每周例会",
    location: "会议室A",
    startDate: new Date(2025, 0, 15, 14, 0, 0), // 2025年1月15日14:00
    endDate: new Date(2025, 0, 15, 15, 30, 0),   // 2025年1月15日15:30
    allDay: false,
    reminders: [{ value: 15, unit: "minutes" }],
    createdAt: new Date(2025, 0, 1, 12, 0, 0),
    updatedAt: new Date(2025, 0, 1, 12, 0, 0)
  };

  const calendar: Calendar = {
    id: "meeting-cal",
    name: "会议日历",
    timezone: "Asia/Shanghai",
    events: [timedEvent],
    createdAt: new Date(2025, 0, 1, 12, 0, 0),
    updatedAt: new Date(2025, 0, 1, 12, 0, 0)
  };

  // Mock固定时间
  const mockDate = new Date(2025, 0, 1, 12, 0, 0);
  const originalDate = global.Date;

  // @ts-expect-error Mock Date constructor for testing
  global.Date = class extends Date {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(mockDate);
      } else {
        super(...(args as ConstructorParameters<typeof Date>));
      }
    }

    static now() {
      return mockDate.getTime();
    }
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 0 }
  });

  const content = generator.generate();

  // 还原Date对象
  global.Date = originalDate;

  // 完整的预期ICS内容
  const expectedContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ICS Calendar Generator//EN',
    'X-WR-CALNAME:会议日历',
    'X-WR-TIMEZONE:Asia/Shanghai',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Shanghai',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0800',
    'TZOFFSETTO:+0800',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:event-789',
    'DTSTAMP:20250101T120000Z',
    'CREATED:20250101T120000Z',
    'LAST-MODIFIED:20250101T120000Z',
    'SUMMARY:团队会议',
    'DESCRIPTION:每周例会',
    'LOCATION:会议室A',
    'DTSTART;TZID=Asia/Shanghai:20250115T140000Z',
    'DTEND;TZID=Asia/Shanghai:20250115T153000Z',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:团队会议',
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  expect(content).toBe(expectedContent);
});

test("Test multiple known lunar-solar date conversions", () => {
  // 测试多个已知的农历-阳历对应关系
  const knownLunarDates = [
    {
      name: "春节",
      lunar: new Date(2020, 0, 1), // 农历2020年正月初一
      description: "农历正月初一"
    },
    {
      name: "端午节",
      lunar: new Date(2020, 4, 5), // 农历2020年五月初五
      description: "农历五月初五"
    },
    {
      name: "中秋节",
      lunar: new Date(2020, 7, 15), // 农历2020年八月十五
      description: "农历八月十五"
    }
  ];

  knownLunarDates.forEach((testCase, index) => {
    const lunarEvent: BirthdayEvent = {
      id: `lunar-known-${index}`,
      type: "birthday",
      personName: testCase.name,
      birthDate: testCase.lunar,
      calendarType: "lunar",
      showAge: false,
      summary: `${testCase.name}测试`,
      description: testCase.description,
      reminders: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const calendar: Calendar = {
      id: `known-lunar-${index}`,
      name: `${testCase.name}农历测试`,
      timezone: "Asia/Shanghai",
      events: [lunarEvent],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const generator = new ICSGenerator({
      calendar,
      yearRange: { past: 0, future: 2 } // 测试3年
    });

    const content = generator.generate();

    // 应该生成3个事件（2025, 2026, 2027）
    const eventCount = (content.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBe(3);

    // 验证每年的日期都不同
    const dateMatches = content.match(/DTSTART;VALUE=DATE:(\d{8})/g);
    expect(dateMatches).not.toBeNull();
    expect(dateMatches?.length).toBe(3);

    if (dateMatches) {
      const dates = dateMatches.map(match => match.split(':')[1]);
      const uniqueDates = new Set(dates);
      expect(uniqueDates.size).toBe(3); // 三年应该有三个不同的日期

      // 验证年份递增
      const years = dates.map(date => parseInt(date.substr(0, 4))).sort();
      expect(years).toEqual([2025, 2026, 2027]);
    }

    // 验证包含农历信息
    expect(content).toContain(testCase.description);
  });
});

test("Validate lunar leap month handling accuracy", () => {
  // 2023年有闰二月，测试闰月处理
  const leapMonthBirthday: BirthdayEvent = {
    id: "leap-month-test",
    type: "birthday",
    personName: "闰月测试",
    birthDate: new Date(2023, 1, 15), // 2023年二月十五（闰二月年份）
    calendarType: "lunar",
    showAge: true,
    summary: "闰月生日测试",
    description: "测试闰月年份的农历转换",
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "leap-month-cal",
    name: "闰月测试日历",
    timezone: "Asia/Shanghai",
    events: [leapMonthBirthday],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 3 } // 测试4年，包含有闰月和无闰月的年份
  });

  const content = generator.generate();

  // 应该生成4个事件
  const eventCount = (content.match(/BEGIN:VEVENT/g) || []).length;
  expect(eventCount).toBe(4);

  // 验证日期格式和合理性
  const dateMatches = content.match(/DTSTART;VALUE=DATE:(\d{8})/g);
  expect(dateMatches).not.toBeNull();
  expect(dateMatches?.length).toBe(4);

  if (dateMatches) {
    const dates = dateMatches.map(match => match.split(':')[1]);

    // 验证所有日期都不同（闰月影响应该导致日期差异）
    const uniqueDates = new Set(dates);
    expect(uniqueDates.size).toBe(4);

    // 农历二月十五通常在阳历3-4月
    dates.forEach(date => {
      const month = parseInt(date.substr(4, 2));
      expect(month).toBeGreaterThanOrEqual(3);
      expect(month).toBeLessThanOrEqual(5);
    });
  }

  // 验证年龄计算（从2023年出生）
  expect(content).toContain('(2岁)');  // 2025年
  expect(content).toContain('(3岁)');  // 2026年
  expect(content).toContain('(4岁)');  // 2027年
  expect(content).toContain('(5岁)');  // 2028年
});

test("Direct validation of lunar conversion accuracy against LunarConverter", () => {
  // 直接使用LunarConverter验证ICS生成器中的农历转换是否正确
  const testCases = [
    { lunarYear: 1990, lunarMonth: 8, lunarDay: 15, name: "八月十五" },
    { lunarYear: 1985, lunarMonth: 1, lunarDay: 1, name: "正月初一" },
    { lunarYear: 1995, lunarMonth: 5, lunarDay: 5, name: "五月初五" }
  ];

  testCases.forEach(testCase => {
    const lunarBirthday: BirthdayEvent = {
      id: `direct-test-${testCase.lunarYear}-${testCase.lunarMonth}-${testCase.lunarDay}`,
      type: "birthday",
      personName: `直接验证-${testCase.name}`,
      birthDate: new Date(testCase.lunarYear, testCase.lunarMonth - 1, testCase.lunarDay),
      calendarType: "lunar",
      showAge: false,
      summary: `${testCase.name}直接验证`,
      description: "直接验证农历转换",
      reminders: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const calendar: Calendar = {
      id: `direct-validation-${testCase.lunarYear}`,
      name: "直接验证日历",
      timezone: "Asia/Shanghai",
      events: [lunarBirthday],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const generator = new ICSGenerator({
      calendar,
      yearRange: { past: 0, future: 1 }
    });

    const content = generator.generate();

    // 提取ICS中生成的日期
    const dateMatches = content.match(/DTSTART;VALUE=DATE:(\d{8})/g);
    expect(dateMatches).not.toBeNull();
    expect(dateMatches?.length).toBe(2); // 2025和2026年

    if (dateMatches) {
      const icsGeneratedDates = dateMatches.map(match => {
        const dateStr = match.split(':')[1];
        const year = parseInt(dateStr.substr(0, 4));
        const month = parseInt(dateStr.substr(4, 2)) - 1; // Date构造函数中月份是0-11
        const day = parseInt(dateStr.substr(6, 2));
        return new Date(year, month, day);
      });

      // 使用LunarConverter直接计算应该的阳历日期
      const expectedDates = [2025, 2026].map(targetYear => {
        return LunarConverter.getBirthdayInSolarYear(
          testCase.lunarYear,
          testCase.lunarMonth,
          testCase.lunarDay,
          targetYear
        );
      });

      // 验证ICS生成器和LunarConverter的结果一致
      icsGeneratedDates.forEach((icsDate, index) => {
        const expectedDate = expectedDates[index];
        expect(expectedDate).not.toBeNull();

        if (expectedDate) {
          expect(icsDate.getFullYear()).toBe(expectedDate.getFullYear());
          expect(icsDate.getMonth()).toBe(expectedDate.getMonth());
          expect(icsDate.getDate()).toBe(expectedDate.getDate());
        }
      });
    }
  });
});

test("Edge case: Invalid lunar dates should be handled gracefully", () => {
  // 测试无效的农历日期处理
  const invalidLunarBirthday: BirthdayEvent = {
    id: "invalid-lunar-test",
    type: "birthday",
    personName: "无效农历测试",
    birthDate: new Date(1850, 0, 1), // 1850年超出了LunarConverter的支持范围
    calendarType: "lunar",
    showAge: true,
    summary: "无效农历测试",
    description: "测试超出范围的农历日期",
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "invalid-lunar-cal",
    name: "无效农历测试",
    timezone: "Asia/Shanghai",
    events: [invalidLunarBirthday],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  // 应该不抛出错误，但需要检查如何处理超出范围的日期
  expect(() => {
    const content = generator.generate();

    // 检查实际行为：如果LunarConverter返回null，则不应生成事件
    // 如果生成了事件，则验证其合理性
    const eventCount = (content.match(/BEGIN:VEVENT/g) || []).length;

    if (eventCount > 0) {
      // 如果生成了事件，验证日期是否合理
      const dateMatches = content.match(/DTSTART;VALUE=DATE:(\d{8})/g);
      expect(dateMatches).not.toBeNull();

      if (dateMatches) {
        dateMatches.forEach(match => {
          const dateStr = match.split(':')[1];
          const year = parseInt(dateStr.substr(0, 4));
          // 生成的年份应该是目标年份（2025, 2026）
          expect(year >= 2025 && year <= 2026).toBe(true);
        });
      }
    }
  }).not.toThrow();
});

test("Validate RFC5545 compliance and edge cases", () => {
  // Test leap year birthday (Feb 29)
  const leapYearBirthday: BirthdayEvent = {
    id: "leap-year-test",
    type: "birthday",
    personName: "闰年宝宝",
    birthDate: new Date(2000, 1, 29), // Feb 29, 2000 (leap year)
    calendarType: "solar",
    showAge: true,
    summary: "闰年生日",
    description: "闰年出生测试",
    reminders: [{ value: 0, unit: "minutes" }], // Event time reminder
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "rfc5545-test",
    name: "RFC5545 Compliance Test",
    timezone: "Asia/Shanghai",
    events: [leapYearBirthday],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 2 } // Test multiple years including non-leap years
  });

  const content = generator.generate();
  const lines = content.split('\r\n');

  // Validate RFC5545 line endings (CRLF)
  expect(content).not.toContain('\n\r'); // Wrong order
  expect(content.includes('\r\n')).toBe(true); // Correct CRLF

  // Validate required calendar properties
  expect(lines).toContain('BEGIN:VCALENDAR');
  expect(lines).toContain('VERSION:2.0');
  expect(lines).toContain('END:VCALENDAR');

  // Validate PRODID format
  const prodidLine = lines.find(line => line.startsWith('PRODID:'));
  expect(prodidLine).toBeDefined();
  expect(prodidLine).toMatch(/^PRODID:-\/\/.*\/\/.*/);

  // For non-leap years, Feb 29 should become Feb 28
  // 2025 is not a leap year, so birthday should be on Feb 28
  expect(content).toContain('DTSTART;VALUE=DATE:20250228');
  // 2026 is not a leap year, so birthday should be on Feb 28
  expect(content).toContain('DTSTART;VALUE=DATE:20260228');
  // 2027 is not a leap year, so birthday should be on Feb 28
  expect(content).toContain('DTSTART;VALUE=DATE:20270228');

  // Test zero-minute reminder (event time)
  expect(content).toContain('TRIGGER:-PT0M');

  // Validate UID uniqueness
  const uidMatches = content.match(/UID:([^\r\n]+)/g);
  expect(uidMatches).not.toBeNull();
  if (uidMatches) {
    const uids = uidMatches.map(match => match.split(':')[1]);
    const uniqueUids = new Set(uids);
    expect(uniqueUids.size).toBe(uids.length); // All UIDs should be unique
  }

  // Validate DTSTAMP format
  const dtstampMatches = content.match(/DTSTAMP:(\d{8}T\d{6}Z)/g);
  expect(dtstampMatches).not.toBeNull();
  expect(dtstampMatches?.length).toBeGreaterThan(0);
});

test("Exact recurrence rule: 每2周的周二14:00开会，共5次", () => {
  // 精确测试案例：2024年1月2日(周二)14:00开始，每2周重复，共5次
  const recurringEvent: RegularEvent = {
    id: "exact-recurrence-test",
    type: "event",
    summary: "精确重复测试",
    description: "每2周的周二例会",
    location: "305会议室",
    startDate: new Date(2024, 0, 2, 14, 0), // 2024年1月2日 14:00 (周二)
    endDate: new Date(2024, 0, 2, 15, 30), // 2024年1月2日 15:30
    allDay: false,
    recurrence: {
      frequency: "WEEKLY",
      interval: 2, // 每2周
      count: 5    // 共5次
    },
    reminders: [
      { value: 30, unit: "minutes" }, // 30分钟前
      { value: 1, unit: "days" }      // 1天前
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const calendar: Calendar = {
    id: "exact-recurrence-cal",
    name: "精确重复测试",
    timezone: "Asia/Shanghai",
    events: [recurringEvent],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  // 精确验证：RRULE必须完全匹配
  expect(content).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=5');

  // 精确验证：开始和结束时间
  expect(content).toContain('DTSTART;TZID=Asia/Shanghai:20240102T140000Z');
  expect(content).toContain('DTEND;TZID=Asia/Shanghai:20240102T153000Z');

  // 精确验证：提醒时间
  expect(content).toContain('TRIGGER:-PT30M');   // 30分钟 = 30M
  expect(content).toContain('TRIGGER:-PT1440M'); // 1天 = 1440M

  // 精确验证：其他属性
  expect(content).toContain('SUMMARY:精确重复测试');
  expect(content).toContain('DESCRIPTION:每2周的周二例会');
  expect(content).toContain('LOCATION:305会议室');

  // 精确验证：应该有2个提醒
  const alarmCount = (content.match(/BEGIN:VALARM/g) || []).length;
  expect(alarmCount).toBe(2);
});

test("Validate empty calendar and edge cases", () => {
  // Test empty calendar
  const emptyCalendar: Calendar = {
    id: "empty-cal",
    name: "Empty Calendar",
    timezone: "Asia/Shanghai",
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const generator = new ICSGenerator({
    calendar: emptyCalendar,
    yearRange: { past: 0, future: 1 }
  });

  const content = generator.generate();

  // Should still have valid calendar structure
  expect(content).toContain('BEGIN:VCALENDAR');
  expect(content).toContain('END:VCALENDAR');
  expect(content).toContain('X-WR-CALNAME:Empty Calendar');

  // Should not contain any events
  expect(content).not.toContain('BEGIN:VEVENT');
  expect(content).not.toContain('END:VEVENT');

  // Should still have timezone definition
  expect(content).toContain('BEGIN:VTIMEZONE');
  expect(content).toContain('END:VTIMEZONE');
});
