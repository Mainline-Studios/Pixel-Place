'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { User, FriendRequest, Message } from '@/types';
import { getUsers } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';
import { useUser } from '@/contexts/UserContext';
import { useFriendsOnlineStatus, useOnlineStatus, updateCurrentGame, OnlineStatus } from '@/lib/onlineStatus';

interface FriendsTabProps {
  user: User;
  editMode: boolean;
}

interface FriendData {
  friends: User[];
  incomingRequests: FriendRequest[];
  sentRequests: string[];
}

export default function FriendsTab({ user, editMode }: FriendsTabProps) {
  const { updateUser } = useUser();
  const [friendsData, setFriendsData] = useState<FriendData>({ friends: [], incomingRequests: [], sentRequests: [] });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Track online status for current user
  useOnlineStatus(user.username);

  // Filter users for search (using useMemo to ensure proper hook ordering)
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      if (!u || !u.username) return false;
      const query = searchQuery.toLowerCase().trim();
      const username = u.username.toLowerCase();
      const isFriend = friendsData.friends.some(f => f && f.username && f.username.toLowerCase() === username);
      const isPending = friendsData.sentRequests.some(r => r && r.toLowerCase() === username);
      
      // If search query is empty, show all users (except self, friends, and pending)
      if (!query) {
        return !isFriend && !isPending && username !== user.username.toLowerCase();
      }
      
      // If search query exists, filter by it
      return username.includes(query) && !isFriend && !isPending && username !== user.username.toLowerCase();
    });
  }, [allUsers, searchQuery, friendsData.friends, friendsData.sentRequests, user.username]);

  // Track online status for all friends and search results
  const friendUsernames = useMemo(() => friendsData.friends.map(f => f.username), [friendsData.friends]);
  const searchUsernames = useMemo(() => filteredUsers.slice(0, 20).map(u => u.username), [filteredUsers]);
  const allTrackedUsernames = useMemo(() => [...new Set([...friendUsernames, ...searchUsernames])], [friendUsernames, searchUsernames]);
  const friendsOnlineStatus = useFriendsOnlineStatus(allTrackedUsernames);

  // Load friends data - non-blocking
  const loadFriendsData = async () => {
    try {
      const response = await fetch(apiUrl(`/api/friends?username=${encodeURIComponent(user.username)}`), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFriendsData(data);
      }
    } catch (error) {
      // Silent error - don't block UI
    }
  };

  // Load all users for search - non-blocking
  const loadAllUsers = async () => {
    try {
      const users = await getUsers();
      setAllUsers(users.filter(u => u.username.toLowerCase() !== user.username.toLowerCase()));
    } catch (error) {
      // Silent error - don't block UI
    }
  };

  // Load messages for selected friend
  const loadMessages = async (friendUsername: string) => {
    try {
      const response = await fetch(apiUrl(`/api/messages?username=${encodeURIComponent(user.username)}&with=${encodeURIComponent(friendUsername)}`));
      if (response.ok) {
        const msgs = await response.json();
        setMessages(msgs);
        // Mark messages as read
        msgs.forEach((msg: Message) => {
          if (msg.to.toLowerCase() === user.username.toLowerCase() && !msg.read) {
            fetch(apiUrl('/api/messages'), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: msg.id, read: true })
            }).catch(() => {});
          }
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    // Load immediately without blocking - start both in parallel
    loadFriendsData();
    loadAllUsers();
    // Refresh every 5 seconds (less frequent to reduce load)
    const interval = setInterval(() => {
      loadFriendsData();
      if (selectedFriend) {
        loadMessages(selectedFriend.username);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user.username]);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages(selectedFriend.username);
    }
  }, [selectedFriend]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive, but only scroll the container, not the page
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const shouldScroll = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      if (shouldScroll) {
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [messages]);

  // Send friend request
  const sendFriendRequest = async (toUsername: string) => {
    try {
      const response = await fetch(apiUrl('/api/friends'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          fromUsername: user.username,
          toUsername
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await loadFriendsData();
        await loadAllUsers();
        // Show success message
        // Don't show alert on success to avoid annoying user
      } else {
        // Silent error - no alert
        console.error('Friend request error:', result.error);
      }
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      // Silent error - no alert
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (fromUsername: string) => {
    try {
      const response = await fetch(apiUrl('/api/friends'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          fromUsername,
          toUsername: user.username
        })
      });
      if (response.ok) {
        await loadFriendsData();
        await loadAllUsers(); // Refresh user list too
        // Update user context
        const updatedFriendsData = await fetch(apiUrl(`/api/friends?username=${encodeURIComponent(user.username)}`), {
          cache: 'no-store'
        }).then(r => r.json());
        updateUser({ friends: updatedFriendsData.friends.map((f: User) => f.username) });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Decline friend request
  const declineFriendRequest = async (fromUsername: string) => {
    try {
      const response = await fetch(apiUrl('/api/friends'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          fromUsername,
          toUsername: user.username
        })
      });
      if (response.ok) {
        await loadFriendsData();
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  // Remove friend
  const removeFriend = async (friendUsername: string) => {
    if (!confirm(`Remove ${friendUsername} from your friends?`)) return;
    try {
      const response = await fetch(apiUrl('/api/friends'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          fromUsername: user.username,
          toUsername: friendUsername
        })
      });
      if (response.ok) {
        await loadFriendsData();
        await loadAllUsers(); // Refresh user list too
        if (selectedFriend?.username === friendUsername) {
          setSelectedFriend(null);
          setMessages([]);
        }
        // Update user context
        const updatedFriendsData = await fetch(apiUrl(`/api/friends?username=${encodeURIComponent(user.username)}`), {
          cache: 'no-store'
        }).then(r => r.json());
        updateUser({ friends: updatedFriendsData.friends.map((f: User) => f.username) });
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedFriend || !newMessage.trim()) return;

    try {
      const response = await fetch(apiUrl('/api/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername: user.username,
          toUsername: selectedFriend.username,
          message: newMessage.trim()
        })
      });
      if (response.ok) {
        setNewMessage('');
        await loadMessages(selectedFriend.username);
        messageInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Join friend's game
  const handleJoinFriend = async (friendUsername: string) => {
    try {
      // Get friend's current game session
      const presenceResponse = await fetch(apiUrl(`/api/presence?username=${encodeURIComponent(friendUsername)}`));
      if (presenceResponse.ok) {
        const presence = await presenceResponse.json();
        if (presence.isOnline && presence.currentSessionId) {
          // Friend is in a game - join it
          const joinResponse = await fetch(apiUrl('/api/game-sessions'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'join',
              sessionId: presence.currentSessionId,
              username: user.username
            })
          });
          if (joinResponse.ok) {
            window.location.href = `/play?session=${presence.currentSessionId}`;
          } else {
            alert('Could not join friend\'s game. The session may be full or no longer available.');
          }
        } else {
          // Friend is online but not in a game - create a new game session
          const gameResponse = await fetch(apiUrl('/api/game-sessions'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create',
              gameId: 'multiplayer',
              hostUsername: user.username
            })
          });
          if (gameResponse.ok) {
            const result = await gameResponse.json();
            // Invite friend to join
            await fetch(apiUrl('/api/game-sessions'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'join',
                sessionId: result.session.sessionId,
                username: friendUsername
              })
            });
            window.location.href = `/play?session=${result.session.sessionId}`;
          }
        }
      }
    } catch (error) {
      console.error('Error joining friend:', error);
      alert('Could not join friend. They may not be in a game.');
    }
  };

  // Chat with non-friend user
  const handleChatWithUser = (targetUsername: string) => {
    // Send friend request first, then open chat
    sendFriendRequest(targetUsername);
    // After friend request is sent, we could open a chat window
    // For now, just send the request
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <h2 className="section-title">Friends</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'friends' ? 'var(--accent-bg)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'friends' ? '2px solid var(--accent-hover)' : '2px solid transparent',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Friends ({friendsData.friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'requests' ? 'var(--accent-bg)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '2px solid var(--accent-hover)' : '2px solid transparent',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            position: 'relative'
          }}
        >
          Requests
          {friendsData.incomingRequests.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ff4d4d',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {friendsData.incomingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'search' ? 'var(--accent-bg)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'search' ? '2px solid var(--accent-hover)' : '2px solid transparent',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Find Friends
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedFriend ? '300px 1fr' : '1fr', gap: '20px', minHeight: '500px', alignContent: 'start' }}>
        {/* Left Panel: Friends List / Requests / Search */}
        <div style={{
          background: 'var(--panel-alt)',
          borderRadius: 'var(--panel-radius)',
          padding: '16px',
          border: '1px solid var(--border)',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {activeTab === 'friends' && (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                Your Friends ({friendsData.friends.length})
              </div>
              {friendsData.friends.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 20px' }}>
                  No friends yet. Search for users to add friends!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {friendsData.friends.map((friend) => (
                    <div
                      key={friend.username}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFriend(friend);
                      }}
                      style={{
                        padding: '12px',
                        background: selectedFriend?.username === friend.username ? 'var(--accent-bg)' : 'var(--panel-soft)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: selectedFriend?.username === friend.username ? '1px solid var(--accent-hover)' : '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFriend?.username !== friend.username) {
                          e.currentTarget.style.background = 'var(--panel-soft)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFriend?.username !== friend.username) {
                          e.currentTarget.style.background = 'var(--panel-soft)';
                        }
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                          {/* Online status indicator */}
                          {friendsOnlineStatus[friend.username]?.isOnline && (
                            <div style={{
                              position: 'absolute',
                              top: '-2px',
                              right: '-2px',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: '#4caf50',
                              border: '2px solid var(--panel-alt)',
                              boxShadow: '0 0 4px rgba(76, 175, 80, 0.6)'
                            }} />
                          )}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--accent-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-main)'
                          }}>
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {friend.username}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            {friendsOnlineStatus[friend.username]?.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {friendsOnlineStatus[friend.username]?.isOnline && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinFriend(friend.username);
                            }}
                            style={{
                              padding: '4px 8px',
                              background: 'var(--accent-bg)',
                              border: '1px solid var(--accent-hover)',
                              borderRadius: '4px',
                              color: 'var(--accent-hover)',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--accent-bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--accent-bg)';
                            }}
                          >
                            Join
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFriend(friend.username);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#3a1a1a';
                            e.currentTarget.style.borderColor = '#5a2a2a';
                            e.currentTarget.style.color = '#ff4d4d';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-dim)';
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                Friend Requests
              </div>
              
              {/* Incoming Requests */}
              {friendsData.incomingRequests.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                    Incoming ({friendsData.incomingRequests.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {friendsData.incomingRequests.map((request) => (
                      <div
                        key={`${request.from}-${request.timestamp}`}
                        style={{
                          padding: '12px',
                          background: 'var(--panel-soft)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                          {request.from}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => acceptFriendRequest(request.from)}
                            className="btn"
                            style={{ flex: 1, fontSize: '12px', padding: '6px 12px', background: '#00a2ff', border: 'none' }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.from)}
                            style={{
                              flex: 1,
                              fontSize: '12px',
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              color: 'var(--text-dim)',
                              cursor: 'pointer'
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sent Requests */}
              {friendsData.sentRequests.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                    Sent ({friendsData.sentRequests.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {friendsData.sentRequests.map((username) => (
                      <div
                        key={username}
                        style={{
                          padding: '12px',
                          background: 'var(--panel-soft)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          color: 'var(--text-dim)'
                        }}
                      >
                        {username} - Pending
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {friendsData.incomingRequests.length === 0 && friendsData.sentRequests.length === 0 && (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 20px' }}>
                  No friend requests
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                Find Friends
              </div>
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--panel-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredUsers.slice(0, 20).map((u) => {
                  const userStatus = friendsOnlineStatus[u.username] || { isOnline: false, username: u.username };
                  return (
                    <div
                      key={u.username}
                      style={{
                        padding: '12px',
                        background: 'var(--panel-soft)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{ position: 'relative' }}>
                          {/* Online status indicator */}
                          {userStatus.isOnline && (
                            <div style={{
                              position: 'absolute',
                              top: '-2px',
                              right: '-2px',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: '#4caf50',
                              border: '2px solid var(--panel-soft)',
                              boxShadow: '0 0 4px rgba(76, 175, 80, 0.6)'
                            }} />
                          )}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--accent-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-main)'
                          }}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                            {u.username}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            {userStatus.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {userStatus.isOnline && (
                          <button
                            onClick={() => handleChatWithUser(u.username)}
                            style={{
                              fontSize: '12px',
                              padding: '6px 12px',
                              background: 'var(--accent-bg)',
                              border: '1px solid var(--accent-hover)',
                              borderRadius: '4px',
                              color: 'var(--accent-hover)',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Chat
                          </button>
                        )}
                        <button
                          onClick={() => sendFriendRequest(u.username)}
                          className="btn"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Add Friend
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && searchQuery && (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                    No users found matching &quot;{searchQuery}&quot;
                  </div>
                )}
                {filteredUsers.length === 0 && !searchQuery && allUsers.length === 0 && (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                    No other users found
                  </div>
                )}
                {filteredUsers.length === 0 && !searchQuery && allUsers.length > 0 && (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                    Type a username to search for friends
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Messages */}
        {selectedFriend && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--panel-alt)',
            borderRadius: 'var(--panel-radius)',
            border: '1px solid var(--border)',
            height: '600px'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                {selectedFriend.username}
              </div>
              <button
                onClick={() => {
                  setSelectedFriend(null);
                  setMessages([]);
                }}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Close
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {messages.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 20px' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.from.toLowerCase() === user.username.toLowerCase();
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        background: isOwn ? '#00a2ff' : 'var(--panel-soft)',
                        borderRadius: '12px',
                        border: isOwn ? 'none' : '1px solid var(--border)'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          color: isOwn ? '#ffffff' : 'var(--text-main)',
                          marginBottom: '4px',
                          wordBreak: 'break-word'
                        }}>
                          {msg.message}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--text-dim)',
                          textAlign: 'right'
                        }}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                ref={messageInputRef}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--panel-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={sendMessage}
                className="btn"
                style={{
                  padding: '10px 20px',
                  background: '#00a2ff',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
