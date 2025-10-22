import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid project name' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'local_permanent', 'projects.csv');
    const newRow = `;${name};;;;;;;\n`;

    await fs.appendFile(csvPath, newRow);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding project to CSV:', error);
    return NextResponse.json({ error: 'Failed to add project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { projects } = await request.json();

    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'Invalid projects data' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'local_permanent', 'projects.csv');
    const csvContent = projects.map(project =>
      `;${project.name};${project.color};;;;;;`
    ).join('\n') + '\n';

    await fs.writeFile(csvPath, csvContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving projects to CSV:', error);
    return NextResponse.json({ error: 'Failed to save projects' }, { status: 500 });
  }
}