import type { Metadata } from 'next';
import WebDeployServicesClient from '@/components/WebDeployServicesClient';
import { buildSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildSiteMetadata({
    title: 'Web Deploy Services',
    description: 'Request hosting on a pixelplaceofficial.com subdomain (moderator approval required).',
    path: '/web-deploy',
  }),
  robots: { index: false, follow: false },
};

export default function WebDeployPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #1a1d2e 0%, #0f1118 50%, #16192a 100%)',
      }}
    >
      <WebDeployServicesClient />
    </div>
  );
}
