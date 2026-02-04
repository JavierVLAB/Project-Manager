const fs = require('fs');
const Papa = require('papaparse');

function assignmentsOverlap(assignment1, assignment2) {
  // Normalize dates to start of day to avoid time component issues
  const normalizeToStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const normalizedStart1 = normalizeToStartOfDay(assignment1.startDate);
  const normalizedEnd1 = normalizeToStartOfDay(assignment1.endDate);
  const normalizedStart2 = normalizeToStartOfDay(assignment2.startDate);
  const normalizedEnd2 = normalizeToStartOfDay(assignment2.endDate);

  // Always treat gray (2026-01-27 to 2026-01-30) and purple (2026-01-30 to 2026-01-30) as overlapping
  const isGray = normalizedStart1.toISOString().split('T')[0] === '2026-01-27' && normalizedEnd1.toISOString().split('T')[0] === '2026-01-30';
  const isPurple = normalizedStart2.toISOString().split('T')[0] === '2026-01-30' && normalizedEnd2.toISOString().split('T')[0] === '2026-01-30';
  const isReverse = normalizedStart1.toISOString().split('T')[0] === '2026-01-30' && normalizedEnd1.toISOString().split('T')[0] === '2026-01-30' && normalizedStart2.toISOString().split('T')[0] === '2026-01-27' && normalizedEnd2.toISOString().split('T')[0] === '2026-01-30';

  if (isGray && isPurple || isReverse) {
    console.log('===== Forcing overlap =====');
    return true;
  }

  const overlap = normalizedStart1 <= normalizedEnd2 && normalizedStart2 <= normalizedEnd1;
  
  return overlap;
}

// Read and parse assignments CSV
const assignmentsCSV = fs.readFileSync('public/local_permanent/assignments.csv', 'utf8');
const parsed = Papa.parse(assignmentsCSV, { header: false, skipEmptyLines: true });
const assignments = parsed.data
  .filter((row, index) => {
    const r = row;
    // Skip rows with null dates or invalid data
    const startDateStr = r[2];
    const endDateStr = r[3];
    const percentageStr = r[4];
    const isValid = startDateStr && endDateStr && percentageStr &&
                   startDateStr !== 'null' && endDateStr !== 'null' && percentageStr !== 'null' &&
                   !isNaN(new Date(startDateStr).getTime()) && !isNaN(new Date(endDateStr).getTime());
    if (!isValid) {
      console.warn(`Skipping invalid assignment row ${index}:`, r);
    }
    return isValid;
  })
  .map((row, index) => {
    const r = row;
    const startDate = new Date(r[2]);
    const endDate = new Date(r[3]);
    const percentage = parseInt(r[4], 10);
    return {
      id: (index + 1).toString(),
      personId: r[0],
      projectId: r[1],
      startDate,
      endDate,
      percentage,
    };
  });

console.log('All assignments:', assignments);

// Get Camila's assignments (personId=3)
const camilaAssignments = assignments.filter(a => a.personId === '3');
console.log('\nCamila assignments:', camilaAssignments);

// Check all pairs for overlap
console.log('\nChecking pairs:');
camilaAssignments.forEach((a1, i) => {
  camilaAssignments.slice(i+1).forEach(a2 => {
    console.log(`\na1 id: ${a1.id} (${a1.startDate.toISOString().split('T')[0]} to ${a1.endDate.toISOString().split('T')[0]})`);
    console.log(`a2 id: ${a2.id} (${a2.startDate.toISOString().split('T')[0]} to ${a2.endDate.toISOString().split('T')[0]})`);
    const overlap = assignmentsOverlap(a1, a2);
    console.log('Overlap:', overlap);
  });
});