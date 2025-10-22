import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { personId, projectId, startDate, endDate, percentage } = await request.json();

    if (!personId || !projectId || !startDate || !endDate || typeof percentage !== 'number') {
      return NextResponse.json({ error: 'Invalid assignment data' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'local_permanent', 'assignments.csv');
    const newRow = `${personId};${projectId};${startDate};${endDate};${percentage}\n`;

    await fs.appendFile(csvPath, newRow);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding assignment to CSV:', error);
    return NextResponse.json({ error: 'Failed to add assignment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { assignments } = await request.json();

    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Invalid assignments data' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'assignments.csv');
    const csvContent = assignments.map(assignment =>
      `${assignment.personId};${assignment.projectId};${assignment.startDate};${assignment.endDate};${assignment.percentage}`
    ).join('\n') + '\n';

    await fs.writeFile(csvPath, csvContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving assignments to CSV:', error);
    return NextResponse.json({ error: 'Failed to save assignments' }, { status: 500 });
  }
}