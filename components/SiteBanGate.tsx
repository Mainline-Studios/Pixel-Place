'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { checkDeviceBanStatus } from '@/lib/storage';
import BanScreen from '@/components/BanScreen';
import TerminatedBanScreen from '@/components/TerminatedBanScreen';
import type { Ban } from '@/types';
import { isTerminatedBan, setTerminatedLockFlag } from '@/lib/terminatedBan';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';

/**
 * Blocks the entire site (all routes) when the device or account is banned.
 * Terminated employment bans show the fiery full-screen with no appeals.
 */
export default function SiteBanGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { bannedSession, deviceBannedSession, clearBannedSession, clearDeviceBannedSession } = useUser();
  const [deviceBan, setDeviceBan] = useState<Ban | null>(null);
  const [checking, setChecking] = useState(true);

  const refreshDeviceBan = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const { banned, ban } = await checkDeviceBanStatus();
      if (banned && ban) {
        setDeviceBan(ban);
        if (isTerminatedBan(ban)) setTerminatedLockFlag(true);
      } else {
        setDeviceBan(null);
        if (!bannedSession && !deviceBannedSession) setTerminatedLockFlag(false);
      }
    } catch {
      setDeviceBan(null);
    } finally {
      setChecking(false);
    }
  }, [bannedSession, deviceBannedSession]);

  useEffect(() => {
    setChecking(true);
    void refreshDeviceBan();
  }, [pathname, refreshDeviceBan]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void refreshDeviceBan();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refreshDeviceBan]);

  const activeBan =
    (bannedSession && isTerminatedBan(bannedSession.ban) && bannedSession.ban) ||
    (deviceBannedSession && isTerminatedBan(deviceBannedSession.ban) && deviceBannedSession.ban) ||
    (deviceBan && isTerminatedBan(deviceBan) && deviceBan) ||
    null;

  const normalBanSession = bannedSession && !isTerminatedBan(bannedSession.ban) ? bannedSession : null;
  const normalDeviceSession =
    !activeBan && deviceBannedSession && !isTerminatedBan(deviceBannedSession.ban)
      ? deviceBannedSession
      : !activeBan && deviceBan && !isTerminatedBan(deviceBan)
        ? { username: deviceBan.username || 'This device', ban: deviceBan }
        : null;

  if (activeBan) {
    return (
      <div data-terminated-root>
        <TerminatedBanScreen ban={activeBan} />
      </div>
    );
  }

  if (normalBanSession) {
    return (
      <BanScreen
        ban={normalBanSession.ban}
        username={normalBanSession.username}
        onAppealSubmitted={clearBannedSession}
      />
    );
  }

  if (normalDeviceSession) {
    return (
      <BanScreen
        ban={normalDeviceSession.ban}
        username={normalDeviceSession.username}
        onAppealSubmitted={clearDeviceBannedSession}
      />
    );
  }

  if (checking && typeof window !== 'undefined') {
    try {
      const { deviceId } = getDeviceFingerprint();
      if (deviceId) {
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: '#050000',
              zIndex: 2147483645,
            }}
            aria-busy
            aria-label="Checking access"
          />
        );
      }
    } catch {
      /* ignore */
    }
  }

  return <>{children}</>;
}
