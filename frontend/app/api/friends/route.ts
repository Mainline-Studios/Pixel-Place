import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, COLLECTIONS, getFirestoreInstance } from '@/lib/firestore';
import { User, FriendRequest } from '@/types';
import { getDb } from '@/lib/db';
import {
  getUserByUsernameFromSqlite,
  persistUserCloudAndLocal,
} from '@/lib/sqliteUserStore';

function userFromDoc(doc: Record<string, unknown> & { id?: string }): User {
  const parseArr = (v: unknown, fb: unknown[]) =>
    Array.isArray(v) ? (v as unknown[]) : typeof v === 'string' ? JSON.parse(v || '[]') : fb;
  return {
    username: (doc.username as string) || (doc.id as string) || '',
    password: (doc.password_hash as string) || (doc.password as string) || '',
    gender: (doc.gender as string) || '',
    role: (doc.role || 'user') as User['role'],
    coins: (doc.coins as number) || 0,
    safetyPoints: typeof doc.safety_points === 'number' ? doc.safety_points : undefined,
    ownedSkins: parseArr(doc.owned_skins, []) as string[],
    equippedSkin: (doc.equipped_skin as string) || '',
    ownedFaces: parseArr(doc.owned_faces, []) as string[],
    equippedFace: doc.equipped_face as string | undefined,
    ownedAccessories: parseArr(doc.owned_accessories, []) as string[],
    equippedAccessories: (() => {
      const v = doc.equipped_accessories;
      if (Array.isArray(v)) return v as string[];
      if (v && typeof v === 'object') return v as Record<string, string>;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v) as string[] | Record<string, string>;
        } catch {
          return [];
        }
      }
      return [];
    })(),
    ownedServers: parseArr(doc.owned_servers, []) as string[],
    friends: parseArr(doc.friends, []) as string[],
    friendRequests: parseArr(doc.friend_requests, []) as FriendRequest[],
    sentFriendRequests: parseArr(doc.sent_friend_requests, []) as string[],
  };
}

function friendRequestFromDoc(doc: Record<string, unknown>): FriendRequest {
  return {
    from: doc.from_username as string,
    to: doc.to_username as string,
    timestamp: (doc.created_at as number) || Date.now(),
    status: (doc.status as FriendRequest['status']) || 'pending',
  };
}

function normalizeReqTime(t: number): number {
  if (!t) return Date.now();
  return t < 1e12 ? t * 1000 : t;
}

async function loadUser(username: string): Promise<User | null> {
  const fs = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
  if (fs) return userFromDoc(fs as Record<string, unknown> & { id?: string });
  return getUserByUsernameFromSqlite(username);
}

// GET - Get friends list for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const user = await loadUser(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const friends = user.friends || [];

    const friendUsers: User[] = [];
    for (const friendUsername of friends) {
      const fu = await loadUser(friendUsername);
      if (fu) friendUsers.push(fu);
    }

    const fsDb = getFirestoreInstance();
    let incomingRequests: FriendRequest[] = [];
    let sentRequests: string[] = [];

    if (fsDb) {
      const incomingSnapshot = await fsDb
        .collection(COLLECTIONS.FRIEND_REQUESTS)
        .where('to_username_lower', '==', username.toLowerCase())
        .where('status', '==', 'pending')
        .get();
      incomingRequests = incomingSnapshot.docs.map((doc) =>
        friendRequestFromDoc({ id: doc.id, ...doc.data() })
      );

      const sentSnapshot = await fsDb
        .collection(COLLECTIONS.FRIEND_REQUESTS)
        .where('from_username_lower', '==', username.toLowerCase())
        .where('status', '==', 'pending')
        .get();
      sentRequests = sentSnapshot.docs.map((d) => d.data().to_username as string);
    } else {
      const db = getDb();
      const inc = db
        .prepare(
          `SELECT * FROM friend_requests WHERE LOWER(to_username) = LOWER(?) AND status = 'pending'`
        )
        .all(username) as Record<string, unknown>[];
      incomingRequests = inc.map((row) => ({
        from: row.from_username as string,
        to: row.to_username as string,
        timestamp: normalizeReqTime(row.created_at as number),
        status: 'pending' as const,
      }));

      const sent = db
        .prepare(
          `SELECT * FROM friend_requests WHERE LOWER(from_username) = LOWER(?) AND status = 'pending'`
        )
        .all(username) as Record<string, unknown>[];
      sentRequests = sent.map((row) => row.to_username as string);
    }

    return NextResponse.json(
      {
        friends: friendUsers,
        incomingRequests:
          incomingRequests.length > 0 ? incomingRequests : user.friendRequests || [],
        sentRequests:
          sentRequests.length > 0 ? sentRequests : user.sentFriendRequests || [],
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Error getting friends:', error);
    return NextResponse.json({ error: 'Failed to get friends' }, { status: 500 });
  }
}

