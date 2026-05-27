'use client';

import Link from 'next/link';

/** Nearly invisible footer entry — unrelated third-party deploy service. */
export default function WebDeployFooterLink() {
  return (
    <Link
      href="/web-deploy"
      title="Pixel Place Web Deploy Services"
      style={{
        fontSize: 9,
        lineHeight: 1,
        opacity: 0.28,
        color: 'inherit',
        textDecoration: 'none',
        letterSpacing: '0.02em',
      }}
    >
      ·
    </Link>
  );
}
