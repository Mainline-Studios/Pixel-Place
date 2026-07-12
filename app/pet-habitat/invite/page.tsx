import type { Metadata } from 'next';
import PetHabitatInviteClient from '@/components/Games/PetHabitatInviteClient';
import { buildSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildSiteMetadata({
    title: 'Pet Habitat Invite — Pixel Place',
    description: 'Join a private Pet Habitat with a secret invite link.',
    path: '/pet-habitat/invite',
  }),
  robots: { index: false, follow: false },
};

export default function PetHabitatInvitePage() {
  return <PetHabitatInviteClient />;
}
