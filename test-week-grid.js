
const { getWeekDays, snapToWeek, getISOWeekNumber } = require('./src/utils/calendarUtils');

// Test with current date (Feb 10, 2026)
const today = new Date(2026, 1, 10);
const selectedWeek = snapToWeek(today);
console.log('Selected week (Monday):', selectedWeek.toISOString().split('T')[0]);
console.log('Week number:', getISOWeekNumber(selectedWeek));

// Get week days for the selected week
const weekDays = getWeekDays(selectedWeek);
console.log('Week days:');
weekDays.forEach(day => {
  console.log(`  ${day.dayName} ${day.dayNumber} (${getISOWeekNumber(day.date)})`);
});

// Calculate week 6
const week1Monday = new Date(2025, 11, 28); // Week 1 starts on Dec 28, 2025
const week6Start = new Date(week1Monday);
week6Start.setDate(week1Monday.getDate() + (6 - 1) * 7);
const week6End = new Date(week6Start);
week6End.setDate(week6Start.getDate() + 6);
console.log('\nWeek 6:', week6Start.toISOString().split('T')[0], 'to', week6End.toISOString().split('T')[0]);

// Check Feb 9, 2026
const feb9 = new Date(2026, 1, 9);
console.log('\nFeb 9, 2026 week number:', getISOWeekNumber(feb9));

// Check Feb 8, 2026
const feb8 = new Date(2026, 1, 8);
console.log('Feb 8, 2026 week number:', getISOWeekNumber(feb8));
