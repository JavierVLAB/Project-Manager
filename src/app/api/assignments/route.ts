import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: { person: true, project: true },
    });
    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { personId, projectId, startDate, endDate, percentage } = await request.json();
    
    // Parse dates and normalize to UTC start of day (00:00:00)
    const startDateObj = new Date(startDate);
    const normalizedStartDate = new Date(Date.UTC(
      startDateObj.getUTCFullYear(),
      startDateObj.getUTCMonth(),
      startDateObj.getUTCDate(),
      0, 0, 0, 0
    ));
    
    const endDateObj = new Date(endDate);
    const normalizedEndDate = new Date(Date.UTC(
      endDateObj.getUTCFullYear(),
      endDateObj.getUTCMonth(),
      endDateObj.getUTCDate(),
      0, 0, 0, 0
    ));
    
    const newAssignment = await prisma.assignment.create({
      data: {
        personId,
        projectId,
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        percentage,
      },
    });
    return NextResponse.json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { assignments } = await request.json();
    await prisma.assignment.deleteMany();
    const createdAssignments = await prisma.assignment.createMany({
      data: assignments.map((assignment: {
        id: string;
        personId: string;
        projectId: string;
        startDate: string;
        endDate: string;
        percentage: number;
        layer?: number;
      }) => ({
        id: assignment.id,
        personId: assignment.personId,
        projectId: assignment.projectId,
        startDate: new Date(assignment.startDate),
        endDate: new Date(assignment.endDate),
        percentage: assignment.percentage,
        layer: assignment.layer,
      })),
    });
    return NextResponse.json({ success: true, count: createdAssignments.count });
  } catch (error) {
    console.error('Error updating assignments:', error);
    return NextResponse.json(
      { error: 'Failed to update assignments' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.assignment.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
