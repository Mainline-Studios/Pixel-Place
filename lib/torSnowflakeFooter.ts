/** Optional Tor Snowflake proxy widget in the site footer (device-local preference). */

export const TOR_SNOWFLAKE_FOOTER_STORAGE_KEY = 'pixelplace_tor_snowflake_footer';
export const TOR_SNOWFLAKE_FOOTER_CHANGE = 'pixelplace:tor-snowflake-footer-change';

export const TOR_SNOWFLAKE_EMBED_URL = 'https://snowflake.torproject.org/embed.html';

export function getTorSnowflakeFooterEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(TOR_SNOWFLAKE_FOOTER_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setTorSnowflakeFooterEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOR_SNOWFLAKE_FOOTER_STORAGE_KEY, enabled ? '1' : '0');
  } catch {}
  window.dispatchEvent(new CustomEvent(TOR_SNOWFLAKE_FOOTER_CHANGE));
}
