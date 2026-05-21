import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Page Not Found — Pixel Place',
  robots: { index: false, follow: true },
  alternates: { canonical: SITE_ORIGIN },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#0f1117',
        color: '#f2f2f5',
      }}
    >
      <Image
        src="/error-icon.png"
        alt="Page not found"
        width={120}
        height={120}
        style={{ marginBottom: '24px', borderRadius: '16px' }}
      />
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#f2f2f5',
        }}
      >
        404 — Page Not Found
      </h1>
      <p
        style={{
          fontSize: '16px',
          marginBottom: '32px',
          color: '#8b90a8',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #00aa88 0%, #008866 100%)',
          border: 'none',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          padding: '12px 24px',
          borderRadius: '12px',
          cursor: 'pointer',
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(0, 170, 136, 0.4)',
          transition: 'all 0.2s',
        }}
      >
        Back to Pixel Place
      </Link>
    </div>
  );
}
