export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument, queryDocuments } from '@/lib/firestore';

/**
 * GET /api/challenges?username=xxx&type=daily|weekly
 * Get challenges for a user or available challenges
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const type = searchParams.get('type') || 'daily';

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ challenges: [] });
    }

    if (username) {
      // Get user's challenge progress
      const userChallenges = await getDocument(COLLECTIONS.USER_CHALLENGES, username.toLowerCase());
      const challenges = userChallenges?.challenges || [];
      
      // Filter by type
      const filtered = challenges.filter((c: any) => c.type === type);
      
      return NextResponse.json({
        username,
        challenges: filtered,
        completedCount: filtered.filter((c: any) => c.completed).length
      });
    }

    // Get available challenges
    const availableChallenges = await queryDocuments(COLLECTIONS.CHALLENGES_MASTER, 'type', '==', type);
    return NextResponse.json({ challenges: availableChallenges, type });
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ challenges: [] });
  }
}

/**
 * POST /api/challenges
 * Update challenge progress or complete a challenge
 * Body: { username, challengeId, progress?, completed? }
 */
export async function POST(request: NextRequest) {
  try {
    const { username, challengeId, progress, completed } = await request.json();

    if (!username || !challengeId) {
      return NextResponse.json({ error: 'Username and challengeId required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const userChallengesRef = db.collection(COLLECTIONS.USER_CHALLENGES).doc(username.toLowerCase());
    const userChallenges = await userChallengesRef.get();
    
    const currentData = userChallenges.exists ? userChallenges.data() : { challenges: [] };
    const challenges = currentData.challenges || [];

    let challengeIndex = challenges.findIndex((c: any) => c.id === challengeId);
    
    if (challengeIndex === -1) {
      // New challenge - get master data
      const challengeMaster = await getDocument(COLLECTIONS.CHALLENGES_MASTER, challengeId);
      if (!challengeMaster) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
      }

      challenges.push({
        id: challengeId,
        name: challengeMaster.name,
        description: challengeMaster.description,
        type: challengeMaster.type,
        target: challengeMaster.target,
        reward: challengeMaster.reward,
        progress: progress || 0,
        completed: completed || false,
        startedAt: Date.now()
      });
      challengeIndex = challenges.length - 1;
    } else {
      // Update existing challenge
      if (progress !== undefined) {
        challenges[challengeIndex].progress = progress;
      }
      if (completed !== undefined) {
        challenges[challengeIndex].completed = completed;
        if (completed) {
          challenges[challengeIndex].completedAt = Date.now();
        }
      }
    }

    await setDocument(COLLECTIONS.USER_CHALLENGES, username.toLowerCase(), {
      username,
      username_lower: username.toLowerCase(),
      challenges,
      lastUpdated: Date.now()
    });

    return NextResponse.json({ success: true, challenge: challenges[challengeIndex] });
  } catch (error: any) {
    console.error('Error updating challenge:', error);
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
  }
}
