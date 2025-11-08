import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rides, users, drivers } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const driverRides = await db
      .select({
        ride: rides,
        rider: users,
      })
      .from(rides)
      .leftJoin(users, eq(rides.riderId, users.id))
      .where(eq(rides.driverId, driver.id))
      .orderBy(desc(rides.createdAt))
      .limit(50);

    return NextResponse.json({ rides: driverRides });
  } catch (error) {
    console.error('Error fetching driver rides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

