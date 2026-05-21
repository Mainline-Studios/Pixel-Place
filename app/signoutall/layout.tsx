import type { Metadata } from 'next';
import { buildSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildSiteMetadata({
    title: 'Sign Out All Devices — Pixel Place',
    path: '/signoutall',
    noIndex: true,
  }),
};

export default function SignOutAllLayout({ children }: { children: React.ReactNode }) {
  return children;
}
