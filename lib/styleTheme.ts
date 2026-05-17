export type StyleTheme =
  | 'modern'
  | 'futuristic'
  | 'normal'
  | '90s'
  | '80s'
  | 'lowcontrast'
  | 'highcontrast'
  | 'maximalist'
  | 'minimalist';

const STORAGE_KEY = 'pixelplace_style';

export const STYLE_OPTIONS: { id: StyleTheme; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'futuristic', label: 'Futuristic' },
  { id: 'normal', label: 'Normal' },
  { id: '90s', label: '90s' },
  { id: '80s', label: '80s' },
  { id: 'lowcontrast', label: 'Low Contrast' },
  { id: 'highcontrast', label: 'High Contrast' },
  { id: 'maximalist', label: 'Maximalist' },
  { id: 'minimalist', label: 'Minimalist' },
];

export function getStoredStyle(): StyleTheme {
  if (typeof window === 'undefined') return 'normal';
  const s = localStorage.getItem(STORAGE_KEY);
  if (s && STYLE_OPTIONS.some((o) => o.id === s)) return s as StyleTheme;
  return 'normal';
}

export function setStoredStyle(style: StyleTheme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, style);
}
