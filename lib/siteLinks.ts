/** Official Pixel Place social / source links (UI + JSON-LD). */
export const PIXEL_PLACE_YOUTUBE = 'https://www.youtube.com/@PixelPlaceOfficial';
export const PIXEL_PLACE_GITHUB = 'https://github.com/Mainline-Studios/Pixel-Place';

/** Official Pixel Place blog on Blogger. */
export const PIXEL_PLACE_BLOG =
  'https://www.blogger.com/blog/posts/7830132861557753760?hl=en';

/** Official Mainline Studios beats on Treblo (formerly Sonauto; AI-generated — brief in-app disclosure). */
export const MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT =
  'https://treblo.com/group/944d8ce3-d28a-4a30-92d8-b567cb5bc8ac';

/** @deprecated use MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT */
export const PIXEL_PLACE_OFFICIAL_MUSIC_BEAT = MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT;

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
  /** Opens a brief note that music is AI-made before navigating (Treblo). */
  opensWithAiMusicNote?: boolean;
};

/** Footer “urls” row — YouTube & GitHub show full URLs; Discord shows a clear Mainline Studios label. */
export const PIXEL_PLACE_OFFICIAL_LINKS: readonly OfficialFooterLink[] = [
  { href: PIXEL_PLACE_YOUTUBE, linkText: PIXEL_PLACE_YOUTUBE },
  { href: PIXEL_PLACE_GITHUB, linkText: PIXEL_PLACE_GITHUB },
  {
    href: PIXEL_PLACE_BLOG,
    linkText: 'Pixel Place blog',
    title: `Official Pixel Place blog — ${PIXEL_PLACE_BLOG}`,
  },
  {
    href: MAINLINE_STUDIOS_DISCORD,
    linkText: 'Mainline Studios Discord',
    title: `Official Mainline Studios Discord — ${MAINLINE_STUDIOS_DISCORD}`,
  },
  {
    href: MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT,
    linkText: 'Mainline beats (Treblo)',
    title: `Official Mainline Studios beats on Treblo — ${MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT}`,
    opensWithAiMusicNote: true,
  },
];

/** Pyx AI trainer / content filter — https://pyx-ai.web.app/ */
export const PYX_AI_TRAIN_URL = 'https://pyx-ai.web.app/';
