import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User, FriendRequest } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// GET - Get friends list for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Always read fresh data from file
    const users = await readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const friends = user.friends || [];
    const friendRequests = user.friendRequests || [];
    const sentFriendRequests = user.sentFriendRequests || [];

    // Get full friend user objects (fresh data)
    const friendUsers = friends
      .map(friendUsername => users.find(u => u.username.toLowerCase() === friendUsername.toLowerCase()))
      .filter(Boolean) as User[];

    // Return response with no-cache headers
    return NextResponse.json({
      friends: friendUsers,
      incomingRequests: friendRequests,
      sentRequests: sentFriendRequests
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
    const body = await request.json();
    const { action, fromUsername, toUsername } = body;

    if (!action || !fromUsername || !toUsername) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    const users = await readUsers();
    const fromUser = users.find(u => u.username.toLowerCase() === fromUsername.toLowerCase());
    const toUser = users.find(u => u.username.toLowerCase() === toUsername.toLowerCase());

    if (!fromUser || !toUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize arrays if they don't exist
    if (!fromUser.friends) fromUser.friends = [];
    if (!fromUser.sentFriendRequests) fromUser.sentFriendRequests = [];
    if (!toUser.friends) toUser.friends = [];
    if (!toUser.friendRequests) toUser.friendRequests = [];

    if (action === 'send') {
      // Check if already friends (bidirectional check)
      const isAlreadyFriend = fromUser.friends.some(f => f.toLowerCase() === toUsername.toLowerCase()) ||
                              toUser.friends.some(f => f.toLowerCase() === fromUsername.toLowerCase());
      
      if (isAlreadyFriend) {
        // Clean up - remove from sentFriendRequests if exists
        fromUser.sentFriendRequests = fromUser.sentFriendRequests?.filter(
          f => f.toLowerCase() !== toUsername.toLowerCase()
        ) || [];
        await writeUsers(users);
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }

      // Check if request already sent (but clean up if user is already in sent list)
      if (fromUser.sentFriendRequests.some(f => f.toLowerCase() === toUsername.toLowerCase())) {
        // Check if there's a pending request on the other side
        const hasPendingRequest = toUser.friendRequests?.some(
          (req: FriendRequest) => req.from.toLowerCase() === fromUsername.toLowerCase() && req.status === 'pending'
        );
        
        if (hasPendingRequest) {
          return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
        } else {
          // Clean up stale sent request
          fromUser.sentFriendRequests = fromUser.sentFriendRequests.filter(
            f => f.toLowerCase() !== toUsername.toLowerCase()
          );
        }
      }

      // Check if there's already an incoming request (bidirectional - maybe they sent one to us)
      const existingRequest = toUser.friendRequests?.find(
        (req: FriendRequest) => req.from.toLowerCase() === fromUsername.toLowerCase() && req.status === 'pending'
      );

      if (existingRequest) {
        return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
      }

      // Create friend request
      const friendRequest: FriendRequest = {
        from: fromUsername,
        to: toUsername,
        timestamp: Date.now(),
        status: 'pending'
      };

      toUser.friendRequests = toUser.friendRequests || [];
      toUser.friendRequests.push(friendRequest);
      fromUser.sentFriendRequests = fromUser.sentFriendRequests || [];
      fromUser.sentFriendRequests.push(toUsername);

      await writeUsers(users);
      return NextResponse.json({ success: true, message: 'Friend request sent' }, {
        headers: {
          'Cache-Control': 'no-store'
        }
      });

    } else if (action === 'accept') {
      // Find the friend request
      const requestIndex = toUser.friendRequests?.findIndex(
        (req: FriendRequest) => req.from.toLowerCase() === fromUsername.toLowerCase() && req.status === 'pending'
      ) ?? -1;

      if (requestIndex === -1) {
        return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
      }

      // Mark request as accepted
      if (toUser.friendRequests) {
        toUser.friendRequests[requestIndex].status = 'accepted';
      }

      // Add to friends lists (bidirectional - case insensitive check)
      if (!toUser.friends.some(f => f.toLowerCase() === fromUsername.toLowerCase())) {
        toUser.friends.push(fromUsername);
      }
      if (!fromUser.friends.some(f => f.toLowerCase() === toUsername.toLowerCase())) {
        fromUser.friends.push(toUsername);
      }

      // Remove from sent requests (both users)
      fromUser.sentFriendRequests = fromUser.sentFriendRequests?.filter(
        f => f.toLowerCase() !== toUsername.toLowerCase()
      ) || [];
      toUser.sentFriendRequests = toUser.sentFriendRequests?.filter(
        f => f.toLowerCase() !== fromUsername.toLowerCase()
      ) || [];

      // Remove the accepted request from incoming requests
      toUser.friendRequests = toUser.friendRequests?.filter(
        (req: FriendRequest) => !(req.from.toLowerCase() === fromUsername.toLowerCase() && req.status === 'accepted')
      ) || [];

      await writeUsers(users);
      return NextResponse.json({ success: true, message: 'Friend request accepted' });

    } else if (action === 'decline') {
      // Remove the friend request
      toUser.friendRequests = toUser.friendRequests?.filter(
        (req: FriendRequest) => !(req.from.toLowerCase() === fromUsername.toLowerCase() && req.status === 'pending')
      ) || [];

      // Remove from sent requests
      fromUser.sentFriendRequests = fromUser.sentFriendRequests?.filter(
        f => f.toLowerCase() !== toUsername.toLowerCase()
      ) || [];

      await writeUsers(users);
      return NextResponse.json({ success: true, message: 'Friend request declined' });

    } else if (action === 'remove') {
      // Remove from friends lists
      toUser.friends = toUser.friends?.filter(f => f.toLowerCase() !== fromUsername.toLowerCase()) || [];
      fromUser.friends = fromUser.friends?.filter(f => f.toLowerCase() !== toUsername.toLowerCase()) || [];

      await writeUsers(users);
      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 });
  }
}

