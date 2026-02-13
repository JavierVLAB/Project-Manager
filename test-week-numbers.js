// Test script to see week numbers and dates in dialog
const options = [];
const today = new Date();
const currentYear = today.getFullYear();

console.log(`Testing for year: ${currentYear}`);
console.log(`Today: ${today.toLocaleDateString()} (Day: ${today.getDay()})`);

// Find the first Monday of the year
const firstDayOfYear = new Date(currentYear, 0, 1);
const firstMonday = new Date(firstDayOfYear);
while (firstMonday.getDay() !== 1) {
  firstMonday.setDate(firstMonday.getDate() + 1);
}

console.log(`First Monday: ${firstMonday.toLocaleDateString()}`);

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

console.log('Generated week options:');
options.forEach(option => {
  console.log(`Week ${option.value}: ${option.startDate.toLocaleDateString()} to ${option.endDate.toLocaleDateString()}`);
});
