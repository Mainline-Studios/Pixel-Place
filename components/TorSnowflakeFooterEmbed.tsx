'use client';

import { useEffect, useState } from 'react';
import {
  getTorSnowflakeFooterEnabled,
  TOR_SNOWFLAKE_EMBED_URL,
  TOR_SNOWFLAKE_FOOTER_CHANGE,
} from '@/lib/torSnowflakeFooter';

function useTorSnowflakeFooterEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getTorSnowflakeFooterEnabled());
    const onChange = () => setEnabled(getTorSnowflakeFooterEnabled());
    window.addEventListener(TOR_SNOWFLAKE_FOOTER_CHANGE, onChange);
    return () => window.removeEventListener(TOR_SNOWFLAKE_FOOTER_CHANGE, onChange);
  }, []);

  return enabled;
}

/** Optional Tor Snowflake browser proxy — helps censored users reach Tor. */
export default function TorSnowflakeFooterEmbed() {
  const enabled = useTorSnowflakeFooterEnabled();
  if (!enabled) return null;

  return (
    <div className="tor-snowflake-footer-embed">
      <p className="tor-snowflake-footer-embed__label">
        Tor Snowflake — optional proxy you can run from this tab.{' '}
        <a
          href="https://snowflake.torproject.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="tor-snowflake-footer-embed__learn"
        >
          Learn more
        </a>
      </p>
      <iframe
        src={TOR_SNOWFLAKE_EMBED_URL}
        width={320}
        height={240}
        title="Tor Snowflake proxy"
        loading="lazy"
        className="tor-snowflake-footer-embed__frame"
      />
    </div>
  );
}
