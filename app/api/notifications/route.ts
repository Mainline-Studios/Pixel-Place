export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    const usernameParam = searchParams.get('username') || '';
    const username = usernameParam || auth.user.username;

    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'head_admin';
    if (!isAdmin && usernameParam && usernameParam.toLowerCase() !== auth.user.username.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

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
    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'head_admin';
    const requesterLower = auth.user.username.toLowerCase();

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    if (action === 'create') {
      if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });
      if (!isAdmin && username.toLowerCase() !== requesterLower) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
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
        const notifUsernameLower = (notification.username_lower || notification.username || '').toLowerCase();
        if (!isAdmin && notifUsernameLower && notifUsernameLower !== requesterLower) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await setDocument(COLLECTIONS.NOTIFICATIONS, notificationId, {
          ...notification,
          read: true,
          readAt: Date.now()
        });
      }
      return NextResponse.json({ success: true });
    } else if (action === 'markAllRead' && username) {
      if (!isAdmin && username.toLowerCase() !== requesterLower) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
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
