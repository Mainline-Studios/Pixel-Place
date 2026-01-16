'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Report, Ban, GameSubmission, UserMadeGame } from '@/types';
import { getUsers, getBannedUsers, getReports, banUser, unbanUser, updateReportStatus, saveBannedUsers, ADMIN_ACCOUNTS_LIST, getBanAppeals, updateBanAppealStatus, getMessages, sendMessage, getGameSubmissions, saveUserMadeGame, deleteGameSubmission } from '@/lib/storage';

interface AdminPanelTabProps {
  user: User;
  editMode: boolean;
}

export default function AdminPanelTab({ user }: AdminPanelTabProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'bans' | 'reports' | 'appeals' | 'gamesubmissions'>('users');
  const [gameSubmissions, setGameSubmissions] = useState<GameSubmission[]>([]);
  const [banUsername, setBanUsername] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banPermanent, setBanPermanent] = useState(true);
  const [banDays, setBanDays] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [chattingWith, setChattingWith] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingChatMessage, setSendingChatMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;

    // Try to load data, with error handling
    loadData().catch((error) => {
      console.error('Error loading admin panel data:', error);
      // Silent error - no alert
    });
  }, []);

  const loadData = async () => {
    try {
      const [appealsData, storedUsers, bansData, reportsData, submissionsData] = await Promise.all([
        getBanAppeals(),
        getUsers(),
        getBannedUsers(),
        getReports(),
        getGameSubmissions()
      ]);

      setAppeals(appealsData);
      setGameSubmissions(submissionsData);

      // Old admin accounts that should be filtered out (not in current ADMIN_ACCOUNTS_LIST)
      const oldAdminUsernames = new Set([
        'number 9',
        'number5',
        'the goat',
        'usernotfound',
        'yoUr 8',
        'admin2',
        '345',
        '67'
      ].map(u => u.toLowerCase()));

      // Current admin usernames (case-insensitive)
      const currentAdminUsernames = new Set(
        ADMIN_ACCOUNTS_LIST.map(a => a.username.toLowerCase())
      );

      // Filter out old admin accounts from stored users
      const filteredStoredUsers = storedUsers.filter(user => {
        const usernameLower = user.username.toLowerCase();
        // Remove if it's an old admin account that's not in the current list
        if (oldAdminUsernames.has(usernameLower) && !currentAdminUsernames.has(usernameLower)) {
          return false;
        }
        return true;
      });

      // Create a map of existing usernames for quick lookup
      const existingUsernames = new Set(filteredStoredUsers.map(u => u.username.toLowerCase()));

      // Add admin accounts that haven't logged in yet (so they appear in the list even if never logged in)
      const adminAccountsNotInStorage = ADMIN_ACCOUNTS_LIST
        .filter(admin => !existingUsernames.has(admin.username.toLowerCase()))
        .map(admin => ({
          username: admin.username,
          password: admin.password,
          gender: 'N/A',
          role: 'admin' as const,
          coins: 99999,
          ownedSkins: ['starter_classic'],
          equippedSkin: 'starter_classic',
          isDonor: false,
          ownedAccessories: [],
          equippedAccessories: {}
        }));

      // Combine: ALL stored users (regular + admins who logged in) + admin accounts that never logged in
      // Start with filtered stored users (these are the real accounts, with old admins removed)
      const uniqueUsers: User[] = [...filteredStoredUsers];

      // Add admin accounts that haven't logged in yet (so they appear in the list)
      adminAccountsNotInStorage.forEach(admin => {
        // Only add if not already in the list
        if (!uniqueUsers.some(u => u.username.toLowerCase() === admin.username.toLowerCase())) {
          uniqueUsers.push(admin);
        }
      });

      // Sort: admins first, then alphabetically
      uniqueUsers.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return a.username.localeCompare(b.username);
      });

      setAllUsers(uniqueUsers);
      setBans(bansData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error in loadData:', error);
      // Silent error - no alert
    }
  };


  const handleAcceptSubmission = async (submission: GameSubmission) => {
    if (!confirm(`Accept and publish "${submission.title}" by ${submission.owner}?`)) return;

    const game: UserMadeGame = {
      id: 'game_' + Date.now(),
      title: submission.title,
      desc: submission.desc,
      owner: submission.owner,
      ts: Date.now(),
      sceneData: submission.sceneData,
      publishedBy: user.username
    };

    await saveUserMadeGame(game);

    // Update submission status
    submission.status = 'approved';
    submission.reviewedBy = user.username;
    submission.adminNotes = 'Game accepted and published to Games tab.';

    // Delete the submission
    await deleteGameSubmission(submission.id);

    await loadData();
    // Silent success - no alert
  };

  const handleRejectSubmission = async (submission: GameSubmission) => {
    const notes = prompt('Enter rejection reason (optional):');
    if (notes === null) return; // User cancelled

    submission.status = 'rejected';
    submission.reviewedBy = user.username;
    submission.adminNotes = notes || 'Game rejected.';

    await deleteGameSubmission(submission.id);
    await loadData();
    // Silent success - no alert
  };

  const handleBan = async () => {
    if (!banUsername.trim()) {
      // Silent validation - no alert
      return;
    }
    if (!banReason.trim()) {
      // Silent validation - no alert
      return;
    }

    const usernameToBan = banUsername.trim().toLowerCase();

    // Check if user is an admin (only check if user exists in system)
    const targetUser = allUsers.find(u => u.username.toLowerCase() === usernameToBan);
    if (targetUser && targetUser.role === 'admin') {
      // Silent error - no alert
      return;
    }

    const usernameToBanFinal = banUsername.trim();
    const days = banPermanent ? undefined : banDays;
    const success = await banUser(usernameToBanFinal, user.username, banReason.trim(), banPermanent, days);

    if (success) {
      // Verify the ban was actually saved
      const updatedBans = await getBannedUsers();
      const banExists = updatedBans.some(b => b.username.toLowerCase() === usernameToBanFinal.toLowerCase());

      if (banExists) {
        setBanUsername('');
        setBanReason('');
        setBanPermanent(true);
        await loadData();
        // Silent success - no alert
      } else {
        // Silent error - no alert
        console.error('Error: Ban was not saved properly.');
      }
    } else {
      // Silent error - no alert
      console.error('Cannot ban administrators. Admins are protected from bans.');
    }
  };

  const handleUnban = async (username: string) => {
    if (confirm(`Unban user "${username}"?`)) {
      await unbanUser(username);
      await loadData();
      // Silent success - no alert
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolved' | 'dismissed', notes?: string) => {
    await updateReportStatus(reportId, action, user.username, notes);
    await loadData();
    // Silent success - no alert
  };

  const loadChatMessages = async (bannedUsername: string) => {
    const messages = await getMessages(user.username, bannedUsername);
    setChatMessages(messages);
  };

  const handleSendChatMessage = async (toUsername: string) => {
    if (!newChatMessage.trim()) return;
    setSendingChatMessage(true);
    try {
      await sendMessage(user.username, toUsername, newChatMessage.trim());
      setNewChatMessage('');
      await loadChatMessages(toUsername);
    } catch (error) {
      console.error('Error sending message:', error);
      // Silent error - no alert
    } finally {
      setSendingChatMessage(false);
    }
  };

  useEffect(() => {
    if (chattingWith) {
      loadChatMessages(chattingWith);
      const interval = setInterval(() => loadChatMessages(chattingWith), 2000);
      return () => clearInterval(interval);
    }
  }, [chattingWith, user.username]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    r.reportedUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reporterUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (user.role !== 'admin') {
    return (
      <div className="ai-box">
        <div className="ai-label">Access Denied</div>
        <div className="ai-output">
          You must be an administrator to access this panel.
          <br />
          <small style={{ color: 'var(--text-dim)' }}>Current role: {user.role}</small>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 0, paddingBottom: 0 }}>
      <h2 className="section-title" style={{ marginBottom: '12px' }}>🛡️ Admin Panel</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          All Users ({allUsers.length})
        </button>
        <button
          className={`btn ${activeTab === 'bans' ? 'active' : ''}`}
          onClick={() => setActiveTab('bans')}
        >
          Bans ({bans.length})
        </button>
        <button
          className={`btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.filter(r => r.status === 'pending').length} pending)
        </button>
        <button
          className={`btn ${activeTab === 'appeals' ? 'active' : ''}`}
          onClick={() => setActiveTab('appeals')}
        >
          Ban Appeals ({appeals.filter(a => a.status === 'pending').length} pending)
        </button>
        <button
          className={`btn ${activeTab === 'gamesubmissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('gamesubmissions')}
        >
          Game Submissions ({gameSubmissions.filter(s => s.status === 'pending').length} pending)
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--panel-soft)',
            color: 'var(--text)'
          }}
        />
      </div>

      {activeTab === 'users' && (
        <div className="ai-box" style={{ marginBottom: 0 }}>
          <div className="ai-label">
            All Users ({filteredUsers.length} of {allUsers.length} total)
          </div>
          <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div className="smalltext">No users found. {allUsers.length === 0 ? 'No users in system.' : `Try a different search term.`}</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredUsers.map((u) => (
                  <div
                    key={u.username}
                    style={{
                      padding: '12px',
                      background: 'var(--panel-soft)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {u.username}
                        {u.role === 'admin' && <span style={{ color: '#ff4d4d', marginLeft: '8px' }}>👑 ADMIN</span>}
                      </div>
                      <div className="smalltext">
                        Role: {u.role} • Coins: {u.coins} • Gender: Boy
                      </div>
                    </div>
                    {u.role !== 'admin' ? (
                      <button
                        className="btn"
                        onClick={() => {
                          setBanUsername(u.username);
                          setActiveTab('bans');
                        }}
                        style={{ background: '#ff4d4d' }}
                      >
                        Ban User
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>Protected</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bans' && (
        <div>
          <div className="ai-box" style={{ marginBottom: '16px' }}>
            <div className="ai-label">Ban a User</div>
            <div className="ai-output">
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Username:</label>
                  <input
                    type="text"
                    value={banUsername}
                    onChange={(e) => setBanUsername(e.target.value)}
                    placeholder="Enter username to ban"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--panel-soft)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Reason:</label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter ban reason"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--panel-soft)',
                      color: 'var(--text)',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={banPermanent}
                      onChange={(e) => setBanPermanent(e.target.checked)}
                    />
                    <span>Permanent Ban</span>
                  </label>
                  {!banPermanent && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Ban Duration (days):</label>
                      <input
                        type="number"
                        value={banDays}
                        onChange={(e) => setBanDays(parseInt(e.target.value) || 7)}
                        min={1}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'var(--panel-soft)',
                          color: 'var(--text)'
                        }}
                      />
                    </div>
                  )}
                </div>
                <button className="btn" onClick={handleBan} style={{ background: '#ff4d4d' }}>
                  Ban User
                </button>
              </div>
            </div>
          </div>

          <div className="ai-box" style={{ marginBottom: 0 }}>
            <div className="ai-label">
              Banned Users ({bans.length})
            </div>
            <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {bans.length === 0 ? (
                <div className="smalltext">No banned users.</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {bans.map((ban) => (
                    <>
                      <div
                        key={ban.username}
                        style={{
                          padding: '12px',
                          background: 'var(--panel-soft)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#ff4d4d' }}>
                            {ban.username}
                          </div>
                          <div className="smalltext">
                            Reason: {ban.reason}
                            <br />
                            Banned by: {ban.bannedBy}
                            <br />
                            Date: {new Date(ban.timestamp).toLocaleString()}
                            <br />
                            Type: {ban.permanent ? 'Permanent' : `Temporary (expires ${ban.expiresAt ? new Date(ban.expiresAt).toLocaleString() : 'N/A'})`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn"
                            onClick={() => {
                              setChattingWith(chattingWith === ban.username ? null : ban.username);
                              if (chattingWith !== ban.username) {
                                loadChatMessages(ban.username);
                              }
                            }}
                            style={{ background: chattingWith === ban.username ? 'var(--accent)' : '#2ecc71', fontSize: '12px', padding: '6px 12px' }}
                          >
                            {chattingWith === ban.username ? 'Close Chat' : '💬 Chat'}
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleUnban(ban.username)}
                            style={{ background: 'var(--accent)' }}
                          >
                            Unban
                          </button>
                        </div>
                      </div>
                      {chattingWith === ban.username && (
                        <div style={{
                          marginTop: '12px',
                          padding: '16px',
                          background: 'var(--panel)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          maxHeight: '400px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text)' }}>
                            Chat with {ban.username}
                          </div>
                          <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            marginBottom: '12px',
                            minHeight: '200px',
                            maxHeight: '300px',
                            padding: '8px',
                            background: 'var(--panel-soft)',
                            borderRadius: '4px'
                          }}>
                            {chatMessages.length === 0 ? (
                              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                                No messages yet. Start the conversation!
                              </div>
                            ) : (
                              chatMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  style={{
                                    marginBottom: '12px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    background: msg.fromUsername === user.username ? 'rgba(46, 204, 113, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                                    textAlign: msg.fromUsername === user.username ? 'right' : 'left',
                                    alignSelf: msg.fromUsername === user.username ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%'
                                  }}
                                >
                                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                                    {msg.fromUsername === user.username ? 'You' : ban.username} • {new Date(msg.timestamp).toLocaleTimeString()}
                                  </div>
                                  <div style={{ fontSize: '14px', color: 'var(--text)' }}>
                                    {msg.message}
                                  </div>
                                </div>
                              ))
                            )}
                            <div ref={chatEndRef} />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={newChatMessage}
                              onChange={(e) => setNewChatMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && !sendingChatMessage && handleSendChatMessage(ban.username)}
                              placeholder="Type your message..."
                              style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--panel-soft)',
                                color: 'var(--text)',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              className="btn"
                              onClick={() => handleSendChatMessage(ban.username)}
                              disabled={sendingChatMessage || !newChatMessage.trim()}
                              style={{
                                padding: '10px 20px',
                                opacity: (sendingChatMessage || !newChatMessage.trim()) ? 0.5 : 1,
                                cursor: (sendingChatMessage || !newChatMessage.trim()) ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {sendingChatMessage ? 'Sending...' : 'Send'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ))}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="ai-box">
          <div className="ai-label">Reports ({reports.length} total, {reports.filter(r => r.status === 'pending').length} pending)</div>
          <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredReports.length === 0 ? (
              <div className="smalltext">No reports found.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredReports
                  .sort((a, b) => {
                    // Pending first, then by timestamp
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return b.timestamp - a.timestamp;
                  })
                  .map((report) => (
                    <div
                      key={report.id}
                      style={{
                        padding: '16px',
                        background: report.status === 'pending' ? 'rgba(255, 215, 106, 0.1)' : 'var(--panel-soft)',
                        borderRadius: '8px',
                        border: `1px solid ${report.status === 'pending' ? '#ffd76a' : 'var(--border)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                            Reported: <span style={{ color: '#ff4d4d' }}>{report.reportedUsername}</span>
                          </div>
                          <div className="smalltext">
                            Reported by: {report.reporterUsername}
                            <br />
                            Reason: {report.reason}
                            <br />
                            Date: {new Date(report.timestamp).toLocaleString()}
                            <br />
                            Status: <span style={{
                              color: report.status === 'pending' ? '#ffd76a' :
                                report.status === 'resolved' ? '#2ecc71' : '#999'
                            }}>
                              {report.status.toUpperCase()}
                            </span>
                            {report.reviewedBy && (
                              <>
                                <br />
                                Reviewed by: {report.reviewedBy}
                              </>
                            )}
                          </div>
                        </div>
                        {report.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <button
                              className="btn"
                              onClick={() => {
                                const notes = prompt('Add notes (optional):');
                                handleReportAction(report.id, 'resolved', notes || undefined);
                              }}
                              style={{ background: '#2ecc71', fontSize: '12px', padding: '6px 12px' }}
                            >
                              Resolve
                            </button>
                            <button
                              className="btn"
                              onClick={() => {
                                const notes = prompt('Add notes (optional):');
                                handleReportAction(report.id, 'dismissed', notes || undefined);
                              }}
                              style={{ background: '#999', fontSize: '12px', padding: '6px 12px' }}
                            >
                              Dismiss
                            </button>
                            <button
                              className="btn"
                              onClick={async () => {
                                const reportedUser = allUsers.find(u => u.username.toLowerCase() === report.reportedUsername.toLowerCase());
                                const isAdminAccount = ADMIN_ACCOUNTS_LIST.some(a => a.username.toLowerCase() === report.reportedUsername.toLowerCase());

                                if (reportedUser?.role === 'admin' || isAdminAccount) {
                                  // Silent error - no alert
                                  return;
                                }

                                if (confirm(`Ban user "${report.reportedUsername}" based on this report?`)) {
                                  const reason = prompt('Ban reason:', `Reported for: ${report.reason}`);
                                  if (reason) {
                                    const success = await banUser(report.reportedUsername, user.username, reason, true);
                                    if (success) {
                                      await handleReportAction(report.id, 'resolved', `User banned based on report`);
                                      await loadData();
                                    } else {
                                      // Silent error - no alert
                                      console.error('Cannot ban administrators. Admins are protected from bans.');
                                    }
                                  }
                                }
                              }}
                              style={{ background: '#ff4d4d', fontSize: '12px', padding: '6px 12px' }}
                            >
                              Ban User
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{
                        padding: '8px',
                        background: 'var(--panel)',
                        borderRadius: '4px',
                        marginTop: '8px'
                      }}>
                        <div className="smalltext" style={{ fontWeight: 600, marginBottom: '4px' }}>Description:</div>
                        <div className="smalltext">{report.description || 'No description provided.'}</div>
                        {report.adminNotes && (
                          <>
                            <div className="smalltext" style={{ fontWeight: 600, marginTop: '8px', marginBottom: '4px' }}>Admin Notes:</div>
                            <div className="smalltext">{report.adminNotes}</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appeals' && (
        <div className="ai-box" style={{ marginBottom: 0 }}>
          <div className="ai-label">
            Ban Appeals ({appeals.filter(a => a.status === 'pending').length} pending, {appeals.length} total)
          </div>
          <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {appeals.length === 0 ? (
              <div className="smalltext">No ban appeals.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {appeals
                  .sort((a, b) => {
                    // Pending first, then by timestamp
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return b.timestamp - a.timestamp;
                  })
                  .map((appeal) => (
                    <div
                      key={appeal.id}
                      style={{
                        padding: '16px',
                        background: appeal.status === 'pending' ? 'rgba(255, 215, 106, 0.1)' : 'var(--panel-soft)',
                        borderRadius: '8px',
                        border: `1px solid ${appeal.status === 'pending' ? '#ffd76a' : 'var(--border)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                            Appeal from: <span style={{ color: '#ff4d4d' }}>{appeal.username}</span>
                          </div>
                          <div className="smalltext">
                            Original Ban Reason: {appeal.ban.reason}
                            <br />
                            Banned by: {appeal.ban.bannedBy}
                            <br />
                            Appeal Date: {new Date(appeal.timestamp).toLocaleString()}
                            <br />
                            Status: <span style={{
                              color: appeal.status === 'pending' ? '#ffd76a' :
                                appeal.status === 'approved' ? '#2ecc71' : '#ff4d4d'
                            }}>
                              {appeal.status.toUpperCase()}
                            </span>
                            {appeal.reviewedBy && (
                              <>
                                <br />
                                Reviewed by: {appeal.reviewedBy}
                              </>
                            )}
                          </div>
                        </div>
                        {appeal.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <button
                              className="btn"
                              onClick={async () => {
                                if (confirm(`Approve appeal from "${appeal.username}" and unban them?`)) {
                                  await updateBanAppealStatus(appeal.id, 'approved', user.username, 'Appeal approved', true);
                                  await loadData();
                                  // Silent success - no alert
                                }
                              }}
                              style={{ background: '#2ecc71', fontSize: '12px', padding: '6px 12px' }}
                            >
                              Approve & Unban
                            </button>
                            <button
                              className="btn"
                              onClick={async () => {
                                const notes = prompt('Add notes (optional):');
                                await updateBanAppealStatus(appeal.id, 'denied', user.username, notes || undefined, false);
                                await loadData();
                                // Silent success - no alert
                              }}
                              style={{ background: '#ff4d4d', fontSize: '12px', padding: '6px 12px' }}
                            >
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{
                        padding: '8px',
                        background: 'var(--panel)',
                        borderRadius: '4px',
                        marginTop: '8px'
                      }}>
                        <div className="smalltext" style={{ fontWeight: 600, marginBottom: '4px' }}>Appeal Message:</div>
                        <div className="smalltext">{appeal.appealMessage || 'No message provided.'}</div>
                        {appeal.adminNotes && (
                          <>
                            <div className="smalltext" style={{ fontWeight: 600, marginTop: '8px', marginBottom: '4px' }}>Admin Notes:</div>
                            <div className="smalltext">{appeal.adminNotes}</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gamesubmissions' && (
        <div className="ai-box" style={{ marginBottom: 0 }}>
          <div className="ai-label">
            Game Submissions ({gameSubmissions.filter(s => s.status === 'pending').length} pending, {gameSubmissions.length} total)
          </div>
          <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {gameSubmissions.length === 0 ? (
              <div className="smalltext">No game submissions.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {gameSubmissions
                  .filter(s => searchTerm === '' || s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.owner.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((submission) => (
                    <div
                      key={submission.id}
                      style={{
                        padding: '16px',
                        background: 'var(--panel-soft)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '16px' }}>
                          {submission.title}
                        </div>
                        <div className="smalltext" style={{ marginBottom: '8px' }}>
                          By: {submission.owner} • Submitted: {new Date(submission.ts).toLocaleString()}
                          <br />
                          Status: <span style={{ color: submission.status === 'pending' ? '#ffa500' : submission.status === 'approved' ? '#2ecc71' : '#ff4d4d' }}>
                            {submission.status.toUpperCase()}
                          </span>
                          {submission.reviewedBy && ` • Reviewed by: ${submission.reviewedBy}`}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                          {submission.desc}
                        </div>
                        {submission.adminNotes && (
                          <div style={{ fontSize: '12px', color: '#8b90a8', fontStyle: 'italic', marginTop: '8px' }}>
                            Admin Notes: {submission.adminNotes}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#8b90a8', marginTop: '4px' }}>
                          Scene Objects: {submission.sceneData?.objects?.length || 0}
                        </div>
                      </div>
                      {submission.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn"
                            onClick={() => handleAcceptSubmission(submission)}
                            style={{ background: '#2ecc71', flex: 1 }}
                          >
                            ✅ Accept & Publish
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleRejectSubmission(submission)}
                            style={{ background: '#ff4d4d', flex: 1 }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
