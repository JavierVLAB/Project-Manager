// Test snapToWeek function
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

// Test with Monday
console.log('=== Test with Monday (2026-02-02) ===');
const date1 = new Date('2026-02-02'); // Monday (day 1)
const result1 = snapToWeek(date1);
console.log('Original date:', date1.toISOString().split('T')[0]);
console.log('Snapped date:', result1.toISOString().split('T')[0]);
console.log('Snapped day of week:', result1.getUTCDay()); // Should be 1 (Monday)

// Test with Tuesday
console.log('\n=== Test with Tuesday (2026-02-03) ===');
const date2 = new Date('2026-02-03'); // Tuesday (day 2)
const result2 = snapToWeek(date2);
console.log('Original date:', date2.toISOString().split('T')[0]);
console.log('Snapped date:', result2.toISOString().split('T')[0]);
console.log('Snapped day of week:', result2.getUTCDay()); // Should be 1 (Monday)

// Test with Sunday
console.log('\n=== Test with Sunday (2026-02-08) ===');
const date3 = new Date('2026-02-08'); // Sunday (day 0)
const result3 = snapToWeek(date3);
console.log('Original date:', date3.toISOString().split('T')[0]);
console.log('Snapped date:', result3.toISOString().split('T')[0]);
console.log('Snapped day of week:', result3.getUTCDay()); // Should be 1 (Monday)
