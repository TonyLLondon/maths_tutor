# Parallel agent batch overlap

**Status:** mitigated (2026-07-23)

Several slugs appeared in multiple batch lists (`batch-ratio.txt`, `batch-remaining.txt`, `batch-final-misc.txt`, etc.). Concurrent agents **double-wrote** `R16`, `S5`, and `S6`; those files were rewritten and re-validated (30 questions, 30 answer ids).

**Rule:** Before launching agents, regenerate a single list from `coverage.json` `missingSlugs` only. Do not re-run completed batch `*.txt` files — spine is **86/86**.
