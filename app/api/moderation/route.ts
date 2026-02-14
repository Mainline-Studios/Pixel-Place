import { NextRequest, NextResponse } from 'next/server';
import { moderateContent } from '@/lib/moderation';

/**
 * POST /api/moderation - Check content for violations
 */
export async function POST(request: NextRequest) {
  try {
    const { message, username, context } = await request.json();

    if (!message || !username) {
      return NextResponse.json(
        { error: 'Message and username are required' },
        { status: 400 }
      );
    }

    const result = await moderateContent(message, username, context || 'unknown');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in moderation API:', error);
    return NextResponse.json(
      { error: 'Failed to moderate content', details: error.message },
      { status: 500 }
    );
  }
}
