'use client';

import type { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { navigateToTab } from '@/lib/routing';
import { downloadPrivacySafeProfileJson } from '@/lib/privacyExport';
import { clearSiteTranslationCache } from '@/lib/siteTranslationCache';
import LocalizeText from '@/components/LocalizeText';

interface SafetyPrivacyPanelProps {
  user: User;
}

export default function SafetyPrivacyPanel({ user }: SafetyPrivacyPanelProps) {
  const { setUser } = useUser();

  const handleSignOut = () => {
    if (
      !confirm(
        'Sign out on this browser? Your session and auth token on this device will be cleared.',
      )
    ) {
      return;
    }
    setUser(null);
  };

  return (
    <div className="ai-box">
      <div className="ai-label">
        <LocalizeText text="Privacy & safety" />
      </div>
      <div className="ai-output" style={{ lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 10px' }}>
          <LocalizeText text="We take safety seriously: accounts use server-verified sign-in, reports go to moderators, and you control data on this device." />
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: '1.2em' }}>
          <li>
            <LocalizeText text="Never share your password or one-time codes with anyone — staff will never ask for them." />
          </li>
          <li>
            <LocalizeText text="Use the Safety tab to report harassment, cheating, or impersonation." />
          </li>
          <li>
            <LocalizeText text="Download your profile JSON if you want a portable copy of non-secret account fields." />
          </li>
        </ul>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          <button type="button" className="btn" onClick={() => navigateToTab('report')}>
            <LocalizeText text="Open Safety & reports" />
          </button>
          <button type="button" className="btn" onClick={() => downloadPrivacySafeProfileJson(user)}>
            <LocalizeText text="Download my data (JSON)" />
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              clearSiteTranslationCache();
              alert('Translation cache cleared for this tab. UI may reload translations as you browse.');
            }}
          >
            <LocalizeText text="Clear translation cache" />
          </button>
          <button type="button" className="btn" onClick={handleSignOut}>
            <LocalizeText text="Sign out on this browser" />
          </button>
        </div>
      </div>
    </div>
  );
}
