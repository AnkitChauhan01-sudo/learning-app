import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasClerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY,
      hasGoogleMaps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  });
}

