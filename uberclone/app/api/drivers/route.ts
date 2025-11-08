import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drivers, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      licenseNumber,
      vehicleModel,
      vehicleColor,
      vehiclePlate,
    } = body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user role to driver
    await db
      .update(users)
      .set({ role: 'driver' })
      .where(eq(users.id, user.id));

    // Check if driver already exists
    const existingDriver = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, user.id))
      .limit(1);

    if (existingDriver.length > 0) {
      const [updatedDriver] = await db
        .update(drivers)
        .set({
          licenseNumber,
          vehicleModel,
          vehicleColor,
          vehiclePlate,
          updatedAt: new Date(),
        })
        .where(eq(drivers.id, existingDriver[0].id))
        .returning();

      return NextResponse.json({ driver: updatedDriver });
    }

    // Create new driver
    const [driver] = await db
      .insert(drivers)
      .values({
        userId: user.id,
        licenseNumber,
        vehicleModel,
        vehicleColor,
        vehiclePlate,
        isAvailable: true,
      })
      .returning();

    return NextResponse.json({ driver });
  } catch (error) {
    console.error('Error creating/updating driver:', error);
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

    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, user.id))
      .limit(1);

    return NextResponse.json({ driver: driver || null });
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

