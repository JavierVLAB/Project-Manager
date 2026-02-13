// Test script to verify the capacity calculation for Camila (personId: 3)

// Mock the assignments data from CSV
const assignments = [
  { personId: '3', projectId: '7', startDate: new Date('2026-01-27'), endDate: new Date('2026-01-29'), percentage: 40 },
  { personId: '3', projectId: '3', startDate: new Date('2026-01-27'), endDate: new Date('2026-01-30'), percentage: 50 },
  { personId: '3', projectId: '1', startDate: new Date('2026-01-30'), endDate: new Date('2026-01-30'), percentage: 50 }
];

// Normalize dates to ISO midnight (UTC) to avoid time zone issues
const normalizeToStartOfDay = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return d;
};

// Mock selected week (let's assume we're looking at the week of Jan 27th 2026)
// According to snapToWeek function (which uses local time), let's see what the actual week dates would be
// If today is Jan 29th, the week would be Jan 27 - Feb 2
const selectedWeek = new Date('2026-01-27');
const weekEnd = new Date(selectedWeek);
weekEnd.setDate(weekEnd.getDate() + 6); // 1 week - 1 day

const normalizedWeekStart = normalizeToStartOfDay(selectedWeek);
const normalizedWeekEnd = normalizeToStartOfDay(weekEnd);

console.log(`Selected week: ${normalizedWeekStart.toISOString()} to ${normalizedWeekEnd.toISOString()}`);
console.log('Camila\'s assignments:');
assignments.forEach((a, index) => {
  const normStart = normalizeToStartOfDay(a.startDate);
  const normEnd = normalizeToStartOfDay(a.endDate);
  console.log(`  Assignment ${index + 1}: ${normStart.toISOString()} - ${normEnd.toISOString()}, ${a.percentage}%`);
});

// Calculate maximum capacity on any single day of the week
let maxDailyCapacity = 0;
const currentDate = new Date(normalizedWeekStart);

console.log('\nCalculating daily capacities:');
while (currentDate <= normalizedWeekEnd) {
  const dayCapacity = assignments.reduce((sum, assignment) => {
    const normalizedStart = normalizeToStartOfDay(assignment.startDate);
    const normalizedEnd = normalizeToStartOfDay(assignment.endDate);
    
    if (currentDate >= normalizedStart && currentDate <= normalizedEnd) {
      return sum + assignment.percentage;
    }
    
    return sum;
  }, 0);
  
  console.log(`  ${currentDate.toISOString().split('T')[0]}: ${dayCapacity}%`);
  
  if (dayCapacity > maxDailyCapacity) {
    maxDailyCapacity = dayCapacity;
  }
  
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log(`\nMaximum daily capacity: ${maxDailyCapacity}%`);
