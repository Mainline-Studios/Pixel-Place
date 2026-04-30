/**
 * Names for Infinite Mac `/embed?…` query params — must match {@link https://github.com/mihaip/infinite-mac/blob/main/src/defs/run-def.ts runDefFromUrl}
 * (`disk` = disk displayName, `machine` = machine.name). Generated from upstream `defs/disks.ts` / `defs/machines.ts`.
 */

export type InfiniteMacMachineSpec = {
  name: string;
  /** RAM options supported by that machine (first entry is Infinite Mac’s default). */
  ramSizes: readonly string[];
  /** Typical iframe pixel size for HistoriMac chrome (embed uses iframe bounds; see embed-docs). */
  embedWidth: number;
  embedHeight: number;
};

/** Machines exposed in Infinite Mac’s UI — mirrors `ALL_MACHINES` / `MACHINES_BY_NAME`. */
export const INFINITE_MAC_MACHINES: readonly InfiniteMacMachineSpec[] = [
  { name: 'Mac 128K', ramSizes: ['128K'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac 128K (Snow)', ramSizes: ['128K'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac 512K (Snow)', ramSizes: ['512K'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac 512Ke', ramSizes: ['512K'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac 512Ke (Snow)', ramSizes: ['512K', '128K'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac Plus', ramSizes: ['4M'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac Plus (Snow)', ramSizes: ['4M', '2M', '1M'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac SE', ramSizes: ['4M'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac SE (Snow)', ramSizes: ['4M', '2M', '1M'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac Classic (Snow)', ramSizes: ['4M', '2M', '1M'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac II', ramSizes: ['8M'], embedWidth: 640, embedHeight: 480 },
  { name: 'Mac II (Snow)', ramSizes: ['8M', '4M', '2M', '1M'], embedWidth: 640, embedHeight: 480 },
  { name: 'Mac IIx', ramSizes: ['32M'], embedWidth: 640, embedHeight: 480 },
  { name: 'Mac IIx (Snow)', ramSizes: ['8M', '128M', '32M', '16M', '4M', '2M', '1M'], embedWidth: 640, embedHeight: 480 },
  { name: 'Mac IIcx (Snow)', ramSizes: ['8M', '128M', '32M', '16M', '4M', '2M', '1M'], embedWidth: 640, embedHeight: 480 },
  { name: 'Mac SE/30 (Snow)', ramSizes: ['8M', '128M', '32M', '16M', '4M', '2M', '1M'], embedWidth: 512, embedHeight: 342 },
  { name: 'Mac IIfx', ramSizes: ['128M', '64M', '32M', '16M', '8M', '4M'], embedWidth: 640, embedHeight: 480 },
  { name: 'Quadra 650', ramSizes: ['128M', '64M', '32M', '16M', '8M', '4M'], embedWidth: 640, embedHeight: 480 },
  {
    name: 'Power Macintosh 6100',
    ramSizes: ['136M', '72M', '40M', '24M', '12M', '8M'],
    embedWidth: 832,
    embedHeight: 624,
  },
  {
    name: 'Power Macintosh 7200',
    ramSizes: ['16M', '32M', '64M', '128M', '256M'],
    embedWidth: 832,
    embedHeight: 624,
  },
  {
    name: 'Power Macintosh 7500',
    ramSizes: ['16M', '32M', '64M', '128M', '256M'],
    embedWidth: 832,
    embedHeight: 624,
  },
  { name: 'Power Macintosh 9500', ramSizes: ['256M', '128M', '64M', '32M', '16M'], embedWidth: 1024, embedHeight: 768 },
  {
    name: 'Power Macintosh G3 (Beige)',
    ramSizes: ['256M', '128M', '64M', '32M'],
    embedWidth: 1024,
    embedHeight: 768,
  },
  {
    name: 'iMac G3 (233 Mhz)',
    ramSizes: ['128M', '64M', '32M', '256M', '512M', '1024M'],
    embedWidth: 1024,
    embedHeight: 768,
  },
  {
    name: 'Power Macintosh G3 (Blue & White) - Experimental',
    ramSizes: ['256M', '128M', '64M', '32M'],
    embedWidth: 1024,
    embedHeight: 768,
  },
  { name: 'Power Macintosh G3 (Blue & White)', ramSizes: ['256M', '128M', '64M'], embedWidth: 1024, embedHeight: 768 },
  {
    name: 'Power Macintosh G4 (PCI Graphics)',
    ramSizes: ['256M', '128M', '64M', '32M'],
    embedWidth: 640,
    embedHeight: 480,
  },
  { name: 'NeXT Computer', ramSizes: ['64M', '32M', '16M'], embedWidth: 1120, embedHeight: 832 },
  { name: 'NeXTcube', ramSizes: ['64M', '32M', '16M'], embedWidth: 1120, embedHeight: 832 },
  { name: 'NeXTstation', ramSizes: ['32M', '16M'], embedWidth: 1120, embedHeight: 832 },
  { name: 'NeXTstation Turbo Color', ramSizes: ['128M', '64M', '32M', '16M'], embedWidth: 1120, embedHeight: 832 },
];

export function getInfiniteMacMachineSpec(name: string): InfiniteMacMachineSpec | undefined {
  return INFINITE_MAC_MACHINES.find((m) => m.name === name);
}

/** System / Mac OS / NeXT disk display names — must match `ALL_DISKS` / `FLOPPY_DISKS` in Infinite Mac. */
export const INFINITE_MAC_DISK_NAMES: readonly string[] = [
  'KanjiTalk 7.5.3',
  'Mac OS 7.6',
  'Mac OS 7.6.1',
  'Mac OS 8.0',
  'Mac OS 8.1',
  'Mac OS 8.1 Disk Tools (68K)',
  'Mac OS 8.1 Disk Tools (PPC)',
  'Mac OS 8.5',
  'Mac OS 8.6',
  'Mac OS 9.0',
  'Mac OS 9.0.1',
  'Mac OS 9.0.2',
  'Mac OS 9.0.3',
  'Mac OS 9.0.4',
  'Mac OS 9.1',
  'Mac OS 9.2',
  'Mac OS 9.2.1',
  'Mac OS 9.2.2',
  'Mac OS X 10.0',
  'Mac OS X 10.1',
  'Mac OS X 10.2',
  'Mac OS X 10.3',
  'Mac OS X 10.4',
  'NeXTSTEP 3.1',
  'NeXTSTEP 3.2',
  'NeXTSTEP 3.3',
  'NeXTSTEP 4.0 PR1',
  'NeXTStep 0.8',
  'NeXTStep 0.9',
  'NeXTStep 1.0',
  'NeXTStep 1.0a',
  'NeXTStep 2.0',
  'NeXTStep 2.1',
  'NeXTStep 2.2',
  'NeXTStep 3.0',
  'OPENSTEP 4.0',
  'OPENSTEP 4.1',
  'OPENSTEP 4.2',
  'System 1.0',
  'System 1.0 (System Disk)',
  'System 1.1',
  'System 2.0',
  'System 2.1',
  'System 3.0',
  'System 3.1',
  'System 3.2',
  'System 3.3',
  'System 4.0',
  'System 4.1',
  'System 5.0',
  'System 5.1',
  'System 6.0',
  'System 6.0.1',
  'System 6.0.2',
  'System 6.0.3',
  'System 6.0.4',
  'System 6.0.5',
  'System 6.0.6.',
  'System 6.0.7',
  'System 6.0.8',
  'System 7.0',
  'System 7.0.1',
  'System 7.1',
  'System 7.1.1',
  'System 7.1.2',
  'System 7.1.2 Disk Tools',
  'System 7.5',
  'System 7.5 Disk Tools',
  'System 7.5.1',
  'System 7.5.2',
  'System 7.5.3',
  'System 7.5.4',
  'System 7.5.5',
];
