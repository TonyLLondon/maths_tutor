# Maths Tutor

## Local dev (hot reload)

```bash
npm run dev:4000
```

Next.js **Turbopack** reloads the app when you edit `src/` or `content/` — no manual restart for most changes.

## Sign-in

Allowed users live in **`content/accounts.json`** (commit to add someone). Only those ids/names can sign in; everyone else gets 401.

Optional KV key **`mt:accounts:overrides`** can patch `displayName` per user on production (does not add new users).

## KV (production + local)

| Key pattern | Purpose |
|-------------|---------|
| `mt:user:{id}:progress:maths:{domain}/{code}` | Per-person practice scores |
| `mt:tenant:archer:worksheet:{slug}` | Worksheet markdown overrides |
| `mt:accounts:overrides` | Display-name tweaks |

Local dev without Redis uses `.data/kv-dev.json`.

## Flow

Login → Subjects → Maths → topic → **Practice** / Print

## Vercel (GitHub)

Repo: [TonyLLondon/maths_tutor](https://github.com/TonyLLondon/maths_tutor). Production: **maths-tutor** on Vercel (deploys from `main` when Git is connected).

1. Link **Upstash Redis** or Vercel KV to the project so `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set (practice progress and worksheet overrides need this in production).
2. Optional: `LICHESS_EXPLORER_TOKEN` for chess opening names (see `.env.example`).

Copy env names from `.env.example`; never commit real tokens.
