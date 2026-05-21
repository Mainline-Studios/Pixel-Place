import type { Metadata } from 'next';
import { buildSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildSiteMetadata({
    title: 'Mainline Login — Pixel Place',
    path: '/mainlinelogin',
    noIndex: true,
  }),
};

export default function MainlineLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
