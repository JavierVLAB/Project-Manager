import { NextResponse } from 'next/server';
import { syncKimaiProjects, testKimaiConnection } from '@/lib/kimai';

export async function GET() {
  try {
    // Test connection first
    const connectionOk = await testKimaiConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Failed to connect to Kimai database' },
        { status: 500 }
      );
    }

    const projects = await syncKimaiProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching Kimai projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Kimai projects' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Test connection first
    const connectionOk = await testKimaiConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Failed to connect to Kimai database' },
        { status: 500 }
      );
    }

    const projects = await syncKimaiProjects();

    return NextResponse.json({
      success: true,
      syncedProjects: projects.length,
      projects,
    });
  } catch (error) {
    console.error('Error synchronizing Kimai projects:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize Kimai projects' },
      { status: 500 }
    );
  }
}
