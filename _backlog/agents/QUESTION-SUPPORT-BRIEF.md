# Question hint + help articles

Every numbered question in every spine topic needs a sibling support file:

`content/tenants/archer/subjects/maths/topics/{domain}/{CODE}.support.json`

## Schema

```json
{
  "version": 1,
  "questions": {
    "1": {
      "hint": "Short nudge in plain English. Must NOT give the final answer.",
      "help": "Markdown mini-lesson (2–6 short paragraphs). Teach the method. Use a **different** worked example where helpful — not the same numbers as the question."
    }
  }
}
```

## Rules

- **Audience:** children ~7–14. No “tier”, “AO”, “GCSE”, “markdown”, file paths.
- **Coverage:** one entry for **every** question id in `{CODE}.md` (continuous 1…n). Read the worksheet; match ids exactly.
- **Hint:** max **220** characters. A single guiding question or first step only.
- **Help:** min **60** characters. Explain *why* and *how*, not just “do the sum”. Bullet lists OK. `$...$` for maths if needed.
- **Do not** copy the model answer from `{CODE}.answers.json` into the hint.
- **Do not** use Python/scripts to bulk-generate identical text. Write each question by hand in context of that stem.
- After your domain’s files exist, run `npm run content:validate` and fix every error mentioning your codes.

## Paths

Worksheets: `content/tenants/archer/subjects/maths/topics/{domain}/{CODE}.md`  
Answers (reference only): `{CODE}.answers.json`  
Output: `{CODE}.support.json` in the same folder.

Spine domains: `number`, `algebra`, `ratio`, `geometry`, `probability`, `statistics`.
