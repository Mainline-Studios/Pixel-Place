const LS_PRIV = 'pixelplace_ppaf_private_pkcs8_pem';
const LS_PUB = 'pixelplace_ppaf_public_spki_pem';

export function getStoredPpafKeys(): { privatePem: string; publicPem: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const priv = localStorage.getItem(LS_PRIV);
    const pub = localStorage.getItem(LS_PUB);
    if (!priv?.trim() || !pub?.trim()) return null;
    return { privatePem: priv.trim(), publicPem: pub.trim() };
  } catch {
    return null;
  }
}

export function setStoredPpafKeys(privatePem: string, publicPem: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_PRIV, privatePem.trim());
  localStorage.setItem(LS_PUB, publicPem.trim());
}

export function clearStoredPpafKeys(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LS_PRIV);
    localStorage.removeItem(LS_PUB);
  } catch {
    /* ignore */
  }
}

export function hasStoredPpafKeys(): boolean {
  return getStoredPpafKeys() !== null;
}
