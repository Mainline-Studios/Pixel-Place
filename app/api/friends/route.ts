import { NextRequest, NextResponse } from 'next/server';
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

    const db = getDb();
    const userRow = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username);

    if (!userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userFromRow(userRow);
    const friends = user.friends || [];
    const friendRequests = user.friendRequests || [];
    const sentFriendRequests = user.sentFriendRequests || [];

    // Get full friend user objects
    const friendUsers: User[] = [];
    for (const friendUsername of friends) {
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
    const db = getDb();
    const body = await request.json();
    const { action, fromUsername, toUsername } = body;

    if (!action || !fromUsername || !toUsername) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    const fromUserRow = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(fromUsername);
    const toUserRow = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(toUsername);

    if (!fromUserRow || !toUserRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fromUser = userFromRow(fromUserRow);
    const toUser = userFromRow(toUserRow);

    if (action === 'send') {
      // Check if already friends
      const isAlreadyFriend = (fromUser.friends || []).some(f => f.toLowerCase() === toUsername.toLowerCase()) ||
                              (toUser.friends || []).some(f => f.toLowerCase() === fromUsername.toLowerCase());
      
      if (isAlreadyFriend) {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }

      // Check if request already exists
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

      // Update sent friend requests in user record
      const sentRequests = fromUser.sentFriendRequests || [];
      if (!sentRequests.includes(toUsername)) {
        sentRequests.push(toUsername);
        db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
          JSON.stringify(sentRequests),
          fromUserRow.id
        );
      }

      return NextResponse.json({ success: true, message: 'Friend request sent' }, {
        headers: { 'Cache-Control': 'no-store' }
      });

    } else if (action === 'accept') {
      // Find the friend request
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
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(fromFriends),
        fromUserRow.id
      );
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(toFriends),
        toUserRow.id
      );

      // Remove from sent requests
      const fromSent = (fromUser.sentFriendRequests || []).filter(f => f.toLowerCase() !== toUsername.toLowerCase());
      const toSent = (toUser.sentFriendRequests || []).filter(f => f.toLowerCase() !== fromUsername.toLowerCase());
      
      db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
        JSON.stringify(fromSent),
        fromUserRow.id
      );
      db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
        JSON.stringify(toSent),
        toUserRow.id
      );

      return NextResponse.json({ success: true, message: 'Friend request accepted' });

    } else if (action === 'decline') {
      // Mark request as declined
      const requestRow = db.prepare(`
        SELECT * FROM friend_requests
        WHERE LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?)
          AND status = 'pending'
      `).get(fromUsername, toUsername);

      if (requestRow) {
        db.prepare('UPDATE friend_requests SET status = ?, updated_at = strftime(\'%s\', \'now\') WHERE id = ?').run('declined', requestRow.id);
      }

      // Remove from sent requests
      const fromSent = (fromUser.sentFriendRequests || []).filter(f => f.toLowerCase() !== toUsername.toLowerCase());
      db.prepare('UPDATE users SET sent_friend_requests = ? WHERE id = ?').run(
        JSON.stringify(fromSent),
        fromUserRow.id
      );

      return NextResponse.json({ success: true, message: 'Friend request declined' });

    } else if (action === 'remove') {
      // Remove from friends lists
      const fromFriends = (fromUser.friends || []).filter(f => f.toLowerCase() !== toUsername.toLowerCase());
      const toFriends = (toUser.friends || []).filter(f => f.toLowerCase() !== fromUsername.toLowerCase());
      
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(fromFriends),
        fromUserRow.id
      );
      db.prepare('UPDATE users SET friends = ? WHERE id = ?').run(
        JSON.stringify(toFriends),
        toUserRow.id
      );

      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 });
  }
}
