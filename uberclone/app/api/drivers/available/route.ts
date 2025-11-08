import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drivers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const availableDrivers = await db
      .select()
      .from(drivers)
      .where(eq(drivers.isAvailable, true))
      .limit(20);

    return NextResponse.json({ drivers: availableDrivers });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

