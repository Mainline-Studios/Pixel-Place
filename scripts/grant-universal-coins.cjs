#!/usr/bin/env node
/**
 * One-shot: set every user account to 10,000,000,000 coins and clear founder floors.
 * Usage: node scripts/grant-universal-coins.mjs
 */
const admin = require('firebase-admin');

const GRANT = 10_000_000_000;
const FLAG = 'universal_coin_grant_v1';

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({
      databaseURL: 'https://pixel-place-823b1-default-rtdb.firebaseio.com',
      storageBucket: 'pixel-place-823b1.firebasestorage.app',
    });
  }
  const rtdb = admin.database();
  const fs = admin.firestore();

  let updatedRtdb = 0;
  const rtdbSnap = await rtdb.ref('users').once('value');
  const users = rtdbSnap.val() || {};
  const ids = Object.keys(users);
  console.log(`RTDB users: ${ids.length}`);
  for (const id of ids) {
    const row = users[id] || {};
    await rtdb.ref(`users/${id}`).update({
      coins: GRANT,
      [FLAG]: true,
      founder_lifetime_coins: false,
      founder_celebration_pending: false,
      founder_ordinal: null,
      updated_at: Date.now(),
    });
    updatedRtdb += 1;
    if (updatedRtdb % 50 === 0) console.log(`  RTDB updated ${updatedRtdb}/${ids.length}`);
  }

  let updatedFs = 0;
  const fsSnap = await fs.collection('users').get();
  console.log(`Firestore users: ${fsSnap.size}`);
  for (const doc of fsSnap.docs) {
    await doc.ref.set(
      {
        coins: GRANT,
        [FLAG]: true,
        founder_lifetime_coins: false,
        founder_celebration_pending: false,
        founder_ordinal: null,
        updated_at: Date.now(),
      },
      { merge: true }
    );
    updatedFs += 1;
    if (updatedFs % 50 === 0) console.log(`  Firestore updated ${updatedFs}/${fsSnap.size}`);
  }

  console.log(`Done. RTDB=${updatedRtdb} Firestore=${updatedFs} coins=${GRANT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
