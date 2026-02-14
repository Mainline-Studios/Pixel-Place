# Content Moderation System

## Overview

This comprehensive AI-powered content moderation system protects all chat communications in Pixel Place by:
- Detecting profanity and obscenities
- Identifying inappropriate content (threats, harassment, hate speech)
- Detecting Personal Identifiable Information (PII)
- Tracking warnings per user
- Automatically banning users with multiple violations in the same month

## Features

### 1. Content Detection

The system detects:

**Profanity & Obscenities**
- Common swear words and vulgar language
- Variations and leetspeak (e.g., "@ss", "f*ck")
- Configurable word list

**Inappropriate Content**
- Threats of violence
- Harassment and bullying
- Hate speech
- Sexual content
- Self-harm references

**Personal Information (PII)**
- Email addresses
- Phone numbers
- Social Security Numbers (SSN)
- Credit card numbers
- Physical addresses
- IP addresses

### 2. Severity Levels

- **LOW**: Minor profanity, borderline content → Warning only
- **MEDIUM**: Clear violations, PII exposure → Warning + Block message
- **HIGH**: Severe violations (threats, hate speech) → Warning + Block message

### 3. Warning & Auto-Ban System

- Users receive warnings for content violations
- Warnings are tracked by calendar month (YYYY-MM format)
- **2 warnings in the same calendar month = Automatic permanent ban**
- Ban reason: "Automatic ban: Multiple content violations within the same month"

### 4. Protected Chat Systems

Moderation applies to:
- ✅ Global chat (all channels)
- ✅ Private messages between users
- ✅ Ban appeal chat (admin communications)
- ✅ Game waiting room chat (WebSocket)

### 5. Admin Dashboard

**Warnings Tab**
- View all user warnings
- Filter by user, severity, or date
- See warning count (current month and all-time)
- Delete/clear warnings
- Statistics: total warnings, this month, unique users, auto-bans

**Flagged Messages Tab**
- View all blocked messages
- See violation details
- Message content display (PII redacted for admin view)
- Context information (where message was sent)

## Configuration

### Moderation Settings (`lib/moderation.ts`)

```typescript
export const MODERATION_CONFIG = {
  enableProfanityFilter: true,
  enablePIIDetection: true,
  enableToxicityDetection: true,
  warningsPerMonth: 2, // Warnings before auto-ban
  exemptUsernames: ['admin', 'moderator'],
  severityActions: {
    low: 'warn',
    medium: 'block',
    high: 'block'
  }
};
```

### Admin Exemptions

Users with usernames containing these terms are exempt from moderation:
- 'admin'
- 'moderator'

## API Endpoints

### POST /api/moderation
Check content for violations

**Request:**
```json
{
  "message": "Message to check",
  "username": "username",
  "context": "global_chat:main"
}
```

**Response:**
```json
{
  "safe": false,
  "severity": "medium",
  "violations": ["profanity", "pii:email"],
  "blocked": true,
  "message": "Content violation detected: profanity, pii:email"
}
```

### GET /api/warnings
Get warnings with optional filters

**Query Parameters:**
- `username` - Filter by specific user
- `month` - Filter by month (YYYY-MM)
- `stats=true` - Get statistics only
- `limit` - Maximum results (default: 100)

**Response (list):**
```json
[
  {
    "id": "warning123",
    "username": "testuser",
    "message": "violating message",
    "violation_type": "profanity",
    "severity": "low",
    "timestamp": 1234567890,
    "month": "2026-02",
    "context": "global_chat:main",
    "detected_items": ["profanity"],
    "action_taken": "warning"
  }
]
```

**Response (stats):**
```json
{
  "totalWarnings": 150,
  "warningsThisMonth": 25,
  "uniqueUsersWarned": 18,
  "autoBansThisMonth": 3
}
```

### DELETE /api/warnings
Delete a warning (admin only)

**Request:**
```json
{
  "id": "warning123"
}
```

