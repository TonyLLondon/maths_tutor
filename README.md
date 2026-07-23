# Maths Tutor

Login → **Subjects** → **Maths** → **Topic** → worksheet / print / **practice**.

Repository: [github.com/TonyLLondon/maths_tutor](https://github.com/TonyLLondon/maths_tutor)

## Login

Type **Archer** at `/login` (no password).

## Content layout

| Path | Purpose |
|------|---------|
| `content/tenants/archer/subjects/maths/topics/{domain}/{CODE}.md` | Questions (print + practice) |
| `…/{CODE}.answers.json` | Answer key for practice grading |
| `content/tenants/archer/worksheets/` | Legacy flat worksheets |

## Practice mode

- `/t/archer/subjects/maths/number/N4/practice` — one question at a time
- Right/wrong feedback; **correct answer always shown** after each attempt
- Progress stored in KV: `mt:tenant:archer:progress:maths:number/N4`

Local dev without Redis uses `.data/kv-dev.json`.

## Is maths “complete”?

The app tracks **17 GCSE seed topics** (age 9 → Foundation), not the full GCSE specification. The Maths subject page shows worksheet ✓ / answers ✓ per topic. Expand `src/lib/topics/catalog.ts` when you add new strands.

## Deploy

```bash
vercel --prod
```

Optional: Vercel Redis for KV (practice progress + worksheet edits).
