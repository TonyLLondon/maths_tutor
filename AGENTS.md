<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Maths tutor — agent guide

## Audience: children first

Archer (9) and Sloan use this app to **learn maths**, not to operate infrastructure.

**In the UI (pages, buttons, labels, errors, empty states):**

- Use plain English a child can read: “Your score”, “Try again”, “Well done”, “Print worksheet”.
- **Never** show: KV, Redis, Vercel, Git, markdown, YAML, tenant, API, `.json` paths, “repo”, “commit”, GCSE spec jargon on primary screens.
- Parent-only edit flows (worksheet editor) may say “Save changes” / “Reset to original” — still no KV/Git.

**In code, README, and this file:** technical terms are fine.

## Product shape

1. **Login** — name must match an entry in `content/accounts.json` (commit to add users).
2. **Subjects → Maths → topic** — worksheet, print, **Practice** (one question at a time, show correct answer after each try).
3. **Subjects → Chess** — opening trainer (`src/components/chess/`). Opening data via `/api/chess/explorer` (server proxies Lichess; set `LICHESS_EXPLORER_TOKEN` in `.env.local` / Vercel env — never commit the token).
4. **Progress** — stored per user id in the backend (KV in production, `.data/kv-dev.json` locally). The UI should say “saved” or show a score, not where it is stored.

## Content

- **Coverage spine:** `src/lib/topics/spine.json` (86 Edexcel 1MA1 Foundation codes; mirror in `_backlog/state/` for agents). Track progress in `_backlog/state/coverage.json` (regenerate via `_backlog/scripts/update-coverage.py`).
- Questions: `content/tenants/archer/subjects/maths/topics/{domain}/{CODE}.md`
- Answers (for practice grading): sibling `{CODE}.answers.json` (not shown to children on print view)
- Accounts: `content/accounts.json`

## Practice (adaptive level)

**Adaptive rating** per user per topic (chess-style, stored in KV with attempt history): each question has its own difficulty; practice picks by proximity to the learner’s level and updates after each try. **GCSE Hard** questions anchor at **2000** on the internal scale. **Kid UI** shows **Level** — not “ELO” or rating jargon. Tier tabs (**Easier / Medium / Harder**) are removed from Practice. Answer `kind`: `text` | `self-check` | `bar-chart`. See `_backlog/issues/005-adaptive-practice-rating.md` and `_backlog/issues/004-practice-answer-kinds.md`.

Run `npm run content:validate` after editing worksheets.

## Local dev

```bash
npm run dev:4000
```

Turbopack hot-reloads `src/` and `content/` changes.

## Deploy / KV (agents)

- **Never** `vercel integration add upstash/upstash-kv` — Vercel marketplace defaults to **paid** Pay-as-you-go and opens a browser checkout.
- **Do** set `KV_REST_API_URL` + `KV_REST_API_TOKEN` on the Vercel project (`vercel env add … --sensitive`) from a **Free** Upstash database (`npx @upstash/cli redis create …` or console.upstash.com), then redeploy.
- App keys are prefixed `mt:` so one free Redis can serve multiple family apps if needed.

## Smoke test with MCPBundles browser (prod hub)

Use the **mcpbundles** CLI with **`--as mcpbundles_prod`**. Discovery workflow is documented in `.skills/mcpbundles-cli/SKILL.md`.

1. Start the app locally on port 4000 (`npm run dev:4000`).
2. Open the login page in the managed browser:

```bash
mcpbundles call browser-navigate-d4c --server browser --as mcpbundles_prod -- \
  url="http://localhost:4000/login"
```

3. Walk the happy path (sign in as Archer or Sloan → Subjects → Maths → a topic → Practice). On Practice, confirm **Level** (no tier tabs), try **5 today**, and submit one typed answer. Use snapshot/click/type tools on the `browser` server as needed (`mcpbundles tools --server browser --as mcpbundles_prod`).
4. For print layout, navigate to a topic’s print URL and optionally `browser` screenshot tools.

Do not tell the user to “verify in the browser themselves” — run this smoke path when changing auth, navigation, or practice flow.

## When editing

- Match existing tone on worksheet markdown (Fluency / Reasoning / Problem / Stretch).
- Target **28–36 numbered questions** per topic (continuous `1.` … `n.`) with a matching `{CODE}.answers.json` entry for every id.
- Keep diffs small; no drive-by refactors.
- Do not add TODO comments — ship complete behaviour.
