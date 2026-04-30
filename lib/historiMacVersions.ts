/**
 * HistoriMac — one entry per version button.
 * - Infinite Monkey (AI control) is a separate page: https://infinitemac.org/monkey/ — not a `/embed?…` flag (see embed docs + blog).
 * - embedUrl: direct Infinite Mac (or other) embed — single iframe, best for their /embed URLs
 * - htmlPath: file under public/
 * - inlineHtml: full HTML document for iframe srcdoc
 */
export type HistoriMacVersion = {
  id: string;
  /** Shown as “Version: {label}” */
  label: string;
  /** Direct embed URL (e.g. https://infinitemac.org/embed?...) */
  embedUrl?: string;
  /** iframe `allow` (e.g. cross-origin-isolated for Infinite Mac) */
  embedAllow?: string;
  /** Fixed iframe size in px (classic Mac); omitted = fill available area */
  embedWidth?: number;
  embedHeight?: number;
  /** Served from public/, e.g. `/games/historimac/system7.html` */
  htmlPath?: string;
  /** Full HTML document string; used in iframe srcdoc if set (overrides htmlPath) */
  inlineHtml?: string;
  /** Historical / technical context shown on the picker and above the embed */
  backgroundInfo?: string;
  /** Optional spotlight on the emulated hardware (longevity, last OS, etc.) */
  deviceShowcase?: string;
  /** Shown under “Device Showcase” (e.g. machine name) */
  deviceShowcaseSubtitle?: string;
  /** Loud callout (e.g. SUPER UNSTABLE) above background on picker & embed */
  warningBanner?: string;
  /** Representative year for the timeline strip (see `lib/historiMacTimeline.ts` — range auto-fits all set years) */
  timelineYear?: number;
};

