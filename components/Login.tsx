'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const { login, createAccount } = useUser();

  const handleSignIn = async () => {
    const result = await login(username, password);
    setMessage(result.message);
  };

  const handleCreateAccount = async () => {
    const result = await createAccount(username, password, gender);
    setMessage(result.message);
  };

  return (
    <div id="login-screen">
      <div className="login-box">
        <h1>Pixel Place</h1>
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


