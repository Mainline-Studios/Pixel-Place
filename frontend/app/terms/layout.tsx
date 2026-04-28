import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Pixel Place',
  description: 'Terms governing use of Pixel Place.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
