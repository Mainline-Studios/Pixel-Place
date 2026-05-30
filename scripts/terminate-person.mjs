#!/usr/bin/env node
/**
 * Permanently terminate a person on Pixel Place:
 * - Find users by search terms (username, display name, email, role)
 * - Delete user + linked web deploy accounts
 * - Hardware-ban all linked device profiles (closure)
 * - Account bans with ban_kind=terminated + fiery message
 *
 * Usage:
 *   node scripts/terminate-person.mjs --search "oliver" --subject "Oliver L" [--dry-run]
 *
 * Requires Application Default Credentials or FIREBASE_SERVICE_ACCOUNT.
 */
import { randomUUID } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const TERMINATED_BAN_KIND = 'terminated';
const TERMINATED_FIRE_MESSAGE = `YOU ARE FIRED.

Your access to Pixel Place is permanently revoked. Every browser and device profile linked to your accounts has been burned from our systems.

You will never see Pixel Place again. There is no appeal. There is no back door. There is no second chance.

Turn off the screen and walk away.`;

const COLLECTIONS = {
  USERS: 'users',
  BANS: 'bans',
  USER_DEVICES: 'user_devices',
  DEVICE_USERS: 'device_users',
  HARDWARE_BANS: 'hardware_bans',
  WEB_DEPLOY_ACCOUNTS: 'web_deploy_accounts',
  BAN_APPEALS: 'ban_appeals',
};

function parseArgs(argv) {
  const out = { search: [], subject: '', dryRun: false, bannedBy: 'admin' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--search' && argv[i + 1]) out.search.push(argv[++i].toLowerCase());
    else if (a === '--subject' && argv[i + 1]) out.subject = argv[++i];
    else if (a === '--by' && argv[i + 1]) out.bannedBy = argv[++i];
  }
  return out;
}

function ensureApp() {
  if (getApps().length) return;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'pixel-place-823b1';
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      projectId,
    });
  } else {
    initializeApp({ projectId });
  }
}

function sanitizeDeviceId(raw) {
  const s = String(raw || '')
    .slice(0, 128)
    .replace(/[^a-zA-Z0-9_-]/g, '');
  return s.length >= 8 ? s : '';
}

async function collectLinkedHardwareNetwork(db, rootDeviceId) {
  const root = sanitizeDeviceId(rootDeviceId);
  const deviceIds = new Set();
  const usernames = new Set();
  if (!root) return { deviceIds: [], usernames: [] };
  deviceIds.add(root);
  for (let round = 0; round < 32; round++) {
    const dCount = deviceIds.size;
    const uCount = usernames.size;
    for (const d of [...deviceIds]) {
      const snap = await db.collection(COLLECTIONS.DEVICE_USERS).doc(d).get();
      const list = Array.isArray(snap.data()?.usernames) ? snap.data().usernames : [];
      for (const u of list) {
        const ul = String(u).toLowerCase().trim();
        if (ul) usernames.add(ul);
      }
    }
    for (const u of [...usernames]) {
      const snap = await db.collection(COLLECTIONS.USER_DEVICES).doc(u).get();
      const devs = Array.isArray(snap.data()?.devices) ? snap.data().devices : [];
      for (const row of devs) {
        const did = sanitizeDeviceId(String(row?.deviceId || ''));
        if (did) deviceIds.add(did);
      }
    }
    if (deviceIds.size === dCount && usernames.size === uCount) break;
  }
  return { deviceIds: [...deviceIds], usernames: [...usernames] };
}

function matchesUser(doc, terms) {
  const d = doc.data() || {};
  const id = doc.id.toLowerCase();
  const username = String(d.username || '').toLowerCase();
  const email = String(d.email || '').toLowerCase();
  const role = String(d.role || '').toLowerCase();
  const gender = String(d.gender || '').toLowerCase();
  const hay = [id, username, email, role, gender].join(' ');
  return terms.every((t) => hay.includes(t));
}

async function findUsers(db, terms) {
  const snap = await db.collection(COLLECTIONS.USERS).get();
  return snap.docs.filter((doc) => matchesUser(doc, terms));
}

async function deleteWebDeployForUser(db, userData, dryRun) {
  const email = String(userData.email || '').toLowerCase().trim();
  const uid = String(userData.firebase_uid || userData.firebaseUid || '').trim();
  const snap = await db.collection(COLLECTIONS.WEB_DEPLOY_ACCOUNTS).get();
  const toDelete = snap.docs.filter((d) => {
    const x = d.data() || {};
    const e = String(x.email || '').toLowerCase();
    const u = String(x.uid || x.firebase_uid || '').trim();
    return (email && e === email) || (uid && u === uid);
  });
  if (!dryRun) {
    let batch = db.batch();
    let n = 0;
    for (const d of toDelete) {
      batch.delete(d.ref);
      n++;
      if (n >= 400) {
        await batch.commit();
        batch = db.batch();
        n = 0;
      }
    }
    if (n) await batch.commit();
  }
  return toDelete.map((d) => d.id);
}

