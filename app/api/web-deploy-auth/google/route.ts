export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';
import { signWebDeployToken } from '@/lib/webDeployAuthServer';
import type { WebDeploySession } from '@/lib/webDeployAuth';

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
      projectId: 'pixel-place-823b1',
    });
  } else {
    initializeApp({ projectId: 'pixel-place-823b1' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID token required' }, { status: 400 });
    }
    const decoded = await getAuth().verifyIdToken(String(idToken));
    const deployUid = decoded.uid;
    const email = String(decoded.email ?? '')
      .trim()
      .toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Google account must have an email address' }, { status: 400 });
    }
    const displayName = String(decoded.name || email.split('@')[0] || 'Deploy user').trim();
    const photoURL = String(decoded.picture || '').trim() || undefined;
    const now = Date.now();

    const existing = await getDocument(COLLECTIONS.WEB_DEPLOY_ACCOUNTS, deployUid);
    await setDocument(COLLECTIONS.WEB_DEPLOY_ACCOUNTS, deployUid, {
      deploy_uid: deployUid,
      email,
      display_name: displayName,
      photo_url: photoURL || null,
      last_login_at: now,
      updated_at: now,
      ...(existing ? {} : { created_at: now }),
    });

    const session: WebDeploySession = { deployUid, email, displayName, photoURL };
    const token = signWebDeployToken(session);
    return NextResponse.json({ success: true, token, session });
  } catch (e) {
    console.error('web-deploy-auth/google:', e);
    return NextResponse.json({ error: 'Google sign-in failed' }, { status: 401 });
  }
}
