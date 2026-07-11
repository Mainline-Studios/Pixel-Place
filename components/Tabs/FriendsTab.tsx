'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { User, Message } from '@/types';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useFriendsOnlineStatus, useOnlineStatus } from '@/lib/onlineStatus';
import { getUsers } from '@/lib/storage';
import { navigateToTab } from '@/lib/routing';
import { AvatarChip, fetchFriendsPayload, FriendsPayload, FriendListUser } from '@/components/FriendsStrip';

interface FriendsTabProps {
  user: User;
  editMode: boolean;
}

type Panel = 'friends' | 'requests' | 'search';

function formatTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function FriendsTab({ user }: FriendsTabProps) {
  const { updateUser } = useUser();
  const [panel, setPanel] = useState<Panel>('friends');
  const [data, setData] = useState<FriendsPayload>({
    friends: [],
    incomingRequests: [],
    sentRequests: [],
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<FriendListUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useOnlineStatus(user.username);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(''), 3500);
  };

  const loadFriends = useCallback(async () => {
    try {
      const next = await fetchFriendsPayload(user.username);
      setData(next);
      const names = next.friends.map((f) => f.username);
      const prev = Array.isArray(user.friends) ? user.friends : [];
      const same =
        prev.length === names.length &&
        prev.every((n, i) => String(n).toLowerCase() === String(names[i]).toLowerCase());
      if (!same) {
        void updateUser({ friends: names });
      }
      setSelected((cur) => {
        if (!cur) return cur;
        return next.friends.find((f) => f.username.toLowerCase() === cur.username.toLowerCase()) || null;
      });
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, [user.username, user.friends, updateUser]);

  const loadDirectory = useCallback(async () => {
    try {
      const users = await getUsers();
      setAllUsers(users.filter((u) => u.username?.toLowerCase() !== user.username.toLowerCase()));
    } catch {
      /* directory optional */
    }
  }, [user.username]);

  const loadMessages = useCallback(
    async (friendUsername: string) => {
      try {
        const res = await authenticatedFetch(
          apiUrl(
            `/api/messages?username=${encodeURIComponent(user.username)}&with=${encodeURIComponent(friendUsername)}`
          ),
          { cache: 'no-store' }
        );
        const msgs = await res.json().catch(() => []);
        if (!res.ok) {
          flash(authErrorMessage(res.status, msgs));
          return;
        }
        setMessages(Array.isArray(msgs) ? msgs : []);
        for (const msg of Array.isArray(msgs) ? msgs : []) {
          if (msg.to?.toLowerCase() === user.username.toLowerCase() && !msg.read) {
            void authenticatedFetch(apiUrl('/api/messages'), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: msg.id, read: true }),
            });
          }
        }
      } catch {
        flash('Could not load messages');
      }
    },
    [user.username]
  );

  useEffect(() => {
    void loadFriends();
    void loadDirectory();
    const t = window.setInterval(() => {
      void loadFriends();
      if (selected) void loadMessages(selected.username);
    }, 8000);
    return () => window.clearInterval(t);
  }, [loadFriends, loadDirectory, selected, loadMessages]);

  useEffect(() => {
    if (selected) void loadMessages(selected.username);
    else setMessages([]);
  }, [selected, loadMessages]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const friendNames = useMemo(() => data.friends.map((f) => f.username), [data.friends]);
  const online = useFriendsOnlineStatus(friendNames);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const friendSet = new Set(data.friends.map((f) => f.username.toLowerCase()));
    const pendingSet = new Set(data.sentRequests.map((r) => String(r).toLowerCase()));
    return allUsers.filter((u) => {
      if (!u?.username) return false;
      const name = u.username.toLowerCase();
      if (friendSet.has(name) || pendingSet.has(name)) return false;
      if (!q) return true;
      return name.includes(q);
    });
  }, [allUsers, searchQuery, data.friends, data.sentRequests]);

  const postAction = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await authenticatedFetch(apiUrl('/api/friends'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash(authErrorMessage(res.status, result));
        return false;
      }
      await loadFriends();
      await loadDirectory();
      return true;
    } catch {
      flash('Network error');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendRequest = (toUsername: string) =>
    postAction({ action: 'send', fromUsername: user.username, toUsername }).then((ok) => {
      if (ok) flash(`Request sent to ${toUsername}`);
    });

  const acceptRequest = (fromUsername: string) =>
    postAction({ action: 'accept', fromUsername, toUsername: user.username }).then((ok) => {
      if (ok) flash(`You are now friends with ${fromUsername}`);
    });

  const declineRequest = (fromUsername: string) =>
    postAction({ action: 'decline', fromUsername, toUsername: user.username });

  const removeFriend = async (friendUsername: string) => {
    if (!window.confirm(`Remove ${friendUsername} from your friends?`)) return;
    const ok = await postAction({
      action: 'remove',
      fromUsername: user.username,
      toUsername: friendUsername,
    });
    if (ok && selected?.username === friendUsername) {
      setSelected(null);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!selected || !draft.trim() || busy) return;
    setBusy(true);
    try {
      const res = await authenticatedFetch(apiUrl('/api/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername: user.username,
          toUsername: selected.username,
          message: draft.trim(),
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash(authErrorMessage(res.status, result));
        return;
      }
      setDraft('');
      await loadMessages(selected.username);
      inputRef.current?.focus();
    } catch {
      flash('Failed to send message');
    } finally {
      setBusy(false);
    }
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: '8px 14px',
    background: active ? 'var(--accent-bg)' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--accent-hover)' : '2px solid transparent',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    position: 'relative' as const,
  });

  return (
    <>
      <h2 className="section-title">Friends</h2>
      <p className="smalltext" style={{ marginTop: -8, marginBottom: 12 }}>
        Add players, accept requests, and chat. Online status updates live.
      </p>

      {status ? (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(74,144,226,0.12)',
            border: '1px solid rgba(74,144,226,0.35)',
            fontSize: 13,
          }}
        >
          {status}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <button type="button" style={tabStyle(panel === 'friends')} onClick={() => setPanel('friends')}>
          Friends ({data.friends.length})
        </button>
        <button type="button" style={tabStyle(panel === 'requests')} onClick={() => setPanel('requests')}>
          Requests
          {data.incomingRequests.length > 0 ? (
            <span
              style={{
                marginLeft: 6,
                background: '#ef4444',
                color: '#fff',
                borderRadius: 999,
                padding: '1px 6px',
                fontSize: 11,
              }}
            >
              {data.incomingRequests.length}
            </span>
          ) : null}
        </button>
        <button type="button" style={tabStyle(panel === 'search')} onClick={() => setPanel('search')}>
          Find Friends
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selected ? 'minmax(260px, 320px) 1fr' : '1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: 'var(--panel-alt)',
            borderRadius: 'var(--panel-radius)',
            padding: 14,
            border: '1px solid var(--border)',
            maxHeight: 620,
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <div style={{ color: 'var(--text-dim)', padding: 24, textAlign: 'center' }}>Loading…</div>
          ) : null}

          {!loading && panel === 'friends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.friends.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
                  No friends yet. Use Find Friends to send a request.
                </div>
              ) : (
                data.friends.map((friend) => {
                  const isOn = !!online[friend.username]?.isOnline;
                  const active = selected?.username === friend.username;
                  return (
                    <div
                      key={friend.username}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(friend)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelected(friend);
                      }}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: active ? '1px solid var(--accent-hover)' : '1px solid var(--border)',
                        background: active ? 'var(--accent-bg)' : 'var(--panel-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        cursor: 'pointer',
                      }}
                    >
                      <AvatarChip username={friend.username} online={isOn} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{friend.username}</div>
                        <div style={{ fontSize: 11, color: isOn ? '#22c55e' : 'var(--text-dim)' }}>
                          {isOn ? 'Online' : 'Offline'}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn"
                        style={{ fontSize: 11, padding: '4px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToTab('games');
                        }}
                      >
                        Games
                      </button>
                      <button
                        type="button"
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                        }}
                        disabled={busy}
                        onClick={(e) => {
                          e.stopPropagation();
                          void removeFriend(friend.username);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {!loading && panel === 'requests' && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Incoming</div>
              {data.incomingRequests.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', marginBottom: 18, fontSize: 13 }}>No incoming requests</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {data.incomingRequests.map((req) => (
                    <div
                      key={`${req.from}-${req.timestamp}`}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--panel-soft)',
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>{req.from}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn"
                          disabled={busy}
                          style={{ flex: 1 }}
                          onClick={() => void acceptRequest(req.from)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                          onClick={() => void declineRequest(req.from)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ fontWeight: 600, marginBottom: 10 }}>Sent</div>
              {data.sentRequests.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No pending sent requests</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.sentRequests.map((name) => (
                    <div
                      key={name}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        color: 'var(--text-dim)',
                        fontSize: 13,
                      }}
                    >
                      {name} · pending
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && panel === 'search' && (
            <div>
              <input
                type="search"
                placeholder="Search username…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 12,
                  background: 'var(--panel-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-main)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredUsers.slice(0, 30).map((u) => (
                  <div
                    key={u.username}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--panel-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <AvatarChip username={u.username} size={32} />
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{u.username}</div>
                    <button
                      type="button"
                      className="btn"
                      disabled={busy}
                      style={{ fontSize: 12, padding: '6px 10px' }}
                      onClick={() => void sendRequest(u.username)}
                    >
                      Add
                    </button>
                  </div>
                ))}
                {filteredUsers.length === 0 ? (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20, fontSize: 13 }}>
                    {searchQuery ? `No matches for “${searchQuery}”` : 'No other players to show yet.'}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {selected ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--panel-alt)',
              borderRadius: 'var(--panel-radius)',
              border: '1px solid var(--border)',
              minHeight: 420,
              height: 620,
            }}
          >
            <div
              style={{
                padding: 14,
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AvatarChip
                  username={selected.username}
                  online={!!online[selected.username]?.isOnline}
                  size={36}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{selected.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {online[selected.username]?.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-dim)',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 40 }}>
                  No messages yet — say hi.
                </div>
              ) : (
                messages.map((msg) => {
                  const own = msg.from.toLowerCase() === user.username.toLowerCase();
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: own ? 'flex-end' : 'flex-start' }}>
                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '8px 12px',
                          borderRadius: 12,
                          background: own ? '#0284c7' : 'var(--panel-soft)',
                          border: own ? 'none' : '1px solid var(--border)',
                          color: own ? '#fff' : 'var(--text-main)',
                        }}
                      >
                        <div style={{ fontSize: 14, wordBreak: 'break-word' }}>{msg.message}</div>
                        <div style={{ fontSize: 10, opacity: 0.7, textAlign: 'right', marginTop: 4 }}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void sendMessage();
                }}
                placeholder="Type a message…"
                style={{
                  flex: 1,
                  padding: 10,
                  background: 'var(--panel-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-main)',
                }}
              />
              <button type="button" className="btn" disabled={busy || !draft.trim()} onClick={() => void sendMessage()}>
                Send
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
