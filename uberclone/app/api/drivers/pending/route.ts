import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rides } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const pendingRides = await db
      .select()
      .from(rides)
      .where(eq(rides.status, 'pending'))
      .orderBy(rides.createdAt)
      .limit(20);

    return NextResponse.json({ rides: pendingRides });
  } catch (error) {
    console.error('Error fetching pending rides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

