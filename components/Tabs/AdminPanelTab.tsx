'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Report, Ban, GameSubmission, UserMadeGame, DeviceRecord, HardwareBan, AppealMessage } from '@/types';
import { getBannedUsers, getReports, banUser, unbanUser, updateReportStatus, saveBannedUsers, saveUsers, ADMIN_ACCOUNTS_LIST, getBanAppeals, updateBanAppealStatus, getMessagesAPI, sendMessage, getGameSubmissions, saveUserMadeGame, deleteGameSubmission, getHardwareBans, addHardwareBan as addHardwareBanApi, removeHardwareBan, getDevicesForUser, getAppealMessagesAdmin } from '@/lib/storage';
import { subscribeToUsers } from '@/lib/firestoreClient';
import { FilteredUsername } from '@/components/FilteredText';

interface AdminPanelTabProps {
  user: User;
  editMode: boolean;
}

export default function AdminPanelTab({ user }: AdminPanelTabProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'bans' | 'hardwarebans' | 'reports' | 'appeals' | 'gamesubmissions'>('users');
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
  const [hardwareBans, setHardwareBans] = useState<HardwareBan[]>([]);
  const [deviceBanId, setDeviceBanId] = useState('');
  const [deviceBanReason, setDeviceBanReason] = useState('');
  const [userDevices, setUserDevices] = useState<Record<string, DeviceRecord[]>>({});
  const [loadingDevicesFor, setLoadingDevicesFor] = useState<string | null>(null);
  const [appealThreads, setAppealThreads] = useState<Record<string, AppealMessage[]>>({});
  const [loadingThreadFor, setLoadingThreadFor] = useState<string | null>(null);

  // Real-time users from Firestore (instant updates when admin changes role/etc in Firebase Console)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsub = subscribeToUsers((firestoreUsers) => {
      processUsersFromFirestore(firestoreUsers);    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadOtherData().catch((e) => console.error('Error loading admin data:', e));
  }, []);

  useEffect(() => {
    if (activeTab === 'hardwarebans') {
      getHardwareBans().then(setHardwareBans).catch(() => setHardwareBans([]));
    }
  }, [activeTab]);

  const processUsersFromFirestore = (storedUsers: User[]) => {
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
        if ((a.role === 'head_admin' || a.role === 'admin') && (b.role !== 'head_admin' && b.role !== 'admin')) return -1;
        if ((a.role !== 'head_admin' && a.role !== 'admin') && (b.role === 'head_admin' || b.role === 'admin')) return 1;
        if (a.role === 'head_admin' && b.role === 'admin') return -1;
        if (a.role === 'admin' && b.role === 'head_admin') return 1;
        return a.username.localeCompare(b.username);
      });

    setAllUsers(uniqueUsers);
  };

  const loadOtherData = async () => {
    try {
      const [appealsData, bansData, reportsData, submissionsData] = await Promise.all([
        getBanAppeals(),
        getBannedUsers(),
        getReports(),
        getGameSubmissions()
      ]);
      setAppeals(appealsData);
      setGameSubmissions(submissionsData);
      setBans(bansData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error in loadOtherData:', error);    }
  };

  const loadData = async () => {
    await loadOtherData();
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
      publishedBy: user.username,
      gameType: submission.gameType,
      fileContent: submission.fileContent,
      fileType: submission.fileType
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

    // Check if user is an admin (head_admin can ban admins)
    const canBanAdmins = user.role === 'head_admin';
    const targetUser = allUsers.find(u => u.username.toLowerCase() === usernameToBan);
    if (!canBanAdmins && targetUser && (targetUser.role === 'admin' || targetUser.role === 'head_admin')) {
      return;
    }

    const usernameToBanFinal = banUsername.trim();
    const days = banPermanent ? undefined : banDays;
    const success = await banUser(usernameToBanFinal, user.username, banReason.trim(), banPermanent, days, canBanAdmins);

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
    (u?.username ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    (r.reportedUsername ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.reporterUsername ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.reason ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );


  const isAdminOrHeadAdmin = user.role === 'admin' || user.role === 'head_admin';
  if (!isAdminOrHeadAdmin) {
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
          className={`btn ${activeTab === 'hardwarebans' ? 'active' : ''}`}
          onClick={() => setActiveTab('hardwarebans')}
        >
          Hardware Bans ({hardwareBans.length})
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
                  <div key={u.username}>
                  <div
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
                        {u.role === 'head_admin' && <span style={{ color: '#c9a43a', marginLeft: '8px' }}>👑 HEAD ADMIN</span>}
                      {u.role === 'admin' && <span style={{ color: '#ff4d4d', marginLeft: '8px' }}>👑 ADMIN</span>}
                      </div>
                      <div className="smalltext">
                        Role: {u.role} • Coins: {u.coins} • Gender: Boy
                        {(userDevices[u.username]?.length ?? 0) > 0 && (
                          <> • Devices: {userDevices[u.username].map((d) => d.label).join(', ')}</>
                        )}
                      </div>
                      {loadingDevicesFor === u.username ? (
                        <span className="smalltext">Loading devices…</span>
                      ) : (
                        <button
                          className="btn"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={async () => {
                            if (userDevices[u.username]) {
                              setUserDevices((prev) => ({ ...prev, [u.username]: [] }));
                              return;
                            }
                            setLoadingDevicesFor(u.username);
                            try {
                              const devs = await getDevicesForUser(u.username);
                              setUserDevices((prev) => ({ ...prev, [u.username]: devs }));
                            } finally {
                              setLoadingDevicesFor(null);
                            }
                          }}
                        >
                          {userDevices[u.username] ? 'Hide devices' : 'Show devices'}
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {u.role !== 'admin' && u.role !== 'head_admin' ? (
                        <>
                          <button
                            className="btn"
                            onClick={async () => {
                              const updated = { ...u, role: 'admin' as const, coins: Math.max(u.coins, 99999) };
                              setAllUsers((prev) => prev.map((x) => (x.username.toLowerCase() === u.username.toLowerCase() ? updated : x)));
                              await saveUsers([updated]);
                            }}
                            style={{ background: '#00aaff', padding: '6px 12px', fontSize: '12px' }}
                          >
                            Make admin
                          </button>
                          <button
                            className="btn"
                            onClick={() => {
                              setBanUsername(u.username);
                              setActiveTab('bans');
                            }}
                            style={{ background: '#ff4d4d', padding: '6px 12px', fontSize: '12px' }}
                          >
                            Ban
                          </button>
                        </>
                      ) : (
                        <>
                          {!ADMIN_ACCOUNTS_LIST.some((a) => a.username.toLowerCase() === u.username.toLowerCase()) ? (
                            <button
                              className="btn"
                              onClick={async () => {
                                const updated = { ...u, role: 'user' as const };
                                setAllUsers((prev) => prev.map((x) => (x.username.toLowerCase() === u.username.toLowerCase() ? updated : x)));
                                await saveUsers([updated]);
                              }}
                              style={{ background: '#666', padding: '6px 12px', fontSize: '12px' }}
                            >
                              Remove admin
                            </button>
                          ) : null}
                          {user.role === 'head_admin' && u.username !== user.username ? (
                            <button
                              className="btn"
                              onClick={() => {
                                setBanUsername(u.username);
                                setActiveTab('bans');
                              }}
                              style={{ background: '#ff4d4d', padding: '6px 12px', fontSize: '12px' }}
                            >
                              Ban
                            </button>
) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>Protected from ban</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {userDevices[u.username]?.length ? (
                    <div style={{
                      marginTop: '4px',
                      padding: '8px 12px',
                      background: 'var(--panel)',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '6px' }}>Devices for {u.username}:</div>
                      {userDevices[u.username].map((d) => (
                        <div key={d.deviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span>{d.label} <code style={{ fontSize: '10px', opacity: 0.8 }}>{d.deviceId.slice(0, 12)}…</code></span>
                          <button
                            className="btn"
                            style={{ padding: '2px 8px', fontSize: '10px', background: '#ff4d4d' }}
                            onClick={async () => {
                              if (!confirm(`Ban this device? All accounts that used it will be banned.`)) return;
                              try {
                                await addHardwareBanApi(d.deviceId, `From admin panel (user ${u.username})`);
                                setHardwareBans(await getHardwareBans());
                                await loadOtherData();
                                setUserDevices((prev) => ({ ...prev, [u.username]: [] }));
                              } catch (e: any) {
                                alert(e?.message || 'Failed');
                              }
                            }}
                          >
                            Ban this device
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
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

      {activeTab === 'hardwarebans' && (
        <div>
          <div className="ai-box" style={{ marginBottom: '16px' }}>
            <div className="ai-label">Ban a device (hardware ban)</div>
            <div className="ai-output">
              <p className="smalltext" style={{ marginBottom: '12px' }}>
                Bans this device: no one can sign in or create accounts from it. All accounts that have used this device will be banned. Reversible.
              </p>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr auto' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Device ID:</label>
                  <input
                    type="text"
                    value={deviceBanId}
                    onChange={(e) => setDeviceBanId(e.target.value)}
                    placeholder="Paste device ID (from user devices)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--panel-soft)',
                      color: 'var(--text)',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Reason (optional):</label>
                  <input
                    type="text"
                    value={deviceBanReason}
                    onChange={(e) => setDeviceBanReason(e.target.value)}
                    placeholder="e.g. Ban evasion"
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
                <div style={{ alignSelf: 'end' }}>
                  <button
                    className="btn"
                    style={{ background: '#ff4d4d' }}
                    onClick={async () => {
                      if (!deviceBanId.trim()) return;
                      try {
                        const result = await addHardwareBanApi(deviceBanId.trim(), deviceBanReason.trim());
                        setDeviceBanId('');
                        setDeviceBanReason('');
                        setHardwareBans(await getHardwareBans());
                        await loadOtherData();
                        alert(`Device banned. Account(s) banned: ${result.bannedUsernames.length ? result.bannedUsernames.join(', ') : 'none (already banned or no linked accounts)'}`);
                      } catch (e: any) {
                        alert(e?.message || 'Failed to ban device');
                      }
                    }}
                  >
                    Ban device
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="ai-box" style={{ marginBottom: 0 }}>
            <div className="ai-label">Banned devices ({hardwareBans.length}) — reversible</div>
            <div className="ai-output" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {hardwareBans.length === 0 ? (
                <div className="smalltext">No hardware bans. Ban a device above to block it and all linked accounts.</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {hardwareBans.map((hb) => (
                    <div
                      key={hb.deviceId}
                      style={{
                        padding: '12px',
                        background: 'var(--panel-soft)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', marginBottom: '4px', wordBreak: 'break-all' }}>
                          {hb.deviceId}
                        </div>
                        <div className="smalltext">
                          Banned by: {hb.bannedBy} • {new Date(hb.bannedAt).toLocaleString()}
                          {hb.reason ? ` • ${hb.reason}` : ''}
                          {hb.linkedUsernames?.length ? (
                            <> • Accounts: {hb.linkedUsernames.join(', ')}</>
                          ) : null}
                        </div>
                      </div>
                      <button
                        className="btn"
                        style={{ background: 'var(--accent)' }}
                        onClick={async () => {
                          if (!confirm('Unban this device? Linked accounts will be unbanned (only if they were banned due to this device).')) return;
                          try {
                            const result = await removeHardwareBan(hb.deviceId);
                            setHardwareBans(await getHardwareBans());
                            await loadOtherData();
                            alert(`Device unbanned. Account(s) unbanned: ${result.unbannedUsernames.length ? result.unbannedUsernames.join(', ') : 'none'}`);
                          } catch (e: any) {
                            alert(e?.message || 'Failed to unban device');
                          }
                        }}
                      >
                        Unban device
                      </button>
                    </div>
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
                            Reported: <span style={{ color: '#ff4d4d' }}>{report.reportedUsername ?? 'Unknown'}</span>
                          </div>
                          <div className="smalltext">
                            Reported by: {report.reporterUsername ?? 'Unknown'}
                            <br />
                            Reason: {report.reason ?? '—'}
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
                                const reportedName = report.reportedUsername ?? '';
                                if (!reportedName) return;
                                const reportedUser = allUsers.find(u => u.username.toLowerCase() === reportedName.toLowerCase());
                                const isAdminAccount = ADMIN_ACCOUNTS_LIST.some(a => a.username.toLowerCase() === reportedName.toLowerCase());
                                const canBanAdmins = user.role === 'head_admin';

                                if (!canBanAdmins && (reportedUser?.role === 'admin' || reportedUser?.role === 'head_admin' || isAdminAccount)) {
                                  return;
                                }

                                if (confirm(`Ban user "${reportedName}" based on this report?`)) {
                                  const reason = prompt('Ban reason:', `Reported for: ${report.reason ?? ''}`);
                                  if (reason) {
                                    const success = await banUser(reportedName, user.username, reason, true, undefined, canBanAdmins);
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
                            Original Ban Reason: {appeal.ban?.reason ?? '—'}
                            <br />
                            Banned by: {appeal.ban?.bannedBy ?? '—'}
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
                        <div className="smalltext" style={{ fontWeight: 600, marginBottom: '4px' }}>Appeal message (first message):</div>
                        <div className="smalltext">{appeal.appealMessage || appeal.appealText || 'No message provided.'}</div>
                        {appeal.adminNotes && (
                          <>
                            <div className="smalltext" style={{ fontWeight: 600, marginTop: '8px', marginBottom: '4px' }}>Admin Notes:</div>
                            <div className="smalltext">{appeal.adminNotes}</div>
                          </>
                        )}
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <button
                          className="btn"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={async () => {
                            if (appealThreads[appeal.id]) {
                              setAppealThreads((prev) => ({ ...prev, [appeal.id]: [] }));
                              return;
                            }
                            setLoadingThreadFor(appeal.id);
                            try {
                              const msgs = await getAppealMessagesAdmin(appeal.id);
                              setAppealThreads((prev) => ({ ...prev, [appeal.id]: msgs }));
                            } finally {
                              setLoadingThreadFor(null);
                            }
                          }}
                        >
                          {loadingThreadFor === appeal.id ? 'Loading…' : appealThreads[appeal.id] ? 'Hide conversation' : 'View full conversation (user + AI)'}
                        </button>
                        {appealThreads[appeal.id]?.length > 0 && (
                          <div style={{
                            marginTop: '10px',
                            padding: '12px',
                            background: 'var(--panel-soft)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            maxHeight: '280px',
                            overflowY: 'auto'
                          }}>
                            <div className="smalltext" style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-dim)' }}>Full thread (visible to admins):</div>
                            {appealThreads[appeal.id].map((msg) => (
                              <div
                                key={msg.id}
                                style={{
                                  marginBottom: '8px',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  background: msg.fromUsername === 'appeal_bot' ? 'rgba(100, 149, 237, 0.15)' : 'var(--panel)',
                                  fontSize: '12px'
                                }}
                              >
                                <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>{msg.fromUsername === 'appeal_bot' ? 'Appeal assistant' : msg.fromUsername}</span>
                                {' • '}
                                <span className="smalltext">{new Date(msg.timestamp).toLocaleString()}</span>
                                <div style={{ marginTop: '4px' }}>{msg.message}</div>
                              </div>
                            ))}
                          </div>
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
                          By: <FilteredUsername username={submission.owner || ''} currentUsername={user.username || ''} /> • Submitted: {new Date(submission.ts).toLocaleString()}
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
