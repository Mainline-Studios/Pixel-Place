# Content Moderation System Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER SENDS MESSAGE                            │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Chat API (chat/route.ts or messages/route.ts)           │
│  • Receives message from user                                        │
│  • Validates basic input                                             │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│              MODERATION CHECK (lib/moderation.ts)                    │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ 1. Check if user is exempt (admin/moderator)             │       │
│  │    ├─ YES → Return safe: true                            │       │
│  │    └─ NO  → Continue to checks                           │       │
│  │                                                           │       │
│  │ 2. Profanity Detection (bad-words library)               │       │
│  │    └─ Detects swear words, variations                    │       │
│  │                                                           │       │
│  │ 3. PII Detection (regex patterns)                        │       │
│  │    ├─ Email addresses                                    │       │
│  │    ├─ Phone numbers                                      │       │
│  │    ├─ SSN                                                │       │
│  │    ├─ Credit cards                                       │       │
│  │    └─ Physical addresses                                 │       │
│  │                                                           │       │
│  │ 4. Inappropriate Content Detection (regex patterns)      │       │
│  │    ├─ Threats                                            │       │
│  │    ├─ Harassment                                         │       │
│  │    ├─ Hate speech                                        │       │
│  │    ├─ Sexual content                                     │       │
│  │    └─ Self-harm                                          │       │
│  │                                                           │       │
│  │ 5. Determine Severity Level                              │       │
│  │    ├─ LOW: Minor profanity                               │       │
│  │    ├─ MEDIUM: PII, clear violations                      │       │
│  │    └─ HIGH: Threats, extreme hate speech                 │       │
│  └──────────────────────────────────────────────────────────┘       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MODERATION RESULT                                 │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────┐           ┌────────────────┐
│ safe: true   │           │ safe: false    │
│ No violations│           │ Violations!    │
└──────┬───────┘           └────────┬───────┘
       │                            │
       ▼                            ▼
┌──────────────┐           ┌────────────────────────────────────────┐
│ SAVE MESSAGE │           │  PROCESS VIOLATION (lib/warnings.ts)  │
│              │           │  ┌──────────────────────────────────┐  │
│ ✓ Message OK │           │  │ 1. Create Warning Record         │  │
└──────────────┘           │  │    └─ Store in Firestore         │  │
                           │  │                                   │  │
                           │  │ 2. Get User's Warnings This Month│  │
                           │  │    └─ Query: month = "YYYY-MM"   │  │
                           │  │                                   │  │
                           │  │ 3. Check Warning Count           │  │
                           │  │    ├─ Count < 2 → Issue Warning  │  │
                           │  │    └─ Count >= 2 → AUTO-BAN!     │  │
                           │  └──────────────────────────────────┘  │
                           └────────┬───────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
                    ▼                                ▼
        ┌─────────────────────┐        ┌──────────────────────┐
        │ warningCount < 2    │        │ warningCount >= 2    │
        └──────────┬──────────┘        └──────────┬───────────┘
                   │                              │
                   ▼                              ▼
        ┌─────────────────────┐        ┌──────────────────────┐
        │ Check Severity      │        │ AUTO-BAN USER        │
        ├─────────────────────┤        │ • Create ban record  │
        │ LOW: Allow message  │        │ • Reason: "Auto-ban" │
        │      Show warning   │        │ • Mark warning       │
        │                     │        │ • Block message      │
        │ MEDIUM/HIGH:        │        └──────────────────────┘
        │      Block message  │
        │      Show warning   │
        └─────────────────────┘
```

## Warning Count Logic

```
Month: January 2026 (2026-01)
┌────────────────────────────────────────┐
│ User: alice                            │
│ Warnings this month: 0                 │
└────────────────────────────────────────┘
         │
         │ Violation 1
         ▼
┌────────────────────────────────────────┐
│ User: alice                            │
│ Warnings this month: 1                 │
│ Status: ⚠️ WARNING (1/2)               │
└────────────────────────────────────────┘
         │
         │ Violation 2 (same month)
         ▼
