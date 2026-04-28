'use client';

import { useState } from 'react';

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  console.log("Pixel Place is not open to the public. A password will be required.");
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pixelplace2024') {
      sessionStorage.setItem('passwordVerified', 'true');
      onSuccess();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="Enter password"
          style={{
            padding: '10px',
            fontSize: '16px',
            marginBottom: '10px',
            width: '200px',
          }}
          autoFocus
        />
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
