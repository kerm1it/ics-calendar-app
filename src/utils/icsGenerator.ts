/**
 * ICS (iCalendar) File Generator
 * Generates RFC5545 compliant calendar files
 */

import {
  Calendar,
  BirthdayEvent,
  RegularEvent,
  Reminder,
  ICSGeneratorOptions
} from '../types';
import { LunarConverter } from './lunarConverter';

export class ICSGenerator {
  private calendar: Calendar;
  private yearRange: { past: number; future: number };

  constructor(options: ICSGeneratorOptions) {
    this.calendar = options.calendar;
    this.yearRange = options.yearRange;
  }

  /**
   * Generate complete ICS file content
   */
  public generate(): string {
    const lines: string[] = [];

    // ICS header
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push(`PRODID:-//ICS Calendar Generator//EN`);
    lines.push(`X-WR-CALNAME:${this.escapeText(this.calendar.name)}`);
    if (this.calendar.description) {
      lines.push(`X-WR-CALDESC:${this.escapeText(this.calendar.description)}`);
    }
    lines.push(`X-WR-TIMEZONE:${this.calendar.timezone}`);
    lines.push('CALSCALE:GREGORIAN');

    // Add timezone definition
    lines.push(...this.generateTimezone());

    // Generate events
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - this.yearRange.past;
    const endYear = currentYear + this.yearRange.future;

    for (const event of this.calendar.events) {
      if (event.type === 'birthday') {
        lines.push(...this.generateBirthdayEvents(event as BirthdayEvent, startYear, endYear));
      } else {
        lines.push(...this.generateRegularEvent(event as RegularEvent));
      }
    }

    // ICS footer
    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
  }

  /**
   * Generate timezone definition
   */
  private generateTimezone(): string[] {
    const lines: string[] = [];

    if (this.calendar.timezone === 'Asia/Shanghai') {
      lines.push('BEGIN:VTIMEZONE');
      lines.push('TZID:Asia/Shanghai');
      lines.push('BEGIN:STANDARD');
      lines.push('DTSTART:19700101T000000');
      lines.push('TZOFFSETFROM:+0800');
      lines.push('TZOFFSETTO:+0800');
      lines.push('TZNAME:CST');
      lines.push('END:STANDARD');
      lines.push('END:VTIMEZONE');
    }

    return lines;
  }

  /**
   * Generate birthday events for multiple years
   */
  private generateBirthdayEvents(event: BirthdayEvent, startYear: number, endYear: number): string[] {
    const lines: string[] = [];

    for (let year = startYear; year <= endYear; year++) {
      let eventDate: Date | null = null;

      if (event.calendarType === 'lunar') {
        // Extract month and day from birthDate for lunar calendar
        const birthDate = new Date(event.birthDate);
        const lunarMonth = birthDate.getMonth() + 1;  // getMonth() returns 0-11
        const lunarDay = birthDate.getDate();
        const birthYear = birthDate.getFullYear();

        eventDate = LunarConverter.getBirthdayInSolarYear(
          birthYear,
          lunarMonth,
          lunarDay,
          year
        );
      } else {
        // Solar calendar birthday
        const birthDate = new Date(event.birthDate);
        eventDate = new Date(year, birthDate.getMonth(), birthDate.getDate());

        // Handle Feb 29 for non-leap years
        if (birthDate.getMonth() === 1 && birthDate.getDate() === 29 && !this.isLeapYear(year)) {
          eventDate = new Date(year, 1, 28);
        }
      }

      if (eventDate) {
        const birthYear = new Date(event.birthDate).getFullYear();
        const age = year - birthYear;
        const summary = event.showAge
          ? `${event.personName}生日 (${age}岁)`
          : `${event.personName}生日`;

        lines.push(...this.generateVEvent({
          uid: `${event.id}-${year}`,
          summary,
          description: event.description || `${event.personName}的生日`,
          startDate: eventDate,
          allDay: true,
          reminders: event.reminders,
          recurring: false
        }));
      }
    }

    return lines;
  }

  /**
   * Generate a regular event
   */
  private generateRegularEvent(event: RegularEvent): string[] {
    const rrule = event.recurrence ? this.generateRRule(event.recurrence) : null;

    return this.generateVEvent({
      uid: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      allDay: event.allDay,
      reminders: event.reminders,
      recurring: !!rrule,
      rrule: rrule || undefined
    });
  }

