export const TERMINATED_BAN_KIND = 'terminated';

export const TERMINATED_FIRE_MESSAGE = `YOU ARE FIRED.

Your access to Pixel Place is permanently revoked. Every browser and device profile linked to your accounts has been burned from our systems.

You will never see Pixel Place again. There is no appeal. There is no back door. There is no second chance.

Turn off the screen and walk away.`;

export function banPayloadFromHardwareDoc(d: Record<string, unknown> | undefined | null): {
  username: string;
  reason: string;
  bannedBy: string;
  timestamp: number;
  permanent: boolean;
  banKind?: string;
  terminatedSubject?: string;
  appealsBlocked?: boolean;
} {
  const data = d || {};
  const banKind = typeof data.ban_kind === 'string' ? data.ban_kind : undefined;
  const terminatedSubject =
    typeof data.terminated_subject === 'string' ? data.terminated_subject.trim() : undefined;
  const isTerminated = banKind === TERMINATED_BAN_KIND;
  return {
    username: terminatedSubject || 'This device',
    reason: (data.reason as string) || (isTerminated ? TERMINATED_FIRE_MESSAGE : 'Access from this browser profile is blocked.'),
    bannedBy: (data.banned_by as string) || 'Administrator',
    timestamp: (data.banned_at as number) || Date.now(),
    permanent: true,
    banKind,
    terminatedSubject,
    appealsBlocked: isTerminated,
  };
}

export function banPayloadFromAccountBanDoc(d: Record<string, unknown> | undefined | null, username: string): {
  username: string;
  reason: string;
  bannedBy: string;
  timestamp: number;
  permanent: boolean;
  banKind?: string;
  terminatedSubject?: string;
  appealsBlocked?: boolean;
} {
  const data = d || {};
  const banKind = typeof data.ban_kind === 'string' ? data.ban_kind : undefined;
  const terminatedSubject =
    typeof data.terminated_subject === 'string' ? data.terminated_subject.trim() : undefined;
  const isTerminated = banKind === TERMINATED_BAN_KIND;
  return {
    username: terminatedSubject || username,
    reason: (data.reason as string) || (isTerminated ? TERMINATED_FIRE_MESSAGE : 'Account banned'),
    bannedBy: (data.banned_by as string) || 'Administrator',
    timestamp: (data.banned_at as number) || Date.now(),
    permanent: data.permanent !== false,
    banKind,
    terminatedSubject,
    appealsBlocked: isTerminated,
  };
}
