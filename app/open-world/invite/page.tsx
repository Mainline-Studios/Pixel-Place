import type { Metadata } from 'next';
import OpenWorldInviteClient from '@/components/Games/OpenWorldInviteClient';
import { buildSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildSiteMetadata({
    title: 'Open World Invite — Pixel Place',
    description: 'Join a private Open World Plaza server with a secret invite link.',
    path: '/open-world/invite',
  }),
  robots: { index: false, follow: false },
};

/**
 * Static invite landing. Firebase rewrites /open-world/invite/** here;
 * the client reads ppowg-… from the pathname.
 */
export default function OpenWorldInvitePage() {
  return <OpenWorldInviteClient />;
}
