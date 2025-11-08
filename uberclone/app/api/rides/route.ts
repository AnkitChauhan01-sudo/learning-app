import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rides, users, drivers } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      fare,
      distance,
      duration,
    } = body;

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create ride
    const [ride] = await db
      .insert(rides)
      .values({
        riderId: user.id,
        pickupLat: pickupLat.toString(),
        pickupLng: pickupLng.toString(),
        pickupAddress,
        dropoffLat: dropoffLat.toString(),
        dropoffLng: dropoffLng.toString(),
        dropoffAddress,
        fare: fare?.toString(),
        distance: distance?.toString(),
        duration,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({ ride });
  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const userRides = await db
      .select({
        ride: rides,
        driver: drivers,
      })
      .from(rides)
      .leftJoin(drivers, eq(rides.driverId, drivers.id))
      .where(eq(rides.riderId, user.id))
      .orderBy(desc(rides.createdAt))
      .limit(50);

    return NextResponse.json({ rides: userRides });
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

