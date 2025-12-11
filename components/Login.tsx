'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import BanScreen from './BanScreen';
import Image from 'next/image';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const [banInfo, setBanInfo] = useState<any>(null);
  const { login, createAccount } = useUser();

  const handleSignIn = async () => {
    const result = await login(username, password);
    if (result.ban) {
      setBanInfo(result.ban);
    } else {
      setMessage(result.message);
      setBanInfo(null);
    }
  };

  const handleCreateAccount = async () => {
    const result = await createAccount(username, password, gender);
    setMessage(result.message);
    setBanInfo(null);
  };

  const handleAppealSubmitted = () => {
    setBanInfo(null);
    setUsername('');
    setPassword('');
  };

  if (banInfo) {
    return <BanScreen ban={banInfo} username={username} onAppealSubmitted={handleAppealSubmitted} />;
  }

  return (
    <div id="login-screen">
      <div className="login-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <Image
            src="/logo.png"
            alt="Pixel Place Logo"
            width={48}
            height={48}
            style={{ objectFit: 'contain' }}
            priority
          />
          <h1 style={{ margin: 0 }}>Pixel Place</h1>
        </div>
        <input
          id="user"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          id="pass"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender (for new account)</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <button className="btn auth-btn" onClick={handleSignIn}>
          Sign In
        </button>
        <button className="btn auth-btn" onClick={handleCreateAccount}>
          Create Account
        </button>
        <div id="msg">{message}</div>
      </div>
    </div>
  );
}




