import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';

const BREAK_DURATION_MS = 30 * 60 * 1000;
const BREAK_REWARD = 35;
const INACTIVITY_STEP_DAYS = 5;
const INACTIVITY_REWARD = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeSafetyData(data: any, username: string, today: string) {
  return {
    username,
    username_lower: username.toLowerCase(),
    safetyPoints: data?.safetyPoints || 0,
    breaksToday: data?.breaksToday || 0,
    playtimeToday: data?.playtimeToday || 0,
    lastResetDate: data?.lastResetDate || today,
    lastBreakTime: data?.lastBreakTime || null,
    lastBreakReminder: data?.lastBreakReminder || null,
    totalPlaytime: data?.totalPlaytime || 0,
    lastActiveAt: data?.lastActiveAt || Date.now(),
    breakInProgress: data?.breakInProgress || false,
    breakStartedAt: data?.breakStartedAt || null,
    breakEndsAt: data?.breakEndsAt || null
  };
}

function applyDailyReset(data: any, today: string) {
  if (data.lastResetDate !== today) {
    return {
      ...data,
      breaksToday: 0,
      playtimeToday: 0,
      lastResetDate: today
    };
  }
  return data;
}

function applyInactivityReward(data: any, now: number) {
  const lastActiveAt = data.lastActiveAt || now;
  const inactiveDays = Math.floor((now - lastActiveAt) / DAY_MS);
  const rewardSteps = Math.floor(inactiveDays / INACTIVITY_STEP_DAYS);
  if (rewardSteps <= 0) {
    return { data, reward: 0 };
  }
  const reward = rewardSteps * INACTIVITY_REWARD;
  return {
    data: {
      ...data,
      safetyPoints: (data.safetyPoints || 0) + reward,
      lastActiveAt: now,
      lastInactivityRewardAt: now
    },
    reward
  };
}

function applyBreakCompletion(data: any, now: number) {
  if (!data.breakInProgress || !data.breakEndsAt || now < data.breakEndsAt) {
    return { data, awarded: false };
  }
  return {
    data: {
      ...data,
      safetyPoints: (data.safetyPoints || 0) + BREAK_REWARD,
      breaksToday: (data.breaksToday || 0) + 1,
      lastBreakTime: now,
      playtimeToday: 0,
      breakInProgress: false,
      breakStartedAt: null,
      breakEndsAt: null,
      lastUpdated: now
    },
    awarded: true
  };
}
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
    const now = Date.now();

    let currentData = normalizeSafetyData(userSafety, username, today);
    let shouldSave = !userSafety;

    const resetData = applyDailyReset(currentData, today);
    if (resetData !== currentData) {
      currentData = resetData;
      shouldSave = true;
    }

    const breakResult = applyBreakCompletion(currentData, now);
    if (breakResult.awarded) {
      currentData = breakResult.data;
      shouldSave = true;
    } else {
      currentData = breakResult.data;
    }

    const inactivityResult = applyInactivityReward(currentData, now);
    if (inactivityResult.reward > 0) {
      currentData = inactivityResult.data;
      shouldSave = true;
    }

    if (shouldSave) {
      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        ...currentData,
        lastUpdated: now
      });
    }

    return NextResponse.json({
      safetyPoints: currentData.safetyPoints || 0,
      breaksToday: currentData.breaksToday || 0,
      lastBreakTime: currentData.lastBreakTime || null,
      playtimeToday: currentData.playtimeToday || 0,
      lastBreakReminder: currentData.lastBreakReminder || null,
      totalPlaytime: currentData.totalPlaytime || 0,
      breakInProgress: currentData.breakInProgress || false,
      breakStartedAt: currentData.breakStartedAt || null,
      breakEndsAt: currentData.breakEndsAt || null,
      breakRemainingMs: currentData.breakInProgress && currentData.breakEndsAt
        ? Math.max(0, currentData.breakEndsAt - now)
        : 0,
      inactivityReward: inactivityResult.reward || 0,
      breakRewarded: breakResult.awarded
    });
  } catch (error: any) {
    console.error('Error fetching safety data:', error);
    return NextResponse.json({ error: 'Failed to fetch safety data' }, { status: 500 });
  }
}

