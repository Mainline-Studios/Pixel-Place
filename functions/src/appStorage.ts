import * as admin from 'firebase-admin';

/** Default Firebase Storage bucket (must exist — enable Storage in Firebase Console or deploy storage rules). */
export function getAppStorageBucket() {
  const name =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.STORAGE_BUCKET?.trim() ||
    'pixel-place-823b1.firebasestorage.app';
  return admin.storage().bucket(name);
}
