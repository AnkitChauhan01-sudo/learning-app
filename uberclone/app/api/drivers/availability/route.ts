import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drivers, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isAvailable } = body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, user.id))
      .limit(1);

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const [updatedDriver] = await db
      .update(drivers)
      .set({
        isAvailable,
        updatedAt: new Date(),
      })
      .where(eq(drivers.id, driver.id))
      .returning();

    return NextResponse.json({ driver: updatedDriver });
  } catch (error) {
    console.error('Error updating driver availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