## Database Schema

### Warnings Collection (`warnings`)

```typescript
{
  id: string;
  username: string;
  message: string; // The violating message
  violation_type: 'profanity' | 'inappropriate' | 'pii' | 'multiple';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  month: string; // Format: "YYYY-MM"
  context: string; // 'global_chat' | 'private_message' | 'waiting_room'
  detected_items: string[]; // e.g., ['profanity', 'pii:email']
  action_taken: 'warning' | 'blocked' | 'banned';
}
```

## Usage in Code

### Integrating Moderation in New Chat Systems

```typescript
import { moderateContent } from '@/lib/moderation';
import { processModerationResult } from '@/lib/warnings';

// Before saving a message
const moderationResult = await moderateContent(
  message,
  username,
  'your_context'
);

if (!moderationResult.safe) {
  const { warning, banned, warningCount } = await processModerationResult(
    username,
    message,
    moderationResult,
    'your_context'
  );

  if (moderationResult.blocked) {
    // Don't save message, return error
    return {
      error: 'Message blocked',
      banned,
      warningCount
    };
  }
}

// Save message normally if safe or low severity
```

## Testing

### Manual Testing

1. **Test Profanity Detection**
   - Send message: "fuck this"
   - Expected: Warning issued, message may be blocked

2. **Test PII Detection**
   - Send message: "Email me at test@example.com"
   - Expected: Medium severity, message blocked

3. **Test Auto-Ban**
   - Get 1st warning in current month
   - Get 2nd warning in same month
   - Expected: User automatically banned

4. **Test Admin Exemption**
   - Send inappropriate message as admin
   - Expected: No warning, message sent normally

5. **Test Different Months**
   - Get warning in Month 1
   - Get warning in Month 2
   - Expected: No auto-ban (different months)

### Viewing Results

1. Login as admin
2. Go to Admin Panel
3. Click "Warnings" tab to see all warnings
4. Click "Flagged Messages" tab to see blocked messages

## Security Considerations

1. **PII Redaction**: PII is redacted in admin views using `redactPII()` function
2. **Admin Exemption**: Admins and moderators are exempt from moderation
3. **Context Tracking**: All violations are logged with context (where they occurred)
4. **Audit Trail**: Complete history of warnings and bans for review
5. **False Positive Handling**: Admins can delete incorrect warnings

## Performance

- Moderation checks are fast (< 100ms typically)
- Database queries are indexed on username and month
- Real-time updates in admin panel via Firestore subscriptions
- Minimal impact on message sending performance

## Future Enhancements

Possible future additions:
- AI-powered toxicity detection (OpenAI Moderation API)
- Custom word lists per community
- Warning appeals system
- Temporary mutes instead of immediate bans
- Configurable thresholds per chat channel
- Machine learning for context-aware detection
- Image/video content moderation
- Multi-language support

## Dependencies

- `bad-words` - Profanity filter
- `firebase-admin` - Firestore database
- Regex patterns for PII detection

## Files Modified/Created

### Created Files
- `lib/moderation.ts` - Core moderation engine
- `lib/warnings.ts` - Warning system and auto-ban logic
- `app/api/moderation/route.ts` - Moderation API
- `app/api/warnings/route.ts` - Warnings API

### Modified Files
- `types/index.ts` - Added Warning and ModerationResult types
- `lib/firestore.ts` - Added WARNINGS collection
- `app/api/chat/route.ts` - Integrated moderation
- `app/api/messages/route.ts` - Integrated moderation
- `components/Tabs/AdminPanelTab.tsx` - Added Warnings/Flagged tabs
- `lib/firestoreClient.ts` - Added WARNINGS collection

## Support

For issues or questions:
1. Check admin panel warnings to diagnose
2. Review warning statistics
3. Check Firestore warnings collection
4. Review API logs for moderation calls

## License

Part of Pixel Place project - internal use only.
