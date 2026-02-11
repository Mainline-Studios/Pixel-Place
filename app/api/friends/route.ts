import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocument, setDocument, queryDocuments, getDocuments, COLLECTIONS, getFirestoreInstance } from '@/lib/firestore';
import { User, FriendRequest } from '@/types';

function userFromDoc(doc: any): User {
  return {
    username: doc.username || doc.id,
    password: doc.password_hash || doc.password || '',
    gender: doc.gender || '',
    role: (doc.role || 'user') as 'admin' | 'user',
    coins: doc.coins || 0,
    ownedSkins: Array.isArray(doc.owned_skins) ? doc.owned_skins : (typeof doc.owned_skins === 'string' ? JSON.parse(doc.owned_skins || '[]') : []),
    equippedSkin: doc.equipped_skin || '',
    ownedAccessories: Array.isArray(doc.owned_accessories) ? doc.owned_accessories : (typeof doc.owned_accessories === 'string' ? JSON.parse(doc.owned_accessories || '[]') : []),
    equippedAccessories: Array.isArray(doc.equipped_accessories) ? doc.equipped_accessories : (typeof doc.equipped_accessories === 'string' ? JSON.parse(doc.equipped_accessories || '[]') : []),
    ownedServers: Array.isArray(doc.owned_servers) ? doc.owned_servers : (typeof doc.owned_servers === 'string' ? JSON.parse(doc.owned_servers || '[]') : []),
    friends: Array.isArray(doc.friends) ? doc.friends : (typeof doc.friends === 'string' ? JSON.parse(doc.friends || '[]') : []),
    friendRequests: Array.isArray(doc.friend_requests) ? doc.friend_requests : (typeof doc.friend_requests === 'string' ? JSON.parse(doc.friend_requests || '[]') : []),
    sentFriendRequests: Array.isArray(doc.sent_friend_requests) ? doc.sent_friend_requests : (typeof doc.sent_friend_requests === 'string' ? JSON.parse(doc.sent_friend_requests || '[]') : [])
  };
}

