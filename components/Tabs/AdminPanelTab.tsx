'use client';

import { useState, useEffect } from 'react';
import { User, Report, Ban } from '@/types';
import { getUsers, getBannedUsers, getReports, banUser, unbanUser, updateReportStatus, saveBannedUsers } from '@/lib/storage';

interface AdminPanelTabProps {
  user: User;
  editMode: boolean;
}

export default function AdminPanelTab({ user }: AdminPanelTabProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'bans' | 'reports'>('users');
  const [banUsername, setBanUsername] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banPermanent, setBanPermanent] = useState(true);
  const [banDays, setBanDays] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAllUsers(getUsers());
    setBans(getBannedUsers());
    setReports(getReports());
  };

  const handleBan = () => {
    if (!banUsername.trim()) {
      alert('Please enter a username to ban.');
      return;
    }
    if (!banReason.trim()) {
      alert('Please enter a reason for the ban.');
      return;
    }

    const days = banPermanent ? undefined : banDays;
    banUser(banUsername.trim(), user.username, banReason.trim(), banPermanent, days);
    setBanUsername('');
    setBanReason('');
    setBanPermanent(true);
    loadData();
    alert(`User "${banUsername}" has been ${banPermanent ? 'permanently' : `temporarily (${banDays} days)`} banned.`);
  };

  const handleUnban = (username: string) => {
    if (confirm(`Unban user "${username}"?`)) {
      unbanUser(username);
      loadData();
      alert(`User "${username}" has been unbanned.`);
    }
  };

  const handleReportAction = (reportId: string, action: 'resolved' | 'dismissed', notes?: string) => {
    updateReportStatus(reportId, action, user.username, notes);
    loadData();
    alert(`Report marked as ${action}.`);
  };

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
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="section-title">🛡️ Admin Panel</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
        <div className="ai-box">
          <div className="ai-label">All Users ({filteredUsers.length})</div>
          <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div className="smalltext">No users found.</div>
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
                        Role: {u.role} • Coins: {u.coins} • Gender: {u.gender}
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bans' && (
        <div>
          <div className="ai-box" style={{ marginBottom: '20px' }}>
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

          <div className="ai-box">
            <div className="ai-label">Banned Users ({bans.length})</div>
            <div className="ai-output" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {bans.length === 0 ? (
                <div className="smalltext">No banned users.</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {bans.map((ban) => (
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
                      <button
                        className="btn"
                        onClick={() => handleUnban(ban.username)}
                        style={{ background: 'var(--accent)' }}
                      >
                        Unban
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
                              onClick={() => {
                                if (confirm(`Ban user "${report.reportedUsername}" based on this report?`)) {
                                  const reason = prompt('Ban reason:', `Reported for: ${report.reason}`);
                                  if (reason) {
                                    banUser(report.reportedUsername, user.username, reason, true);
                                    handleReportAction(report.id, 'resolved', `User banned based on report`);
                                    loadData();
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
    </>
  );
}
