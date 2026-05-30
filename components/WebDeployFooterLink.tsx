'use client';

import Link from 'next/link';

/** Footer link to Web Deploy Services — separate from Anti 6-7 vote triggers. */
export default function WebDeployFooterLink() {
  return (
    <span
      className="web-deploy-footer-entry"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginLeft: 12,
        verticalAlign: 'middle',
      }}
    >
      <span aria-hidden style={{ opacity: 0.35, fontSize: 10 }}>
        |
      </span>
      <Link
        href="/web-deploy"
        className="web-deploy-footer-link"
        title="Pixel Place Web Deploy Services — hosting on pixelplaceofficial.com (not games login)"
        aria-label="Web Deploy Services — separate hosting service"
        style={{
          fontSize: 11,
          lineHeight: 1.3,
          opacity: 0.72,
          color: 'var(--accent, rgba(125, 211, 252, 0.95))',
          textDecoration: 'none',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        Web Deploy Services
      </Link>
    </span>
  );
}
