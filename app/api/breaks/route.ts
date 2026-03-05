export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';

/**
 * GET /api/breaks?username=xxx
 * Get break status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const user = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    // Reset daily counters if it's a new day
    const lastBreakTime = user.lastBreakTime || 0;
    const breaksTakenToday = (lastBreakTime >= todayStart) ? (user.breaksTakenToday || 0) : 0;
    const playtimeToday = (user.sessionStartTime && user.sessionStartTime >= todayStart) 
      ? (user.playtimeToday || 0) + (now - (user.sessionStartTime || now))
      : (user.playtimeToday || 0);

    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const needsBreak = playtimeToday >= oneHour && breaksTakenToday < 3;
    const canEarnPoints = breaksTakenToday < 3;

    return NextResponse.json({
      username,
      playtimeToday,
      breaksTakenToday,
      needsBreak,
      canEarnPoints,
      safetyPoints: user.safetyPoints || 0,
      timeUntilBreak: needsBreak ? 0 : Math.max(0, oneHour - playtimeToday)
    });
  } catch (error: any) {
    console.error('Error fetching break status:', error);
    return NextResponse.json({ error: 'Failed to fetch break status' }, { status: 500 });
  }
}

/**
 * POST /api/breaks
 * Take a break and earn Safety Points
 * Body: { username, breakDuration? }
 */
export async function POST(request: NextRequest) {
  try {
    const { username, breakDuration } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const user = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const lastBreakTime = user.lastBreakTime || 0;
    
    // Reset if new day
    const breaksTakenToday = (lastBreakTime >= todayStart) ? (user.breaksTakenToday || 0) : 0;

    if (breaksTakenToday >= 3) {
      return NextResponse.json({ 
        error: 'Maximum breaks per day (3) already taken',
        breaksTakenToday: 3
      }, { status: 400 });
    }

    // Minimum break duration is 30 minutes (in milliseconds)
    const minBreakDuration = 30 * 60 * 1000;
    const actualBreakDuration = breakDuration || minBreakDuration;

    if (actualBreakDuration < minBreakDuration) {
      return NextResponse.json({ 
        error: 'Break must be at least 30 minutes',
        requiredDuration: minBreakDuration
      }, { status: 400 });
    }

    // Award 35 Safety Points
    const currentSafetyPoints = user.safetyPoints || 0;
    const newSafetyPoints = currentSafetyPoints + 35;
    const newBreaksTaken = breaksTakenToday + 1;

    // Update user
    await setDocument(COLLECTIONS.USERS, username.toLowerCase(), {
      ...user,
      safetyPoints: newSafetyPoints,
      breaksTakenToday: newBreaksTaken,
      lastBreakTime: now,
      playtimeToday: 0, // Reset playtime after break
      sessionStartTime: now // Start new session
    });

    return NextResponse.json({
      success: true,
      safetyPointsAwarded: 35,
      totalSafetyPoints: newSafetyPoints,
      breaksTakenToday: newBreaksTaken,
      message: 'Break completed! You earned 35 Safety Points.'
    });
  } catch (error: any) {
    console.error('Error processing break:', error);
    return NextResponse.json({ error: 'Failed to process break' }, { status: 500 });
  }
}
