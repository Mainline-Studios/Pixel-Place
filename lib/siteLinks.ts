/** Official Pixel Place social / source links (UI + JSON-LD). */
export const PIXEL_PLACE_YOUTUBE = 'https://www.youtube.com/@OfficialPixelPlace';
export const PIXEL_PLACE_GITHUB = 'https://github.com/Mainline-Studios/Pixel-Place';

/** Official Mainline Studios Discord server (community hub, not only Pixel Place). */
export const MAINLINE_STUDIOS_DISCORD = 'https://discord.gg/VV6nKAz5sR';

/** @deprecated use MAINLINE_STUDIOS_DISCORD */
export const PIXEL_PLACE_DISCORD = MAINLINE_STUDIOS_DISCORD;

export type OfficialFooterLink = {
  href: string;
  /** Anchor text in the footer */
  linkText: string;
  /** Tooltip; defaults to `href` in the UI */
  title?: string;
};

/** Footer “urls” row — YouTube & GitHub show full URLs; Discord shows a clear Mainline Studios label. */
export const PIXEL_PLACE_OFFICIAL_LINKS: readonly OfficialFooterLink[] = [
  { href: PIXEL_PLACE_YOUTUBE, linkText: PIXEL_PLACE_YOUTUBE },
  { href: PIXEL_PLACE_GITHUB, linkText: PIXEL_PLACE_GITHUB },
  {
    href: MAINLINE_STUDIOS_DISCORD,
    linkText: 'Mainline Studios Discord',
    title: `Official Mainline Studios Discord — ${MAINLINE_STUDIOS_DISCORD}`,
  },
];

/** Pyx AI trainer / content filter — https://pyx-ai.web.app/ */
export const PYX_AI_TRAIN_URL = 'https://pyx-ai.web.app/';
