# Pyx AI Content Moderation System - Implementation Guide

## Overview

The Pyx AI Content Moderation System is a neural network-based moderation system integrated into Pixel-Place. It automatically detects and blocks inappropriate content, issues warnings to violators, and implements an auto-ban system.

## Key Features

### 1. Neural Network-Based Scoring
- Scores content from 0.0 (safe) to 1.0 (inappropriate)
- Uses a simple feedforward neural network with:
  - Input layer: 64 neurons (text encoding)
  - Hidden layer: 32 neurons
  - Output layer: 8 neurons
- Learns from examples through backpropagation

### 2. Automatic Warning System
- Issues warnings for inappropriate content (score ≥ 0.7)
- Tracks warnings by calendar month
- Three severity levels:
  - High (score ≥ 0.9)
  - Medium (score ≥ 0.8)
  - Low (score ≥ 0.7)

### 3. Auto-Ban Logic
- **2 warnings within the same calendar month = automatic permanent ban**
- Warnings from different months don't trigger auto-ban
- Ban reason includes all violations from the current month
- Admin accounts are exempt from moderation

### 4. Admin Dashboard
- **Warnings Tab**: View all warnings, filter by user, clear warnings
- **Train AI Tab**: Train the neural network on new examples, view stats

## Technical Architecture

### Core Components

#### 1. PyxBrain (`lib/pyxModeration.ts`)
Neural network engine with:
- `encode(text, size)`: Converts text to numerical vector
- `forward(inputs)`: Forward pass through the network
- `trainStep(inputs, targets)`: Single training iteration with backpropagation
- `predict(inputs)`: Get output for given inputs

#### 2. PyxMemory (`lib/pyxModeration.ts`)
Content storage with ban threshold filtering:
- `add(category, text, score)`: Store content with score
- `isBanned(score)`: Check if score indicates banned content
- `getAllowed(category)`: Get safe content
- `getBanned(category)`: Get inappropriate content

#### 3. PyxModeration (`lib/pyxModeration.ts`)
Main interface:
- `score(text)`: Score text content (0-1)
- `train(text, safe, category, epochs)`: Train on example
- `aiDecide(text, category)`: Make safe/unsafe decision
- `loadModel()`: Load weights from Firestore
- `save()`: Save weights to Firestore

### API Endpoints

#### POST /api/moderation
Score content without issuing warnings:
```json
{
  "text": "message to check",
  "context": "global_chat"
}
```

Response:
```json
{
  "safe": false,
  "score": 0.85,
  "severity": "medium",
  "blocked": true,
  "threshold": 0.7
}
```

#### POST /api/moderation/train (Admin Only)
Train AI on new examples:
```json
{
  "text": "example phrase",
  "safe": true,
  "category": "phrases",
  "username": "admin"
}
```

#### GET /api/warnings?username=X
Get warnings for a user:
```json
{
  "warnings": [...],
  "stats": {
    "totalWarnings": 5,
    "warningsThisMonth": 2,
    "lastWarning": {...}
  }
}
```

#### DELETE /api/warnings?id=X&admin=Y (Admin Only)
Remove a warning

### Database Schema

#### Firestore Collections

**warnings** collection:
```typescript
{
  id: string;                // Username_timestamp
  username: string;
  username_lower: string;    // For case-insensitive queries
  message: string;           // Violating message
  violation_type: string;    // 'inappropriate' | 'profanity' | 'pii'
  severity: string;          // 'low' | 'medium' | 'high'
  score: number;             // Pyx AI score (0-1)
  timestamp: number;
  month: string;             // "YYYY-MM" for monthly tracking
  context: string;           // Where violation occurred
  action_taken: string;      // 'warning' | 'blocked' | 'banned'
}
```

**pyx_training** collection:
```typescript
{
  id: string;                // Category name
  category: string;
  items: Record<string, number>; // text -> score
  updated_at: number;
}
```

**pyx_model** collection:
```typescript
{
  id: 'current',
  weights_w1: number[][];
  weights_w2: number[][];
  biases_b1: number[];
  biases_b2: number[];
  learning_rate: number;
  ban_threshold: number;
  last_trained: number;
}
```

## Integration Points

### Chat Moderation
```typescript
// app/api/chat/route.ts
const modResult = await moderateContent(message, username, 'global_chat');
if (!modResult.safe) {
  return NextResponse.json({ 
    error: 'Message blocked',
    warning: modResult.warning,
    warningsThisMonth: modResult.warningsThisMonth,
    banned: modResult.banned
  }, { status: 403 });
}
```

### Private Messages
```typescript
// app/api/messages/route.ts
const modResult = await moderateContent(message, fromUsername, 'private_message');
```

## Configuration

### Moderation Config (`lib/moderationConfig.ts`)
```typescript
{
  BAN_LINE: 0.7,              // Threshold for inappropriate
  WARNING_THRESHOLD_PER_MONTH: 2,
  SEVERITY_THRESHOLDS: {
    HIGH: 0.9,
    MEDIUM: 0.8,
    LOW: 0.7
  },
  ENABLE_MODERATION: true,
  EXEMPT_USERNAMES: ['admin', ...], // Admins bypass moderation
  NEURAL_NET_CONFIG: {
    INPUT_SIZE: 64,
    HIDDEN_SIZE: 32,
    OUTPUT_SIZE: 8,
    LEARNING_RATE: 0.15
  }
}
```

## Training the AI

