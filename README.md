# Maths Tutor

Next.js app for **GCSE-aligned maths worksheets** with simple **multi-tenant** auth (tenant **Archer**), **markdown** content in Git, **web edits** stored in **Vercel KV**, and **print-first** layouts.

Repository: [github.com/TonyLLondon/maths_tutor](https://github.com/TonyLLondon/maths_tutor)

## Stack

- Next.js (App Router) on Vercel free tier
- Markdown worksheets in `content/tenants/{tenant}/worksheets/*.md`
- GCSE topic catalog in `src/lib/topics/catalog.ts`
- Per-tenant overrides in KV keys `mt:tenant:{tenant}:worksheet:{slug}`
- Local dev without KV uses `.data/kv-dev.json`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login). Default dev password: `archer-dev` (when `TENANT_ARCHER_PASSWORD` is unset).

## Content (markdown)

Each worksheet file uses YAML frontmatter:

```yaml
---
title: Factors and multiples
topic: N4
domain: number
ao:
  - AO1
  - AO2
week: 1
printNotes: Name · Date · space for working
---

## Fluency (AO1)

1. Your question here.
```

Sections like **Fluency / Reasoning / Problem / Stretch** map to GCSE AO1–AO3 style practice.

## Deploy on Vercel

1. Push this repo to GitHub and import in Vercel.
2. Add **Storage → Redis** (Upstash) from the Vercel marketplace; link to the project (sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`).
3. Environment variables:
   - `AUTH_SECRET` — random string
   - `TENANT_ARCHER_PASSWORD` — Archer login password
4. Deploy.

## Routes

| Path | Purpose |
|------|---------|
| `/login` | Sign in as Archer |
| `/t/archer` | Dashboard |
| `/t/archer/topics` | GCSE topic map |
| `/t/archer/worksheets` | List worksheets |
| `/t/archer/worksheets/{slug}` | Preview |
| `/t/archer/worksheets/{slug}/print` | A4 print / Save as PDF |
| `/t/archer/worksheets/{slug}/edit` | Edit markdown → KV |

## Adding tenants

1. Add an entry in `src/lib/tenants.ts`.
2. Create `content/tenants/{id}/worksheets/`.
3. Set `TENANT_{ID}_PASSWORD` in Vercel.

## Workflow: Git vs KV

- **Git markdown** = canonical, versioned, good for bulk authoring in Cursor.
- **KV save** = quick tweaks from phone/tablet on the deployed app.
- Copy KV edits back into Git when you want them permanent in the repo.
