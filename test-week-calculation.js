
// Test week calculation
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Monday is 1, Sunday is 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Test week 1 calculation
const currentYear = 2026;
const jan4 = new Date(currentYear, 0, 4);
const dayNum = jan4.getDay() || 7; // Monday is 1, Sunday is 7
const week1Monday = new Date(jan4);
week1Monday.setDate(jan4.getDate() - (dayNum - 1));
week1Monday.setHours(0, 0, 0, 0);

console.log('Week 1 Monday:', week1Monday.toISOString().split('T')[0]);

// Calculate week 6 dates
const week6Start = new Date(week1Monday);
week6Start.setDate(week1Monday.getDate() + (6 - 1) * 7);
const week6End = new Date(week6Start);
week6End.setDate(week6Start.getDate() + 6);

console.log('Week 6:');
console.log('  Start:', week6Start.toISOString().split('T')[0]);
console.log('  End:', week6End.toISOString().split('T')[0]);

// Check what week number Feb 9, 2026 is
const feb9 = new Date(2026, 1, 9);
console.log('Feb 9, 2026 week number:', getISOWeekNumber(feb9));

// Check what week number Feb 8, 2026 is
const feb8 = new Date(2026, 1, 8);
console.log('Feb 8, 2026 week number:', getISOWeekNumber(feb8));
