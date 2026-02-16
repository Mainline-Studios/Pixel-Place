/**
 * Warnings API Endpoint
 * 
 * Manage content moderation warnings
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserWarnings,
  getAllWarnings,
  removeWarning,
  getWarningStats,
  issueWarning
} from '@/lib/warnings';
import { ADMIN_ACCOUNTS_LIST } from '@/lib/storage';

/**
 * GET /api/warnings?username=X
 * Get warnings for a specific user or all warnings (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const isAdmin = searchParams.get('admin');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (username) {
      // Get warnings for specific user
      const warnings = await getUserWarnings(username, limit);
      const stats = await getWarningStats(username);
      
      return NextResponse.json({
        warnings,
        stats,
        username
      });
    } else if (isAdmin === 'true') {
      // Get all warnings (admin only)
      const warnings = await getAllWarnings(limit);
      
      return NextResponse.json({
        warnings,
        total: warnings.length
      });
    } else {
      return NextResponse.json(
        { error: 'Username parameter required' },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Error fetching warnings:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/warnings
 * Issue a warning (internal use by moderation system)
 */
export async function POST(request: NextRequest) {
  try {
    const { username, message, score, context } = await request.json();
    
    if (!username || !message || typeof score !== 'number' || !context) {
      return NextResponse.json(
        { error: 'Username, message, score, and context are required' },
        { status: 400 }
      );
    }
    
    const warning = await issueWarning(username, message, score, context);
    
    return NextResponse.json({
      success: true,
      warning
    });
    
  } catch (error: any) {
    console.error('Error issuing warning:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/warnings?id=X
 * Remove a warning (admin only)
 * 
 * NOTE: Authentication uses username verification against hardcoded list for consistency
 * with existing codebase. Production systems should use proper JWT/session authentication.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warningId = searchParams.get('id');
    const adminUsername = searchParams.get('admin');
    
    if (!warningId) {
      return NextResponse.json(
        { error: 'Warning ID required' },
        { status: 400 }
      );
    }
    
    // Verify admin
    if (!adminUsername) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }
    
    const isAdmin = ADMIN_ACCOUNTS_LIST.some(
      admin => admin.username.toLowerCase() === adminUsername.toLowerCase()
    );
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    await removeWarning(warningId);
    
    return NextResponse.json({
      success: true,
      message: 'Warning removed'
    });
    
  } catch (error: any) {
    console.error('Error removing warning:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
