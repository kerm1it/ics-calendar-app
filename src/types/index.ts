// Calendar and Event type definitions

export type CalendarType = 'solar' | 'lunar';
export type EventType = 'birthday' | 'event';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Reminder {
  value: number;
  unit: 'weeks' | 'days' | 'hours' | 'minutes';
}

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  timezone: string;
  events: CalendarEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseEvent {
  id: string;
  type: EventType;
  summary: string;
  description?: string;
  location?: string;
  reminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BirthdayEvent extends BaseEvent {
  type: 'birthday';
  personName: string;
  birthDate: Date;  // For solar: actual birth date, For lunar: stores lunar date as Date object
  calendarType: CalendarType;
  showAge: boolean;
}

export interface RegularEvent extends BaseEvent {
  type: 'event';
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval?: number;
    count?: number;
    until?: Date;
    byWeekDay?: number[];
    byMonthDay?: number[];
  };
}

export type CalendarEvent = BirthdayEvent | RegularEvent;

export interface ICSGeneratorOptions {
  calendar: Calendar;
  yearRange: {
    past: number;
    future: number;
  };
}

// Form related types
export interface CalendarFormData {
  name: string;
  description?: string;
  timezone: string;
}

export interface BirthdayFormData {
  personName: string;
  calendarType: CalendarType;
  birthDate: string;  // YYYY-MM-DD format for both solar and lunar
  showAge: boolean;
  reminders: string[];
  description?: string;
}

export interface EventFormData {
  summary: string;
  description?: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  allDay: boolean;
  recurring: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval: number;
    endType: 'never' | 'count' | 'until';
    count?: number;
    until?: string;
  };
  reminders: string[];
}