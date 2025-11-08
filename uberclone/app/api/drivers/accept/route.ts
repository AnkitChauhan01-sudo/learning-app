import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rides, users, drivers } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { rideId } = body;

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

    // Check if ride exists and is pending
    const [ride] = await db
      .select()
      .from(rides)
      .where(and(eq(rides.id, rideId), eq(rides.status, 'pending')))
      .limit(1);

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found or already accepted' },
        { status: 404 }
      );
    }

    // Update ride with driver and status
    const [updatedRide] = await db
      .update(rides)
      .set({
        driverId: driver.id,
        status: 'accepted',
        updatedAt: new Date(),
      })
      .where(eq(rides.id, rideId))
      .returning();

    // Set driver as unavailable
    await db
      .update(drivers)
      .set({ isAvailable: false })
      .where(eq(drivers.id, driver.id));

    return NextResponse.json({ ride: updatedRide });
  } catch (error) {
    console.error('Error accepting ride:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

