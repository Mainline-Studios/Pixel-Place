import { NextResponse } from 'next/server';

// Static placeholder for build. Production uses Cloud Functions at apiUrl('/api/...').
export async function GET() {
  return NextResponse.json([]);
}
