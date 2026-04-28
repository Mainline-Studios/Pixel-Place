```markdown
# Ghost in the Dark - Game module

Overview
--------
This module implements the core game logic for "Ghost in the Dark" and can be used on the server or in a single-player authoritative client. It provides role definitions and enforces the mechanics you specified.

Key meeting timing changes
- Discussion/chat phase: 20 seconds (players may discuss).
- Voting phase: 30 seconds (players cast votes or skip).
- Meetings automatically progress: discussion -> voting -> voting end -> tally/ejection (auto end).
- Voting is only accepted during the voting phase. Chat is typically accepted during discussion; resurrected players are prevented from chatting during meetings.

Mechanics enforced
- Players can call meetings ONCE (except President who gets up to 5).
- During meetings there is a two-phase meeting (discussion then voting); players can skip.
- Voting the ghost off makes all other players win.
- If only two players remain (Ghost + 1), the Ghost instantly wins.
- Reporting dead bodies allowed (calls a meeting).
- Roles:
  - Ghost: kills with 30s cooldown. Victim receives a jumpscare event when killed by the Ghost.
  - Angel: revive one person once (cannot revive self). Resurrected cannot chat during meetings.
  - Detective: ask anyone's role (one-time).
  - Haunter: can kill players ONLY WHEN IT IS DEAD. Kill cooldown 60s.
  - Sheriff: can shoot someone; if target is not Ghost, Sheriff dies.
  - Whisperer: talk to the dead and see where people died (access death reports).
  - Spirit: can pass through walls up to 3 times, each use lasts 15s.
  - President: call meetings anywhere and up to 5 meetings per game.
  - Murderer: kill only once per game.
  - Lawyer: force one person once to vote for someone else or to skip voting (only during voting phase).
  - Civilians: default role.

API
---
- Constructor:
  new GhostInTheDarkGame(players: {id,name}[], options?: GameOptions)
- Major methods:
  - callMeeting(callerId, report?) -> starts discussion phase (20s) then voting phase (30s)
  - reportBody(reporterId, victimId, location?)
  - vote(voterId, targetId|null) -> allowed only during voting phase
  - endMeeting() -> manually end and tally (also auto-ends after voting time)
  - attemptKill(killerId, targetId)
  - sheriffShoot(shooterId, targetId)
  - detectiveAsk(detId, targetId) -> returns the target's role (secret)
  - angelRevive(angelId, targetId)
  - spiritPhase(spiritId) -> returns duration & remaining uses
  - lawyerForceVote(lawyerId, targetIdToForce, forcedVoteFor) -> allowed only during voting phase
  - getDeathReports()
  - snapshot(forPlayerId?) -> useful view for clients

Events (callbacks via options):
- onJumpscare(victim, killer)
- onPlayerKilled(victim, killer)
- onPlayerRevived(player, reviver)
- onMeetingCalled(caller, report)
- onMeetingPhaseChanged(phase, startedAt, durationMs)
  - phase is `"discussion"` for chat time (20s) or `"voting"` for voting time (30s)
- onMeetingEnded(result)
- onGameEnd(winner)

Integration tips
----------------
- This module is intentionally authoritative: run it on the server for multiplayer or on a host client to prevent cheating.
- The UI should subscribe to events:
  - onMeetingPhaseChanged -> enable/disable chat UI, show timers for discussion/voting.
  - onJumpscare -> present full-screen jumpscare to the killed player (only when killer role is ghost).
  - onPlayerKilled / getDeathReports -> update map markers and whisperer view.
  - onMeetingCalled -> present meeting UI with options to vote/skip.
- Enforce chat restrictions during meetings; resurrected players will have `isResurrected` true and `canChatDuringMeeting` false.
- Persist cooldowns and role-specific flags in the Player object if you need to save/restore mid-game.

Notes
-----
- Meetings now have two explicit phases: discussion and voting. Voting methods are blocked unless in the voting phase.
- Lawyer force-vote is restricted to voting phase.
- The module emits a meeting phase change event so the UI can show accurate countdowns and enable/disable chat/vote controls.

Next steps
----------
- Hook this Game class into your network layer (socket events) and map UI callbacks to the event handlers.
- Implement ability UIs: detective query button, angel revive button, sheriff shoot UI, spirit wall-pass UI, lawyer force-vote UI, etc.
- Create UI animations/graphics for the jumpscare event.
- Add server-side validation for every action to prevent client-side cheating.

If you'd like, I can push these files to your repository and open a PR (I have the repo as `Mainline-Studios/Pixel-Place`). Tell me whether to:
- create a new branch and PR against `main`, or
- commit directly to `main` (not recommended).
```
