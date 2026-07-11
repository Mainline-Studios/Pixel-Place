/**
 * Friends + DMs for the Cloud Functions API (static hosting only rewrites /api/** here).
 */
import type { Express, Request, Response } from 'express';
import type * as admin from 'firebase-admin';
import type { AuthUser } from './authMiddleware';

type RequireAuth = (req: Request, res: Response) => AuthUser | null;

function isAdmin(auth: AuthUser) {
  return auth.role === 'admin' || auth.role === 'head_admin';
}

function publicUser(id: string, d: Record<string, any> | undefined) {
  if (!d) return null;
  return {
    username: d.username || id,
    password: '',
    gender: d.gender || '',
    role: d.role || 'user',
    coins: d.coins || 0,
    ownedSkins: d.owned_skins || [],
    equippedSkin: d.equipped_skin || '',
    ownedFaces: d.owned_faces || [],
    equippedFace: d.equipped_face || '',
    ownedAccessories: d.owned_accessories || [],
    equippedAccessories: d.equipped_accessories || {},
    friends: Array.isArray(d.friends) ? d.friends : [],
    emailVerified: d.email_verified === true,
    photoURL: d.photo_url || d.photoURL || '',
  };
}

function messageFromDoc(id: string, d: Record<string, any>) {
  return {
    id,
    from: d.from_username,
    to: d.to_username,
    message: d.message,
    timestamp: d.created_at || d.timestamp || Date.now(),
    read: d.read === true,
  };
}

