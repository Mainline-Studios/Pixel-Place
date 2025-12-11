'use client';

import { useState, useEffect } from 'react';
import { User, FriendRequest, Message } from '@/types';
import { getUsers, saveUsers, getFriendRequests, saveFriendRequests, getMessages, saveMessages } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

interface FriendsTabProps {
  user: User;
  editMode: boolean;
}

export default function FriendsTab({ user, editMode }: FriendsTabProps) {
  const { updateUser } = useUser();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'messages' | 'add'>('friends');
  const [friendUsername, setFriendUsername] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const users = getUsers();
  const friendRequests = getFriendRequests();
  const messages = getMessages();

  const currentUser = users.find(u => u.username === user.username) || user;
  const friends = currentUser.friends || [];
  const incomingRequests = friendRequests.filter(
    req => req.to === user.username && req.status === 'pending'
  );
  const outgoingRequests = currentUser.sentFriendRequests || [];

  const friendUsers = users.filter(u => friends.includes(u.username));
  const unreadMessages = messages.filter(
    m => m.to === user.username && !m.read
  );

  const handleSendFriendRequest = () => {
    if (!friendUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    if (friendUsername.toLowerCase() === user.username.toLowerCase()) {
      alert('You cannot add yourself as a friend');
      return;
    }

    const targetUser = users.find(u => u.username.toLowerCase() === friendUsername.toLowerCase());
    if (!targetUser) {
      alert('User not found');
      return;
    }

    if (friends.includes(targetUser.username)) {
      alert('You are already friends with this user');
      return;
    }

    if (outgoingRequests.includes(targetUser.username)) {
      alert('You already sent a friend request to this user');
      return;
    }

    // Check if there's already a pending request from them
    const existingRequest = friendRequests.find(
      req => req.from === targetUser.username && req.to === user.username && req.status === 'pending'
    );

    if (existingRequest) {
      // Auto-accept if they sent you a request
      handleAcceptRequest(existingRequest);
      return;
    }

    // Create new friend request
    const newRequest: FriendRequest = {
      from: user.username,
      to: targetUser.username,
      timestamp: Date.now(),
      status: 'pending'
    };

    const updatedRequests = [...friendRequests, newRequest];
    saveFriendRequests(updatedRequests);

    const updatedSentRequests = [...outgoingRequests, targetUser.username];
    const updatedUsers = users.map(u =>
      u.username === user.username
        ? { ...u, sentFriendRequests: updatedSentRequests }
        : u
    );
    saveUsers(updatedUsers);
    updateUser({ sentFriendRequests: updatedSentRequests });

    setFriendUsername('');
    alert(`Friend request sent to ${targetUser.username}`);
  };

  const handleAcceptRequest = (request: FriendRequest) => {
    const updatedRequests = friendRequests.map(req =>
      req.from === request.from && req.to === request.to
        ? { ...req, status: 'accepted' as const }
        : req
    );
    saveFriendRequests(updatedRequests);

    // Add to both users' friend lists
    const updatedUsers = users.map(u => {
      if (u.username === user.username) {
        const newFriends = [...(u.friends || []), request.from];
        return { ...u, friends: newFriends };
      }
      if (u.username === request.from) {
        const newFriends = [...(u.friends || []), user.username];
        return { ...u, friends: newFriends };
      }
      return u;
    });
    saveUsers(updatedUsers);

    // Update current user
    const newFriends = [...friends, request.from];
    updateUser({ friends: newFriends });

    alert(`You are now friends with ${request.from}!`);
  };

  const handleDeclineRequest = (request: FriendRequest) => {
    const updatedRequests = friendRequests.map(req =>
      req.from === request.from && req.to === request.to
        ? { ...req, status: 'declined' as const }
        : req
    );
    saveFriendRequests(updatedRequests);
    alert(`Friend request from ${request.from} declined`);
  };

  const handleRemoveFriend = (friendUsername: string) => {
    if (!confirm(`Remove ${friendUsername} from your friends list?`)) return;

    const updatedUsers = users.map(u => {
      if (u.username === user.username) {
        return { ...u, friends: (u.friends || []).filter(f => f !== friendUsername) };
      }
      if (u.username === friendUsername) {
        return { ...u, friends: (u.friends || []).filter(f => f !== user.username) };
      }
      return u;
    });
    saveUsers(updatedUsers);

    const newFriends = friends.filter(f => f !== friendUsername);
    updateUser({ friends: newFriends });
    alert(`${friendUsername} removed from friends`);
  };

  const handleSendMessage = () => {
    if (!selectedFriend || !messageText.trim()) {
      alert('Please select a friend and enter a message');
      return;
    }

    const newMessage: Message = {
      id: 'msg_' + Date.now() + '_' + Math.random(),
      from: user.username,
      to: selectedFriend,
      message: messageText,
      timestamp: Date.now(),
      read: false
    };

    const updatedMessages = [...messages, newMessage];
    saveMessages(updatedMessages);
    setMessageText('');
    alert('Message sent!');
  };

  const handleMarkAsRead = (messageId: string) => {
    const updatedMessages = messages.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    );
    saveMessages(updatedMessages);
  };

  const conversationMessages = selectedFriend
    ? messages.filter(
      m =>
        (m.from === user.username && m.to === selectedFriend) ||
        (m.from === selectedFriend && m.to === user.username)
    ).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  return (
    <>
      <h2 className="section-title">Friends</h2>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          Friends ({friends.length})
        </button>
        <button
          className={`btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          Requests ({incomingRequests.length})
        </button>
        <button
          className={`btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          Messages {unreadMessages.length > 0 && `(${unreadMessages.length})`}
        </button>
        <button
          className={`btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          Add Friend
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div className="ai-box">
          <div className="ai-label">Your Friends ({friends.length})</div>
          {friends.length === 0 ? (
            <div className="smalltext">You don&apos;t have any friends yet. Add some friends to get started!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {friendUsers.map((friend) => (
                <div
                  key={friend.username}
                  style={{
                    padding: '12px',
                    background: 'var(--panel-soft)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {escapeHTML(friend.username)}
                    </div>
                    <div className="smalltext" style={{ color: 'var(--text-dim)' }}>
                      {friend.role === 'admin' ? '👑 Admin' : 'User'} • {escapeHTML(friend.gender || 'N/A')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => {
                        setSelectedFriend(friend.username);
                        setActiveTab('messages');
                      }}
                    >
                      Message
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--danger)' }}
                      onClick={() => handleRemoveFriend(friend.username)}
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

      {/* Friend Requests */}
      {activeTab === 'requests' && (
        <div className="ai-box">
          <div className="ai-label">Friend Requests</div>

          {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
            <div className="smalltext" style={{ marginTop: '12px' }}>No pending friend requests</div>
          ) : (
            <>
              {incomingRequests.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Incoming Requests:</div>
                  {incomingRequests.map((request) => (
                    <div
                      key={`${request.from}-${request.timestamp}`}
                      style={{
                        padding: '12px',
                        background: 'var(--panel-soft)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{escapeHTML(request.from)}</div>
                        <div className="smalltext" style={{ color: 'var(--text-dim)' }}>
                          wants to be your friend
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn"
                          style={{ fontSize: '12px', padding: '6px 12px', background: '#4ade80' }}
                          onClick={() => handleAcceptRequest(request)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn"
                          style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--danger)' }}
                          onClick={() => handleDeclineRequest(request)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {outgoingRequests.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Sent Requests:</div>
                  {outgoingRequests.map((username) => (
                    <div
                      key={username}
                      style={{
                        padding: '12px',
                        background: 'var(--panel-soft)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{escapeHTML(username)}</div>
                        <div className="smalltext" style={{ color: 'var(--text-dim)' }}>
                          Pending...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Messages */}
      {activeTab === 'messages' && (
        <div className="ai-box">
          <div className="ai-label">Direct Messages</div>

          {friends.length === 0 ? (
            <div className="smalltext" style={{ marginTop: '12px' }}>
              Add friends to start messaging
            </div>
          ) : (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', minHeight: '400px' }}>
                {/* Friend List Sidebar */}
                <div style={{ borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Friends:</div>
                  {friendUsers.map((friend) => {
                    const unreadCount = messages.filter(
                      m => m.from === friend.username && m.to === user.username && !m.read
                    ).length;
                    return (
                      <div
                        key={friend.username}
                        onClick={() => {
                          setSelectedFriend(friend.username);
                          // Mark messages as read when opening conversation
                          messages
                            .filter(m => m.from === friend.username && m.to === user.username && !m.read)
                            .forEach(m => handleMarkAsRead(m.id));
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: selectedFriend === friend.username ? 'var(--accent-bg)' : 'transparent',
                          marginBottom: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{escapeHTML(friend.username)}</span>
                        {unreadCount > 0 && (
                          <span style={{
                            background: 'var(--danger)',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 600
                          }}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Message Area */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {selectedFriend ? (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                        Conversation with {escapeHTML(selectedFriend)}
                      </div>

                      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', maxHeight: '300px' }}>
                        {conversationMessages.length === 0 ? (
                          <div className="smalltext" style={{ color: 'var(--text-dim)' }}>
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          conversationMessages.map((msg) => (
                            <div
                              key={msg.id}
                              style={{
                                marginBottom: '12px',
                                display: 'flex',
                                flexDirection: msg.from === user.username ? 'row-reverse' : 'row',
                                gap: '8px'
                              }}
                            >
                              <div
                                style={{
                                  padding: '8px 12px',
                                  background: msg.from === user.username ? 'var(--accent-bg)' : 'var(--panel-soft)',
                                  borderRadius: '8px',
                                  maxWidth: '70%'
                                }}
                              >
                                <div className="smalltext" style={{ fontWeight: 600, marginBottom: '4px' }}>
                                  {msg.from === user.username ? 'You' : escapeHTML(msg.from)}
                                </div>
                                <div>{escapeHTML(msg.message)}</div>
                                <div className="smalltext" style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'var(--panel-soft)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-main)'
                          }}
                        />
                        <button
                          className="btn"
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                        >
                          Send
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="smalltext" style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '50px' }}>
                      Select a friend to start messaging
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Friend */}
      {activeTab === 'add' && (
        <div className="ai-box">
          <div className="ai-label">Add Friend</div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendFriendRequest();
                  }
                }}
                placeholder="Enter username..."
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--panel-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-main)',
                  fontSize: '14px'
                }}
              />
            </div>
            <button
              className="btn"
              onClick={handleSendFriendRequest}
              disabled={!friendUsername.trim()}
              style={{ width: '100%' }}
            >
              Send Friend Request
            </button>
          </div>
        </div>
      )}

      {/* Party Up Feature */}
      {friends.length > 0 && (
        <div className="ai-box" style={{ marginTop: '16px' }}>
          <div className="ai-label">Party Up</div>
          <div className="smalltext" style={{ marginTop: '8px' }}>
            Invite friends to join your game server. Select friends to invite:
          </div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {friendUsers.map((friend) => (
              <div
                key={friend.username}
                style={{
                  padding: '8px',
                  background: 'var(--panel-soft)',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{escapeHTML(friend.username)}</span>
                <button
                  className="btn"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => {
                    alert(`Party invite sent to ${friend.username}! (This would connect to your game server in a full implementation)`);
                  }}
                >
                  Invite to Party
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
