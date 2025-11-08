import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviews, rides, users, drivers } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { rideId, rating, comment } = body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if ride exists and belongs to user
    const [ride] = await db
      .select()
      .from(rides)
      .where(and(eq(rides.id, rideId), eq(rides.riderId, user.id)))
      .limit(1);

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    if (!ride.driverId) {
      return NextResponse.json(
        { error: 'Ride has no driver' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.rideId, rideId))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'Review already exists' },
        { status: 400 }
      );
    }

    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        rideId,
        riderId: user.id,
        driverId: ride.driverId,
        rating,
        comment,
      })
      .returning();

    // Update driver rating
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, ride.driverId))
      .limit(1);

    if (driver) {
      const currentRating = parseFloat(driver.rating || '0');
      const totalRides = driver.totalRides || 0;
      const newRating =
        (currentRating * totalRides + rating) / (totalRides + 1);

      await db
        .update(drivers)
        .set({
          rating: newRating.toFixed(2),
          totalRides: totalRides + 1,
        })
        .where(eq(drivers.id, driver.id));
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rideId = searchParams.get('rideId');

    if (rideId) {
      const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.rideId, rideId))
        .limit(1);

      return NextResponse.json({ review: review || null });
    }

    const allReviews = await db
      .select({
        review: reviews,
        rider: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.riderId, users.id))
      .limit(50);

    return NextResponse.json({ reviews: allReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

