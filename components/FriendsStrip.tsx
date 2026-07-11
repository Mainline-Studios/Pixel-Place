'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '@/types';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage } from '@/lib/api';
import { useFriendsOnlineStatus } from '@/lib/onlineStatus';
import { navigateToTab } from '@/lib/routing';

export type FriendListUser = Pick<User, 'username'> & {
  emailVerified?: boolean;
  photoURL?: string;
  equippedSkin?: string;
};

export type FriendsPayload = {
  friends: FriendListUser[];
  incomingRequests: Array<{ from: string; to: string; timestamp: number; status?: string }>;
  sentRequests: string[];
};

export async function fetchFriendsPayload(username: string): Promise<FriendsPayload> {
  const res = await authenticatedFetch(
    apiUrl(`/api/friends?username=${encodeURIComponent(username)}`),
    { cache: 'no-store' }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(authErrorMessage(res.status, data));
  }
  return {
    friends: Array.isArray(data.friends) ? data.friends : [],
    incomingRequests: Array.isArray(data.incomingRequests) ? data.incomingRequests : [],
    sentRequests: Array.isArray(data.sentRequests) ? data.sentRequests : [],
  };
}

function AvatarChip({
  username,
  online,
  size = 40,
  onClick,
}: {
  username: string;
  online?: boolean;
  size?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={username}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--accent-bg)',
        color: 'var(--text-main)',
        fontWeight: 700,
        fontSize: Math.max(12, size * 0.35),
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    >
      {username.charAt(0).toUpperCase()}
      <span
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: Math.max(8, size * 0.22),
          height: Math.max(8, size * 0.22),
          borderRadius: '50%',
          background: online ? '#22c55e' : '#64748b',
          border: '2px solid var(--panel-alt, #1a1d29)',
        }}
      />
    </button>
  );
}

/** Horizontal friends row for the top of Games (and elsewhere). */
export function FriendsStrip({
  user,
  onOpenFriends,
}: {
  user: User;
  onOpenFriends?: () => void;
}) {
  const [friends, setFriends] = useState<FriendListUser[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await fetchFriendsPayload(user.username);
      setFriends(data.friends);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load friends');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [user.username]);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(t);
  }, [load]);

  const names = useMemo(() => friends.map((f) => f.username), [friends]);
  const online = useFriendsOnlineStatus(names);
  const onlineCount = names.filter((n) => online[n]?.isOnline).length;

  return (
    <div
      className="ai-box"
      style={{
        marginBottom: 16,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          Friends {loading ? '' : `(${friends.length})`}
          {!loading && onlineCount > 0 ? (
            <span style={{ marginLeft: 8, color: '#22c55e', fontWeight: 600, fontSize: 12 }}>
              {onlineCount} online
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="btn"
          style={{ fontSize: 12, padding: '6px 10px' }}
          onClick={() => (onOpenFriends ? onOpenFriends() : navigateToTab('friends'))}
        >
          Manage
        </button>
      </div>

      {error ? (
        <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>
      ) : loading ? (
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Loading friends…</div>
      ) : friends.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          No friends yet — open Friends to search and send requests.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 4,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {friends.map((friend) => (
            <div
              key={friend.username}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                minWidth: 56,
              }}
            >
              <AvatarChip
                username={friend.username}
                online={!!online[friend.username]?.isOnline}
                onClick={() => navigateToTab('friends')}
              />
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  maxWidth: 64,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {friend.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { AvatarChip };
