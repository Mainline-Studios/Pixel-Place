import type * as admin from 'firebase-admin';

export type WebDeploySourceType = 'git' | 'files' | 'coded';

export type WebDeploySiteContext = {
  projectName: string;
  sourceType: WebDeploySourceType;
  status: 'pending' | 'approved' | 'live' | 'rejected' | string;
  appDeployed: boolean;
};

type Collections = {
  WEB_DEPLOY_SITES: string;
  WEB_DEPLOY_REQUESTS: string;
};

function normalizeSourceType(raw: unknown): WebDeploySourceType {
  const s = String(raw ?? '').toLowerCase();
  if (s === 'files') return 'files';
  if (s === 'coded') return 'coded';
  return 'git';
}

export async function fetchWebDeploySiteContext(
  db: admin.firestore.Firestore,
  collections: Collections,
  predomain: string,
): Promise<WebDeploySiteContext | null> {
  const siteSnap = await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).get();
  if (siteSnap.exists) {
    const d = siteSnap.data()!;
    return {
      projectName: String(d.project_name ?? predomain),
      sourceType: normalizeSourceType(d.source_type),
      status: String(d.status ?? 'approved'),
      appDeployed: Boolean(d.app_deployed) || Number(d.deploy_files_count) > 0,
    };
  }

  const reqs = await db
    .collection(collections.WEB_DEPLOY_REQUESTS)
    .where('predomain', '==', predomain)
    .limit(5)
    .get();

  if (reqs.empty) return null;

  const sorted = reqs.docs.sort(
    (a, b) => Number(b.data().created_at ?? 0) - Number(a.data().created_at ?? 0),
  );
  const d = sorted[0].data();
  return {
    projectName: String(d.project_name ?? predomain),
    sourceType: normalizeSourceType(d.source_type),
    status: String(d.status ?? 'pending'),
    appDeployed: Boolean(d.app_deployed) || Number(d.deploy_files_count) > 0,
  };
}
