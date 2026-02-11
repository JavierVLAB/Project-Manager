const fs = require('fs');
const path = require('path');

// Read the calendarStore.ts file
const calendarStoreContent = fs.readFileSync(
  path.join(__dirname, 'src', 'stores', 'calendarStore.ts'),
  'utf8'
);

// Extract the splitAssignmentIntoWeeks function
const functionMatch = calendarStoreContent.match(/function splitAssignmentIntoWeeks([\s\S]*?)\}/);
if (!functionMatch) {
  console.error('Error: splitAssignmentIntoWeeks function not found');
  process.exit(1);
}

// Clean up and make it executable in Node.js
let functionCode = functionMatch[0];

// Replace TypeScript types with JavaScript
functionCode = functionCode
  .replace(/Omit<Assignment, 'id'>/g, 'Object')
  .replace(/: Date/g, '')
  .replace(/: number/g, '')
  .replace(/: boolean/g, '')
  .replace(/: unknown/g, '')
  .replace(/: any/g, '')
  .replace(/\.\.\.rest/g, '')
  .replace(/interface.*?\{[\s\S]*?\}/g, '')
  .replace(/type.*?=/g, '')
  .trim();

// Create a test script
const testScript = `
${functionCode}

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
  console.log(\`Week \${index + 1}: \${a.startDate.toISOString().split('T')[0]} to \${a.endDate.toISOString().split('T')[0]}\`);
});

// Test case 2: 3-week assignment
console.log('\\n=== Test case 2: 3-week assignment ===');
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
  console.log(\`Week \${index + 1}: \${a.startDate.toISOString().split('T')[0]} to \${a.endDate.toISOString().split('T')[0]}\`);
});
`;

// Write to test file
fs.writeFileSync(path.join(__dirname, 'test-split-assignment-run.js'), testScript);

// Execute the test
console.log('Executing test script...');
const { execSync } = require('child_process');
try {
  const output = execSync('node test-split-assignment-run.js');
  console.log(output.toString());
} catch (error) {
  console.error('Error executing test script:', error.stderr.toString());
}

// Clean up temp file
fs.unlinkSync(path.join(__dirname, 'test-split-assignment-run.js'));
