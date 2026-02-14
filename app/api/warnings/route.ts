import { NextRequest, NextResponse } from 'next/server';
import {
  getAllWarnings,
  getAllWarningsForUser,
  getWarningsForUserInMonth,
  deleteWarning,
  getWarningStats
} from '@/lib/warnings';

/**
 * GET /api/warnings - Get warnings
 * Query params:
 * - username: Get warnings for specific user
 * - month: Filter by month (YYYY-MM format)
 * - stats: Get statistics (pass stats=true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const month = searchParams.get('month');
    const getStats = searchParams.get('stats') === 'true';

    if (getStats) {
      const stats = await getWarningStats();
      return NextResponse.json(stats);
    }

    if (username) {
      if (month) {
        const warnings = await getWarningsForUserInMonth(username, month);
        return NextResponse.json(warnings);
      } else {
        const warnings = await getAllWarningsForUser(username);
        return NextResponse.json(warnings);
      }
    }

    // Get all warnings
    const limit = parseInt(searchParams.get('limit') || '100');
    const warnings = await getAllWarnings(limit);
    return NextResponse.json(warnings);
  } catch (error: any) {
    console.error('Error getting warnings:', error);
    return NextResponse.json(
      { error: 'Failed to get warnings', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/warnings - Delete a warning
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Warning ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteWarning(id);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete warning' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting warning:', error);
    return NextResponse.json(
      { error: 'Failed to delete warning', details: error.message },
      { status: 500 }
    );
  }
}
