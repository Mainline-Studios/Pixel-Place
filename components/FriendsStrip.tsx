'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Accessory, Skin, User } from '@/types';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage } from '@/lib/api';
import { useFriendsOnlineStatus } from '@/lib/onlineStatus';
import { navigateToTab } from '@/lib/routing';
import { getAccessories, getSkins } from '@/lib/storage';
import { normalizeAvatarPose } from '@/lib/avatarPoses';
import Avatar3DViewer from '@/components/Avatar3DViewer';

export type FriendListUser = Pick<User, 'username'> & {
  emailVerified?: boolean;
  photoURL?: string;
  equippedSkin?: string;
  equippedFace?: string;
  equippedAccessories?: Record<string, string> | string[];
  accountPreferences?: User['accountPreferences'];
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

/** 3D friend chip with their equipped skin + selected showcase pose. */
function AvatarChip({
  username,
  online,
  size = 72,
  onClick,
  skin,
  face,
  pose,
}: {
  username: string;
  online?: boolean;
  size?: number;
  onClick?: () => void;
  skin?: Skin | null;
  face?: Skin | null;
  pose?: string;
}) {
  const animation = normalizeAvatarPose(pose);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${username} · ${animation}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: 14,
        border: '1px solid var(--border)',
        background: 'radial-gradient(circle at 50% 20%, #334155 0%, #0b1220 78%)',
        color: 'var(--text-main)',
        fontWeight: 700,
        fontSize: Math.max(12, size * 0.28),
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {skin ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transform: 'translateY(6%)',
          }}
        >
          <Avatar3DViewer
            skin={skin}
            equippedFace={face || undefined}
            width={size}
            height={size}
            interactive={false}
            autoRotate
            turntableSpeed={0.45}
            animation={animation}
          />
        </div>
      ) : (
        <span
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {username.charAt(0).toUpperCase()}
        </span>
      )}
      <span
        style={{
          position: 'absolute',
          right: 4,
          bottom: 4,
          width: Math.max(9, size * 0.18),
          height: Math.max(9, size * 0.18),
          borderRadius: '50%',
          background: online ? '#22c55e' : '#64748b',
          border: '2px solid #0b1220',
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
  onPlayWithFriend?: (friendUsername: string) => void;
}) {
  const [friends, setFriends] = useState<FriendListUser[]>([]);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      const [data, skinsData, accData] = await Promise.all([
        fetchFriendsPayload(user.username),
        getSkins().catch(() => [] as Skin[]),
        getAccessories().catch(() => [] as Accessory[]),
      ]);
      setFriends(data.friends);
      setSkins(Array.isArray(skinsData) ? skinsData : []);
      setAccessories(Array.isArray(accData) ? accData : []);
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

  const previewForFriend = useCallback(
    (friend: FriendListUser): { skin: Skin | null; face: Skin | null; pose: string } => {
      const base =
        skins.find((s) => s.id === friend.equippedSkin) ||
        skins.find((s) => s.id === 'pixel_placer') ||
        skins[0] ||
        null;
      const face = friend.equippedFace
        ? skins.find((s) => s.id === friend.equippedFace && s.isFace) || null
        : null;
      const equippedIds = Object.values(friend.equippedAccessories || {}).filter(Boolean) as string[];
      const accList = equippedIds
        .map((id) => accessories.find((a) => a.id === id))
        .filter(Boolean) as Accessory[];
      const skin = base
        ? {
            ...base,
            accessories: [...(base.accessories || []), ...accList],
          }
        : null;
      return {
        skin,
        face,
        pose: normalizeAvatarPose(friend.accountPreferences?.avatarPose),
      };
    },
    [skins, accessories],
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
              paddingBottom: 6,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {friends.map((friend) => {
              const isSelected = selectedFriend?.toLowerCase() === friend.username.toLowerCase();
              const preview = previewForFriend(friend);
              return (
                <div
                  key={friend.username}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 76,
                  }}
                >
                  <div
                    style={{
                      borderRadius: 16,
                      padding: 2,
                      outline: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                    }}
                  >
                    <AvatarChip
                      username={friend.username}
                      online={!!online[friend.username]?.isOnline}
                      skin={preview.skin}
                      face={preview.face}
                      pose={preview.pose}
                      size={76}
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
                      maxWidth: 80,
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
                Opens a private duo plaza
                {online[selected.username]?.isOnline ? ' · they look online' : ''}
              </span>
            </div>
          ) : onPlayWithFriend ? (
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              Click a friend, then Play with them — or open Open World for global / private servers.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export { AvatarChip };