### Initial Training
The system is pre-trained with examples from `lib/initialTrainingData.ts`:
- 50+ safe phrases (greetings, gaming terms, positive interactions)
- 50+ inappropriate phrases (profanity, harassment, PII, spam)

### Manual Training (Admin)
1. Go to Admin Panel → Train AI tab
2. Enter text to train on
3. Click "Mark as SAFE" or "Mark as INAPPROPRIATE"
4. AI learns after 5 training epochs

### Continuous Learning
- Model weights automatically saved to Firestore every 10 training examples
- Model persists across server restarts
- Training data stored in `pyx_training` collection

## Warning System Flow

```
User sends message
    ↓
Pyx AI scores message
    ↓
Score < 0.7 → ✅ Message allowed
Score ≥ 0.7 → ⚠️ Warning issued
    ↓
Check warnings this month
    ↓
< 2 warnings → User warned, message blocked
≥ 2 warnings → 🚫 User auto-banned permanently
```

## Auto-Ban Logic

### Trigger Conditions
1. User receives their 2nd warning in the same calendar month
2. Month is determined by "YYYY-MM" format (e.g., "2026-02")
3. Warnings from January don't count toward February's limit

### Ban Details
- **Permanent ban**: No expiration
- **Reason**: "Automatic ban: Multiple content violations within the same month (X warnings in YYYY-MM)"
- **System actor**: 'pyx-moderation-system'
- **Violations logged**: All messages that triggered warnings

### Example Scenarios

**Scenario 1: Auto-ban triggered**
- Jan 15: User gets warning #1 → Allowed
- Jan 28: User gets warning #2 → Auto-banned ❌

**Scenario 2: No auto-ban (different months)**
- Jan 15: User gets warning #1
- Feb 3: User gets warning #1 in Feb → Not banned ✅
- Feb 10: User gets warning #2 in Feb → Auto-banned ❌

## Performance Considerations

### Optimization Strategies
1. **Singleton Instance**: Pyx AI uses singleton pattern to cache model in memory
2. **Message Truncation**: Long messages truncated to 1000 chars
3. **Periodic Saving**: Model saved every 10 training examples (not every time)
4. **Admin Exemption**: Admins bypass moderation entirely

### Benchmarks
- **Scoring time**: ~5-10ms per message (in-memory)
- **Training time**: ~20-30ms per example (5 epochs)
- **Database save**: ~100-200ms (periodic)

## Security Notes

### Current Implementation
- ⚠️ Admin authentication uses username comparison against hardcoded list
- ⚠️ Client provides username in API requests
- ✅ Consistent with existing codebase patterns

### Production Recommendations
1. **Implement JWT/Session Authentication**: Replace username-based auth with proper tokens
2. **Server-side Session Verification**: Validate user identity server-side
3. **Role-based Access Control**: Store admin permissions in database
4. **Rate Limiting**: Add rate limits to training endpoint
5. **Input Validation**: Enhanced validation for all API inputs

## Monitoring & Maintenance

### Admin Dashboard Views

**Warnings Tab**
- Filter warnings by username
- View warning details (message, score, severity, date)
- See monthly warning counts
- Clear warnings (admin override)

**Train AI Tab**
- Check current AI score for text
- Train AI on new examples
- View training log
- See system statistics

### Key Metrics to Monitor
1. **Warning rate**: Warnings issued per day
2. **Auto-ban rate**: Auto-bans per month
3. **False positives**: Incorrectly flagged safe content
4. **False negatives**: Missed inappropriate content
5. **Training frequency**: How often AI is retrained

## Testing

### Manual Testing Checklist
- [ ] Safe messages pass through
- [ ] Inappropriate messages blocked
- [ ] Warning issued on first violation
- [ ] Auto-ban on 2nd violation same month
- [ ] No auto-ban if warnings in different months
- [ ] Admin messages not moderated
- [ ] Training interface works
- [ ] Warnings visible in admin panel
- [ ] Model persists across restarts

### Test Cases
```javascript
// Safe phrases (should pass)
"hello everyone"
"good game"
"thanks for helping"

// Inappropriate (should be blocked)
"stupid idiot"
"you suck"
"shut up loser"

// Gaming context (should pass with training)
"died to lava"
"respawn me please"
"that killed me"
```

## Troubleshooting

### Common Issues

**AI not blocking inappropriate content**
- Solution: Train AI on more examples via Train AI tab
- Check: Verify BAN_LINE threshold in config

**False positives (blocking safe content)**
- Solution: Train AI to recognize safe phrases
- Check: Review initial training data

**Auto-ban not triggering**
- Solution: Verify both warnings are in same month
- Check: Look at warning.month field in database

**Model not persisting**
- Solution: Check Firestore connection
- Check: Verify pyx_model collection exists

## Future Enhancements

### Potential Improvements
1. **Context-aware scoring**: Consider previous messages in thread
2. **Language detection**: Support multiple languages
3. **Image moderation**: Extend to images/files
4. **Appeal system**: Let users appeal false positives
5. **Graduated penalties**: Temporary bans before permanent
6. **Whitelist patterns**: Explicitly allow certain phrases
7. **Real-time dashboard**: Live moderation feed for admins
8. **Analytics**: Detailed moderation statistics and trends

## Support

For issues or questions about the moderation system:
1. Check this documentation
2. Review code comments in `lib/pyxModeration.ts`
3. Test with safe/inappropriate examples
4. Adjust thresholds in `lib/moderationConfig.ts`

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-16  
**Maintainer**: Pyx AI Integration Team
