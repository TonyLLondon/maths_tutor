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

1. **Login** — display name must match an entry in `content/accounts.json`.
2. **Subjects → Maths → topic → Go** — one question at a time; level updates after every answer.
3. **Subjects → Chess** — opening trainer (`src/components/chess/`). Opening data via `/api/chess/explorer` (server proxies Lichess; set `LICHESS_EXPLORER_TOKEN` in `.env.local` / Vercel env — never commit the token).
4. **Progress** — stored per user id in the backend (KV in production, `.data/kv-dev.json` locally). The UI should say “saved” or show a score, not where it is stored.

## Content layout

- **Coverage spine:** `src/lib/topics/spine.json` (86 Edexcel 1MA1 Foundation codes).
- Per tenant under `content/tenants/{tenantId}/`:
  - Worksheets: `subjects/maths/topics/{domain}/{CODE}.md`
  - Practice grading: sibling `{CODE}.answers.json`
  - Hint + help: sibling `{CODE}.support.json` (`hint` one line, `help` markdown mini-lesson per question id)
  - Optional **Start here** list: `starter-topics.json` (`domain`, `code`, child-friendly `label`)
- Accounts (all tenants): `content/accounts.json`
- After worksheet or answer edits, run `npm run content:validate` (defaults to tenant `archer`; override with `CONTENT_TENANT`).

## Practice

Adaptive **Level** per user per topic (chess-style rating in KV, attempt history). **Starting level 500** on a new topic. Show **Your level** only — **never** “x / y mastered” or permanent “answered” counts; the same questions can appear again at the same level. **Every submitted answer** updates level (K=28); show the change (+/−) after each question. Each topic should have **200** rated questions (500–2000) for a deep adaptive pool.

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

## When editing

- Match existing worksheet tone and section patterns in peer topics.
- Keep question ids continuous **1…200** per topic; answers and support JSON must match every id; satisfy `npm run content:validate` (**200** questions, ratings 500–2000, hint + help each). Expansion brief: `_backlog/agents/TOPIC-200-EXPANSION-BRIEF.md`.
- Keep diffs small; no drive-by refactors.
- Do not add TODO comments — ship complete behaviour.