/**
 * POST /api/safety
 * Update playtime, start break timer, or reset break reminder
 * Body: { username, action: 'updatePlaytime'|'startBreak'|'takeBreak'|'dismissReminder'|'updateSafetyPoints', playtime? }
 */
export async function POST(request: NextRequest) {
  try {
    const { username, action, playtime, safetyPoints } = await request.json();

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
    const now = Date.now();
    
    let currentData = normalizeSafetyData(userSafety.exists ? userSafety.data() : null, username, today);
    currentData = applyDailyReset(currentData, today);

    const breakResult = applyBreakCompletion(currentData, now);
    if (breakResult.awarded) {
      currentData = breakResult.data;
    } else {
      currentData = breakResult.data;
    }

    const inactivityResult = applyInactivityReward(currentData, now);
    if (inactivityResult.reward > 0) {
      currentData = inactivityResult.data;
    }

    if (action === 'updatePlaytime') {
      // Update playtime (in milliseconds)
      if (!currentData.breakInProgress) {
        const newPlaytime = (currentData.playtimeToday || 0) + (playtime || 0);
        const newTotalPlaytime = (currentData.totalPlaytime || 0) + (playtime || 0);
        currentData = {
          ...currentData,
          playtimeToday: newPlaytime,
          totalPlaytime: newTotalPlaytime,
          lastActiveAt: now,
          lastUpdated: now
        };
      } else {
        currentData = {
          ...currentData,
          lastActiveAt: now,
          lastUpdated: now
        };
      }

      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), currentData);

      return NextResponse.json({ 
        success: true, 
        playtimeToday: currentData.playtimeToday || 0,
        totalPlaytime: currentData.totalPlaytime || 0,
        needsBreak: (currentData.playtimeToday || 0) >= 3600000,
        breakInProgress: currentData.breakInProgress || false
      });
    } else if (action === 'startBreak' || action === 'takeBreak') {
      if (currentData.breakInProgress && currentData.breakEndsAt && now < currentData.breakEndsAt) {
        return NextResponse.json({
          success: true,
          breakInProgress: true,
          breakEndsAt: currentData.breakEndsAt,
          breakRemainingMs: Math.max(0, currentData.breakEndsAt - now)
        });
      }

      if (currentData.breaksToday >= 3) {
        return NextResponse.json({ 
          success: false, 
          error: 'Maximum breaks per day reached (3)' 
        }, { status: 400 });
      }

      const breakEndsAt = now + BREAK_DURATION_MS;
      currentData = {
        ...currentData,
        breakInProgress: true,
        breakStartedAt: now,
        breakEndsAt,
        lastBreakReminder: now,
        lastUpdated: now
      };

      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), currentData);

      return NextResponse.json({ 
        success: true, 
        breakInProgress: true,
        breakEndsAt,
        breakRemainingMs: BREAK_DURATION_MS
      });
    } else if (action === 'dismissReminder') {
      // Dismiss break reminder (don't award points)
      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        ...currentData,
        lastBreakReminder: now,
        lastUpdated: now
      });

      return NextResponse.json({ success: true });
    } else if (action === 'updateSafetyPoints') {
      // Update safety points (for purchases)
      await setDocument(COLLECTIONS.USER_SAFETY, username.toLowerCase(), {
        ...currentData,
        safetyPoints: safetyPoints || 0,
        lastUpdated: now
      });

      return NextResponse.json({ success: true, safetyPoints: safetyPoints || 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating safety data:', error);
    return NextResponse.json({ error: 'Failed to update safety data' }, { status: 500 });
  }
}
