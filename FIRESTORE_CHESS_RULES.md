# Firestore rules for Chess multiplayer

Chess uses Firestore for real-time multiplayer on pixelplaceofficial.com. Add these rules (inside your existing `match /databases/{database}/documents` block, or use the full rules below):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chess_matchmaking/{doc} {
      allow read, write: if true;
    }
    match /chess_games/{doc} {
      allow read, write: if true;
    }
  }
}
```

The Chess collections are:
- `chess_matchmaking` – matchmaking queue
- `chess_games` – active games (doc ID = room code)

**Index required:** If you get an index error, create a composite index for `chess_matchmaking` on `createdAt` (ascending).
