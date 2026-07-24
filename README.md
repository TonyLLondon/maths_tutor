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
| `mt:tenant:lewis:worksheet:{slug}` | Worksheet markdown overrides |
| `mt:accounts:overrides` | Display-name tweaks |

Local dev without Redis uses `.data/kv-dev.json`.

## Flow

Login → Subjects → Maths → topic → **Practice** (optional full worksheet online)

## Vercel (GitHub)

Repo: [TonyLLondon/maths_tutor](https://github.com/TonyLLondon/maths_tutor). Production (**Lewis tutor**): [lewis-tutor.vercel.app](https://lewis-tutor.vercel.app) (Vercel project `lewis-tutor`, deploys from `main`).

**KV (free Upstash, no marketplace browser flow)** — do **not** run `vercel integration add upstash`; that opens paid Pay-as-you-go provisioning. Instead:

1. Create a **Free** database at [console.upstash.com](https://console.upstash.com) (or reuse an existing free REST database).
2. Set on the Vercel project (Production at minimum):

   ```bash
   vercel env add KV_REST_API_URL production --value 'https://….upstash.io' --yes --sensitive
   vercel env add KV_REST_API_TOKEN production --value '…' --yes --sensitive
   ```

   Or with the Upstash CLI (free tier): `npx @upstash/cli redis create --name lewis-tutor --region eu-west-1`, then `upstash redis get --db-id …` for REST URL/token.

3. Redeploy so env is picked up.

Optional: `LICHESS_EXPLORER_TOKEN` for chess opening names (see `.env.example`). Never commit real tokens.
