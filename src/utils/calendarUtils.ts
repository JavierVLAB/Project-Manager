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
  const weekStart = weekDays[0].date;
  const weekEnd = weekDays[6].date;


  // Normalize dates to start of day to avoid timezone issues
  const normalizeToStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const normalizedStart = normalizeToStartOfDay(startDate);
  const normalizedEnd = normalizeToStartOfDay(endDate);
  const normalizedWeekStart = normalizeToStartOfDay(weekStart);
  const normalizedWeekEnd = normalizeToStartOfDay(weekEnd);

  // If assignment is outside the week, return null
  if (normalizedEnd < normalizedWeekStart || normalizedStart > normalizedWeekEnd) {
    console.log('Assignment outside week range:', {
      startDate: normalizedStart.toISOString().split('T')[0],
      endDate: normalizedEnd.toISOString().split('T')[0],
      weekStart: normalizedWeekStart.toISOString().split('T')[0],
      weekEnd: normalizedWeekEnd.toISOString().split('T')[0],
      startBeforeWeekStart: normalizedStart < normalizedWeekStart,
      endAfterWeekEnd: normalizedEnd > normalizedWeekEnd
    });
    return null;
  }

  const effectiveStart = normalizedStart < normalizedWeekStart ? normalizedWeekStart : normalizedStart;
  const effectiveEnd = normalizedEnd > normalizedWeekEnd ? normalizedWeekEnd : normalizedEnd;

  // Calculate day indices (0-6 for Mon-Sun)
  const startIndex = Math.floor((effectiveStart.getTime() - normalizedWeekStart.getTime()) / (1000 * 60 * 60 * 24));
  const endIndex = Math.floor((effectiveEnd.getTime() - normalizedWeekStart.getTime()) / (1000 * 60 * 60 * 24));

  // Ensure indices are within valid range
  const clampedStartIndex = Math.max(0, Math.min(6, startIndex));
  const clampedEndIndex = Math.max(0, Math.min(6, endIndex));

  const left = (clampedStartIndex / 7) * 100;
  const width = ((clampedEndIndex - clampedStartIndex + 1) / 7) * 100;

  // Debug logging for Monday assignments
  if (clampedStartIndex === 0 || startIndex === 0) {
    console.log('Monday assignment detected:', {
      startDate: effectiveStart.toISOString().split('T')[0],
      endDate: effectiveEnd.toISOString().split('T')[0],
      weekStart: normalizedWeekStart.toISOString().split('T')[0],
      rawStartIndex: startIndex,
      rawEndIndex: endIndex,
      clampedStartIndex,
      clampedEndIndex,
      left,
      width,
      shouldShow: width > 0 && left >= 0 && left < 100
    });
  }

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
 * Check if two assignments overlap for the same person
 */
export function assignmentsOverlap(
  assignment1: { startDate: Date; endDate: Date },
  assignment2: { startDate: Date; endDate: Date }
): boolean {
  return assignment1.startDate <= assignment2.endDate && assignment2.startDate <= assignment1.endDate;
}