// POST - Send friend request, accept, or decline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, fromUsername, toUsername } = body;

    if (!action || !fromUsername || !toUsername) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    const fromUser = await loadUser(fromUsername);
    const toUser = await loadUser(toUsername);

    if (!fromUser || !toUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fsDb = getFirestoreInstance();

    if (action === 'send') {
      const isAlreadyFriend =
        (fromUser.friends || []).some((f) => f.toLowerCase() === toUsername.toLowerCase()) ||
        (toUser.friends || []).some((f) => f.toLowerCase() === fromUsername.toLowerCase());

      if (isAlreadyFriend) {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }

      if (fsDb) {
        const existingRequests = await fsDb
          .collection(COLLECTIONS.FRIEND_REQUESTS)
          .where('from_username_lower', '==', fromUsername.toLowerCase())
          .where('to_username_lower', '==', toUsername.toLowerCase())
          .where('status', '==', 'pending')
          .get();

        if (!existingRequests.empty) {
          return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
        }

        await setDocument(
          COLLECTIONS.FRIEND_REQUESTS,
          `${fromUsername.toLowerCase()}_${toUsername.toLowerCase()}`,
          {
            from_username: fromUsername,
            from_username_lower: fromUsername.toLowerCase(),
            to_username: toUsername,
            to_username_lower: toUsername.toLowerCase(),
            status: 'pending',
            created_at: Date.now(),
          }
        );

        const sentRequests = fromUser.sentFriendRequests || [];
        if (!sentRequests.includes(toUsername)) {
          sentRequests.push(toUsername);
          await persistUserCloudAndLocal({ ...fromUser, sentFriendRequests: sentRequests });
        }
      } else {
        const db = getDb();
        const dup = db
          .prepare(
            `SELECT id FROM friend_requests WHERE LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?) AND status = 'pending'`
          )
          .get(fromUsername, toUsername);
        if (dup) {
          return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
        }

        db.prepare(
          `INSERT INTO friend_requests (from_username, to_username, status, created_at, updated_at) VALUES (?, ?, 'pending', strftime('%s','now'), strftime('%s','now'))`
        ).run(fromUsername, toUsername);

        const sentRequests = [...(fromUser.sentFriendRequests || [])];
        if (!sentRequests.includes(toUsername)) {
          sentRequests.push(toUsername);
          await persistUserCloudAndLocal({ ...fromUser, sentFriendRequests: sentRequests });
        }
      }

      return NextResponse.json(
        { success: true, message: 'Friend request sent' },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (action === 'accept') {
      if (fsDb) {
        const requestQuery = await fsDb
          .collection(COLLECTIONS.FRIEND_REQUESTS)
          .where('from_username_lower', '==', fromUsername.toLowerCase())
          .where('to_username_lower', '==', toUsername.toLowerCase())
          .where('status', '==', 'pending')
          .get();

        if (requestQuery.empty) {
          return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        const requestDoc = requestQuery.docs[0];
        await setDocument(COLLECTIONS.FRIEND_REQUESTS, requestDoc.id, {
          status: 'accepted',
          updated_at: Date.now(),
        });
      } else {
        const db = getDb();
        const r = db
          .prepare(
            `SELECT id FROM friend_requests WHERE LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?) AND status = 'pending'`
          )
          .get(fromUsername, toUsername) as { id: number } | undefined;
        if (!r) {
          return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }
        db.prepare(`UPDATE friend_requests SET status = 'accepted', updated_at = strftime('%s','now') WHERE id = ?`).run(
          r.id
        );
      }

      const fromFriends = [...(fromUser.friends || [])];
      const toFriends = [...(toUser.friends || [])];
      if (!fromFriends.some((f) => f.toLowerCase() === toUsername.toLowerCase())) {
        fromFriends.push(toUsername);
      }
      if (!toFriends.some((f) => f.toLowerCase() === fromUsername.toLowerCase())) {
        toFriends.push(fromUsername);
      }

      const fromSent = (fromUser.sentFriendRequests || []).filter(
        (f) => f.toLowerCase() !== toUsername.toLowerCase()
      );
      const toSent = (toUser.sentFriendRequests || []).filter(
        (f) => f.toLowerCase() !== fromUsername.toLowerCase()
      );

      await persistUserCloudAndLocal({
        ...fromUser,
        friends: fromFriends,
        sentFriendRequests: fromSent,
      });
      await persistUserCloudAndLocal({
        ...toUser,
        friends: toFriends,
        sentFriendRequests: toSent,
      });

      return NextResponse.json({ success: true, message: 'Friend request accepted' });
    }

    if (action === 'decline') {
      if (fsDb) {
        const requestQuery = await fsDb
          .collection(COLLECTIONS.FRIEND_REQUESTS)
          .where('from_username_lower', '==', fromUsername.toLowerCase())
          .where('to_username_lower', '==', toUsername.toLowerCase())
          .where('status', '==', 'pending')
          .get();

        if (!requestQuery.empty) {
          await setDocument(COLLECTIONS.FRIEND_REQUESTS, requestQuery.docs[0].id, {
            status: 'declined',
            updated_at: Date.now(),
          });
        }
      } else {
        const db = getDb();
        db.prepare(
          `UPDATE friend_requests SET status = 'declined', updated_at = strftime('%s','now') WHERE LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?) AND status = 'pending'`
        ).run(fromUsername, toUsername);
      }

      const fromSent = (fromUser.sentFriendRequests || []).filter(
        (f) => f.toLowerCase() !== toUsername.toLowerCase()
      );
      await persistUserCloudAndLocal({ ...fromUser, sentFriendRequests: fromSent });

      return NextResponse.json({ success: true, message: 'Friend request declined' });
    }

    if (action === 'remove') {
      const fromFriends = (fromUser.friends || []).filter(
        (f) => f.toLowerCase() !== toUsername.toLowerCase()
      );
      const toFriends = (toUser.friends || []).filter(
        (f) => f.toLowerCase() !== fromUsername.toLowerCase()
      );

      await persistUserCloudAndLocal({ ...fromUser, friends: fromFriends });
      await persistUserCloudAndLocal({ ...toUser, friends: toFriends });

      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 });
  }
}
