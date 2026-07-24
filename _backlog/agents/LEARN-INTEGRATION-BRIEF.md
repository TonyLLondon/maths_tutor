# Learn integration — support + meta pass

Wire **practice Help** to **topic guides** and **glossary**. Platform now validates and renders `mtlearn:` links.

Read `_backlog/agents/LEARN-BRIEF.md` for guide tone (do not rewrite guides unless a broken link).

## Files per topic `{CODE}`

| File | Action |
|------|--------|
| `{CODE}.support.json` | Rewrite **every** question `help` (ids 1…200) |
| `{CODE}.learn.json` | **Create** (one per topic in your scope) |

Path: `content/tenants/lewis/subjects/maths/topics/{domain}/`

## `{CODE}.learn.json`

```json
{
  "version": 1,
  "glossaryTerms": ["mean", "median"]
}
```

- **3–8 slugs** from the fixed glossary list in LEARN-BRIEF (terms that matter for this topic).
- Every slug must have `learn/glossary/{slug}.md`.

## Help article rules (every question id)

1. **First line** (required exact pattern once per help):

   `**Topic guide:** [Learn this topic](mtlearn:{domain}/{CODE})`

   Example geometry G15: `(mtlearn:geometry/G15)`

2. **Steps** — 2–5 numbered steps for **this question only**. Plain English. No exam jargon.

3. **Optional word links** — when a step uses a hard word, link: `[mean](mtlearn:word/mean)` (only slugs that exist in glossary).

4. **Remove** the filler phrase `Picture what is happening` everywhere.

5. **Do not** paste the full topic guide or glossary definition into help.

6. **Length** — max **1400** characters per help; min **60**.

7. **Hints** — keep or lightly improve; max **220** chars; still must not give the final answer.

8. **Grading** — do **not** change `answers.json`.

## Example help (shape only)

```markdown
**Topic guide:** [Learn this topic](mtlearn:statistics/S4)

1. Add all the numbers in the table.
2. Count how many values there are.
3. Divide the total by the count to find the [mean](mtlearn:word/mean).
```

## Finish line

`CONTENT_TENANT=lewis npm run content:validate` — **zero errors** for every `{domain}/{CODE}` in your scope.

Report per-code ✅ and confirm every id 1…200 has updated help + `learn.json` exists.

## Execution (mandatory — do not be lazy)

Complete **100%** of codes in your scope in one run. No partial tables. No scripts. Hand-edit JSON in context of each worksheet question stem.

Model: **composer-2.5-fast** only.
