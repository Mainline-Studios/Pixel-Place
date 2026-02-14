import Filter from 'bad-words';
import { ModerationResult } from '@/types';

// Configuration for moderation
export const MODERATION_CONFIG = {
  enableProfanityFilter: true,
  enablePIIDetection: true,
  enableToxicityDetection: true,
  warningsPerMonth: 2, // Number of warnings before auto-ban
  exemptUsernames: ['admin', 'moderator'], // Exempt from moderation
  severityActions: {
    low: 'warn' as const, // warn, block, ban
    medium: 'block' as const,
    high: 'block' as const
  }
};

// Initialize profanity filter
const filter = new Filter();

// Additional offensive words to catch more variations
const additionalBadWords = [
  'f*ck', 'sh*t', 'b*tch', 'a**hole', 'bastard', 'damn', 'hell',
  'idiot', 'stupid', 'dumb', 'retard', 'faggot', 'nigger', 'chink',
  'spic', 'kike', 'rape', 'sex', 'porn', 'nude', 'naked', 'kill yourself',
  'kys', 'suicide', 'die', 'hate', 'loser', 'ugly', 'fat', 'gay'
];
filter.addWords(...additionalBadWords);

// PII Detection Patterns
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  zipCode: /\b\d{5}(-\d{4})?\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  // Address patterns (simplified)
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi
};

// Inappropriate content patterns
const INAPPROPRIATE_PATTERNS = {
  threats: /\b(kill|murder|hurt|attack|bomb|shoot|stab|destroy|beat up)\s+(you|them|him|her)\b/gi,
  harassment: /\b(harass|bully|annoy|stalk|follow)\b/gi,
  hateSpeech: /\b(hate|despise|detest)\s+(you|them|blacks|whites|jews|muslims|christians|gays|women|men)\b/gi,
  sexualContent: /\b(sex|porn|nude|naked|xxx|nsfw|penis|vagina|breast|ass|boob)\b/gi,
  selfHarm: /\b(suicide|kill myself|cut myself|self harm|end it all|kys)\b/gi
};

/**
 * Check if username is exempt from moderation
 */
export function isExemptUser(username: string): boolean {
  const lowerUsername = username.toLowerCase();
  return MODERATION_CONFIG.exemptUsernames.some(exempt => 
    lowerUsername.includes(exempt.toLowerCase())
  );
}

/**
 * Detect profanity in text
 */
function detectProfanity(text: string): { found: boolean; words: string[] } {
  if (!MODERATION_CONFIG.enableProfanityFilter) {
    return { found: false, words: [] };
  }

  const isProfane = filter.isProfane(text);
  if (isProfane) {
    // Extract profane words
    const words = text.split(/\s+/).filter(word => filter.isProfane(word));
    return { found: true, words };
  }

  return { found: false, words: [] };
}

/**
 * Detect PII (Personal Identifiable Information) in text
 */
function detectPII(text: string): { found: boolean; types: string[]; matches: string[] } {
  if (!MODERATION_CONFIG.enablePIIDetection) {
    return { found: false, types: [], matches: [] };
  }

  const detectedTypes: string[] = [];
  const matches: string[] = [];

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const found = text.match(pattern);
    if (found && found.length > 0) {
      detectedTypes.push(type);
      matches.push(...found);
    }
  }

  return {
    found: detectedTypes.length > 0,
    types: detectedTypes,
    matches
  };
}

/**
 * Detect inappropriate content (threats, harassment, etc.)
 */
function detectInappropriateContent(text: string): { found: boolean; types: string[]; severity: 'low' | 'medium' | 'high' } {
  if (!MODERATION_CONFIG.enableToxicityDetection) {
    return { found: false, types: [], severity: 'low' };
  }

  const detectedTypes: string[] = [];
  let highestSeverity: 'low' | 'medium' | 'high' = 'low';

  for (const [type, pattern] of Object.entries(INAPPROPRIATE_PATTERNS)) {
    const found = text.match(pattern);
    if (found && found.length > 0) {
      detectedTypes.push(type);
      
      // Determine severity based on type
      if (type === 'threats' || type === 'selfHarm') {
        highestSeverity = 'high';
      } else if (type === 'hateSpeech' || type === 'sexualContent') {
        if (highestSeverity !== 'high') highestSeverity = 'medium';
      } else {
        if (highestSeverity === 'low') highestSeverity = 'medium';
      }
    }
  }

  return {
    found: detectedTypes.length > 0,
    types: detectedTypes,
    severity: highestSeverity
  };
}

/**
 * Main moderation function - checks message for violations
 */
export async function moderateContent(
  message: string,
  username: string,
  context: string = 'unknown'
): Promise<ModerationResult> {
  // Skip moderation for exempt users (admins, etc.)
  if (isExemptUser(username)) {
    return {
      safe: true,
      severity: null,
      violations: [],
      blocked: false
    };
  }

  // Skip empty messages
  if (!message || !message.trim()) {
    return {
      safe: true,
      severity: null,
      violations: [],
      blocked: false
    };
  }

  const violations: string[] = [];
  let severity: 'low' | 'medium' | 'high' | null = null;
  let blocked = false;

  // Check for profanity
  const profanityCheck = detectProfanity(message);
  if (profanityCheck.found) {
    violations.push('profanity');
    severity = 'low';
  }

  // Check for PII
  const piiCheck = detectPII(message);
  if (piiCheck.found) {
    violations.push('pii');
    violations.push(...piiCheck.types.map(type => `pii:${type}`));
    if (!severity || severity === 'low') severity = 'medium';
  }

  // Check for inappropriate content
  const inappropriateCheck = detectInappropriateContent(message);
  if (inappropriateCheck.found) {
    violations.push('inappropriate');
    violations.push(...inappropriateCheck.types);
    
    // Use the highest severity
    if (inappropriateCheck.severity === 'high') {
      severity = 'high';
    } else if (inappropriateCheck.severity === 'medium' && severity !== 'high') {
      severity = 'medium';
    } else if (!severity) {
      severity = inappropriateCheck.severity;
    }
  }

  // Determine if message should be blocked based on severity
  if (severity) {
    const action = MODERATION_CONFIG.severityActions[severity];
    blocked = action === 'block' || action === 'ban';
  }

  return {
    safe: violations.length === 0,
    severity,
    violations,
    blocked,
    message: violations.length > 0 
      ? `Content violation detected: ${violations.join(', ')}`
      : undefined
  };
}

/**
 * Redact PII from message for admin display
 */
export function redactPII(message: string): string {
  let redacted = message;

  // Redact emails
  redacted = redacted.replace(PII_PATTERNS.email, '[EMAIL_REDACTED]');
  
  // Redact phone numbers
  redacted = redacted.replace(PII_PATTERNS.phone, '[PHONE_REDACTED]');
  
  // Redact SSN
  redacted = redacted.replace(PII_PATTERNS.ssn, '[SSN_REDACTED]');
  
  // Redact credit cards
  redacted = redacted.replace(PII_PATTERNS.creditCard, '[CC_REDACTED]');
  
  // Redact addresses
  redacted = redacted.replace(PII_PATTERNS.address, '[ADDRESS_REDACTED]');

  return redacted;
}