async function hardwareBanNetwork(db, seedDeviceIds, usernames, opts) {
  const { bannedBy, terminatedSubject, dryRun } = opts;
  const allDeviceIds = new Set();
  const allUsernames = new Set(usernames.map((u) => u.toLowerCase()));

  for (const seed of seedDeviceIds) {
    const { deviceIds, usernames: linked } = await collectLinkedHardwareNetwork(db, seed);
    deviceIds.forEach((id) => allDeviceIds.add(id));
    linked.forEach((u) => allUsernames.add(u));
  }

  const deviceIds = [...allDeviceIds];
  const linkedUsernames = [...allUsernames];
  if (!deviceIds.length && !linkedUsernames.length) {
    return { deviceIds: [], linkedUsernames: [], groupId: null };
  }

  const groupId = randomUUID();
  const now = Date.now();
  const reasonText = TERMINATED_FIRE_MESSAGE;

  if (dryRun) {
    return { deviceIds, linkedUsernames, groupId };
  }

  let batch = db.batch();
  let n = 0;
  const flush = async () => {
    if (!n) return;
    await batch.commit();
    batch = db.batch();
    n = 0;
  };

  const root = deviceIds[0] || '';
  for (const devId of deviceIds) {
    batch.set(
      db.collection(COLLECTIONS.HARDWARE_BANS).doc(devId),
      {
        deviceId: devId,
        banned_at: now,
        banned_by: bannedBy,
        reason: reasonText,
        ban_kind: TERMINATED_BAN_KIND,
        terminated_subject: terminatedSubject,
        linked_usernames: linkedUsernames,
        group_id: groupId,
        root_device_id: root,
        created_at: now,
      },
      { merge: false },
    );
    n++;
    if (n >= 400) await flush();
  }
  await flush();

  for (const un of linkedUsernames) {
    await db
      .collection(COLLECTIONS.BANS)
      .doc(un)
      .set({
        username: un,
        username_lower: un,
        reason: reasonText,
        banned_by: bannedBy,
        banned_at: now,
        expires_at: null,
        permanent: true,
        ban_kind: TERMINATED_BAN_KIND,
        terminated_subject: terminatedSubject,
        hardware_ban_group_id: groupId,
        hardware_ban_device_ids: deviceIds,
        created_at: now,
      });
  }

  return { deviceIds, linkedUsernames, groupId };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.search.length) {
    console.error('Provide at least one --search term (e.g. --search oliver --search "l")');
    process.exit(1);
  }
  const terminatedSubject = args.subject || args.search.join(' ');

  ensureApp();
  const db = getFirestore();

  const users = await findUsers(db, args.search);
  console.log(`Matched ${users.length} user(s) for search [${args.search.join(', ')}]:`);
  for (const doc of users) {
    const d = doc.data();
    console.log(`  - ${doc.id} role=${d.role || 'user'} email=${d.email || '(none)'}`);
  }

  if (!users.length) {
    console.log('No users matched. Exiting without changes.');
    process.exit(0);
  }

  const seedDeviceIds = new Set();
  const usernames = new Set();

  for (const doc of users) {
    usernames.add(doc.id);
    const ud = await db.collection(COLLECTIONS.USER_DEVICES).doc(doc.id).get();
    const devs = Array.isArray(ud.data()?.devices) ? ud.data().devices : [];
    for (const row of devs) {
      const did = sanitizeDeviceId(row?.deviceId);
      if (did) seedDeviceIds.add(did);
    }
  }

  if (args.dryRun) {
    console.log('\n[DRY RUN] Would delete users:', [...usernames]);
    console.log('[DRY RUN] Seed device ids:', [...seedDeviceIds]);
    const preview = await hardwareBanNetwork(db, [...seedDeviceIds], [...usernames], {
      bannedBy: args.bannedBy,
      terminatedSubject,
      dryRun: true,
    });
    console.log('[DRY RUN] Would hardware-ban devices:', preview.deviceIds.length);
    console.log('[DRY RUN] Linked usernames in ban wave:', preview.linkedUsernames);
    process.exit(0);
  }

  for (const doc of users) {
    const wd = await deleteWebDeployForUser(db, doc.data(), false);
    if (wd.length) console.log(`Deleted web_deploy_accounts for ${doc.id}:`, wd);
    await doc.ref.delete();
    console.log(`Deleted user: ${doc.id}`);
  }

  const banResult = await hardwareBanNetwork(db, [...seedDeviceIds], [...usernames], {
    bannedBy: args.bannedBy,
    terminatedSubject,
    dryRun: false,
  });

  console.log('\nTermination complete.');
  console.log('Hardware-banned device profiles:', banResult.deviceIds.length);
  console.log('Banned / linked usernames:', banResult.linkedUsernames.join(', ') || '(none)');
  console.log('Group id:', banResult.groupId);
  console.log('Terminated subject on screen:', terminatedSubject);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
