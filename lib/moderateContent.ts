/**
 * Core Content Moderation Function
 * 
 * Integrates Pyx AI scoring with warning system and auto-ban logic
 */

import { ModerationResult } from '@/types';
import { getPyxInstance } from './pyxModeration';
import { issueWarning, getWarningsThisMonth, checkAutoban, banUserAutomatically } from './warnings';
import { MODERATION_CONFIG } from './moderationConfig';

/**
 * Moderate content using Pyx AI and warning system
 * 
 * @param message The message content to check
 * @param username The username of the person sending the message
 * @param context Where the message is being sent (global_chat, private_message, etc.)
 * @returns ModerationResult with decision and any warnings/bans issued
 */
export async function moderateContent(
  message: string,
  username: string,
  context: 'global_chat' | 'private_message' | 'waiting_room' | 'appeal_chat'
): Promise<ModerationResult> {
  // Check if moderation is enabled
  if (!MODERATION_CONFIG.ENABLE_MODERATION) {
    return { safe: true, score: 0, severity: null, blocked: false };
  }
  
  // Check if user is exempt (admin/moderator)
  if (MODERATION_CONFIG.EXEMPT_USERNAMES.includes(username.toLowerCase())) {
    return { safe: true, score: 0, severity: null, blocked: false };
  }
  
  // Check for empty or system messages
  if (!message || message.trim().length === 0) {
    return { safe: true, score: 0, severity: null, blocked: false };
  }
  
  // Truncate very long messages (performance consideration)
  const messageToCheck = message.length > 1000 ? message.substring(0, 1000) : message;
  
  try {
    // Get Pyx AI instance and score the message
    const pyx = await getPyxInstance();
    const score = pyx.score(messageToCheck);
    
    // If score is below ban threshold, message is safe
    if (score < MODERATION_CONFIG.BAN_LINE) {
      return { safe: true, score, severity: null, blocked: false };
    }
    
    // Message is inappropriate - determine severity
    let severity: 'low' | 'medium' | 'high';
    if (score >= MODERATION_CONFIG.SEVERITY_THRESHOLDS.HIGH) {
      severity = 'high';
    } else if (score >= MODERATION_CONFIG.SEVERITY_THRESHOLDS.MEDIUM) {
      severity = 'medium';
    } else {
      severity = 'low';
    }
    
    // Issue warning
    const warning = await issueWarning(username, message, score, context);
    
    // Check if user should be auto-banned (2+ warnings this month)
    const shouldBan = await checkAutoban(username);
    
    if (shouldBan) {
      // Auto-ban the user
      await banUserAutomatically(username, warning);
      
      return {
        safe: false,
        score,
        severity,
        blocked: true,
        warning,
        banned: true,
        warningsThisMonth: 2 // They have at least 2 if auto-banned
      };
    }
    
    // Not banned yet - get warning count for this month
    const warningsThisMonth = await getWarningsThisMonth(username);
    
    return {
      safe: false,
      score,
      severity,
      blocked: true,
      warning,
      warningsThisMonth: warningsThisMonth.length
    };
    
  } catch (error) {
    console.error('Error during content moderation:', error);
    // Fail open (allow message) on error to prevent blocking legitimate messages
    return { safe: true, score: 0, severity: null, blocked: false };
  }
}

/**
 * Quick check if a message would be flagged (without issuing warnings)
 * Useful for pre-validation or testing
 */
export async function checkContent(message: string): Promise<{
  safe: boolean;
  score: number;
  severity: 'low' | 'medium' | 'high' | null;
}> {
  if (!message || message.trim().length === 0) {
    return { safe: true, score: 0, severity: null };
  }
  
  try {
    const pyx = await getPyxInstance();
    const score = pyx.score(message);
    
    if (score < MODERATION_CONFIG.BAN_LINE) {
      return { safe: true, score, severity: null };
    }
    
    let severity: 'low' | 'medium' | 'high';
    if (score >= MODERATION_CONFIG.SEVERITY_THRESHOLDS.HIGH) {
      severity = 'high';
    } else if (score >= MODERATION_CONFIG.SEVERITY_THRESHOLDS.MEDIUM) {
      severity = 'medium';
    } else {
      severity = 'low';
    }
    
    return { safe: false, score, severity };
  } catch (error) {
    console.error('Error checking content:', error);
    return { safe: true, score: 0, severity: null };
  }
}