function friendRequestFromDoc(doc: any): FriendRequest {
  return {
    from: doc.from_username,
    to: doc.to_username,
    timestamp: doc.created_at || Date.now(),
    status: doc.status || 'pending'
=======
import { getDb } from '@/lib/db';
import { User, FriendRequest } from '@/types';

function userFromRow(row: any): User {
  return {
    username: row.username,
    password: row.password_hash,
    gender: row.gender || '',
    role: (row.role || 'user') as 'admin' | 'user',
    coins: row.coins || 0,
    ownedSkins: JSON.parse(row.owned_skins || '[]'),
    equippedSkin: row.equipped_skin || '',
    ownedAccessories: JSON.parse(row.owned_accessories || '[]'),
    equippedAccessories: JSON.parse(row.equipped_accessories || '[]'),
    ownedServers: JSON.parse(row.owned_servers || '[]'),
    friends: JSON.parse(row.friends || '[]'),
    friendRequests: JSON.parse(row.friend_requests || '[]'),
    sentFriendRequests: JSON.parse(row.sent_friend_requests || '[]')
  };
}

function friendRequestFromRow(row: any): FriendRequest {
  return {
    from: row.from_username,
    to: row.to_username,
    timestamp: row.created_at * 1000,
    status: row.status || 'pending'
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  };
}

// GET - Get friends list for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

<<<<<<< HEAD
    const userDoc = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userFromDoc(userDoc);
    const friends = user.friends || [];
=======
    const db = getDb();
    const userRow = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username);

    if (!userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userFromRow(userRow);
    const friends = user.friends || [];
    const friendRequests = user.friendRequests || [];
    const sentFriendRequests = user.sentFriendRequests || [];
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

    // Get full friend user objects
    const friendUsers: User[] = [];
    for (const friendUsername of friends) {
<<<<<<< HEAD
      const friendDoc = await getDocument(COLLECTIONS.USERS, friendUsername.toLowerCase());
      if (friendDoc) {
        friendUsers.push(userFromDoc(friendDoc));
      }
    }

    // Get friend requests from Firestore
    const db = getFirestoreInstance();
    const incomingRequestsQuery = db.collection(COLLECTIONS.FRIEND_REQUESTS)
      .where('to_username_lower', '==', username.toLowerCase())
      .where('status', '==', 'pending');
    const incomingSnapshot = await incomingRequestsQuery.get();
    const incomingRequests = incomingSnapshot.docs.map(doc => friendRequestFromDoc({ id: doc.id, ...doc.data() }));

    const sentRequestsQuery = db.collection(COLLECTIONS.FRIEND_REQUESTS)
      .where('from_username_lower', '==', username.toLowerCase())
      .where('status', '==', 'pending');
    const sentSnapshot = await sentRequestsQuery.get();
    const sentRequests = sentSnapshot.docs.map(doc => doc.data().to_username);

    return NextResponse.json({
      friends: friendUsers,
      incomingRequests: incomingRequests.length > 0 ? incomingRequests : user.friendRequests,
      sentRequests: sentRequests.length > 0 ? sentRequests : user.sentFriendRequests
=======
      const friendRow = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(friendUsername);
      if (friendRow) {
        friendUsers.push(userFromRow(friendRow));
      }
    }

    // Get friend requests from database
    const dbRequests = db.prepare(`
      SELECT * FROM friend_requests
      WHERE (LOWER(from_username) = LOWER(?) OR LOWER(to_username) = LOWER(?))
        AND status = 'pending'
      ORDER BY created_at DESC
    `).all(username, username);

    const incomingRequests = dbRequests
      .filter((req: any) => req.to_username.toLowerCase() === username.toLowerCase())
      .map(friendRequestFromRow);
    
    const sentRequests = dbRequests
      .filter((req: any) => req.from_username.toLowerCase() === username.toLowerCase())
      .map((req: any) => req.to_username);

    return NextResponse.json({
      friends: friendUsers,
      incomingRequests: incomingRequests.length > 0 ? incomingRequests : friendRequests,
      sentRequests: sentRequests.length > 0 ? sentRequests : sentFriendRequests
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error getting friends:', error);
    return NextResponse.json({ error: 'Failed to get friends' }, { status: 500 });
  }
}

// POST - Send friend request, accept, or decline
export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
=======
    const db = getDb();
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    const body = await request.json();
    const { action, fromUsername, toUsername } = body;

    if (!action || !fromUsername || !toUsername) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

<<<<<<< HEAD
    const fromUserDoc = await getDocument(COLLECTIONS.USERS, fromUsername.toLowerCase());
    const toUserDoc = await getDocument(COLLECTIONS.USERS, toUsername.toLowerCase());

    if (!fromUserDoc || !toUserDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fromUser = userFromDoc(fromUserDoc);
    const toUser = userFromDoc(toUserDoc);
=======
    const fromUserRow = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(fromUsername);
    const toUserRow = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(toUsername);

    if (!fromUserRow || !toUserRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fromUser = userFromRow(fromUserRow);
    const toUser = userFromRow(toUserRow);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

    if (action === 'send') {
      // Check if already friends
      const isAlreadyFriend = (fromUser.friends || []).some(f => f.toLowerCase() === toUsername.toLowerCase()) ||
                              (toUser.friends || []).some(f => f.toLowerCase() === fromUsername.toLowerCase());
      
      if (isAlreadyFriend) {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }

      // Check if request already exists
<<<<<<< HEAD
      const db = getFirestoreInstance();
      const existingRequests = await db.collection(COLLECTIONS.FRIEND_REQUESTS)
        .where('from_username_lower', '==', fromUsername.toLowerCase())
        .where('to_username_lower', '==', toUsername.toLowerCase())
        .where('status', '==', 'pending')
        .get();

      if (!existingRequests.empty) {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
      }

      // Create friend request in Firestore
      await setDocument(COLLECTIONS.FRIEND_REQUESTS, `${fromUsername.toLowerCase()}_${toUsername.toLowerCase()}`, {
        from_username: fromUsername,
        from_username_lower: fromUsername.toLowerCase(),
        to_username: toUsername,
        to_username_lower: toUsername.toLowerCase(),
        status: 'pending',
        created_at: Date.now()
      });
=======
      const existingRequest = db.prepare(`
        SELECT * FROM friend_requests
        WHERE LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?)
          AND status = 'pending'
      `).get(fromUsername, toUsername);

      if (existingRequest) {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
      }

      // Create friend request in database
      db.prepare(`
        INSERT INTO friend_requests (from_username, to_username, status)
        VALUES (?, ?, 'pending')
      `).run(fromUsername, toUsername);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

      // Update sent friend requests in user record
      const sentRequests = fromUser.sentFriendRequests || [];
      if (!sentRequests.includes(toUsername)) {
        sentRequests.push(toUsername);
<<<<<<< HEAD
        await setDocument(COLLECTIONS.USERS, fromUsername.toLowerCase(), {
          sent_friend_requests: sentRequests
        });
=======
        db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
          JSON.stringify(sentRequests),
          fromUserRow.id
        );
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      }

      return NextResponse.json({ success: true, message: 'Friend request sent' }, {
        headers: { 'Cache-Control': 'no-store' }
      });

    } else if (action === 'accept') {
      // Find the friend request
<<<<<<< HEAD
      const db = getFirestoreInstance();
      const requestQuery = await db.collection(COLLECTIONS.FRIEND_REQUESTS)
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
        updated_at: Date.now()
      });
=======
      const requestRow = db.prepare(`
        SELECT * FROM friend_requests
        WHERE LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?)
          AND status = 'pending'
      `).get(fromUsername, toUsername);

      if (!requestRow) {
        return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
      }

      // Mark request as accepted
      db.prepare(`
        UPDATE friend_requests SET status = 'accepted', updated_at = strftime('%s', 'now')
        WHERE id = ?
      `).run(requestRow.id);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

      // Add to friends lists (bidirectional)
      const fromFriends = fromUser.friends || [];
      const toFriends = toUser.friends || [];
      
      if (!fromFriends.some(f => f.toLowerCase() === toUsername.toLowerCase())) {
        fromFriends.push(toUsername);
      }
      if (!toFriends.some(f => f.toLowerCase() === fromUsername.toLowerCase())) {
        toFriends.push(fromUsername);
      }

      // Update both users
<<<<<<< HEAD
      await setDocument(COLLECTIONS.USERS, fromUsername.toLowerCase(), {
        friends: fromFriends
      });
      await setDocument(COLLECTIONS.USERS, toUsername.toLowerCase(), {
        friends: toFriends
      });
=======
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(fromFriends),
        fromUserRow.id
      );
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(toFriends),
        toUserRow.id
      );
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

      // Remove from sent requests
      const fromSent = (fromUser.sentFriendRequests || []).filter(f => f.toLowerCase() !== toUsername.toLowerCase());
      const toSent = (toUser.sentFriendRequests || []).filter(f => f.toLowerCase() !== fromUsername.toLowerCase());
      
<<<<<<< HEAD
      await setDocument(COLLECTIONS.USERS, fromUsername.toLowerCase(), {
        sent_friend_requests: fromSent
      });
      await setDocument(COLLECTIONS.USERS, toUsername.toLowerCase(), {
        sent_friend_requests: toSent
      });
=======
      db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
        JSON.stringify(fromSent),
        fromUserRow.id
      );
      db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
        JSON.stringify(toSent),
        toUserRow.id
      );
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

      return NextResponse.json({ success: true, message: 'Friend request accepted' });

    } else if (action === 'decline') {
      // Mark request as declined
<<<<<<< HEAD
      const db = getFirestoreInstance();
      const requestQuery = await db.collection(COLLECTIONS.FRIEND_REQUESTS)
        .where('from_username_lower', '==', fromUsername.toLowerCase())
        .where('to_username_lower', '==', toUsername.toLowerCase())
        .where('status', '==', 'pending')
        .get();

      if (!requestQuery.empty) {
        await setDocument(COLLECTIONS.FRIEND_REQUESTS, requestQuery.docs[0].id, {
          status: 'declined',
          updated_at: Date.now()
        });
=======
      const requestRow = db.prepare(`
        SELECT * FROM friend_requests
        WHERE LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?)
          AND status = 'pending'
      `).get(fromUsername, toUsername);

      if (requestRow) {
        db.prepare('UPDATE friend_requests SET status = ?, updated_at = strftime(\'%s\', \'now\') WHERE id = ?').run('declined', requestRow.id);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      }

      // Remove from sent requests
      const fromSent = (fromUser.sentFriendRequests || []).filter(f => f.toLowerCase() !== toUsername.toLowerCase());
<<<<<<< HEAD
      await setDocument(COLLECTIONS.USERS, fromUsername.toLowerCase(), {
        sent_friend_requests: fromSent
      });
=======
      db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
        JSON.stringify(fromSent),
        fromUserRow.id
      );
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

      return NextResponse.json({ success: true, message: 'Friend request declined' });

    } else if (action === 'remove') {
      // Remove from friends lists
      const fromFriends = (fromUser.friends || []).filter(f => f.toLowerCase() !== toUsername.toLowerCase());
      const toFriends = (toUser.friends || []).filter(f => f.toLowerCase() !== fromUsername.toLowerCase());
      
<<<<<<< HEAD
      await setDocument(COLLECTIONS.USERS, fromUsername.toLowerCase(), {
        friends: fromFriends
      });
      await setDocument(COLLECTIONS.USERS, toUsername.toLowerCase(), {
        friends: toFriends
      });
=======
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(fromFriends),
        fromUserRow.id
      );
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(toFriends),
        toUserRow.id
      );
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 });
  }
}
