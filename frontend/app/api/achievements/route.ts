import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument, queryDocuments } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (username) {
      const userAchievements = await getDocument(COLLECTIONS.ACHIEVEMENTS, username.toLowerCase());
      return NextResponse.json({
        username,
        achievements: userAchievements?.achievements || [],
        totalPoints: userAchievements?.totalPoints || 0,
        unlockedCount: userAchievements?.unlockedCount || 0
      });
    }

    const allAchievements = await queryDocuments(COLLECTIONS.ACHIEVEMENTS_MASTER, 'enabled', '==', true);
    return NextResponse.json({ achievements: allAchievements });
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, achievementId, gameId, score } = await request.json();

    if (!username || !achievementId) {
      return NextResponse.json({ error: 'Username and achievementId required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const userAchievementsRef = db.collection(COLLECTIONS.ACHIEVEMENTS).doc(username.toLowerCase());
    const userAchievements = await userAchievementsRef.get();
    
    const currentData = userAchievements.exists ? userAchievements.data() : { achievements: [], totalPoints: 0 };
    const achievements = currentData.achievements || [];

    if (achievements.find((a: any) => a.id === achievementId)) {
      return NextResponse.json({ success: true, alreadyUnlocked: true });
    }

    const achievementMaster = await getDocument(COLLECTIONS.ACHIEVEMENTS_MASTER, achievementId);
    if (!achievementMaster) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    const newAchievement = {
      id: achievementId,
      name: achievementMaster.name,
      description: achievementMaster.description,
      icon: achievementMaster.icon,
      points: achievementMaster.points,
      rarity: achievementMaster.rarity,
      unlockedAt: Date.now(),
      gameId: gameId || null,
      score: score || null
    };

    achievements.push(newAchievement);
    const totalPoints = (currentData.totalPoints || 0) + achievementMaster.points;

    await setDocument(COLLECTIONS.ACHIEVEMENTS, username.toLowerCase(), {
      username,
      username_lower: username.toLowerCase(),
      achievements,
      totalPoints,
      unlockedCount: achievements.length,
      lastUpdated: Date.now()
    });

    return NextResponse.json({ 
      success: true, 
      achievement: newAchievement,
      totalPoints,
      unlockedCount: achievements.length
    });
  } catch (error: any) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json({ error: 'Failed to unlock achievement' }, { status: 500 });
  }
}
