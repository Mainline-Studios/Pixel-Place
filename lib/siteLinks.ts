/** Official Pixel Place social / source links (UI + JSON-LD). */
export const PIXEL_PLACE_YOUTUBE = 'https://www.youtube.com/@PixelPlaceOfficial';
export const PIXEL_PLACE_GITHUB = 'https://github.com/Mainline-Studios/Pixel-Place';

/** Official Pixel Place music group on Sonauto (AI-generated beats — see in-app disclosure). */
export const PIXEL_PLACE_OFFICIAL_MUSIC_BEAT =
  'https://sonauto.ai/group/944d8ce3-d28a-4a30-92d8-b567cb5bc8ac';

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
  /** Opens a brief note that music is AI-made before navigating (Sonauto). */
  opensWithAiMusicNote?: boolean;
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
  {
    href: PIXEL_PLACE_OFFICIAL_MUSIC_BEAT,
    linkText: 'Official music beat (Sonauto)',
    title: `Official Pixel Place music group — ${PIXEL_PLACE_OFFICIAL_MUSIC_BEAT}`,
    opensWithAiMusicNote: true,
  },
];

/** Pyx AI trainer / content filter — https://pyx-ai.web.app/ */
export const PYX_AI_TRAIN_URL = 'https://pyx-ai.web.app/';
