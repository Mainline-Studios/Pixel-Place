/**
 * Moderation Training API Endpoint
 * 
 * Allows admins to train Pyx AI on new examples
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPyxInstance } from '@/lib/pyxModeration';
import { ADMIN_ACCOUNTS_LIST } from '@/lib/storage';

/**
 * POST /api/moderation/train
 * Train Pyx AI on a new example (admin only)
 * 
 * Request: { text: string, safe: boolean, category?: string, username: string }
 * Response: { success: boolean, newScore: number, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { text, safe, category, username } = await request.json();
    
    // Verify admin credentials
    if (!username) {
      return NextResponse.json(
        { error: 'Username required for authentication' },
        { status: 401 }
      );
    }
    
    const isAdmin = ADMIN_ACCOUNTS_LIST.some(
      admin => admin.username.toLowerCase() === username.toLowerCase()
    );
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    if (typeof safe !== 'boolean') {
      return NextResponse.json(
        { error: 'Safe parameter must be a boolean' },
        { status: 400 }
      );
    }
    
    // Train the AI
    const pyx = await getPyxInstance();
    const newScore = await pyx.train(
      text,
      safe,
      category || 'phrases',
      5 // 5 epochs
    );
    
    return NextResponse.json({
      success: true,
      newScore,
      message: `Trained on "${text}" as ${safe ? 'SAFE' : 'INAPPROPRIATE'} (new score: ${newScore.toFixed(3)})`
    });
    
  } catch (error: any) {
    console.error('Error in training endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
