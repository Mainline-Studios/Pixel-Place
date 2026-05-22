'use client';

import HistoriMac from '@/components/Games/HistoriMac';
import HistoriMacCatalogNav from '@/components/Games/HistoriMacCatalogNav';

/** Full HistoriMac catalog at `/historimac` — same picker as in-game, with site chrome. */
export default function HistoriMacHub() {
  return (
    <div data-historimac-hub style={{ minHeight: '100vh' }}>
      <HistoriMacCatalogNav />
      <HistoriMac />
    </div>
  );
}