export function mountFriendsRoutes(
  app: Express,
  deps: {
    usersDb: any;
    firestore: admin.firestore.Firestore;
    requireAuth: RequireAuth;
  }
) {
  const { usersDb, firestore, requireAuth } = deps;
  const FRIEND_REQUESTS = 'friend_requests';
  const MESSAGES = 'messages';

  const getFriends = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const usernameParam = String(req.query.username || '').trim();
      const username = usernameParam || auth.username;
      if (!username) return res.status(400).json({ error: 'Username is required' });

      if (
        username.toLowerCase() !== auth.username.toLowerCase() &&
        !isAdmin(auth)
      ) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const userDoc = await usersDb.collection('users').doc(username.toLowerCase()).get();
      if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
      const userData = userDoc.data() || {};
      const friendNames: string[] = Array.isArray(userData.friends) ? userData.friends : [];

      const friendUsers = [];
      for (const friendUsername of friendNames) {
        const friendDoc = await usersDb.collection('users').doc(String(friendUsername).toLowerCase()).get();
        if (friendDoc.exists) {
          const u = publicUser(friendDoc.id, friendDoc.data());
          if (u) friendUsers.push(u);
        }
      }

      const incomingSnap = await firestore
        .collection(FRIEND_REQUESTS)
        .where('to_username_lower', '==', username.toLowerCase())
        .where('status', '==', 'pending')
        .get();
      const incomingRequests = incomingSnap.docs.map((doc) => {
        const d = doc.data();
        return {
          from: d.from_username,
          to: d.to_username,
          timestamp: d.created_at || Date.now(),
          status: d.status || 'pending',
        };
      });

      const sentSnap = await firestore
        .collection(FRIEND_REQUESTS)
        .where('from_username_lower', '==', username.toLowerCase())
        .where('status', '==', 'pending')
        .get();
      const sentRequests = sentSnap.docs.map((doc) => doc.data().to_username);

      const embeddedIncoming = Array.isArray(userData.friend_requests) ? userData.friend_requests : [];
      const embeddedSent = Array.isArray(userData.sent_friend_requests) ? userData.sent_friend_requests : [];

      return res.json({
        friends: friendUsers,
        incomingRequests: incomingRequests.length > 0 ? incomingRequests : embeddedIncoming,
        sentRequests: sentRequests.length > 0 ? sentRequests : embeddedSent,
      });
    } catch (error) {
      console.error('Error getting friends:', error);
      return res.status(500).json({ error: 'Failed to get friends' });
    }
  };

  const postFriends = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const { action, fromUsername, toUsername } = req.body || {};
      if (!action || !fromUsername || !toUsername) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const requesterLower = auth.username.toLowerCase();
      const fromLower = String(fromUsername).toLowerCase();
      const toLower = String(toUsername).toLowerCase();
      const adminUser = isAdmin(auth);

      if (!adminUser) {
        if (action === 'send' && fromLower !== requesterLower) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        if ((action === 'accept' || action === 'decline') && toLower !== requesterLower) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        if (action === 'remove' && fromLower !== requesterLower && toLower !== requesterLower) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      if (fromLower === toLower) {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
      }

      const fromRef = usersDb.collection('users').doc(fromLower);
      const toRef = usersDb.collection('users').doc(toLower);
      const [fromUserDoc, toUserDoc] = await Promise.all([fromRef.get(), toRef.get()]);
      if (!fromUserDoc.exists || !toUserDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const fromData = fromUserDoc.data() || {};
      const toData = toUserDoc.data() || {};
      const fromFriends: string[] = Array.isArray(fromData.friends) ? [...fromData.friends] : [];
      const toFriends: string[] = Array.isArray(toData.friends) ? [...toData.friends] : [];
      const fromSent: string[] = Array.isArray(fromData.sent_friend_requests)
        ? [...fromData.sent_friend_requests]
        : [];
      const toSent: string[] = Array.isArray(toData.sent_friend_requests)
        ? [...toData.sent_friend_requests]
        : [];

      if (action === 'send') {
        const already =
          fromFriends.some((f) => String(f).toLowerCase() === toLower) ||
          toFriends.some((f) => String(f).toLowerCase() === fromLower);
        if (already) return res.status(400).json({ error: 'Already friends' });

        const existing = await firestore
          .collection(FRIEND_REQUESTS)
          .where('from_username_lower', '==', fromLower)
          .where('to_username_lower', '==', toLower)
          .where('status', '==', 'pending')
          .get();
        if (!existing.empty) {
          return res.status(400).json({ error: 'Friend request already sent' });
        }

        const requestId = `${fromLower}_${toLower}`;
        await firestore.collection(FRIEND_REQUESTS).doc(requestId).set({
          from_username: fromUsername,
          from_username_lower: fromLower,
          to_username: toUsername,
          to_username_lower: toLower,
          status: 'pending',
          created_at: Date.now(),
        });

        if (!fromSent.some((f) => String(f).toLowerCase() === toLower)) {
          fromSent.push(toUsername);
          await fromRef.set({ sent_friend_requests: fromSent, updated_at: Date.now() }, { merge: true });
        }

        return res.json({ success: true, message: 'Friend request sent' });
      }

      if (action === 'accept') {
        const requestQuery = await firestore
          .collection(FRIEND_REQUESTS)
          .where('from_username_lower', '==', fromLower)
          .where('to_username_lower', '==', toLower)
          .where('status', '==', 'pending')
          .get();
        if (requestQuery.empty) {
          return res.status(404).json({ error: 'Friend request not found' });
        }

        await firestore.collection(FRIEND_REQUESTS).doc(requestQuery.docs[0].id).set(
          { status: 'accepted', updated_at: Date.now() },
          { merge: true }
        );

        if (!fromFriends.some((f) => String(f).toLowerCase() === toLower)) fromFriends.push(toUsername);
        if (!toFriends.some((f) => String(f).toLowerCase() === fromLower)) toFriends.push(fromUsername);

        await fromRef.set(
          {
            friends: fromFriends,
            sent_friend_requests: fromSent.filter((f) => String(f).toLowerCase() !== toLower),
            updated_at: Date.now(),
          },
          { merge: true }
        );
        await toRef.set(
          {
            friends: toFriends,
            sent_friend_requests: toSent.filter((f) => String(f).toLowerCase() !== fromLower),
            updated_at: Date.now(),
          },
          { merge: true }
        );

        return res.json({ success: true, message: 'Friend request accepted' });
      }

      if (action === 'decline') {
        const requestQuery = await firestore
          .collection(FRIEND_REQUESTS)
          .where('from_username_lower', '==', fromLower)
          .where('to_username_lower', '==', toLower)
          .where('status', '==', 'pending')
          .get();
        if (!requestQuery.empty) {
          await firestore.collection(FRIEND_REQUESTS).doc(requestQuery.docs[0].id).set(
            { status: 'declined', updated_at: Date.now() },
            { merge: true }
          );
        }
        await fromRef.set(
          {
            sent_friend_requests: fromSent.filter((f) => String(f).toLowerCase() !== toLower),
            updated_at: Date.now(),
          },
          { merge: true }
        );
        return res.json({ success: true, message: 'Friend request declined' });
      }

      if (action === 'remove') {
        await fromRef.set(
          {
            friends: fromFriends.filter((f) => String(f).toLowerCase() !== toLower),
            updated_at: Date.now(),
          },
          { merge: true }
        );
        await toRef.set(
          {
            friends: toFriends.filter((f) => String(f).toLowerCase() !== fromLower),
            updated_at: Date.now(),
          },
          { merge: true }
        );
        return res.json({ success: true, message: 'Friend removed' });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error handling friend request:', error);
      return res.status(500).json({ error: 'Failed to process friend request' });
    }
  };

  const getMessages = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const username = String(req.query.username || auth.username).trim();
      const withUsername = String(req.query.with || '').trim();
      if (!username) return res.status(400).json({ error: 'Username is required' });
      if (username.toLowerCase() !== auth.username.toLowerCase() && !isAdmin(auth)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (withUsername) {
        const [sentSnap, receivedSnap] = await Promise.all([
          firestore
            .collection(MESSAGES)
            .where('from_username_lower', '==', username.toLowerCase())
            .where('to_username_lower', '==', withUsername.toLowerCase())
            .get(),
          firestore
            .collection(MESSAGES)
            .where('from_username_lower', '==', withUsername.toLowerCase())
            .where('to_username_lower', '==', username.toLowerCase())
            .get(),
        ]);
        const messages = [
          ...sentSnap.docs.map((doc) => messageFromDoc(doc.id, doc.data())),
          ...receivedSnap.docs.map((doc) => messageFromDoc(doc.id, doc.data())),
        ].sort((a, b) => a.timestamp - b.timestamp);
        return res.json(messages);
      }

      const [sentSnap, receivedSnap] = await Promise.all([
        firestore.collection(MESSAGES).where('from_username_lower', '==', username.toLowerCase()).get(),
        firestore.collection(MESSAGES).where('to_username_lower', '==', username.toLowerCase()).get(),
      ]);
      const messages = [
        ...sentSnap.docs.map((doc) => messageFromDoc(doc.id, doc.data())),
        ...receivedSnap.docs.map((doc) => messageFromDoc(doc.id, doc.data())),
      ].sort((a, b) => a.timestamp - b.timestamp);
      return res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({ error: 'Failed to get messages' });
    }
  };

  const postMessages = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const { fromUsername, toUsername, message } = req.body || {};
      if (!fromUsername || !toUsername || !message) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      if (String(fromUsername).toLowerCase() !== auth.username.toLowerCase() && !isAdmin(auth)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (String(fromUsername).toLowerCase() === String(toUsername).toLowerCase()) {
        return res.status(400).json({ error: 'Cannot send message to yourself' });
      }
      const text = String(message).trim();
      if (!text) return res.status(400).json({ error: 'Message cannot be empty' });

      // Must be friends to DM
      const fromDoc = await usersDb.collection('users').doc(String(fromUsername).toLowerCase()).get();
      const friends: string[] = Array.isArray(fromDoc.data()?.friends) ? fromDoc.data().friends : [];
      const isFriend = friends.some((f) => String(f).toLowerCase() === String(toUsername).toLowerCase());
      if (!isFriend && !isAdmin(auth)) {
        return res.status(403).json({ error: 'You can only message friends' });
      }

      const createdAt = Date.now();
      const ref = await firestore.collection(MESSAGES).add({
        from_username: fromUsername,
        from_username_lower: String(fromUsername).toLowerCase(),
        to_username: toUsername,
        to_username_lower: String(toUsername).toLowerCase(),
        message: text,
        read: false,
        created_at: createdAt,
      });

      return res.json({
        id: ref.id,
        from: fromUsername,
        to: toUsername,
        message: text,
        timestamp: createdAt,
        read: false,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  };

  const putMessages = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const { id, read } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Message ID is required' });

      const ref = firestore.collection(MESSAGES).doc(String(id));
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: 'Message not found' });
      const data = snap.data() || {};
      const viewer = auth.username.toLowerCase();
      if (
        data.to_username_lower !== viewer &&
        data.from_username_lower !== viewer &&
        !isAdmin(auth)
      ) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await ref.set({ read: read !== undefined ? !!read : true }, { merge: true });
      return res.json(messageFromDoc(snap.id, { ...data, read: read !== undefined ? !!read : true }));
    } catch (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({ error: 'Failed to update message' });
    }
  };

  for (const path of ['/friends', '/api/friends']) {
    app.get(path, getFriends);
    app.post(path, postFriends);
  }
  for (const path of ['/messages', '/api/messages']) {
    app.get(path, getMessages);
    app.post(path, postMessages);
    app.put(path, putMessages);
  }
}
