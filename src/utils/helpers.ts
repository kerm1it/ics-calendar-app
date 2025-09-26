/**
 * Helper utility functions
 */

import { Reminder } from '../types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse reminder string to Reminder object
 * Formats: "1w", "3d", "2h", "30m", "0"
 */
export function parseReminderString(reminderStr: string): Reminder | null {
  if (!reminderStr) return null;

  const str = reminderStr.trim().toLowerCase();

  // Special case: 0 means at event time
  if (str === '0') {
    return { value: 0, unit: 'minutes' };
  }

  // Parse number only (default to minutes)
  if (/^\d+$/.test(str)) {
    return { value: parseInt(str), unit: 'minutes' };
  }

  // Parse with unit
  const match = str.match(/^(\d+)([wdhm])$/);
  if (match) {
    const value = parseInt(match[1]);
    const unitChar = match[2];

    const unitMap: Record<string, Reminder['unit']> = {
      'w': 'weeks',
      'd': 'days',
      'h': 'hours',
      'm': 'minutes'
    };

    const unit = unitMap[unitChar];
    if (unit) {
      return { value, unit };
    }
  }

  return null;
}

/**
 * Format reminder to display string
 */
export function formatReminder(reminder: Reminder): string {
  if (reminder.value === 0) return '事件发生时';

  const unitDisplay = {
    weeks: '周',
    days: '天',
    hours: '小时',
    minutes: '分钟'
  };

  return `提前${reminder.value}${unitDisplay[reminder.unit]}`;
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/calendar') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for input field
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time for input field
 */
export function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse date and time from input fields
 */
export function parseDateTimeInput(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      date.setHours(hours, minutes, 0, 0);
    }
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

/**
 * Get timezone list
 */
export function getTimezones(): { value: string; label: string }[] {
  return [
    { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
    { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
    { value: 'America/New_York', label: '美国东部时间 (UTC-5)' },
    { value: 'America/Los_Angeles', label: '美国西部时间 (UTC-8)' },
    { value: 'Europe/London', label: '格林威治标准时间 (UTC+0)' },
    { value: 'Europe/Paris', label: '欧洲中部时间 (UTC+1)' },
    { value: 'Australia/Sydney', label: '澳大利亚东部时间 (UTC+10)' },
  ];
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Get Chinese zodiac sign
 */
export function getChineseZodiac(year: number): string {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  return zodiacs[(year - 4) % 12];
}

/**
 * Get lunar month name
 */
export function getLunarMonthName(month: number): string {
  const months = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  return months[month - 1] || '';
}

/**
 * Get lunar day name
 */
export function getLunarDayName(day: number): string {
  const tens = ['初', '十', '廿', '三十'];
  const ones = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  if (day <= 10) {
    return tens[0] + (day === 10 ? '十' : ones[day]);
  } else if (day < 20) {
    return tens[1] + ones[day - 10];
  } else if (day < 30) {
    return tens[2] + ones[day - 20];
  } else {
    return tens[3];
  }
}