'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { hasUsableAuthToken } from '@/lib/api';
import { startAnti67Lock } from '@/lib/anti67Api';
import { mergeAnti67IntoPreferences } from '@/lib/anti67';
import { syncAnti67Session } from '@/lib/anti67Session';

const triggerStyle: React.CSSProperties = {
  fontSize: 9,
  lineHeight: 1,
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  opacity: 0.42,
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
};

export default function Anti67FooterTriggers() {
  const { user, updateUser } = useUser();
  const [busy, setBusy] = useState(false);

  const onTrigger = async (vote: 'no' | 'yes') => {
    if (busy) return;
    if (!user?.username || !hasUsableAuthToken()) {
      alert('Sign in first — Anti 67 is tied to your account.');
      return;
    }
    setBusy(true);
    const result = await startAnti67Lock(vote);
    setBusy(false);
    if (!result.ok || !result.anti67) {
      alert(result.error || 'Could not start Anti 67.');
      return;
    }
    syncAnti67Session(result.anti67);
    await updateUser({
      accountPreferences: mergeAnti67IntoPreferences(user.accountPreferences, result.anti67),
    });
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 6,
        fontSize: 9,
        opacity: 0.5,
        verticalAlign: 'middle',
      }}
      aria-label="Anti 6-7 vote"
    >
      <button
        type="button"
        style={triggerStyle}
        disabled={busy}
        onClick={() => void onTrigger('no')}
        title="Vote no on 6-7 (Anti 67)"
        aria-label="Vote no on 6-7"
      >
        <s>6-7</s>
      </button>
      <button
        type="button"
        style={{ ...triggerStyle, textDecoration: 'none' }}
        disabled={busy}
        onClick={() => void onTrigger('yes')}
        title="Vote yes on 6-7 (Anti 67)"
        aria-label="Vote yes on 6-7"
      >
        6-7
      </button>
    </span>
  );
}
