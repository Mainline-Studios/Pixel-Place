'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, Report, Ban, GameSubmission, UserMadeGame, DeviceRecord, HardwareBan, AppealMessage } from '@/types';
import { getUsers, getReports, banUser, unbanUser, updateReportStatus, saveBannedUsers, saveUsers, ADMIN_ACCOUNTS_LIST, getBanAppeals, updateBanAppealStatus, getMessagesAPI, sendMessage, getGameSubmissions, saveUserMadeGame, deleteGameSubmission, getHardwareBans, addHardwareBan as addHardwareBanApi, removeHardwareBan, getDevicesForUser, getAppealMessagesAdmin, terminateUserAccess } from '@/lib/storage';
import { TERMINATED_FIRE_MESSAGE } from '@/lib/terminatedBan';
import { subscribeToUsers, subscribeToBans } from '@/lib/firestoreClient';
import { FilteredUsername } from '@/components/FilteredText';
import AdminPanelWebDeploy from '@/components/AdminPanelWebDeploy';
import { formatGenderForDisplay } from '@/lib/formatGenderDisplay';

interface AdminPanelTabProps {
  user: User;
  editMode: boolean;
}

export default function AdminPanelTab({ user }: AdminPanelTabProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    'users' | 'bans' | 'hardwarebans' | 'reports' | 'appeals' | 'gamesubmissions' | 'webdeploy'
  >('users');
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
  const [deviceTerminateSubject, setDeviceTerminateSubject] = useState('');
  const [terminateUsername, setTerminateUsername] = useState('');
  const [terminateSubject, setTerminateSubject] = useState('');
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);
  const [devicesModalUser, setDevicesModalUser] = useState<string | null>(null);
  const [devicesModalList, setDevicesModalList] = useState<DeviceRecord[]>([]);
  const [devicesModalLoading, setDevicesModalLoading] = useState(false);
  const [devicesModalError, setDevicesModalError] = useState<string | null>(null);

  const copyDeviceId = (deviceId: string) => {
    try {
      navigator.clipboard.writeText(deviceId);
      // Optional: brief toast; for now just copy
    } catch (_) {}
  };

  const formatDeviceOS = (label: string) => {
    const l = (label || '').trim();
    if (!l || l === 'Unknown') return 'OS: Unknown';
    if (/^(Windows|Mac OS|Linux|Android|iOS|Chrome OS)$/i.test(l)) return `OS: ${l}`;
    return `OS: ${l}`;
  };
  const [appealThreads, setAppealThreads] = useState<Record<string, AppealMessage[]>>({});
  const [loadingThreadFor, setLoadingThreadFor] = useState<string | null>(null);

  // Real-time users from Firestore (instant updates when admin changes role/etc in Firebase Console)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsub = subscribeToUsers((firestoreUsers) => {
      setAllUsers(processUsersFromFirestore(firestoreUsers));
    });
    return () => unsub();
  }, []);

  // Real-time bans from Firestore so Bans tab shows data even when API is static/export
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsub = subscribeToBans((firestoreBans) => {
      const now = Date.now();
      const mapped: Ban[] = firestoreBans
        .map((d: any) => ({
          username: d.username || d.id || '',
          reason: d.reason || '',
          bannedBy: d.banned_by || '',
          timestamp: d.banned_at ?? d.timestamp ?? now,
          expiresAt: d.expires_at,
          permanent: d.permanent === true,
          banKind: d.ban_kind,
          terminatedSubject: d.terminated_subject,
          appealsBlocked: d.ban_kind === 'terminated',
          hardwareBanDeviceId: d.hardware_ban_device_id,
        }))
        .filter((b: Ban) => b.permanent || (b.expiresAt != null && b.expiresAt > now));
      setBans(mapped);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadOtherData().catch((e) => console.error('Error loading admin data:', e));
  }, []);

  // Load users from API for admins: immediate + delayed fallback (Firestore may return 0 if rules block client read)
  const fetchUsersFromApi = () => {
    setUsersLoadError(null);
    getUsers()
      .then((apiUsers) => {
        setAllUsers((prev) => (prev.length === 0 ? processUsersFromFirestore(apiUsers) : prev));
      })
      .catch(() => {
        setUsersLoadError('Could not load users from server. Check you\'re logged in and try Refresh.');
      });
  };

  useEffect(() => {
    if (typeof window === 'undefined' || (user.role !== 'admin' && user.role !== 'head_admin')) return;
    fetchUsersFromApi();
    const timer = setTimeout(fetchUsersFromApi, 1800);
    return () => clearTimeout(timer);
  }, [user.role]);

  useEffect(() => {
    if (activeTab === 'hardwarebans') {
      getHardwareBans().then(setHardwareBans).catch(() => setHardwareBans([]));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!devicesModalUser) return;
    setDevicesModalLoading(true);
    setDevicesModalError(null);
    setDevicesModalList([]);
    getDevicesForUser(devicesModalUser)
      .then((devs) => {
        setDevicesModalList(devs);
        setDevicesModalError(null);
      })
      .catch((err: any) => {
        setDevicesModalError(err?.message || 'Could not load devices.');
        setDevicesModalList([]);
      })
      .finally(() => setDevicesModalLoading(false));
  }, [devicesModalUser]);

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
          ownedSkins: ['pixel_placer'],
          equippedSkin: 'pixel_placer',
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

    return uniqueUsers;
  };

  const loadOtherData = async () => {
    try {
      const [appealsData, reportsData, submissionsData] = await Promise.all([
        getBanAppeals(),
        getReports(),
        getGameSubmissions()
      ]);
      setAppeals(appealsData);
      setGameSubmissions(submissionsData);
      setReports(reportsData);
      // Bans come from subscribeToBans (Firestore) so they show even with static export
    } catch (error) {
      console.error('Error in loadOtherData:', error);
    }
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
      alert('Enter a username to ban.');
      return;
    }
    if (!banReason.trim()) {
      alert('Enter a ban reason.');
      return;
    }

    const usernameToBan = banUsername.trim().toLowerCase();

    if (usernameToBan === user.username.toLowerCase()) {
      alert('You cannot ban yourself.');
      return;
    }

    // Check if user is an admin (head_admin can ban admins)
    const canBanAdmins = user.role === 'head_admin';
    const targetUser = allUsers.find(u => u.username.toLowerCase() === usernameToBan);
    if (!canBanAdmins && targetUser && (targetUser.role === 'admin' || targetUser.role === 'head_admin')) {
      alert('Admins are protected from bans. Only a head admin can ban an admin.');
      return;
    }

    const usernameToBanFinal = banUsername.trim();
    const days = banPermanent ? undefined : banDays;
    const success = await banUser(usernameToBanFinal, user.username, banReason.trim(), banPermanent, days, canBanAdmins);

    if (success) {
      // Firestore subscription will update bans list; clear form
      setBanUsername('');
      setBanReason('');
      setBanPermanent(true);
      await loadData();
      alert(`${usernameToBanFinal} has been banned.`);
    } else {
      alert('Could not ban this user. Admins are protected, or the request failed. Check you are signed in as admin.');
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
    const messages = await getMessagesAPI(user.username, bannedUsername);
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
          Moderator messages ({appeals.filter(a => a.status === 'pending').length} pending)
        </button>
        <button
          className={`btn ${activeTab === 'gamesubmissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('gamesubmissions')}
        >
          Game Submissions ({gameSubmissions.filter(s => s.status === 'pending').length} pending)
        </button>
        <button
          className={`btn ${activeTab === 'webdeploy' ? 'active' : ''}`}
          onClick={() => setActiveTab('webdeploy')}
        >
          Web Deploy
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
          <div className="ai-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>All Users ({filteredUsers.length} of {allUsers.length} total)</span>
            <button
              type="button"
              className="btn"
              onClick={() => fetchUsersFromApi()}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Refresh from server
            </button>
          </div>
          {usersLoadError && (
            <div style={{ padding: '10px 12px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid var(--danger, #ff4d4d)', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: 'var(--text)' }}>
              {usersLoadError}
            </div>
          )}
          <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div className="smalltext">No users found. {allUsers.length === 0 ? 'No users in system. Use “Refresh from server” if you expect to see users.' : `Try a different search term.`}</div>
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
                        Role: {u.role} • Coins: {u.coins} • Gender:{' '}
                        {formatGenderForDisplay(u.gender)}
                      </div>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setDevicesModalUser(u.username)}
                      >
                        Show devices
                      </button>
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
                            style={{ background: '#38bdf8', color: '#0f172a', padding: '6px 12px', fontSize: '12px' }}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Devices popup modal — portaled to body so it always appears on top */}
      {typeof document !== 'undefined' && devicesModalUser && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setDevicesModalUser(null)}
        >
          <div
            style={{
              background: 'var(--panel)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>Devices for {devicesModalUser}</h3>
              <button type="button" className="btn" style={{ padding: '6px 12px' }} onClick={() => setDevicesModalUser(null)}>Close</button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {devicesModalLoading && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>Loading devices…</div>
              )}
              {!devicesModalLoading && devicesModalError && (
                <div style={{ padding: '12px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px', border: '1px solid var(--danger)', color: 'var(--text)', fontSize: '14px' }}>
                  {devicesModalError}
                </div>
              )}
              {!devicesModalLoading && !devicesModalError && devicesModalList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '14px' }}>
                  No devices recorded for this user. Devices appear after they sign in or register.
                </div>
              )}
              {!devicesModalLoading && !devicesModalError && devicesModalList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {devicesModalList.map((d) => (
                    <div
                      key={d.deviceId}
                      style={{
                        padding: '14px',
                        background: 'var(--panel-soft)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>{formatDeviceOS(d.label)}</div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: 'var(--text-dim)',
                        wordBreak: 'break-all',
                        padding: '8px 10px',
                        background: 'var(--panel)',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        marginBottom: '10px',
                      }}>
                        {d.deviceId || '—'}
                      </div>
                      {(typeof d.firstSeen === 'number' || typeof d.lastSeen === 'number') && (
                        <div className="smalltext" style={{ marginBottom: '10px' }}>
                          {typeof d.firstSeen === 'number' && <>First seen: {new Date(d.firstSeen).toLocaleString()}</>}
                          {typeof d.firstSeen === 'number' && typeof d.lastSeen === 'number' && ' · '}
                          {typeof d.lastSeen === 'number' && <>Last seen: {new Date(d.lastSeen).toLocaleString()}</>}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => copyDeviceId(d.deviceId)}>
                          Copy ID
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#ff4d4d' }}
                          onClick={async () => {
                            if (!confirm('Hardware-ban this device? Linked accounts see the normal ban screen (appeals allowed).')) return;
                            try {
                              await addHardwareBanApi(d.deviceId, `From admin panel (user ${devicesModalUser})`, { mode: 'hardware' });
                              setHardwareBans(await getHardwareBans());
                              setDevicesModalList((prev) => prev.filter((x) => x.deviceId !== d.deviceId));
                            } catch (e: any) {
                              alert(e?.message || 'Failed');
                            }
                          }}
                        >
                          Hardware ban
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#b91c1c', border: '1px solid #ff6b35' }}
                          onClick={async () => {
                            if (!confirm(`TERMINATE this device for ${devicesModalUser}? Fiery fired screen, no appeals, all linked profiles blocked.`)) return;
                            try {
                              await addHardwareBanApi(d.deviceId, undefined, {
                                mode: 'terminated',
                                terminatedSubject: devicesModalUser || 'You',
                              });
                              setHardwareBans(await getHardwareBans());
                              setDevicesModalList((prev) => prev.filter((x) => x.deviceId !== d.deviceId));
                            } catch (e: any) {
                              alert(e?.message || 'Failed');
                            }
                          }}
                        >
                          Terminate 🔥
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
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
                  Ban user (account)
                </button>
              </div>
            </div>
          </div>

          <div className="ai-box" style={{ marginBottom: '16px' }}>
            <div className="ai-label">Terminate user (fiery site block)</div>
            <div className="ai-output">
              <p className="smalltext" style={{ marginBottom: '12px' }}>
                Blocks all linked browser profiles with the <strong>fired</strong> full-screen (no appeals). Uses device history when available; otherwise account-only terminated ban.
              </p>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr auto' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Username:</label>
                  <input
                    type="text"
                    value={terminateUsername}
                    onChange={(e) => setTerminateUsername(e.target.value)}
                    placeholder="Username to terminate"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--panel-soft)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Name on fired screen:</label>
                  <input
                    type="text"
                    value={terminateSubject}
                    onChange={(e) => setTerminateSubject(e.target.value)}
                    placeholder="e.g. Oliver L"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--panel-soft)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
                <div style={{ alignSelf: 'end' }}>
                  <button
                    className="btn"
                    style={{ background: '#b91c1c', border: '1px solid #ff6b35' }}
                    onClick={async () => {
                      const un = terminateUsername.trim();
                      if (!un) return;
                      if (!confirm(`Terminate ${un}? Fiery block on all linked devices — cannot be appealed.`)) return;
                      try {
                        const result = await terminateUserAccess(
                          un,
                          user.username,
                          terminateSubject.trim() || un,
                        );
                        setTerminateUsername('');
                        setTerminateSubject('');
                        await loadOtherData();
                        setHardwareBans(await getHardwareBans());
                        alert(
                          `Terminated. Blocked account(s): ${result.bannedUsernames.length ? result.bannedUsernames.join(', ') : 'see hardware bans list'}`,
                        );
                      } catch (e: any) {
                        alert(e?.message || 'Failed to terminate');
                      }
                    }}
                  >
                    Terminate 🔥
                  </button>
                </div>
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
                          <div style={{ fontWeight: 600, marginBottom: '4px', color: ban.banKind === 'terminated' ? '#ff6b35' : '#ff4d4d' }}>
                            {ban.username}
                            {ban.banKind === 'terminated' ? (
                              <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: '#ff6b35' }}>TERMINATED 🔥</span>
                            ) : ban.hardwareBanDeviceId ? (
                              <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-dim)' }}>Hardware</span>
                            ) : null}
                          </div>
                          <div className="smalltext">
                            Reason: {ban.banKind === 'terminated' ? 'Fired — site access revoked' : ban.reason}
                            <br />
                            Banned by: {ban.bannedBy}
                            <br />
                            Date: {new Date(ban.timestamp).toLocaleString()}
                            <br />
                            Type: {ban.banKind === 'terminated' ? 'Terminated (no appeals)' : ban.permanent ? 'Permanent' : `Temporary (expires ${ban.expiresAt ? new Date(ban.expiresAt).toLocaleString() : 'N/A'})`}
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
            <div className="ai-label">Device actions</div>
            <div className="ai-output">
              <p className="smalltext" style={{ marginBottom: '12px' }}>
                <strong>Hardware ban</strong> — standard ban screen, appeals allowed, reversible.
                <br />
                <strong>Terminate</strong> — fiery &quot;YOU ARE FIRED&quot; screen, no appeals, blocks all linked browser profiles.
              </p>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr 1fr' }}>
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
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Reason (hardware ban):</label>
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
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Fired screen name (terminate):</label>
                  <input
                    type="text"
                    value={deviceTerminateSubject}
                    onChange={(e) => setDeviceTerminateSubject(e.target.value)}
                    placeholder="e.g. Oliver L"
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
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                <button
                  className="btn"
                  style={{ background: '#ff4d4d' }}
                  onClick={async () => {
                    if (!deviceBanId.trim()) return;
                    if (!confirm('Hardware-ban this device? Normal ban screen with appeals.')) return;
                    try {
                      const result = await addHardwareBanApi(deviceBanId.trim(), deviceBanReason.trim(), { mode: 'hardware' });
                      setDeviceBanId('');
                      setDeviceBanReason('');
                      setHardwareBans(await getHardwareBans());
                      await loadOtherData();
                      alert(`Hardware ban applied. Account(s): ${result.bannedUsernames.length ? result.bannedUsernames.join(', ') : 'none'}`);
                    } catch (e: any) {
                      alert(e?.message || 'Failed to hardware ban device');
                    }
                  }}
                >
                  Hardware ban
                </button>
                <button
                  className="btn"
                  style={{ background: '#b91c1c', border: '1px solid #ff6b35' }}
                  onClick={async () => {
                    if (!deviceBanId.trim()) return;
                    if (!confirm('TERMINATE this device? Fiery fired screen, no appeals.')) return;
                    try {
                      const result = await addHardwareBanApi(deviceBanId.trim(), undefined, {
                        mode: 'terminated',
                        terminatedSubject: deviceTerminateSubject.trim() || 'You',
                      });
                      setDeviceBanId('');
                      setDeviceTerminateSubject('');
                      setHardwareBans(await getHardwareBans());
                      await loadOtherData();
                      alert(`Terminated. Account(s): ${result.bannedUsernames.length ? result.bannedUsernames.join(', ') : 'none'}`);
                    } catch (e: any) {
                      alert(e?.message || 'Failed to terminate device');
                    }
                  }}
                >
                  Terminate 🔥
                </button>
              </div>
              <p className="smalltext" style={{ marginTop: '10px', opacity: 0.85 }}>
                Terminate message preview: {TERMINATED_FIRE_MESSAGE.split('\n')[0]}…
              </p>
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', marginBottom: '4px', wordBreak: 'break-all' }}>
                          {hb.deviceId || '—'}
                          {hb.banKind === 'terminated' ? (
                            <span style={{ marginLeft: '8px', color: '#ff6b35', fontFamily: 'inherit', fontWeight: 700 }}>TERMINATED 🔥</span>
                          ) : (
                            <span style={{ marginLeft: '8px', color: 'var(--text-dim)', fontFamily: 'inherit' }}>Hardware</span>
                          )}
                        </div>
                        <div className="smalltext">
                          Banned by: {hb.bannedBy} • {new Date(hb.bannedAt).toLocaleString()}
                          {hb.banKind === 'terminated' && hb.terminatedSubject ? ` • Subject: ${hb.terminatedSubject}` : ''}
                          {hb.reason && hb.banKind !== 'terminated' ? ` • ${hb.reason}` : ''}
                          {hb.linkedUsernames?.length ? (
                            <> • Accounts: {hb.linkedUsernames.join(', ')}</>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => { try { navigator.clipboard.writeText(hb.deviceId); } catch (_) {} }}
                      >
                        Copy ID
                      </button>
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
            Moderator messages ({appeals.filter(a => a.status === 'pending').length} pending, {appeals.length} total)
          </div>
          <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {appeals.length === 0 ? (
              <div className="smalltext">No moderator messages yet.</div>
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
                            Message from: <span style={{ color: '#ff4d4d' }}>{appeal.username}</span>
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
                        <div className="smalltext" style={{ fontWeight: 600, marginBottom: '4px' }}>First message:</div>
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
                          {loadingThreadFor === appeal.id ? 'Loading…' : appealThreads[appeal.id] ? 'Hide chat' : 'View chat (user + assistant)'}
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
                            <div className="smalltext" style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-dim)' }}>Chat (user + assistant):</div>
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
                                <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>{msg.fromUsername === 'appeal_bot' ? 'Assistant' : msg.fromUsername}</span>
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

      {activeTab === 'webdeploy' && (
        <div className="ai-box" style={{ marginBottom: 0 }}>
          <div className="ai-label">Pixel Place Web Deploy Services</div>
          <div className="ai-output">
            <AdminPanelWebDeploy />
          </div>
        </div>
      )}
    </div>
  );
}
