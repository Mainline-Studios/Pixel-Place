'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Skin, User } from '@/types';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage } from '@/lib/api';
import { useFriendsOnlineStatus } from '@/lib/onlineStatus';
import { navigateToTab } from '@/lib/routing';
import { getSkins } from '@/lib/storage';

export type FriendListUser = Pick<User, 'username'> & {
  emailVerified?: boolean;
  photoURL?: string;
  equippedSkin?: string;
  equippedFace?: string;
  equippedAccessories?: Record<string, string> | string[];
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

const FALLBACK_COLORS = {
  head: '#f4c2a1',
  torso: '#4d536f',
  arm: '#3a3f56',
  legs: '#3a3f56',
};

/** Compact 2D avatar preview from equipped skin colors (no WebGL per friend). */
function SkinAvatarPreview({
  colors,
  size,
}: {
  colors: { head: string; torso: string; arm: string; legs: string };
  size: number;
}) {
  const s = size / 40;
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, #334155 0%, #0f172a 75%)',
      }}
    >
      <div style={{ position: 'relative', width: 22 * s, height: 34 * s, marginBottom: 3 * s }}>
        <div
          style={{
            position: 'absolute',
            left: 5 * s,
            top: 0,
            width: 12 * s,
            height: 12 * s,
            borderRadius: 2 * s,
            background: colors.head,
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 4 * s,
            top: 11 * s,
            width: 14 * s,
            height: 12 * s,
            borderRadius: 2 * s,
            background: colors.torso,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 12 * s,
            width: 5 * s,
            height: 11 * s,
            borderRadius: 1.5 * s,
            background: colors.arm,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 12 * s,
            width: 5 * s,
            height: 11 * s,
            borderRadius: 1.5 * s,
            background: colors.arm,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 5 * s,
            top: 22 * s,
            width: 5.5 * s,
            height: 11 * s,
            borderRadius: 1.5 * s,
            background: colors.legs,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 5 * s,
            top: 22 * s,
            width: 5.5 * s,
            height: 11 * s,
            borderRadius: 1.5 * s,
            background: colors.legs,
          }}
        />
      </div>
    </div>
  );
}

/** Compact avatar preview: skin colors, photo, or letter fallback. */
function AvatarChip({
  username,
  online,
  size = 48,
  onClick,
  skin,
  photoURL,
}: {
  username: string;
  online?: boolean;
  size?: number;
  onClick?: () => void;
  skin?: Skin | null;
  photoURL?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const colors = {
    head: skin?.colors?.head || FALLBACK_COLORS.head,
    torso: skin?.colors?.torso || FALLBACK_COLORS.torso,
    arm: skin?.colors?.arm || FALLBACK_COLORS.arm,
    legs: skin?.colors?.legs || FALLBACK_COLORS.legs,
  };

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
        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
        color: 'var(--text-main)',
        fontWeight: 700,
        fontSize: Math.max(12, size * 0.35),
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {skin ? (
        <SkinAvatarPreview colors={colors} size={size} />
      ) : photoURL && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(145deg, ${colors.torso}, ${colors.head})`,
          }}
        >
          {username.charAt(0).toUpperCase()}
        </span>
      )}
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
          zIndex: 2,
        }}
      />
    </button>
  );
}

/** Horizontal friends row for the top of Games (and elsewhere). */
export function FriendsStrip({
  user,
  onOpenFriends,
  selectedFriend,
  onSelectFriend,
  onPlayWithFriend,
}: {
  user: User;
  onOpenFriends?: () => void;
  selectedFriend?: string | null;
  onSelectFriend?: (username: string | null) => void;
  /** Launch Open World (or other) with this friend */
  onPlayWithFriend?: (friendUsername: string) => void;
}) {
  const [friends, setFriends] = useState<FriendListUser[]>([]);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      const [data, skinsData] = await Promise.all([
        fetchFriendsPayload(user.username),
        getSkins().catch(() => [] as Skin[]),
      ]);
      setFriends(data.friends);
      setSkins(Array.isArray(skinsData) ? skinsData : []);
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
  const selected = selectedFriend
    ? friends.find((f) => f.username.toLowerCase() === selectedFriend.toLowerCase()) || null
    : null;

  const skinForFriend = useCallback(
    (friend: FriendListUser): Skin | null => {
      if (!skins.length) return null;
      const byId =
        skins.find((s) => s.id === friend.equippedSkin) ||
        skins.find((s) => s.id === 'pixel_placer') ||
        skins[0];
      return byId || null;
    },
    [skins],
  );

  const handleFriendClick = (username: string) => {
    if (onSelectFriend) {
      onSelectFriend(selectedFriend?.toLowerCase() === username.toLowerCase() ? null : username);
      return;
    }
    navigateToTab('friends');
  };

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
        <>
          <div
            style={{
              display: 'flex',
              gap: 14,
              overflowX: 'auto',
              paddingBottom: 4,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {friends.map((friend) => {
              const isSelected = selectedFriend?.toLowerCase() === friend.username.toLowerCase();
              return (
                <div
                  key={friend.username}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 64,
                  }}
                >
                  <div
                    style={{
                      borderRadius: '50%',
                      padding: 2,
                      outline: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                    }}
                  >
                    <AvatarChip
                      username={friend.username}
                      online={!!online[friend.username]?.isOnline}
                      skin={skinForFriend(friend)}
                      photoURL={friend.photoURL}
                      size={52}
                      onClick={() => handleFriendClick(friend.username)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFriendClick(friend.username)}
                    style={{
                      fontSize: 11,
                      color: isSelected ? '#22c55e' : 'var(--text-dim)',
                      fontWeight: isSelected ? 700 : 500,
                      maxWidth: 72,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {friend.username}
                  </button>
                </div>
              );
            })}
          </div>

          {onPlayWithFriend && selected ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn"
                onClick={() => onPlayWithFriend(selected.username)}
                style={{
                  background: '#22c55e',
                  color: '#052e16',
                  fontWeight: 700,
                  border: 'none',
                  padding: '10px 14px',
                }}
              >
                Play with {selected.username}
              </button>
              <button
                type="button"
                className="btn"
                style={{ fontSize: 12, padding: '8px 10px' }}
                onClick={() => onSelectFriend?.(null)}
              >
                Clear
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                Opens Open World Plaza together
                {online[selected.username]?.isOnline ? ' · they look online' : ''}
              </span>
            </div>
          ) : onPlayWithFriend ? (
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              Click a friend’s name, then press Play with them.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export { AvatarChip };