  /**
   * Generate VEVENT component
   */
  private generateVEvent(params: {
    uid: string;
    summary: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    allDay: boolean;
    reminders: Reminder[];
    recurring: boolean;
    rrule?: string;
  }): string[] {
    const lines: string[] = [];
    const now = new Date();

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${params.uid}`);
    lines.push(`DTSTAMP:${this.formatDateTime(now)}`);
    lines.push(`CREATED:${this.formatDateTime(now)}`);
    lines.push(`LAST-MODIFIED:${this.formatDateTime(now)}`);
    lines.push(`SUMMARY:${this.escapeText(params.summary)}`);

    if (params.description) {
      lines.push(`DESCRIPTION:${this.escapeText(params.description)}`);
    }

    if (params.location) {
      lines.push(`LOCATION:${this.escapeText(params.location)}`);
    }

    // Date/time handling
    if (params.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${this.formatDate(params.startDate)}`);
      if (params.endDate) {
        const endDate = new Date(params.endDate);
        endDate.setDate(endDate.getDate() + 1); // All-day events end next day
        lines.push(`DTEND;VALUE=DATE:${this.formatDate(endDate)}`);
      }
    } else {
      lines.push(`DTSTART;TZID=${this.calendar.timezone}:${this.formatDateTime(params.startDate)}`);
      if (params.endDate) {
        lines.push(`DTEND;TZID=${this.calendar.timezone}:${this.formatDateTime(params.endDate)}`);
      }
    }

    // Recurrence rule
    if (params.rrule) {
      lines.push(`RRULE:${params.rrule}`);
    }

    // Reminders/Alarms
    for (const reminder of params.reminders) {
      lines.push(...this.generateVAlarm(reminder, params.summary, params.allDay));
    }

    lines.push('END:VEVENT');

    return lines;
  }

  /**
   * Generate VALARM component
   */
  private generateVAlarm(reminder: Reminder, summary: string, isAllDay: boolean = false): string[] {
    const lines: string[] = [];

    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${this.escapeText(summary)}`);

    if (isAllDay && reminder.time) {
      // For all-day events with specific reminder time
      const [hours, minutes] = reminder.time.split(':').map(n => parseInt(n));
      const totalMinutesFromMidnight = hours * 60 + minutes;

      // Calculate the offset from the start of the event day (midnight)
      const reminderOffsetMinutes = this.reminderToMinutes(reminder);
      const daysOffset = Math.floor(reminderOffsetMinutes / (24 * 60));

      // For all-day events, we need to calculate from midnight
      // If reminder is "1 day before at 12:00", the offset should be 24*60 - 12*60 = 12*60 minutes
      const actualMinutesOffset = (daysOffset * 24 * 60) + (24 * 60 - totalMinutesFromMidnight);

      lines.push(`TRIGGER:-PT${actualMinutesOffset}M`);
    } else {
      // For timed events or all-day events without specific time, use standard offset
      const minutes = this.reminderToMinutes(reminder);
      lines.push(`TRIGGER:-PT${minutes}M`);
    }

    lines.push('END:VALARM');

    return lines;
  }

  /**
   * Generate RRULE string
   */
  private generateRRule(recurrence: RegularEvent['recurrence']): string | null {
    if (!recurrence) return null;

    const parts: string[] = [`FREQ=${recurrence.frequency}`];

    if (recurrence.interval && recurrence.interval > 1) {
      parts.push(`INTERVAL=${recurrence.interval}`);
    }

    if (recurrence.count) {
      parts.push(`COUNT=${recurrence.count}`);
    } else if (recurrence.until) {
      const until = new Date(recurrence.until);
      parts.push(`UNTIL=${this.formatDateTime(until)}`);
    }

    if (recurrence.byWeekDay && recurrence.byWeekDay.length > 0) {
      const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const weekDays = recurrence.byWeekDay.map(d => days[d]).join(',');
      parts.push(`BYDAY=${weekDays}`);
    }

    if (recurrence.byMonthDay && recurrence.byMonthDay.length > 0) {
      parts.push(`BYMONTHDAY=${recurrence.byMonthDay.join(',')}`);
    }

    return parts.join(';');
  }

  /**
   * Convert reminder to minutes
   */
  private reminderToMinutes(reminder: Reminder): number {
    const multipliers = {
      weeks: 7 * 24 * 60,
      days: 24 * 60,
      hours: 60,
      minutes: 1
    };

    return reminder.value * multipliers[reminder.unit];
  }

  /**
   * Format date to YYYYMMDD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Format datetime to YYYYMMDDTHHMMSSZ
   */
  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Escape text for ICS format
   */
  private escapeText(text: string): string {
    if (!text) return '';

    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  /**
   * Check if year is leap year
   */
  private isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
}