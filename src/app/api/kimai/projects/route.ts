import { NextResponse } from 'next/server';
import { getKimaiProjects, syncKimaiProjects, testKimaiConnection } from '@/lib/kimai';
import { prisma } from '@/lib/prisma';

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

    const projects = await getKimaiProjects();
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

    const kimaiProjects = await syncKimaiProjects();

    // Synchronize with local database
    const existingProjects = await prisma.project.findMany();
    const existingProjectIds = existingProjects.map(project => project.id);

    const projectsToCreate = kimaiProjects.filter(project => !existingProjectIds.includes(project.id));
    const projectsToUpdate = kimaiProjects.filter(project => existingProjectIds.includes(project.id));

    // Create new projects
    if (projectsToCreate.length > 0) {
      await prisma.project.createMany({
        data: projectsToCreate.map(project => ({
          id: project.id,
          name: project.name,
          color: project.color,
        })),
      });
    }

    // Update existing projects
    for (const project of projectsToUpdate) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          name: project.name,
          color: project.color,
        },
      });
    }

    return NextResponse.json({
      success: true,
      syncedProjects: kimaiProjects.length,
      createdProjects: projectsToCreate.length,
      updatedProjects: projectsToUpdate.length,
      projects: kimaiProjects,
    });
  } catch (error) {
    console.error('Error synchronizing Kimai projects:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize Kimai projects' },
      { status: 500 }
    );
  }
}
