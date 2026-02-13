// Test the splitAssignmentIntoWeeks function directly in JavaScript

// Copy of snapToWeek from calendarUtils.ts
function snapToWeek(date) {
  // Create a new date object to avoid modifying the original
  const d = new Date(date.getTime());
  const day = d.getUTCDay(); // Use UTC day of week to avoid time zone issues
  let diff;
  
  if (day === 1) {
    // Already Monday (UTC)
    diff = 0;
  } else if (day === 0) {
    // Sunday, snap back to previous Monday (6 days ago)
    diff = -6;
  } else {
    // Other days, snap to previous Monday (day - 1 days ago)
    diff = 1 - day;
  }
  
  // Calculate the snapped date in UTC
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  
  return d;
}

function splitAssignmentIntoWeeks(assignment) {
  const { startDate, endDate, ...rest } = assignment;
  const weeklyAssignments = [];

  // Normalize input dates to start of day in UTC
  const normalizedStart = new Date(startDate.getTime());
  normalizedStart.setUTCHours(0, 0, 0, 0);
  const normalizedEnd = new Date(endDate.getTime());
  normalizedEnd.setUTCHours(0, 0, 0, 0);

  // Check if assignment is already a single week
  const durationInDays = Math.ceil((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24));
  if (durationInDays <= 7) {
    weeklyAssignments.push({
      ...rest,
      startDate: normalizedStart,
      endDate: normalizedEnd,
    });
    return weeklyAssignments;
  }

  // Snap start date to nearest Monday using existing snapToWeek function
  let currentStart = snapToWeek(normalizedStart);
  currentStart.setUTCHours(0, 0, 0, 0);

  // Split into weekly segments (Monday to Sunday)
  while (currentStart <= normalizedEnd) {
    // Find the end of the current week (Sunday)
    const currentEnd = new Date(currentStart);
    currentEnd.setUTCDate(currentStart.getUTCDate() + 6); // Add 6 days to get to Sunday
    currentEnd.setUTCHours(0, 0, 0, 0);

    // If the week ends after the assignment's end date, use the assignment's end date
    if (currentEnd > normalizedEnd) {
      currentEnd.setTime(normalizedEnd.getTime());
    }

    // Add the weekly assignment
    weeklyAssignments.push({
      ...rest,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
    });

    // Move to the next week (Monday)
    currentStart.setUTCDate(currentEnd.getUTCDate() + 1);
    currentStart.setUTCHours(0, 0, 0, 0);
  }

  return weeklyAssignments;
}

// Test case 1: 2-week assignment
console.log('=== Test case 1: 2-week assignment ===');
const startDate = new Date('2026-02-02'); // Monday
const endDate = new Date('2026-02-14'); // Sunday (2 weeks later)
const assignment = {
  personId: '1',
  projectId: '2',
  startDate,
  endDate,
  percentage: 50
};

const weeklyAssignments = splitAssignmentIntoWeeks(assignment);
console.log('Number of weekly assignments:', weeklyAssignments.length);
weeklyAssignments.forEach((a, index) => {
  console.log(`Week ${index + 1}: ${a.startDate.toISOString().split('T')[0]} to ${a.endDate.toISOString().split('T')[0]}`);
});

// Test case 2: 3-week assignment
console.log('\n=== Test case 2: 3-week assignment ===');
const startDate2 = new Date('2026-02-02'); // Monday
const endDate2 = new Date('2026-02-21'); // Sunday (3 weeks later)
const assignment2 = {
  personId: '1',
  projectId: '2',
  startDate: startDate2,
  endDate: endDate2,
  percentage: 50
};

const weeklyAssignments2 = splitAssignmentIntoWeeks(assignment2);
console.log('Number of weekly assignments:', weeklyAssignments2.length);
weeklyAssignments2.forEach((a, index) => {
  console.log(`Week ${index + 1}: ${a.startDate.toISOString().split('T')[0]} to ${a.endDate.toISOString().split('T')[0]}`);
});