export const HISTORIMAC_VERSIONS: HistoriMacVersion[] = [
  {
    id: 'system1',
    label: 'System 1.0 (Mac 128K)',
    timelineYear: 1984,
    embedUrl:
      'https://infinitemac.org/embed?disk=System+1.0&infinite_hd=true&machine=Mac+128K',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 512,
    embedHeight: 342,
    backgroundInfo:
      'The System 1.0 was shipped with the original Macintosh in 1984. It introduced the desktop, menus, and Finder on a 512×342 monochrome display. The Mac 128K had 128 KB of RAM—just enough to run one app at a time with no hard disk. This is where the modern Mac GUI began.',
  },
  {
    id: 'system20',
    label: 'System 2.0 (Mac 128K)',
    timelineYear: 1985,
    embedUrl:
      'https://infinitemac.org/embed?disk=System+2.0&infinite_hd=true&machine=Mac+128K',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 512,
    embedHeight: 342,
    backgroundInfo:
      'System 2.0 shipped in January 1985 as an update for the original Macintosh line. It refined the Finder, printing, and disk handling while keeping the iconic 512×342 monochrome canvas of the Mac 128K—still floppy-first, no internal hard disk by default.',
  },
  {
    id: 'system21',
    label: 'System 2.1 (Mac 512Ke)',
    timelineYear: 1985,
    embedUrl:
      'https://infinitemac.org/embed?disk=System+2.1&infinite_hd=true&machine=Mac+512Ke',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 512,
    embedHeight: 342,
    backgroundInfo:
      'System 2.1 arrived later in 1985 with fixes and polish across the Finder and utilities. The Macintosh 512Ke paired an 800 KB floppy with the same compact footprint as early Macs—512 KB RAM made System 2.x noticeably more usable than the original 128K.',
  },
  {
    id: 'system3',
    label: 'System 3.0 (Mac Plus)',
    timelineYear: 1986,
    embedUrl:
      'https://infinitemac.org/embed?disk=System+3.0&infinite_hd=true&machine=Mac+Plus',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 512,
    embedHeight: 342,
    backgroundInfo:
      'The System 3.0 was released in 1986 alongside the Macintosh Plus. The Plus bumped RAM to 1 MB and added a SCSI port for hard drives. System 3 brought better multitasking foundations, improved Finder and desk accessories, and reflected Apple’s push toward more capable compact Macs.',
  },
  {
    id: 'system32',
    label: 'System 3.2 (Mac Plus)',
    timelineYear: 1986,
    embedUrl:
      'https://infinitemac.org/embed?disk=System+3.2&infinite_hd=true&machine=Mac+Plus',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 512,
    embedHeight: 342,
    backgroundInfo:
      'System 3.2 refined the mid-1980s Macintosh Plus era—bug fixes, smoother Finder behavior, and incremental polish on the same 512×342 display and SCSI-ready compact chassis that defined “classic Mac” for schools and offices.',
  },
  {
    id: 'system40',
    label: 'System 4.0 (Mac SE)',
    timelineYear: 1987,
    embedUrl:
      'https://infinitemac.org/embed?disk=System+4.0&infinite_hd=true&machine=Mac+SE',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 512,
    embedHeight: 342,
    backgroundInfo:
      'System 4.0 landed in early 1987 as Apple tightened the classic Finder stack before System 5. The Macintosh SE added an expansion slot inside the compact case—still black-and-white and 512×342—making it a favorite upgrade path from the Plus.',
  },
  {
    id: 'system5',
    label: 'System 5.0',
    timelineYear: 1987,
    embedUrl: 'https://infinitemac.org/embed?disk=System+5.0&infinite_hd=true&machine=Mac+SE',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 512,
    embedHeight: 342,
    backgroundInfo:
      'The System 5.0 was released in 1987 and paired well with the Macintosh SE—a compact Mac that added Apple’s first internal expansion slot and built on the Plus era with 800 KB floppies and up to 4 MB RAM. It refined the Finder and desk accessories while keeping the iconic 512×342 monochrome screen, bridging the path toward System 6.',
  },
  {
    id: 'system7',
    label: 'System 7.0',
    timelineYear: 1991,
    embedUrl: 'https://infinitemac.org/embed?disk=System+7.0&infinite_hd=true&machine=Mac+IIfx',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 640,
    embedHeight: 480,
    backgroundInfo:
      'The System 7.0 was released in 1991 and marked a major leap for the Mac: color was central to the experience, the Trash moved into the menu bar, aliases and Balloon Help arrived, and TrueType fonts shipped alongside the classic Finder. The Macintosh IIfx was Apple’s flagship tower of the era—a 40 MHz 68030 powerhouse with NuBus expansion—well suited to showing System 7 at its best.',
  },
  {
    id: 'system711pro',
    label: 'System 7.1.1 Pro',
    timelineYear: 1993,
    embedUrl: 'https://infinitemac.org/embed?disk=System+7.1.1&infinite_hd=true&machine=Quadra+650',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 640,
    embedHeight: 480,
    backgroundInfo:
      'The System 7.1.1 was released in 1993 as a maintenance update to System 7, tightening stability and networking for the millions of Macs already on 7.x. The Macintosh Quadra 650 was a mid-range 68040 tower from the same era—a 33 MHz CPU, flexible RAM expansion, and built-in video made it a common sight in schools and businesses running exactly this generation of system software.',
    deviceShowcaseSubtitle: 'Macintosh Quadra 650',
    deviceShowcase:
      'The Macintosh Quadra 650 had a very long working life. Sold from 1993, these towers stayed in labs, offices, and prepress floors for years. Apple’s last officially supported system for this hardware was Mac OS 8.1—and on that final release the 68040 still ran smoothly with enough RAM, with many users saying the machine handled every supported version from early System 7 through 8.1 reliably.',
  },
  {
    id: 'kanjiTalk753',
    label: 'KanjiTalk 7.5.3 (just for kicks! :D)',
    timelineYear: 1996,
    embedUrl: 'https://infinitemac.org/embed?disk=KanjiTalk+7.5.3&infinite_hd=true&machine=Quadra+650',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 640,
    embedHeight: 480,
    backgroundInfo:
      'The KanjiTalk 7.5.3 was Apple’s Japanese edition of the Mac OS 7.5 era—KanjiTalk bundled WorldScript, Kanji fonts, and a fully localized Finder and utilities for Japan. Under the hood it’s the same System 7.5 lineage you know, but every menu, dialog, and keyboard path is tuned for typing and reading Japanese. We paired it with a Quadra 650 again just for kicks: same tower as System 7.1.1 Pro, totally different linguistic universe.',
  },
  {
    id: 'macos9',
    label: 'Mac OS 9',
    timelineYear: 1999,
    embedUrl:
      'https://infinitemac.org/embed?disk=Mac+OS+9.0&infinite_hd=true&machine=Power+Macintosh+6100',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 832,
    embedHeight: 624,
    backgroundInfo:
      'The Mac OS 9.0 was released in 1999 as the last major chapter of the classic Mac OS before Mac OS X. It polished the Platinum look, shipped Sherlock 2, multiple users, and stronger networking—while still running the same cooperative-multitasking architecture the Mac had used since System 7. Here it runs on a Power Macintosh 6100 profile—one of Apple’s first PowerPC towers—at 832×624, a comfortable late-Classic canvas before the Unix-based future took over.',
  },
  {
    id: 'osx10',
    label: 'Mac OS X 10.0',
    timelineYear: 2001,
    embedUrl:
      'https://infinitemac.org/embed?disk=Mac+OS+X+10.0&infinite_hd=true&machine=Power+Macintosh+G4+%28PCI+Graphics%29',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 640,
    embedHeight: 480,
    backgroundInfo:
      'The Mac OS X 10.0 (Cheetah) shipped in March 2001 as the first consumer release of Mac OS X: Aqua, the Dock, Darwin under the hood, and preemptive multitasking alongside a Classic environment for older Mac apps. Power Mac G4 systems—including the PCI Graphics models—were on Apple’s supported list for 10.0, making this pairing true to the era.',
  },
  {
    id: 'osx102',
    label: 'Mac OS X 10.2 Jaguar',
    timelineYear: 2002,
    embedUrl:
      'https://infinitemac.org/embed?disk=Mac+OS+X+10.2&infinite_hd=true&machine=Power+Macintosh+G4+%28PCI+Graphics%29',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 640,
    embedHeight: 480,
    backgroundInfo:
      'The Mac OS X 10.2 (Jaguar) arrived in August 2002 and was the first release marketed with a big-cat name. It introduced Quartz Extreme on supported GPUs, iChat, a real Address Book, stronger Universal Access, and the “Jaguar” polish that made OS X feel ready for daily use—still right at home on Power Mac G4 systems such as the PCI Graphics tower.',
  },
  {
    id: 'osx103',
    label: 'Mac OS X 10.3 Panther',
    timelineYear: 2003,
    embedUrl:
      'https://infinitemac.org/embed?disk=Mac+OS+X+10.3&infinite_hd=true&machine=Power+Macintosh+G4+%28PCI+Graphics%29',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 640,
    embedHeight: 480,
    backgroundInfo:
      'The Mac OS X 10.3 (Panther) shipped in October 2003 with a darker brushed-metal Finder, Exposé for window management, Fast User Switching, FileVault encryption, and Safari as the default browser. It tightened performance and polish across PowerPC Macs, including Power Mac G4 towers like the PCI Graphics model used here.',
  },
  {
    id: 'osx104',
    label: 'Mac OS X 10.4 Tiger',
    timelineYear: 2005,
    embedUrl:
      'https://infinitemac.org/embed?disk=Mac+OS+X+10.4&infinite_hd=true&machine=Power+Macintosh+G4+%28PCI+Graphics%29',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 640,
    embedHeight: 480,
    backgroundInfo:
      'The Mac OS X 10.4 (Tiger) launched in April 2005 with Spotlight system-wide search, the Dashboard and its widgets, Automator for no-code workflows, and Safari with RSS. It was one of the longest-supported OS X releases and ran strongly on PowerPC Macs, including Power Mac G4 setups like the PCI Graphics tower emulated here.',
  },
  {
    id: 'nextstep1',
    label: 'NeXTSTEP 1.0',
    timelineYear: 1989,
    embedUrl:
      'https://infinitemac.org/embed?disk=NeXTStep+1.0&infinite_hd=true&machine=NeXT+Computer',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 1120,
    embedHeight: 832,
    backgroundInfo:
      'The NeXTSTEP 1.0 was released by NeXT in 1989 for the NeXT Computer—a black magnesium workstation developed after Steve Jobs left Apple. It ran on a Mach-based kernel with Display PostScript and an object-oriented, Unix-style desktop that later influenced macOS when Apple acquired NeXT in 1996.',
  },
  {
    id: 'osx10publicbeta',
    label: 'BONUS!!! Mac OS X Public Beta 💫',
    timelineYear: 2000,
    embedUrl:
      'https://infinitemac.org/embed?disk=Mac+OS+X+10.0&infinite_hd=true&machine=Power+Macintosh+G3+%28Beige%29',
    embedAllow: 'cross-origin-isolated',
    embedWidth: 1152,
    embedHeight: 870,
    warningBanner: 'SUPER UNSTABLE',
    backgroundInfo:
      'The Mac OS X Public Beta landed in 2000—months before Cheetah—showing Aqua, the Dock, and Darwin in rough, unfinished form. Apple handed it out on disc at Macworld and to ADC members; it was slow, crash-happy, and missing pieces compared to the final 10.0. Here it runs on a Power Macintosh G3 (Beige) profile at 1152×870, the kind of early G3 tower brave testers actually used.',
  },
];
