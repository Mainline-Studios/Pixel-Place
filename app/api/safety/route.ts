import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';

/**
 * GET /api/safety?username=xxx
 * Get user's safety points and break status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({
        safetyPoints: 0,
        breaksToday: 0,
        lastBreakTime: null,
        playtimeToday: 0,
        lastBreakReminder: null
      });
    }

    const userSafety = await getDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase());
    const today = new Date().toDateString();
    
    // Reset daily counters if it's a new day
    if (userSafety?.lastResetDate !== today) {
      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        username,
        username_lower: username.toLowerCase(),
        safetyPoints: userSafety?.safetyPoints || 0,
        breaksToday: 0,
        playtimeToday: 0,
        lastResetDate: today,
        lastBreakTime: null,
        lastBreakReminder: null,
        totalPlaytime: userSafety?.totalPlaytime || 0
      });
      
      return NextResponse.json({
        safetyPoints: userSafety?.safetyPoints || 0,
        breaksToday: 0,
        lastBreakTime: null,
        playtimeToday: 0,
        lastBreakReminder: null,
        totalPlaytime: userSafety?.totalPlaytime || 0
      });
    }

    return NextResponse.json({
      safetyPoints: userSafety?.safetyPoints || 0,
      breaksToday: userSafety?.breaksToday || 0,
      lastBreakTime: userSafety?.lastBreakTime || null,
      playtimeToday: userSafety?.playtimeToday || 0,
      lastBreakReminder: userSafety?.lastBreakReminder || null,
      totalPlaytime: userSafety?.totalPlaytime || 0
    });
  } catch (error: any) {
    console.error('Error fetching safety data:', error);
    return NextResponse.json({ error: 'Failed to fetch safety data' }, { status: 500 });
  }
}

/**
 * POST /api/safety
 * Update playtime, award break points, or reset break reminder
 * Body: { username, action: 'updatePlaytime'|'takeBreak'|'dismissReminder', playtime? }
 */
export async function POST(request: NextRequest) {
  try {
    const { username, action, playtime } = await request.json();

    if (!username || !action) {
      return NextResponse.json({ error: 'Username and action required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const userSafetyRef = db.collection(COLLECTIONS.USER_SAFETY).doc(username.toLowerCase());
    const userSafety = await userSafetyRef.get();
    const today = new Date().toDateString();
    
    let currentData = userSafety.exists ? userSafety.data() : {
      safetyPoints: 0,
      breaksToday: 0,
      playtimeToday: 0,
      lastResetDate: today,
      totalPlaytime: 0
    };

    // Reset daily counters if new day
    if (currentData.lastResetDate !== today) {
      currentData.breaksToday = 0;
      currentData.playtimeToday = 0;
      currentData.lastResetDate = today;
    }

    if (action === 'updatePlaytime') {
      // Update playtime (in milliseconds)
      const newPlaytime = (currentData.playtimeToday || 0) + (playtime || 0);
      const newTotalPlaytime = (currentData.totalPlaytime || 0) + (playtime || 0);
      
      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        username,
        username_lower: username.toLowerCase(),
        ...currentData,
        playtimeToday: newPlaytime,
        totalPlaytime: newTotalPlaytime,
        lastUpdated: Date.now()
      });

      return NextResponse.json({ 
        success: true, 
        playtimeToday: newPlaytime,
        totalPlaytime: newTotalPlaytime,
        needsBreak: newPlaytime >= 3600000 // 1 hour in milliseconds
      });
    } else if (action === 'takeBreak') {
      // Award safety points for taking a break (max 3 per day)
      if (currentData.breaksToday >= 3) {
        return NextResponse.json({ 
          success: false, 
          error: 'Maximum breaks per day reached (3)' 
        }, { status: 400 });
      }

      const now = Date.now();
      // Check if at least 30 minutes have passed since last break
      if (currentData.lastBreakTime && (now - currentData.lastBreakTime) < 30 * 60 * 1000) {
        return NextResponse.json({ 
          success: false, 
          error: 'Please wait 30 minutes between breaks' 
        }, { status: 400 });
      }

      const newSafetyPoints = (currentData.safetyPoints || 0) + 35;
      const newBreaksToday = (currentData.breaksToday || 0) + 1;

      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        username,
        username_lower: username.toLowerCase(),
        ...currentData,
        safetyPoints: newSafetyPoints,
        breaksToday: newBreaksToday,
        lastBreakTime: now,
        playtimeToday: 0, // Reset playtime after break
        lastUpdated: Date.now()
      });

      return NextResponse.json({ 
        success: true, 
        safetyPoints: newSafetyPoints,
        breaksToday: newBreaksToday,
        message: 'Break taken! You earned 35 Safety Points!'
      });
    } else if (action === 'dismissReminder') {
      // Dismiss break reminder (don't award points)
      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        username,
        username_lower: username.toLowerCase(),
        ...currentData,
        lastBreakReminder: Date.now(),
        lastUpdated: Date.now()
      });

      return NextResponse.json({ success: true });
    } else if (action === 'updateSafetyPoints') {
      // Update safety points (for purchases)
      const { safetyPoints } = await request.json();
      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        username,
        username_lower: username.toLowerCase(),
        ...currentData,
        safetyPoints: safetyPoints || 0,
        lastUpdated: Date.now()
      });

      return NextResponse.json({ success: true, safetyPoints });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating safety data:', error);
    return NextResponse.json({ error: 'Failed to update safety data' }, { status: 500 });
  }
}
