import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Pixel Place',
  description: 'How Pixel Place collects, uses, and protects your personal data.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
