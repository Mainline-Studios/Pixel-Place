'use client';

import type { GitProviderId } from '@/lib/webDeployGit';

type Props = { provider: GitProviderId; size?: number };

export default function WebDeployGitProviderIcon({ provider, size = 20 }: Props) {
  const s = size;
  switch (provider) {
    case 'github':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.27.825-.585 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.585A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case 'gitlab':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
          <path fill="#fc6d26" d="m23.6 9.6-.7-2.1L12 1.2 1.1 7.5l-.7 2.1L12 22.8z" />
          <path fill="#e24329" d="M12 1.2 5.5 9.6h13L12 1.2z" />
          <path fill="#fc6d26" d="M1.1 7.5 5.5 9.6 12 22.8 18.5 9.6l4.4-2.1z" />
          <path fill="#fca326" d="M1.1 7.5 5.5 9.6 12 1.2 18.5 9.6 22.9 7.5z" />
        </svg>
      );
    case 'bitbucket':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#2684ff"
            d="M.8 3.2A1.2 1.2 0 0 1 2 2h20a1.2 1.2 0 0 1 1.2 1.2l-2.4 14.4a1.2 1.2 0 0 1-1.2 1H5.4a1.2 1.2 0 0 1-1.2-1L.8 3.2zm6 3.6h10.4l.6-3.6H6.2l.6 3.6z"
          />
        </svg>
      );
    case 'codeberg':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="11" fill="#2185d0" />
          <path fill="#fff" d="M12 5.5c-3.2 0-5.8 2.1-5.8 4.7 0 2.1 1.8 3.9 4.3 4.5v3.1h3v-3.1c2.5-.6 4.3-2.4 4.3-4.5 0-2.6-2.6-4.7-5.8-4.7z" />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden fill="currentColor" opacity={0.7}>
          <path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4.5 6.5V18h5v-2.5C16 14.5 19 12 19 9a7 7 0 0 0-7-7zm0 2a5 5 0 0 1 5 5c0 2.2-1.8 4-4 4.5V16h-2v-2.5C8.8 13 7 11.2 7 9a5 5 0 0 1 5-5z" />
        </svg>
      );
  }
}
