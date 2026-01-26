import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const gameId = searchParams.get('gameId');

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ tournaments: [] });
    }

    let query = db.collection(COLLECTIONS.TOURNAMENTS)
      .where('status', '==', status)
      .orderBy('startDate', 'desc')
      .limit(50);

    if (gameId) {
      query = query.where('gameId', '==', gameId);
    }

    const snapshot = await query.get();
    const tournaments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ tournaments });
  } catch (error: any) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ tournaments: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, tournamentId, username, ...tournamentData } = await request.json();

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    if (action === 'create') {
      const tournament = {
        name: tournamentData.name,
        gameId: tournamentData.gameId,
        gameMode: tournamentData.gameMode || 'default',
        maxParticipants: tournamentData.maxParticipants || 100,
        participants: [],
        status: 'upcoming',
        startDate: tournamentData.startDate || Date.now(),
        endDate: tournamentData.endDate || Date.now() + (7 * 24 * 60 * 60 * 1000),
        prizePool: tournamentData.prizePool || 0,
        createdBy: username,
        createdAt: Date.now()
      };

      const docRef = db.collection(COLLECTIONS.TOURNAMENTS).doc();
      await setDocument(COLLECTIONS.TOURNAMENTS, docRef.id, tournament);

      return NextResponse.json({ success: true, tournamentId: docRef.id, tournament });
    } else if (action === 'join' && tournamentId && username) {
      const tournament = await getDocument(COLLECTIONS.TOURNAMENTS, tournamentId);
      if (!tournament) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }

      if (tournament.participants?.includes(username)) {
        return NextResponse.json({ success: true, alreadyJoined: true });
      }

      if (tournament.participants?.length >= tournament.maxParticipants) {
        return NextResponse.json({ error: 'Tournament is full' }, { status: 400 });
      }

      const updatedParticipants = [...(tournament.participants || []), username];
      await setDocument(COLLECTIONS.TOURNAMENTS, tournamentId, {
        ...tournament,
        participants: updatedParticipants
      });

      return NextResponse.json({ success: true, participants: updatedParticipants });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error with tournament:', error);
    return NextResponse.json({ error: 'Failed to process tournament action' }, { status: 500 });
  }
}
