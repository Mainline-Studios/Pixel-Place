/** Session translation cache key — keep in sync with SiteLanguageContext. */
export const SITE_TRANSLATION_CACHE_KEY = 'pp_site_tr_v1';

export function clearSiteTranslationCache(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SITE_TRANSLATION_CACHE_KEY);
  } catch {
    /* quota / private mode */
  }
}
