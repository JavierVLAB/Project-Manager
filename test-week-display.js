
// Copy of getISOWeekNumber
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Monday is 1, Sunday is 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Copy of snapToWeek
function snapToWeek(date) {
    const d = new Date(date.getTime());
    const day = d.getDay();
    
    let diff;
    if (day === 1) {
        diff = 0;
    } else if (day === 0) {
        diff = -6;
    } else {
        diff = 1 - day;
    }
    
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    
    return d;
}

// Copy of getWeekDays
function getWeekDays(startDate, weeks = 1) {
    const days = [];
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

// Test with current date (Feb 10, 2026)
const today = new Date(2026, 1, 10);
const selectedWeek = snapToWeek(today);
console.log('Selected week (Monday):', selectedWeek.toISOString().split('T')[0]);
console.log('Week number:', getISOWeekNumber(selectedWeek));

// Get week days for the selected week
const weekDays = getWeekDays(selectedWeek);
console.log('Week days:');
weekDays.forEach(day => {
    console.log(`  ${day.dayName} ${day.dayNumber} (Week ${getISOWeekNumber(day.date)})`);
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
