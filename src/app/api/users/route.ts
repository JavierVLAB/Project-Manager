import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.person.findMany();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const newUser = await prisma.person.create({
      data: { name },
    });
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { users } = await request.json();
    await prisma.person.deleteMany();
    const createdUsers = await prisma.person.createMany({
      data: users.map((user: any) => ({
        id: user.id,
        name: user.name,
        enabled: user.enabled !== undefined ? user.enabled : true,
      })),
    });
    return NextResponse.json({ success: true, count: createdUsers.count });
  } catch (error) {
    console.error('Error updating users:', error);
    return NextResponse.json(
      { error: 'Failed to update users' },
      { status: 500 }
    );
  }
}
