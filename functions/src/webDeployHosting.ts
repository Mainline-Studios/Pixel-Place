import {
  applyCloudflareDnsRecords,
  ensureWebDeployWildcardCname,
  type DnsRecordInstruction,
} from './webDeployCloudflare';
import {
  registerWebDeployHostingDomain,
  registerWebDeployWildcardDomain,
} from './webDeployFirebaseHosting';
import { uploadPlaceholderSite, WEB_DEPLOY_HOSTING_PREFIX } from './webDeployPlaceholder';

export type WebDeployProvisionResult = {
  storagePath: string;
  hostingStatus: 'placeholder' | 'dns_pending' | 'provisioning';
  dnsRecords: DnsRecordInstruction[];
  dnsApplied: boolean;
  dnsMessage?: string;
  hostingDomainMessage?: string;
  previewUrl: string;
  livePreviewUrl: string;
};

/** Runs automatically on every Web Deploy submit — DNS + Hosting + placeholder HTML. */
export async function provisionWebDeployHosting(
  bucket: Parameters<typeof uploadPlaceholderSite>[0],
  predomain: string,
  projectName: string,
  sourceType: 'git' | 'files' | 'coded' = 'git',
): Promise<WebDeployProvisionResult> {
  const previewUrl = `https://${predomain}.pixelplaceofficial.com`;
  const livePreviewUrl = `https://us-central1-pixel-place-823b1.cloudfunctions.net/api/web-deploy/preview/${predomain}`;

  let storagePath = `${WEB_DEPLOY_HOSTING_PREFIX}/${predomain}/index.html`;
  try {
    storagePath = await uploadPlaceholderSite(bucket, predomain, projectName, sourceType);
  } catch (e) {
    console.error('web-deploy placeholder upload failed (enable Firebase Storage):', e);
  }

  await registerWebDeployWildcardDomain();
  const wildcardDns = await ensureWebDeployWildcardCname();

  const hostingReg = await registerWebDeployHostingDomain(predomain);
  const dns = await applyCloudflareDnsRecords(predomain);

  const messages = [
    hostingReg.ok ? hostingReg.message : hostingReg.message,
    wildcardDns.ok ? wildcardDns.message : wildcardDns.message,
    dns.message,
  ].filter(Boolean);

  const ready = hostingReg.ok && (dns.applied || wildcardDns.ok);

  return {
    storagePath,
    hostingStatus: ready ? 'dns_pending' : 'provisioning',
    dnsRecords: dns.records,
    dnsApplied: dns.applied || wildcardDns.ok,
    dnsMessage: messages.join(' '),
    hostingDomainMessage: hostingReg.message,
    previewUrl,
    livePreviewUrl,
  };
}
