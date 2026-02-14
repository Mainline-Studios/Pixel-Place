import { Warning, ModerationResult, Ban } from '@/types';
import { getFirestoreInstance, COLLECTIONS, addDocument, queryDocuments } from './firestore';
import { MODERATION_CONFIG } from './moderation';
import { apiUrl } from './apiBaseUrl';

/**
 * Get the current month string in format YYYY-MM
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Create a warning for a user
 */
export async function createWarning(
  username: string,
  message: string,
  moderationResult: ModerationResult,
  context: string
): Promise<Warning> {
  const warning: Omit<Warning, 'id'> = {
    username,
    message,
    violation_type: determineViolationType(moderationResult.violations),
    severity: moderationResult.severity || 'low',
    timestamp: Date.now(),
    month: getCurrentMonth(),
    context,
    detected_items: moderationResult.violations,
    action_taken: moderationResult.blocked ? 'blocked' : 'warning'
  };

  const db = getFirestoreInstance();
  if (!db) {
    throw new Error('Database not available');
  }

  // Add warning to database
  const docRef = await db.collection(COLLECTIONS.WARNINGS).add(warning);
  
  return {
    id: docRef.id,
    ...warning
  };
}

/**
 * Determine the primary violation type from a list of violations
 */
function determineViolationType(violations: string[]): 'profanity' | 'inappropriate' | 'pii' | 'multiple' {
  if (violations.length === 0) return 'profanity';
  if (violations.length > 1) return 'multiple';
  
  const violation = violations[0];
  if (violation === 'pii' || violation.startsWith('pii:')) return 'pii';
  if (violation === 'inappropriate' || violation === 'threats' || violation === 'hateSpeech' || violation === 'selfHarm') return 'inappropriate';
  return 'profanity';
}

/**
 * Get warnings for a user in a specific month
 */
export async function getWarningsForUserInMonth(
  username: string,
  month?: string
): Promise<Warning[]> {
  const targetMonth = month || getCurrentMonth();
  const usernameLower = username.toLowerCase();

  const db = getFirestoreInstance();
  if (!db) {
    return [];
  }

  const snapshot = await db
    .collection(COLLECTIONS.WARNINGS)
    .where('username', '==', username)
    .where('month', '==', targetMonth)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Warning));
}

/**
 * Get all warnings for a user (all time)
 */
export async function getAllWarningsForUser(username: string): Promise<Warning[]> {
  const db = getFirestoreInstance();
  if (!db) {
    return [];
  }

  const snapshot = await db
    .collection(COLLECTIONS.WARNINGS)
    .where('username', '==', username)
    .orderBy('timestamp', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Warning));
}

/**
 * Check if user should be auto-banned based on warnings this month
 * Returns true if user should be banned
 */
export async function shouldAutoBan(username: string): Promise<boolean> {
  const warningsThisMonth = await getWarningsForUserInMonth(username);
  return warningsThisMonth.length >= MODERATION_CONFIG.warningsPerMonth;
}

/**
 * Auto-ban a user for multiple violations
 */
export async function autoBanUser(username: string, warnings: Warning[]): Promise<boolean> {
  try {
    // Create ban via API
    const response = await fetch(apiUrl('/api/bans'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        bannedBy: 'System (Auto-ban)',
        reason: `Automatic ban: Multiple content violations within the same month (${warnings.length} warnings)`,
        permanent: true,
        timestamp: Date.now()
      } as Ban)
    });

    if (!response.ok) {
      console.error('Failed to create auto-ban:', response.status);
      return false;
    }

    // Update the warning to mark it as resulting in a ban
    const db = getFirestoreInstance();
    if (db && warnings.length > 0) {
      const latestWarning = warnings[warnings.length - 1];
      await db.collection(COLLECTIONS.WARNINGS).doc(latestWarning.id).update({
        action_taken: 'banned'
      });
    }

    return true;
  } catch (error) {
    console.error('Error auto-banning user:', error);
    return false;
  }
}

/**
 * Process moderation result and handle warnings/bans
 * This is the main function called after moderation check
 */
export async function processModerationResult(
  username: string,
  message: string,
  moderationResult: ModerationResult,
  context: string
): Promise<{
  warning: Warning | null;
  banned: boolean;
  warningCount: number;
}> {
  // If content is safe, no action needed
  if (moderationResult.safe) {
    return { warning: null, banned: false, warningCount: 0 };
  }

  // Create warning
  const warning = await createWarning(username, message, moderationResult, context);

  // Check if user should be auto-banned
  const warningsThisMonth = await getWarningsForUserInMonth(username);
  const shouldBan = warningsThisMonth.length >= MODERATION_CONFIG.warningsPerMonth;

  let banned = false;
  if (shouldBan) {
    banned = await autoBanUser(username, warningsThisMonth);
  }

  return {
    warning,
    banned,
    warningCount: warningsThisMonth.length
  };
}

/**
 * Get all warnings (for admin panel)
 */
export async function getAllWarnings(limit: number = 100): Promise<Warning[]> {
  const db = getFirestoreInstance();
  if (!db) {
    return [];
  }

  const snapshot = await db
    .collection(COLLECTIONS.WARNINGS)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Warning));
}

/**
 * Delete a warning (admin action)
 */
export async function deleteWarning(warningId: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return false;
    }

    await db.collection(COLLECTIONS.WARNINGS).doc(warningId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting warning:', error);
    return false;
  }
}

/**
 * Get warning statistics for admin dashboard
 */
export async function getWarningStats(): Promise<{
  totalWarnings: number;
  warningsThisMonth: number;
  uniqueUsersWarned: number;
  autoBansThisMonth: number;
}> {
  const db = getFirestoreInstance();
  if (!db) {
    return {
      totalWarnings: 0,
      warningsThisMonth: 0,
      uniqueUsersWarned: 0,
      autoBansThisMonth: 0
    };
  }

  const currentMonth = getCurrentMonth();

  // Get all warnings
  const allWarnings = await db.collection(COLLECTIONS.WARNINGS).get();
  const totalWarnings = allWarnings.size;

  // Get warnings this month
  const monthWarnings = await db
    .collection(COLLECTIONS.WARNINGS)
    .where('month', '==', currentMonth)
    .get();
  
  const warningsThisMonth = monthWarnings.size;
  
  // Count unique users warned
  const uniqueUsers = new Set(
    monthWarnings.docs.map(doc => doc.data().username)
  );
  const uniqueUsersWarned = uniqueUsers.size;

  // Count auto-bans this month
  const autoBans = monthWarnings.docs.filter(
    doc => doc.data().action_taken === 'banned'
  ).length;

  return {
    totalWarnings,
    warningsThisMonth,
    uniqueUsersWarned,
    autoBansThisMonth: autoBans
  };
}
