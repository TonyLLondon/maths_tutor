<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Maths tutor — agent guide

## Audience: children first

Kids use this app to **learn maths**, not to operate infrastructure.

**In the UI (pages, buttons, labels, errors, empty states):**

- Use plain English a child can read: “Your score”, “Try again”, “Well done”, “Next question”.
- **Never** show: KV, Redis, Vercel, Git, markdown, YAML, tenant, API, `.json` paths, “repo”, “commit”, GCSE spec jargon on primary screens.
- Parent-only edit flows (worksheet editor) may say “Save changes” / “Reset to original” — still no KV/Git.

**In code, README, and this file:** technical terms are fine.

## Product shape

1. **Login** — display name must match an entry in `content/accounts.json`. Parent accounts (`parentOf`: child user ids) can practice like anyone else and see linked children’s progress under **`/t/{tenant}/family`** (pick Maths or Chess).
2. **Subjects → Maths → area → topic → Go** — one question at a time; level updates after every answer. Maths **areas** are the six GCSE domains (Number, Algebra, …).
3. **Subjects → Chess** — opening trainer (`src/components/chess/`). Opening data via `/api/chess/explorer` (server proxies Lichess; set `LICHESS_EXPLORER_TOKEN` in `.env.local` / Vercel env — never commit the token).
4. **Progress** — stored per user id in the backend (KV in production, `.data/kv-dev.json` locally). The UI should say “saved” or show a score, not where it is stored.

## Content layout

- **Coverage spine:** `src/lib/topics/spine.json` (86 Edexcel 1MA1 Foundation codes).
- Per tenant under `content/tenants/{tenantId}/` (household slug, e.g. `lewis` — not a child’s name):
  - Worksheets: `subjects/maths/topics/{domain}/{CODE}.md`
  - Practice grading: sibling `{CODE}.answers.json`
  - Hint + help: sibling `{CODE}.support.json` (`hint` one line, `help` markdown mini-lesson per question id)
  - Optional read-only diagrams: sibling `{CODE}.figures.json` (`version: 1`, `figures` map question id → spec — see `_backlog/agents/FIGURES-BRIEF.md`)
  - Optional learn links: sibling `{CODE}.learn.json` (`glossaryTerms` slugs); topic guides under `subjects/maths/learn/` — see `_backlog/agents/LEARN-BRIEF.md` and `LEARN-INTEGRATION-BRIEF.md`
  - Optional **Start here** list: `starter-topics.json` (`domain`, `code`, child-friendly `label`)
- Accounts (all tenants): `content/accounts.json`
- After worksheet or answer edits, run `npm run content:validate` (defaults to tenant `lewis`; override with `CONTENT_TENANT`).

### Content authoring — no pipeline scripts

**Never** add or run scripts (Python, Node, shell) to generate, merge, bulk-assign ratings, or patch worksheets, `{CODE}.answers.json`, or `{CODE}.support.json`. That includes “merge expansion”, “generate drafts”, chunk JSON under `_backlog/`, and one-off backfill tools.

**Do:** edit those files directly in the repo — write every question, answer, hint, and help by hand in context.

**Allowed scripts under `scripts/`:** `validate-content.ts`, `reset-user-maths-progress.ts`, and rare one-time migrators already in tree — not new content factories.

## Practice

Adaptive **Level** per user per topic (chess-style rating in KV, attempt history). **Starting level 500** on a new topic. Show **Your level** only — **never** “x / y mastered” or permanent “answered” counts; the same questions can appear again at the same level. **Every submitted answer** updates level (K=28); show the change (+/−) after each question. Each topic should have **200** rated questions (500–2000) for a deep adaptive pool. **Question pick:** only ids whose rating is within **`ADAPTIVE_RATING_WINDOW` (110)** of the learner’s level, widening slightly if the band is empty — never serve stretch items many hundreds of points above level. **Ratings** must sit in the band for the worksheet section (`ratingRangeForSection` in `questions.ts`; enforced by `content:validate`). **Grading:** typed answers only; **`contains`** keyword checks for reasoning; no self-check or empty-accept pass-through.

## Local dev

Run the app on **port 4000** (project default for local work and browser smoke):

```bash
npm run dev:4000
```

Base URL: `http://localhost:4000`. Turbopack hot-reloads `src/` and `content/` changes.

### Browser smoke (MCPBundles)

When changing auth, navigation, or practice UX, run the dev server above, then drive the **managed browser** via the mcpbundles CLI with **`--as mcpbundles_prod`**. Tool discovery and argument shapes: `.skills/mcpbundles-cli/SKILL.md`.

```bash
mcpbundles call browser-navigate-d4c --server browser --as mcpbundles_prod -- \
  url="http://localhost:4000/login"
```

Use snapshot / click / type tools on the `browser` server (`mcpbundles tools --server browser --as mcpbundles_prod`) to sign in and walk Subjects → Maths → Practice. Do not ask the user to smoke-test in their own browser when you can run this path.

## Deploy / KV

- **Never** `vercel integration add upstash/upstash-kv` — marketplace flow defaults to paid checkout.
- Set `KV_REST_API_URL` + `KV_REST_API_TOKEN` on the Vercel project from a free Upstash Redis, then redeploy. App keys use the `mt:` prefix.

## Background agents (`Task` / subagents)

Tony’s default for **bulk content passes** dispatched in the background:

- **Model:** **`composer-2.5-fast` only.** Do not use Sol, Opus, GPT, or other models for these unless Tony explicitly overrides in chat.
- **Anti-lazy:** Every dispatch prompt must include an **Execution (mandatory)** block that requires completing **100% of the listed scope in one run** — no “done N6, pending N7–N16” handoffs, no stopping after one file when several are in scope, no deferring to a follow-up agent.
- **Scope:** Name exact `{domain}/{CODE}` lists and id ranges (e.g. support ids **1–44** only). Tenant path: `content/tenants/lewis/...`.
- **Finish line:** Run `CONTENT_TENANT=lewis npm run content:validate` (or a scoped grep for known boilerplate in the edited files) before reporting success.

Copy-paste block for dispatch prompts:

```text
## Execution (mandatory — do not be lazy)
Complete every code and id range listed above in this single run. Partial completion or “pending” tables are failure.
Edit support/answers/md by hand in repo context. No scripts. Before you finish: validate (or grep boilerplate in scope) and report per-code ✅ for the full list.
```

## When editing

- Match existing worksheet tone and section patterns in peer topics.
- Keep question ids continuous **1…200** per topic; answers and support JSON must match every id; satisfy `npm run content:validate` (**200** questions, ratings 500–2000, hint + help each). Expansion brief: `_backlog/agents/TOPIC-200-EXPANSION-BRIEF.md`.
- Keep diffs small; no drive-by refactors.
- Do not add TODO comments — ship complete behaviour.
