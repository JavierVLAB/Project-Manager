const { getISOWeekNumber } = require('./src/utils/calendarUtils');

// Test Feb 9, 2026
const date1 = new Date(2026, 1, 9); // Month is 0-indexed, so 1 is February
console.log('Feb 9, 2026:', getISOWeekNumber(date1)); // Should be 6

// Test Feb 15, 2026
const date2 = new Date(2026, 1, 15);
console.log('Feb 15, 2026:', getISOWeekNumber(date2)); // Should be 7

// Test Jan 5, 2026
const date3 = new Date(2026, 0, 5);
console.log('Jan 5, 2026:', getISOWeekNumber(date3)); // Should be 1
