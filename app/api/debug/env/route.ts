import { NextResponse } from 'next/server';

export async function GET() {
  // Only return debug info in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    // Core site configuration
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? '✓ Set' : '✗ Missing',

    // Database configuration
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',

    // AI Image Generation
    NEXT_PUBLIC_APICORE_TOKEN: process.env.NEXT_PUBLIC_APICORE_TOKEN ? '✓ Set' : '✗ Missing',
  };

  return NextResponse.json({ envStatus });
}