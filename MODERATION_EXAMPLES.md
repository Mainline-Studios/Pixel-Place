/**
 * Content Moderation System - Example Usage and Testing
 * 
 * This file demonstrates how the moderation system works and provides
 * examples of test cases for various violation types.
 */

// ============================================================================
// EXAMPLE 1: Testing Profanity Detection
// ============================================================================

/**
 * POST /api/moderation
 * Request body:
 * {
 *   "message": "this is damn stupid",
 *   "username": "testuser",
 *   "context": "global_chat:main"
 * }
 * 
 * Expected Response:
 * {
 *   "safe": false,
 *   "severity": "low",
 *   "violations": ["profanity"],
 *   "blocked": false,
 *   "message": "Content violation detected: profanity"
 * }
 */

// ============================================================================
// EXAMPLE 2: Testing PII Detection - Email
// ============================================================================

/**
 * POST /api/moderation
 * Request body:
 * {
 *   "message": "Contact me at john.doe@example.com",
 *   "username": "testuser",
 *   "context": "private_message"
 * }
 * 
 * Expected Response:
 * {
 *   "safe": false,
 *   "severity": "medium",
 *   "violations": ["pii", "pii:email"],
 *   "blocked": true,
 *   "message": "Content violation detected: pii, pii:email"
 * }
 */

// ============================================================================
// EXAMPLE 3: Testing PII Detection - Phone Number
// ============================================================================

/**
 * POST /api/moderation
 * Request body:
 * {
 *   "message": "Call me at 555-123-4567",
 *   "username": "testuser",
 *   "context": "global_chat:main"
 * }
 * 
 * Expected Response:
 * {
 *   "safe": false,
 *   "severity": "medium",
 *   "violations": ["pii", "pii:phone"],
 *   "blocked": true,
 *   "message": "Content violation detected: pii, pii:phone"
 * }
 */

// ============================================================================
// EXAMPLE 4: Testing Inappropriate Content - Threats
// ============================================================================

/**
 * POST /api/moderation
 * Request body:
 * {
 *   "message": "I will kill you",
 *   "username": "testuser",
 *   "context": "global_chat:main"
 * }
 * 
 * Expected Response:
 * {
 *   "safe": false,
 *   "severity": "high",
 *   "violations": ["inappropriate", "threats"],
 *   "blocked": true,
 *   "message": "Content violation detected: inappropriate, threats"
 * }
 */

// ============================================================================
// EXAMPLE 5: Testing Admin Exemption
// ============================================================================

/**
 * POST /api/moderation
 * Request body:
 * {
 *   "message": "this damn message should be allowed",
 *   "username": "admin",
 *   "context": "global_chat:main"
 * }
 * 
 * Expected Response:
 * {
 *   "safe": true,
 *   "severity": null,
 *   "violations": [],
 *   "blocked": false
 * }
 */

// ============================================================================
// EXAMPLE 6: Testing Warning System
// ============================================================================

/**
 * Step 1: User sends first violating message in February 2026
 * POST /api/chat
 * Request body:
 * {
 *   "username": "violator1",
 *   "channel": "main",
 *   "message": "this is stupid",
 *   "type": "text"
 * }
 * 
 * Expected Response (403):
 * {
 *   "error": "Message blocked due to content violation",
 *   "violations": ["profanity"],
 *   "severity": "low",
 *   "warning": { ...warning object... },
 *   "banned": false,
 *   "warningCount": 1,
 *   "message": "Warning 1/2: Content violation detected: profanity. 1 more warning(s) this month will result in a permanent ban."
 * }
 * 
 * Step 2: Same user sends second violating message in February 2026
 * POST /api/chat
 * Request body:
 * {
 *   "username": "violator1",
 *   "channel": "main",
 *   "message": "you are so dumb",
 *   "type": "text"
 * }
 * 
 * Expected Response (403):
 * {
 *   "error": "Message blocked due to content violation",
 *   "violations": ["profanity"],
 *   "severity": "low",
 *   "warning": { ...warning object... },
 *   "banned": true,
 *   "warningCount": 2,
 *   "message": "You have been automatically banned for multiple violations this month."
 * }
 * 
 * Step 3: Check warnings for user
 * GET /api/warnings?username=violator1&month=2026-02
 * 
 * Expected Response:
 * [
 *   {
 *     "id": "warning1",
 *     "username": "violator1",
 *     "message": "this is stupid",
 *     "violation_type": "profanity",
 *     "severity": "low",
 *     "timestamp": 1234567890,
 *     "month": "2026-02",
 *     "context": "global_chat:main",
 *     "detected_items": ["profanity"],
 *     "action_taken": "warning"
 *   },
 *   {
 *     "id": "warning2",
 *     "username": "violator1",
 *     "message": "you are so dumb",
 *     "violation_type": "profanity",
 *     "severity": "low",
 *     "timestamp": 1234567900,
 *     "month": "2026-02",
 *     "context": "global_chat:main",
 *     "detected_items": ["profanity"],
 *     "action_taken": "banned"
 *   }
 * ]
 */

// ============================================================================
// EXAMPLE 7: Testing Different Months (No Auto-Ban)
// ============================================================================

