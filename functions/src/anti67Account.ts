import type { Express, Request, Response } from 'express';

export const ANTI_67_REQUIRED_PLAYS = 3;

export type Anti67State = {
  locked: boolean;
  playsCompleted: number;
};

export function parseAnti67FromPreferences(prefs: unknown): Anti67State {
  if (!prefs || typeof prefs !== 'object') {
    return { locked: false, playsCompleted: 0 };
  }
  const raw = (prefs as { anti67?: unknown }).anti67;
  if (!raw || typeof raw !== 'object') {
    return { locked: false, playsCompleted: 0 };
  }
  const locked = (raw as Anti67State).locked === true;
  const playsCompleted = Math.min(
    ANTI_67_REQUIRED_PLAYS,
    Math.max(0, Number((raw as Anti67State).playsCompleted) || 0),
  );
  return { locked, playsCompleted };
}

type Anti67Deps = {
  db: { collection: (name: string) => { doc: (id: string) => { get: () => Promise<any>; set: (data: unknown, opts?: unknown) => Promise<void> } } };
  usersCollection: string;
  requireAuth: (req: Request, res: Response) => { username: string } | null;
};

export function mountAnti67AccountRoutes(app: Express, deps: Anti67Deps) {
  const { db, usersCollection, requireAuth } = deps;

  const loadUserPrefs = async (username: string) => {
    const id = username.toLowerCase();
    const doc = await db.collection(usersCollection).doc(id).get();
    if (!doc.exists) return null;
    const d = doc.data() || {};
    const prefs = d.account_preferences && typeof d.account_preferences === 'object' ? d.account_preferences : {};
    return { ref: doc.ref, prefs, id };
  };

  const saveAnti67 = async (
    ref: { set: (data: unknown, opts?: unknown) => Promise<void> },
    prefs: Record<string, unknown>,
    anti67: Anti67State,
  ) => {
    await ref.set(
      {
        account_preferences: { ...prefs, anti67 },
        updated_at: Date.now(),
      },
      { merge: true },
    );
  };

  const startHandler = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const loaded = await loadUserPrefs(auth.username);
      if (!loaded) return res.status(404).json({ error: 'User not found' });
      const anti67: Anti67State = { locked: true, playsCompleted: 0 };
      await saveAnti67(loaded.ref, loaded.prefs as Record<string, unknown>, anti67);
      return res.json({ success: true, anti67 });
    } catch (e) {
      console.error('[anti67] start failed:', e);
      return res.status(500).json({ error: 'Failed to start Anti 67 lock' });
    }
  };

  const playCompleteHandler = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const loaded = await loadUserPrefs(auth.username);
      if (!loaded) return res.status(404).json({ error: 'User not found' });
      const current = parseAnti67FromPreferences(loaded.prefs);
      if (!current.locked) {
        return res.status(400).json({ error: 'Anti 67 lock is not active' });
      }
      const playsCompleted = Math.min(ANTI_67_REQUIRED_PLAYS, current.playsCompleted + 1);
      const anti67: Anti67State = { locked: true, playsCompleted };
      await saveAnti67(loaded.ref, loaded.prefs as Record<string, unknown>, anti67);
      return res.json({ success: true, anti67 });
    } catch (e) {
      console.error('[anti67] play-complete failed:', e);
      return res.status(500).json({ error: 'Failed to record listen' });
    }
  };

  const dismissHandler = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const loaded = await loadUserPrefs(auth.username);
      if (!loaded) return res.status(404).json({ error: 'User not found' });
      const current = parseAnti67FromPreferences(loaded.prefs);
      if (!current.locked || current.playsCompleted < ANTI_67_REQUIRED_PLAYS) {
        return res.status(400).json({ error: 'Finish listening 3 times before closing' });
      }
      const anti67: Anti67State = { locked: false, playsCompleted: current.playsCompleted };
      await saveAnti67(loaded.ref, loaded.prefs as Record<string, unknown>, anti67);
      return res.json({ success: true, anti67 });
    } catch (e) {
      console.error('[anti67] dismiss failed:', e);
      return res.status(500).json({ error: 'Failed to dismiss Anti 67' });
    }
  };

  ['/account/anti67/start', '/api/account/anti67/start'].forEach((path) => app.post(path, startHandler));
  ['/account/anti67/play-complete', '/api/account/anti67/play-complete'].forEach((path) =>
    app.post(path, playCompleteHandler),
  );
  ['/account/anti67/dismiss', '/api/account/anti67/dismiss'].forEach((path) => app.post(path, dismissHandler));
}
