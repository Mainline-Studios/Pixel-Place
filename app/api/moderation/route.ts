/**
 * Moderation API Endpoint
 * 
 * Provides content moderation and AI training capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPyxInstance } from '@/lib/pyxModeration';
import { checkContent } from '@/lib/moderateContent';
import { MODERATION_CONFIG } from '@/lib/moderationConfig';

/**
 * POST /api/moderation
 * Score content using Pyx AI
 * 
 * Request: { text: string, context?: string }
 * Response: { safe: boolean, score: number, severity: string, blocked: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Check content (without issuing warnings)
    const result = await checkContent(text);
    
    return NextResponse.json({
      safe: result.safe,
      score: result.score,
      severity: result.severity || 'none',
      blocked: !result.safe,
      threshold: MODERATION_CONFIG.BAN_LINE,
      context: context || 'unknown'
    });
    
  } catch (error: any) {
    console.error('Error in moderation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/moderation
 * Get moderation system stats
 */
export async function GET(request: NextRequest) {
  try {
    const pyx = await getPyxInstance();
    const stats = pyx.getStats();
    
    return NextResponse.json({
      stats,
      config: {
        banLine: MODERATION_CONFIG.BAN_LINE,
        warningThreshold: MODERATION_CONFIG.WARNING_THRESHOLD_PER_MONTH,
        enabled: MODERATION_CONFIG.ENABLE_MODERATION
      }
    });
    
  } catch (error: any) {
    console.error('Error getting moderation stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
