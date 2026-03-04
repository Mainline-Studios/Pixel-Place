export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ notifications: [] });
    }

    let query = db.collection(COLLECTIONS.NOTIFICATIONS)
      .where('username', '==', username)
      .orderBy('timestamp', 'desc')
      .limit(100);

    if (unreadOnly) {
      query = query.where('read', '==', false);
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, username, notificationId, ...notificationData } = await request.json();

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    if (action === 'create') {
      // Create new notification
      const notification = {
        username,
        username_lower: username.toLowerCase(),
        type: notificationData.type, // 'friend_request', 'achievement', 'tournament', 'message', etc.
        title: notificationData.title,
        message: notificationData.message,
        link: notificationData.link || null,
        read: false,
        timestamp: Date.now()
      };

      const docRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
      await setDocument(COLLECTIONS.NOTIFICATIONS, docRef.id, notification);

      return NextResponse.json({ success: true, notification });
    } else if (action === 'markRead' && notificationId) {
      // Mark notification as read
      const notification = await getDocument(COLLECTIONS.NOTIFICATIONS, notificationId);
      if (notification) {
        await setDocument(COLLECTIONS.NOTIFICATIONS, notificationId, {
          ...notification,
          read: true,
          readAt: Date.now()
        });
      }
      return NextResponse.json({ success: true });
    } else if (action === 'markAllRead' && username) {
      // Mark all notifications as read for user
      const notificationsRef = db.collection(COLLECTIONS.NOTIFICATIONS)
        .where('username', '==', username)
        .where('read', '==', false);
      
      const snapshot = await notificationsRef.get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true, readAt: Date.now() });
      });
      await batch.commit();

      return NextResponse.json({ success: true, updated: snapshot.docs.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error with notifications:', error);
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
