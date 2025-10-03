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