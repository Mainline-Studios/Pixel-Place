import type { Metadata } from 'next';
import { buildSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildSiteMetadata({
    title: 'Verify Email — Pixel Place',
    path: '/verify',
    noIndex: true,
  }),
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