┌────────────────────────────────────────┐
│ User: alice                            │
│ Warnings this month: 2                 │
│ Status: 🚫 BANNED (permanently)        │
└────────────────────────────────────────┘


Month: February 2026 (2026-02)
┌────────────────────────────────────────┐
│ User: bob                              │
│ Warnings this month: 0                 │
│ Warnings last month: 1 (doesn't count) │
└────────────────────────────────────────┘
         │
         │ Violation 1 (new month)
         ▼
┌────────────────────────────────────────┐
│ User: bob                              │
│ Warnings this month: 1                 │
│ Status: ⚠️ WARNING (1/2)               │
│ NOT BANNED (different month)           │
└────────────────────────────────────────┘
```

## Admin Dashboard Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Users] [Bans] [Reports] [Appeals] [Games] [⚠️Warnings] [🚫Flagged] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴──────────────┐
                    │                              │
                    ▼                              ▼
        ┌─────────────────────┐        ┌──────────────────────┐
        │  WARNINGS TAB       │        │  FLAGGED MESSAGES    │
        ├─────────────────────┤        ├──────────────────────┤
        │ • All warnings      │        │ • Only blocked msgs  │
        │ • Current month #   │        │ • High severity      │
        │ • Total count       │        │ • User info          │
        │ • By severity       │        │ • Violation details  │
        │ • Filter by user    │        │ • Delete option      │
        │ • Delete option     │        │                      │
        └─────────────────────┘        └──────────────────────┘
```

## Severity Actions

```
LOW SEVERITY (profanity)
├─ Action: Warn
├─ Message: ✓ Saved
└─ Response: Warning notification

MEDIUM SEVERITY (PII, violations)
├─ Action: Block
├─ Message: ✗ Blocked
└─ Response: Error + warning

HIGH SEVERITY (threats, hate speech)
├─ Action: Block
├─ Message: ✗ Blocked
└─ Response: Error + warning
```

## Database Collections

```
warnings/
├── {warningId1}
│   ├── username: "alice"
│   ├── message: "violating message"
│   ├── violation_type: "profanity"
│   ├── severity: "low"
│   ├── timestamp: 1234567890
│   ├── month: "2026-02"
│   ├── context: "global_chat:main"
│   ├── detected_items: ["profanity"]
│   └── action_taken: "warning"
├── {warningId2}
│   ├── username: "alice"
│   ├── message: "another violation"
│   ├── violation_type: "profanity"
│   ├── severity: "low"
│   ├── timestamp: 1234567900
│   ├── month: "2026-02"
│   ├── context: "private_message"
│   ├── detected_items: ["profanity"]
│   └── action_taken: "banned"
└── ...
```

## API Endpoints

```
POST /api/moderation
├─ Input: { message, username, context }
└─ Output: { safe, severity, violations, blocked, message }

GET /api/warnings
├─ ?username=alice → User's warnings
├─ ?month=2026-02 → Month's warnings
├─ ?stats=true → Statistics
└─ Output: Array of warnings or stats object

DELETE /api/warnings
├─ Input: { id }
└─ Output: { success: true }

POST /api/chat (with moderation)
├─ Input: { username, channel, message }
├─ Moderation: Auto-checked
└─ Output: Success or blocked with warning

POST /api/messages (with moderation)
├─ Input: { fromUsername, toUsername, message }
├─ Moderation: Auto-checked
└─ Output: Success or blocked with warning
```

## Configuration

```javascript
MODERATION_CONFIG = {
  enableProfanityFilter: true,
  enablePIIDetection: true,
  enableToxicityDetection: true,
  warningsPerMonth: 2,  // ← Change this to adjust threshold
  exemptUsernames: ['admin', 'moderator'],
  severityActions: {
    low: 'warn',    // ← Change to 'block' to block all
    medium: 'block',
    high: 'block'
  }
}
```
