# Adaptive practice rating

**Status:** planned

## Goal

Replace fixed **Easier / Medium / Harder** tier tabs with chess-style **per-user, per-topic** skill rating. Each question has its own difficulty rating; practice picks questions near the learner’s current level and updates rating after each attempt.

## Rating scale

- Internal numeric rating (Elo-like), stored and computed in the backend.
- **Anchor:** a **GCSE Hard** question ≈ **2000** on this scale. Easier primary/foundation items sit lower; stretch/problem items may exceed 2000 where content warrants it.
- **Kid UI:** show **Level** (plain number or friendly label derived from rating). Do **not** show “ELO”, “rating”, or chess jargon on primary practice screens.

## Per-user, per-topic state (KV)

- One current rating per `(userId, topicCode)` (e.g. `mt:practice:rating:{userId}:{CODE}` — exact key shape TBD at implementation).
- **History:** append-only log of attempts (question id, outcome, ratings before/after, timestamp) in KV for progress views and debugging — not exposed as raw data to children.
- New topic or first visit: start from a sensible default (e.g. mid-primary band) or infer from age/account if we add that later.

## Question difficulty

- Each practice question carries an individual **question rating** (in `{CODE}.answers.json` or sibling metadata — TBD).
- Initial values can be seeded from worksheet section (Fluency → lower, Problem/Stretch → higher) then tuned; anchor calibration ties “GCSE Hard” items to ~2000.
- **Selection:** weighted or deterministic pick among questions in the topic whose rating is closest to the user’s current level (avoid immediate repeats where possible).

## UI changes

- **Remove** Easier / Medium / Harder tier tabs from Practice.
- Single practice flow: one question at a time, adaptive difficulty, show correct answer after each try (unchanged behaviour).
- Surface **Level** (user’s topic level) where helpful — e.g. header or end-of-session summary — still child-friendly copy.

## Content implications (now vs future)

- **Now:** worksheets remain **28–36** questions per topic; tier sections in markdown still help authoring and seeding question ratings.
- **Future:** grow to **40–50 questions per topic** so adaptive bands have enough items at each difficulty without repetition. Track in coverage/content batches; not blocking first ship of adaptive engine.

## Related

- Answer kinds unchanged: `_backlog/issues/004-practice-answer-kinds.md` (`text` | `self-check` | `bar-chart`).
- Chess opening trainer already uses external explorer ratings; maths practice ratings are **app-owned** in KV, not Lichess.

## Acceptance (when implemented)

- No tier tabs on Practice; adaptive question selection works per topic.
- User topic level visible as **Level** in UI; no ELO jargon for children.
- Ratings and attempt history persist per user in KV (local dev: `.data/kv-dev.json`).
- Question ratings present for all practice ids; validate script checks required fields.
- Smoke path: login → Maths topic → Practice → answer several questions; level moves sensibly after correct/incorrect attempts.
