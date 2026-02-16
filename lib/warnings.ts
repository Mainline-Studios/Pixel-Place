/**
 * Warning System for Pyx AI Content Moderation
 * 
 * Tracks user warnings and implements auto-ban logic:
 * - 2 warnings within the same calendar month = automatic permanent ban
 */

import { Warning } from '@/types';
import { getFirestoreInstance } from './firestore';
import { banUser } from './storage';

/**
 * Issue a warning to a user for inappropriate content
 */
export async function issueWarning(
  username: string,
  message: string,
  score: number,
  context: 'global_chat' | 'private_message' | 'waiting_room' | 'appeal_chat'
): Promise<Warning> {
  const db = getFirestoreInstance();
  if (!db) {
    throw new Error('Database not available');
  }
  
  const now = Date.now();
  const month = new Date(now).toISOString().substring(0, 7); // "YYYY-MM"
  
  // Determine severity based on score
  let severity: 'low' | 'medium' | 'high';
  if (score >= 0.9) {
    severity = 'high';
  } else if (score >= 0.8) {
    severity = 'medium';
  } else {
    severity = 'low';
  }
  
  // Determine violation type based on score and content
  let violation_type: 'inappropriate' | 'profanity' | 'pii';
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('@') || lowerMessage.includes('phone') || lowerMessage.match(/\d{3}-\d{3}-\d{4}/)) {
    violation_type = 'pii';
  } else if (score >= 0.85) {
    violation_type = 'profanity';
  } else {
    violation_type = 'inappropriate';
  }
  
  const warning: Warning = {
    id: `${username}_${now}`,
    username,
    username_lower: username.toLowerCase(),
    message: message.substring(0, 500), // Limit message length
    violation_type,
    severity,
    score,
    timestamp: now,
    month,
    context,
    action_taken: 'warning'
  };
  
  // Store warning in database
  await db.collection('warnings').doc(warning.id).set(warning);
  
  console.log(`Warning issued: ${username} (score: ${score.toFixed(3)}, month: ${month})`);
  
  return warning;
}

/**
 * Get all warnings for a user in the current month
 */
export async function getWarningsThisMonth(username: string): Promise<Warning[]> {
  const db = getFirestoreInstance();
  if (!db) {
    return [];
  }
  
  const currentMonth = new Date().toISOString().substring(0, 7);
  const username_lower = username.toLowerCase();
  
  try {
    const snapshot = await db.collection('warnings')
      .where('username_lower', '==', username_lower)
      .where('month', '==', currentMonth)
      .orderBy('timestamp', 'desc')
      .get();
    
    const warnings: Warning[] = [];
    snapshot.forEach(doc => {
      warnings.push(doc.data() as Warning);
    });
    
    return warnings;
  } catch (error) {
    console.error('Error fetching warnings for month:', error);
    return [];
  }
}

/**
 * Get all warnings for a user (any time period)
 */
export async function getUserWarnings(username: string, limit: number = 50): Promise<Warning[]> {
  const db = getFirestoreInstance();
  if (!db) {
    return [];
  }
  
  const username_lower = username.toLowerCase();
  
  try {
    const snapshot = await db.collection('warnings')
      .where('username_lower', '==', username_lower)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const warnings: Warning[] = [];
    snapshot.forEach(doc => {
      warnings.push(doc.data() as Warning);
    });
    
    return warnings;
  } catch (error) {
    console.error('Error fetching user warnings:', error);
    return [];
  }
}

/**
 * Get all warnings across all users (admin only)
 */
export async function getAllWarnings(limit: number = 100): Promise<Warning[]> {
  const db = getFirestoreInstance();
  if (!db) {
    return [];
  }
  
  try {
    const snapshot = await db.collection('warnings')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const warnings: Warning[] = [];
    snapshot.forEach(doc => {
      warnings.push(doc.data() as Warning);
    });
    
    return warnings;
  } catch (error) {
    console.error('Error fetching all warnings:', error);
    return [];
  }
}

/**
 * Check if user should be auto-banned
 * Returns true if user has 2+ warnings this month
 */
export async function checkAutoban(username: string): Promise<boolean> {
  const warnings = await getWarningsThisMonth(username);
  return warnings.length >= 2; // 2 or more warnings this month
}

/**
 * Ban a user automatically due to multiple warnings
 */
export async function banUserAutomatically(username: string, triggeringWarning: Warning): Promise<void> {
  const warnings = await getWarningsThisMonth(username);
  
  const banReason = `Automatic ban: Multiple content violations within the same month (${warnings.length} warnings in ${triggeringWarning.month})`;
  
  // Collect violation details
  const violations = warnings.map(w => ({
    message: w.message,
    score: w.score,
    timestamp: w.timestamp,
    context: w.context,
    severity: w.severity
  }));
  
  // Ban the user permanently
  await banUser(
    username,
    'pyx-moderation-system',
    banReason,
    true, // permanent
    undefined // no days (permanent)
  );
  
  // Update the triggering warning to mark as 'banned'
  const db = getFirestoreInstance();
  if (db) {
    await db.collection('warnings').doc(triggeringWarning.id).update({
      action_taken: 'banned'
    });
  }
  
  console.log(`AUTO-BAN: ${username} - ${warnings.length} warnings in ${triggeringWarning.month}`);
  console.log('Violations:', violations);
}

/**
 * Remove/clear a warning (admin only)
 */
export async function removeWarning(warningId: string): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) {
    throw new Error('Database not available');
  }
  
  await db.collection('warnings').doc(warningId).delete();
  console.log(`Warning removed: ${warningId}`);
}

/**
 * Get warning count statistics for a user
 */
export async function getWarningStats(username: string): Promise<{
  totalWarnings: number;
  warningsThisMonth: number;
  lastWarning?: Warning;
}> {
  const [allWarnings, monthWarnings] = await Promise.all([
    getUserWarnings(username, 1),
    getWarningsThisMonth(username)
  ]);
  
  return {
    totalWarnings: allWarnings.length > 0 ? allWarnings.length : 0,
    warningsThisMonth: monthWarnings.length,
    lastWarning: allWarnings[0]
  };
}
