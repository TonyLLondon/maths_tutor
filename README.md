# Maths Tutor

Next.js app for **GCSE-aligned printable worksheets** (tenant **Archer**), markdown in Git, optional **Vercel KV** for web edits.

Repository: [github.com/TonyLLondon/maths_tutor](https://github.com/TonyLLondon/maths_tutor)

## Login

Open `/login` and type **Archer** (case-insensitive). No password or env secrets required.

Optional: connect **Vercel Redis (Upstash)** only if you use in-browser edits (`KV_REST_API_URL` / `KV_REST_API_TOKEN`).

## Local development

```bash
npm install
npm run dev
```

## Content layout

| Path | URL |
|------|-----|
| `content/tenants/archer/topics/number/N4.md` | `/t/archer/worksheets/number/N4` |
| `content/tenants/archer/worksheets/foo.md` | `/t/archer/worksheets/foo` |

Topic catalog: `src/lib/topics/catalog.ts`

## Deploy (Vercel CLI)

```bash
vercel link    # create/link maths_tutor project
vercel --prod
```

Import from GitHub is equivalent. Add Redis integration only for KV edits.

## Workflow

- Author markdown in Git → push → deploy.
- Quick edits on the live site → Save to KV → copy back to Git when happy.