/**
 * User gets warning in January 2026, then warning in February 2026
 * Should NOT trigger auto-ban (different months)
 * 
 * Step 1: Warning in January
 * (Set system date to January 2026)
 * POST /api/chat with violating message
 * Result: Warning 1/2 for January
 * 
 * Step 2: Warning in February
 * (Set system date to February 2026)
 * POST /api/chat with violating message
 * Result: Warning 1/2 for February (no ban)
 * 
 * The user now has:
 * - 1 warning in January (month: "2026-01")
 * - 1 warning in February (month: "2026-02")
 * - Total: 2 warnings, but NOT banned (different months)
 */

// ============================================================================
// EXAMPLE 8: Getting Warning Statistics
// ============================================================================

/**
 * GET /api/warnings?stats=true
 * 
 * Expected Response:
 * {
 *   "totalWarnings": 150,
 *   "warningsThisMonth": 25,
 *   "uniqueUsersWarned": 18,
 *   "autoBansThisMonth": 3
 * }
 */

// ============================================================================
// EXAMPLE 9: Admin Dashboard - View All Warnings
// ============================================================================

/**
 * 1. Login as admin
 * 2. Navigate to Admin Panel
 * 3. Click "Warnings" tab
 * 
 * You will see:
 * - List of all warnings
 * - Filter by username/violation type
 * - Warning count for current month
 * - Total warnings count
 * - Each warning shows:
 *   - Username
 *   - Severity level (color-coded)
 *   - Violation type
 *   - Context (where it happened)
 *   - Timestamp
 *   - Message content
 *   - Detected violations
 * - "Delete" button for each warning
 */

// ============================================================================
// EXAMPLE 10: Admin Dashboard - View Flagged Messages
// ============================================================================

/**
 * 1. Login as admin
 * 2. Navigate to Admin Panel
 * 3. Click "Flagged Messages" tab
 * 
 * You will see:
 * - Only messages that were blocked (not sent)
 * - Message content
 * - Username who tried to send it
 * - Severity and violations
 * - Context
 * - Timestamp
 * - "Delete" button to remove from records
 */

// ============================================================================
// EXAMPLE 11: Safe Message (No Violation)
// ============================================================================

/**
 * POST /api/moderation
 * Request body:
 * {
 *   "message": "Hello everyone! How are you doing today?",
 *   "username": "testuser",
 *   "context": "global_chat:main"
 * }
 * 
 * Expected Response:
 * {
 *   "safe": true,
 *   "severity": null,
 *   "violations": [],
 *   "blocked": false
 * }
 * 
 * This message will be sent normally with no warnings.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * The moderation system can be configured in lib/moderation.ts:
 * 
 * export const MODERATION_CONFIG = {
 *   enableProfanityFilter: true,      // Enable/disable profanity detection
 *   enablePIIDetection: true,          // Enable/disable PII detection
 *   enableToxicityDetection: true,    // Enable/disable inappropriate content detection
 *   warningsPerMonth: 2,               // Number of warnings before auto-ban
 *   exemptUsernames: ['admin', 'moderator'], // Users exempt from moderation
 *   severityActions: {
 *     low: 'warn',     // Low severity: warn only (message sent)
 *     medium: 'block',  // Medium severity: block message
 *     high: 'block'     // High severity: block message
 *   }
 * };
 */

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Manual Testing Checklist:
 * 
 * ✓ 1. Test profanity detection
 *    - Send message with profanity
 *    - Verify warning is created
 *    - Check admin panel shows warning
 * 
 * ✓ 2. Test PII detection (Email)
 *    - Send message with email address
 *    - Verify message is blocked
 *    - Check admin panel shows flagged message
 * 
 * ✓ 3. Test PII detection (Phone)
 *    - Send message with phone number
 *    - Verify message is blocked
 * 
 * ✓ 4. Test inappropriate content (Threats)
 *    - Send threatening message
 *    - Verify high severity
 *    - Verify message is blocked
 * 
 * ✓ 5. Test admin exemption
 *    - Login as admin
 *    - Send message with violations
 *    - Verify message is sent (no warning)
 * 
 * ✓ 6. Test auto-ban (2 warnings same month)
 *    - Create new user
 *    - Send 1st violating message → Warning 1/2
 *    - Send 2nd violating message → Auto-banned
 *    - Verify user is banned in bans list
 * 
 * ✓ 7. Test different months (no auto-ban)
 *    - User with 1 warning in previous month
 *    - Send violating message in current month
 *    - Verify no auto-ban (different months)
 * 
 * ✓ 8. Test warning statistics
 *    - Check admin panel shows correct counts
 *    - Verify warnings this month
 *    - Verify auto-ban count
 * 
 * ✓ 9. Test deleting warnings
 *    - Click delete on a warning
 *    - Verify it's removed from list
 * 
 * ✓ 10. Test safe messages
 *    - Send normal messages
 *    - Verify no warnings
 *    - Messages sent successfully
 */

console.log('Content Moderation System Examples Loaded');
console.log('See MODERATION_SYSTEM.md for full documentation');
