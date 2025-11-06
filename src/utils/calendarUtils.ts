import { WeekDay } from '@/types';

/**
 * Get the days of the current week starting from Monday
 */
export function getCurrentWeekDays(): WeekDay[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1); // Monday

  const days: WeekDay[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({
      date,
      dayName: dayNames[i],
      dayNumber: date.getDate(),
    });
  }

  return days;
}

/**
 * Get the days for a given number of weeks starting from a specific date
 */
export function getWeekDays(startDate: Date, weeks: number = 1): WeekDay[] {
  const days: WeekDay[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let w = 0; w < weeks; w++) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + i);
      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate(),
      });
    }
  }

  return days;
}

/**
 * Calculate the position and width of an assignment bar
 */
export function calculateAssignmentPosition(
  startDate: Date,
  endDate: Date,
  weekDays: WeekDay[]
): { left: number; width: number } | null {
  const periodStart = weekDays[0].date;
  const periodEnd = weekDays[weekDays.length - 1].date;
  const totalDays = weekDays.length;

  // Normalize dates to start of day to avoid timezone issues
  const normalizeToStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const normalizedStart = normalizeToStartOfDay(startDate);
  const normalizedEnd = normalizeToStartOfDay(endDate);
  const normalizedPeriodStart = normalizeToStartOfDay(periodStart);
  const normalizedPeriodEnd = normalizeToStartOfDay(periodEnd);

  // If assignment is outside the period, return null
  if (normalizedEnd < normalizedPeriodStart || normalizedStart > normalizedPeriodEnd) {
    return null;
  }

  const effectiveStart = normalizedStart < normalizedPeriodStart ? normalizedPeriodStart : normalizedStart;
  const effectiveEnd = normalizedEnd > normalizedPeriodEnd ? normalizedPeriodEnd : normalizedEnd;

  // Calculate day indices
  const startIndex = Math.floor((effectiveStart.getTime() - normalizedPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
  const endIndex = Math.floor((effectiveEnd.getTime() - normalizedPeriodStart.getTime()) / (1000 * 60 * 60 * 24));

  // Ensure indices are within valid range
  const clampedStartIndex = Math.max(0, Math.min(totalDays - 1, startIndex));
  const clampedEndIndex = Math.max(0, Math.min(totalDays - 1, endIndex));

  const left = (clampedStartIndex / totalDays) * 100;
  const width = ((clampedEndIndex - clampedStartIndex + 1) / totalDays) * 100;

  return { left, width };
}

/**
 * Snap a date to the nearest week boundary (Monday)
 */
export function snapToWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Convert a pixel position within a week container to a date
 */
export function pixelToDate(pixelX: number, containerWidth: number, weekDays: WeekDay[]): Date {
  const weekStart = weekDays[0].date;
  const totalDays = 7;
  const pixelsPerDay = containerWidth / totalDays;
  const dayIndex = Math.floor(pixelX / pixelsPerDay);
  const snappedDayIndex = Math.max(0, Math.min(6, dayIndex));
  const targetDate = new Date(weekStart);
  targetDate.setDate(weekStart.getDate() + snappedDayIndex);
  return targetDate;
}

/**
 * Calculate the duration in days from pixel width
 */
export function pixelWidthToDays(pixelWidth: number, containerWidth: number): number {
  const totalDays = 7;
  const pixelsPerDay = containerWidth / totalDays;
  return Math.max(1, Math.round(pixelWidth / pixelsPerDay));
}

/**
 * Get the first Monday of the month containing the given date
 */
export function getFirstMondayOfMonth(date: Date): Date {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate days to add to reach the first Monday
  const daysToAdd = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  return new Date(firstDayOfMonth.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
}

/**
 * Get the last Sunday of the month containing the given date
 */
export function getLastSundayOfMonth(date: Date): Date {
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const dayOfWeek = lastDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // If last day is Sunday, return it
  if (dayOfWeek === 0) {
    return lastDayOfMonth;
  }

  // Otherwise, add days to reach the next Sunday
  const daysToAdd = 7 - dayOfWeek;
  return new Date(lastDayOfMonth.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
}

/**
 * Check if two assignments overlap for the same person
 */
export function assignmentsOverlap(
  assignment1: { startDate: Date; endDate: Date },
  assignment2: { startDate: Date; endDate: Date }
): boolean {
  return assignment1.startDate <= assignment2.endDate && assignment2.startDate <= assignment1.endDate;
}