import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const filters = await prisma.filter.findMany({
      select: {
        id: true,
        name: true,
        personIds: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json({ filters });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, personIds } = await request.json();
    const newFilter = await prisma.filter.create({
      data: {
        name,
        personIds,
      },
    });
    return NextResponse.json(newFilter);
  } catch (error) {
    console.error('Error creating filter:', error);
    return NextResponse.json(
      { error: 'Failed to create filter' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.filter.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter' },
      { status: 500 }
    );
  }
}
