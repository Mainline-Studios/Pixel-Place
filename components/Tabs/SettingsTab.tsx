'use client';

import { useState, useEffect } from 'react';
import { User, Skin, TabContent } from '@/types';
import { getSkins, getTabContent, getUsers, saveUsers } from '@/lib/storage';
import { escapeHTML, containsEmoji } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import AdminPanelTab from './AdminPanelTab';

interface SettingsTabProps {
  user: User;
  editMode: boolean;
  onToggleEditMode: () => void;
  onResetPublished?: () => void;
}

export default function SettingsTab({ user, editMode, onToggleEditMode, onResetPublished }: SettingsTabProps) {
  const { updateUser, setUser } = useUser();
  const coins = typeof user.coins === 'number' ? user.coins : 0;
  const [skins, setSkins] = useState<Skin[]>([]);
  const [tabContent, setTabContent] = useState<TabContent>({} as TabContent);

  // Username/Password change state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState('');
  const [changingUsername, setChangingUsername] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [skinsData, tabData] = await Promise.all([getSkins(), getTabContent()]);
      setSkins(skinsData);
      setTabContent(tabData);
    };
    loadData();
  }, []);

  const equippedSkin = skins.find((s) => s.id === user.equippedSkin);
  const equippedSkinName = equippedSkin ? equippedSkin.name : 'None';

  // Filter emojis from username input for non-admin users
  const handleUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only remove emojis if user is NOT admin - admins can use emojis
    const isAdmin = user.role === 'admin';
    if (containsEmoji(value) && !isAdmin) {
      // Remove emojis from input silently for non-admins
      value = value.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B50}-\u{2B55}\u{FE00}-\u{FE0F}]/gu, '');
    }
    setNewUsername(value);
  };

  // Filter emojis from password input for non-admin users
  const handleNewPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only remove emojis if user is NOT admin - admins can use emojis
    const isAdmin = user.role === 'admin';
    if (containsEmoji(value) && !isAdmin) {
      // Remove emojis from input silently for non-admins
      value = value.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B50}-\u{2B55}\u{FE00}-\u{FE0F}]/gu, '');
    }
    setNewPassword(value);
  };

  const handleConfirmPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only remove emojis if user is NOT admin - admins can use emojis
    const isAdmin = user.role === 'admin';
    if (containsEmoji(value) && !isAdmin) {
      // Remove emojis from input silently for non-admins
      value = value.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B50}-\u{2B55}\u{FE00}-\u{FE0F}]/gu, '');
    }
    setConfirmPassword(value);
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      setMessage('Please enter a new username.');
      return;
    }

    if (newUsername.trim().toLowerCase() === user.username.toLowerCase()) {
      setMessage('New username must be different from current username.');
      return;
    }

    setChangingUsername(true);
    setMessage('');

    try {
      const users = await getUsers();

      // Check if username already exists
      const usernameExists = users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase());
      if (usernameExists) {
        setMessage('Username already exists. Please choose a different one.');
        setChangingUsername(false);
        return;
      }

      // Update username in users array
      const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
      if (userIndex !== -1) {
        const oldUsername = users[userIndex].username;
        users[userIndex].username = newUsername.trim();

        // Update sessionStorage with new username
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('pixelPlaceLoggedInUser', newUsername.trim());
          } catch (error) {
            console.error('Error updating session:', error);
          }
        }

        // Save updated users
        await saveUsers(users);

        // Update user in context
        const updatedUser = { ...users[userIndex] };
        setUser(updatedUser);
        updateUser({ username: newUsername.trim() });

        setMessage(`Username changed from "${oldUsername}" to "${newUsername.trim()}" successfully!`);
        setNewUsername('');
      } else {
        setMessage('User not found. Please refresh and try again.');
      }
    } catch (error: any) {
      setMessage(`Error changing username: ${error.message || 'Something went wrong'}`);
    } finally {
      setChangingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setMessage('Please enter your current password.');
      return;
    }

    if (currentPassword !== user.password) {
      setMessage('Current password is incorrect.');
      return;
    }

    if (!newPassword) {
      setMessage('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    setMessage('');

    try {
      const users = await getUsers();
      const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        await saveUsers(users);

        // Update user in context
        const updatedUser = { ...users[userIndex] };
        setUser(updatedUser);
        updateUser({ password: newPassword });

        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage('User not found. Please refresh and try again.');
      }
    } catch (error: any) {
      setMessage(`Error changing password: ${error.message || 'Something went wrong'}`);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <h2 className="section-title">Settings</h2>
      <div className="ai-box">
        <div className="ai-label">Account</div>
        <div className="ai-output">
          Username: {escapeHTML(user.username)}
          <br />
          Role: {escapeHTML(user.role)}
          <br />
          Gender: Boy
          <br />
          Coins: {coins.toLocaleString('en-US')}
          <br />
          Equipped Skin: {escapeHTML(equippedSkinName)}
        </div>
      </div>

      {/* Change Username */}
      <div className="ai-box" style={{ marginTop: '20px' }}>
        <div className="ai-label">Change Username</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="New username"
            value={newUsername}
            onChange={handleUsernameInputChange}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 170, 255, 0.3)',
              background: 'rgba(15, 20, 35, 0.8)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            className="btn"
            onClick={handleChangeUsername}
            disabled={changingUsername || !newUsername.trim()}
            style={{ opacity: (changingUsername || !newUsername.trim()) ? 0.6 : 1 }}
          >
            {changingUsername ? 'Changing...' : 'Change Username'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="ai-box" style={{ marginTop: '20px' }}>
        <div className="ai-label">Change Password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 170, 255, 0.3)',
              background: 'rgba(15, 20, 35, 0.8)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            value={newPassword}
            onChange={handleNewPasswordInputChange}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 170, 255, 0.3)',
              background: 'rgba(15, 20, 35, 0.8)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={handleConfirmPasswordInputChange}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 170, 255, 0.3)',
              background: 'rgba(15, 20, 35, 0.8)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            className="btn"
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            style={{ opacity: (changingPassword || !currentPassword || !newPassword || !confirmPassword) ? 0.6 : 1 }}
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="ai-box" style={{ marginTop: '20px', border: message.includes('Error') || message.includes('incorrect') || message.includes('already exists') ? '1px solid #ff4d4d' : '1px solid #2ecc71' }}>
          <div className="ai-label" style={{ color: message.includes('Error') || message.includes('incorrect') || message.includes('already exists') ? '#ff4d4d' : '#2ecc71' }}>
            {message.includes('Error') || message.includes('incorrect') || message.includes('already exists') ? 'Error' : 'Success'}
          </div>
          <div className="ai-output">{message}</div>
        </div>
      )}
      {user.role === 'admin' && (
        <div className="ai-box">
          <div className="ai-label">Admin Tools</div>
          <div className="ai-output">
            Edit Mode: {editMode ? 'ON' : 'OFF'}
            <br />
            You can publish instantly with no approval.
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={onToggleEditMode}>
              {editMode ? 'Stop Editing' : 'Edit Mode'}
            </button>
          </div>
        </div>
      )}
      <div className="ai-box">
        <div className="ai-label">Settings Info</div>
        <div className="ai-output">{tabContent.settings || ''}</div>
      </div>

      {/* Admin Panel - Only visible to admins */}
      {user.role === 'admin' && (
        <div style={{ marginTop: '40px' }}>
          <AdminPanelTab user={user} editMode={editMode} />
        </div>
      )}
    </>
  );
}




