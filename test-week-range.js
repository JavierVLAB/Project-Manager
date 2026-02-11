// Test splitAssignmentIntoWeeks with week range from week 6 to week 9

// Copy of snapToWeek from calendarUtils.ts
function snapToWeek(date) {
  const d = new Date(date.getTime());
  const day = d.getDay(); // Use local time day of week
  
  let diff;
  if (day === 1) {
    // Already Monday
    diff = 0;
  } else if (day === 0) {
    // Sunday, snap back to previous Monday (6 days ago)
    diff = -6;
  } else {
    // Other days, snap to previous Monday (day - 1 days ago)
    diff = 1 - day;
  }
  
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Copy of splitAssignmentIntoWeeks from calendarStore.ts
function splitAssignmentIntoWeeks(assignment) {
  const { startDate, endDate, ...rest } = assignment;
  const weeklyAssignments = [];

  // Normalize input dates to start of day in local time
  const normalizedStart = new Date(startDate.getTime());
  normalizedStart.setHours(0, 0, 0, 0);
  const normalizedEnd = new Date(endDate.getTime());
  normalizedEnd.setHours(0, 0, 0, 0);

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

  // Use the start and end dates as given (they should already be Monday to Sunday from the dialog)
  let currentStart = new Date(normalizedStart);
  const maxIterations = 53; // Maximum number of weeks in a year to prevent infinite loop
  let iterationCount = 0;
  
  while (currentStart <= normalizedEnd && iterationCount < maxIterations) {
    // Create a single week assignment
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);
    currentEnd.setHours(0, 0, 0, 0);

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
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentEnd.getDate() + 1);
    currentStart.setHours(0, 0, 0, 0);
    
    iterationCount++;
  }

  return weeklyAssignments;
}

// Generate week options similar to AddEditAssignmentDialog
function generateWeekOptions() {
  const options = [];
  const today = new Date();
  const currentYear = today.getFullYear();

  // Find the first Monday of the year
  const firstDayOfYear = new Date(currentYear, 0, 1);
  const firstMonday = new Date(firstDayOfYear);
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1);
  }

  for (let weekNumber = 1; weekNumber <= 12; weekNumber++) {
    // Calculate start and end dates for each week (starting on Monday)
    const startDate = new Date(firstMonday);
    startDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(0, 0, 0, 0);

    options.push({
      value: weekNumber.toString(),
      label: `Week ${weekNumber}`,
      startDate,
      endDate,
    });
  }

  return options;
}

// Test the week range from week 6 to week 9
console.log('=== Testing week range from week 6 to week 9 ===');
const weekOptions = generateWeekOptions();
const week6 = weekOptions.find(week => week.value === '6');
const week9 = weekOptions.find(week => week.value === '9');

if (!week6 || !week9) {
  console.error('Could not find week 6 or week 9 in generated options');
  process.exit(1);
}

console.log('Week 6:', week6.startDate.toLocaleDateString(), 'to', week6.endDate.toLocaleDateString());
console.log('Week 9:', week9.startDate.toLocaleDateString(), 'to', week9.endDate.toLocaleDateString());

// Create test assignment
const assignment = {
  personId: '23',
  projectId: '71',
  startDate: week6.startDate,
  endDate: week9.endDate,
  percentage: 50
};

// Split into weekly assignments
const weeklyAssignments = splitAssignmentIntoWeeks(assignment);

console.log('Number of weekly assignments:', weeklyAssignments.length);
console.log('Weekly assignments:');
weeklyAssignments.forEach((a, index) => {
  console.log(`  ${index + 1}. ${a.startDate.toLocaleDateString()} to ${a.endDate.toLocaleDateString()}`);
});
