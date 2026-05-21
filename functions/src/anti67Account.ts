import type { Express, Request, Response } from 'express';

export const ANTI_67_BASE_REQUIRED_PLAYS = 3;
export const ANTI_67_NO_VOTE_REQUIRED_PLAYS = 1;
export const ANTI_67_SKIP_PENALTY_PLAYS = 3;

export type Anti67BallotVote = 'no' | 'yes';

export type Anti67State = {
  locked: boolean;
  playsCompleted: number;
  requiredPlays: number;
  vote?: Anti67BallotVote;
  allowEarlyDismiss?: boolean;
};

export function parseAnti67FromPreferences(prefs: unknown): Anti67State {
  if (!prefs || typeof prefs !== 'object') {
    return { locked: false, playsCompleted: 0, requiredPlays: ANTI_67_BASE_REQUIRED_PLAYS };
  }
  const raw = (prefs as { anti67?: unknown }).anti67;
  if (!raw || typeof raw !== 'object') {
    return { locked: false, playsCompleted: 0, requiredPlays: ANTI_67_BASE_REQUIRED_PLAYS };
  }
  const locked = (raw as Anti67State).locked === true;
  const vote: Anti67BallotVote = (raw as Anti67State).vote === 'no' ? 'no' : 'yes';
  const allowEarlyDismiss =
    (raw as Anti67State).allowEarlyDismiss === true || vote === 'no';
  const defaultRequired =
    vote === 'no' ? ANTI_67_NO_VOTE_REQUIRED_PLAYS : ANTI_67_BASE_REQUIRED_PLAYS;
  const minRequired =
    vote === 'no' ? ANTI_67_NO_VOTE_REQUIRED_PLAYS : ANTI_67_BASE_REQUIRED_PLAYS;
  const requiredPlays = Math.max(
    minRequired,
    Number((raw as Anti67State).requiredPlays) || defaultRequired,
  );
  const playsCompleted = Math.min(
    requiredPlays,
    Math.max(0, Number((raw as Anti67State).playsCompleted) || 0),
  );
  return { locked, playsCompleted, requiredPlays, vote, allowEarlyDismiss };
}

function preserveBallotFields(current: Anti67State, next: Anti67State): Anti67State {
  return {
    ...next,
    vote: next.vote ?? current.vote,
    allowEarlyDismiss: next.allowEarlyDismiss ?? current.allowEarlyDismiss,
  };
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
      const vote: Anti67BallotVote = (req.body as { vote?: string })?.vote === 'no' ? 'no' : 'yes';
      const anti67: Anti67State = {
        locked: true,
        playsCompleted: 0,
        requiredPlays: vote === 'no' ? ANTI_67_NO_VOTE_REQUIRED_PLAYS : ANTI_67_BASE_REQUIRED_PLAYS,
        vote,
        allowEarlyDismiss: vote === 'no',
      };
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
      if (current.playsCompleted >= current.requiredPlays) {
        return res.json({ success: true, anti67: current });
      }
      const playsCompleted = current.playsCompleted + 1;
      const anti67 = preserveBallotFields(current, {
        locked: true,
        playsCompleted,
        requiredPlays: current.requiredPlays,
      });
      await saveAnti67(loaded.ref, loaded.prefs as Record<string, unknown>, anti67);
      return res.json({ success: true, anti67 });
    } catch (e) {
      console.error('[anti67] play-complete failed:', e);
      return res.status(500).json({ error: 'Failed to record listen' });
    }
  };

  const skipPenaltyHandler = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const loaded = await loadUserPrefs(auth.username);
      if (!loaded) return res.status(404).json({ error: 'User not found' });
      const current = parseAnti67FromPreferences(loaded.prefs);
      if (!current.locked) {
        return res.status(400).json({ error: 'Anti 67 lock is not active' });
      }
      if (current.vote === 'no' || current.allowEarlyDismiss) {
        return res.status(400).json({ error: 'Skip penalty does not apply to this ballot' });
      }
      const anti67 = preserveBallotFields(current, {
        locked: true,
        playsCompleted: current.playsCompleted,
        requiredPlays: current.requiredPlays + ANTI_67_SKIP_PENALTY_PLAYS,
      });
      await saveAnti67(loaded.ref, loaded.prefs as Record<string, unknown>, anti67);
      return res.json({ success: true, anti67, penaltyAdded: ANTI_67_SKIP_PENALTY_PLAYS });
    } catch (e) {
      console.error('[anti67] skip-penalty failed:', e);
      return res.status(500).json({ error: 'Failed to apply skip penalty' });
    }
  };

  const dismissHandler = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const loaded = await loadUserPrefs(auth.username);
      if (!loaded) return res.status(404).json({ error: 'User not found' });
      const current = parseAnti67FromPreferences(loaded.prefs);
      if (
        !current.locked ||
        (!current.allowEarlyDismiss && current.playsCompleted < current.requiredPlays)
      ) {
        return res.status(400).json({ error: 'Finish all required listens before closing' });
      }
      const anti67 = preserveBallotFields(current, {
        locked: false,
        playsCompleted: current.playsCompleted,
        requiredPlays: current.requiredPlays,
      });
      await saveAnti67(loaded.ref, loaded.prefs as Record<string, unknown>, anti67);
      return res.json({ success: true, anti67 });
    } catch (e) {
      console.error('[anti67] dismiss failed:', e);
      return res.status(500).json({ error: 'Failed to dismiss Anti 67' });
    }
  };

  const statusHandler = async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const loaded = await loadUserPrefs(auth.username);
      if (!loaded) return res.status(404).json({ error: 'User not found' });
      const anti67 = parseAnti67FromPreferences(loaded.prefs);
      return res.json({ success: true, anti67 });
    } catch (e) {
      console.error('[anti67] status failed:', e);
      return res.status(500).json({ error: 'Failed to read Anti 67 status' });
    }
  };

  ['/account/anti67/status', '/api/account/anti67/status'].forEach((path) => app.get(path, statusHandler));
  ['/account/anti67/start', '/api/account/anti67/start'].forEach((path) => app.post(path, startHandler));
  ['/account/anti67/play-complete', '/api/account/anti67/play-complete'].forEach((path) =>
    app.post(path, playCompleteHandler),
  );
  ['/account/anti67/skip-penalty', '/api/account/anti67/skip-penalty'].forEach((path) =>
    app.post(path, skipPenaltyHandler),
  );
  ['/account/anti67/dismiss', '/api/account/anti67/dismiss'].forEach((path) => app.post(path, dismissHandler));
}
