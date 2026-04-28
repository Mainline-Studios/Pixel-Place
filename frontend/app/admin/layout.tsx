import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Pixel Place',
  description: 'Internal moderation and analytics',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
