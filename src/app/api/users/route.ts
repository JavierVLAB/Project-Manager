import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid person name' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'users.csv');
    const newRow = `${name};;0;${';'.repeat(30)}\n`;

    await fs.appendFile(csvPath, newRow);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding person to CSV:', error);
    return NextResponse.json({ error: 'Failed to add person' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!Array.isArray(users)) {
      return NextResponse.json({ error: 'Invalid users data' }, { status: 400 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'users.csv');
    const csvContent = users.map(user =>
      `${user.name};${user.id};0;${';'.repeat(30)}`
    ).join('\n') + '\n';

    await fs.writeFile(csvPath, csvContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving users to CSV:', error);
    return NextResponse.json({ error: 'Failed to save users' }, { status: 500 });
  }
}