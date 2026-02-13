import { NextResponse } from 'next/server';
import { getKimaiUsers, syncKimaiUsers, testKimaiConnection } from '@/lib/kimai';
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

    const users = await getKimaiUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching Kimai users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Kimai users' },
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

    const kimaiUsers = await syncKimaiUsers();

    // Synchronize with local database
    const existingUsers = await prisma.person.findMany();
    const existingUserIds = existingUsers.map(user => user.id);

    const usersToCreate = kimaiUsers.filter(user => !existingUserIds.includes(user.id));
    const usersToUpdate = kimaiUsers.filter(user => existingUserIds.includes(user.id));

    // Create new users
    if (usersToCreate.length > 0) {
      await prisma.person.createMany({
        data: usersToCreate,
      });
    }

     // Update existing users
      for (const user of usersToUpdate) {
        await prisma.person.update({
          where: { id: user.id },
          data: {
            name: user.name,
            enabled: user.enabled,
          },
        });
      }

    return NextResponse.json({
      success: true,
      syncedUsers: kimaiUsers.length,
      createdUsers: usersToCreate.length,
      updatedUsers: usersToUpdate.length,
      users: kimaiUsers,
    });
  } catch (error) {
    console.error('Error synchronizing Kimai users:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize Kimai users' },
      { status: 500 }
    );
  }
}
