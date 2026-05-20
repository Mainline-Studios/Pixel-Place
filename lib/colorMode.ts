export type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'pixelplace_color_mode';

export function getStoredColorMode(): ColorMode {
  if (typeof window === 'undefined') return 'dark';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' ? 'light' : 'dark';
}

export function setStoredColorMode(mode: ColorMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  applyColorModeToDocument(mode);
}

export function applyColorModeToDocument(mode: ColorMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-color-mode', mode);
}
