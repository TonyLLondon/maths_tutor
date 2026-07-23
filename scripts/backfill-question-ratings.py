#!/usr/bin/env python3
"""Set rating on each answer from tier (1200 / 1600 / 2000 + spread)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOPICS = ROOT / "content/tenants/archer/subjects/maths/topics"
GCSE_HARD = 2000
TIER_BASE = {1: 1200, 2: 1600, 3: GCSE_HARD}


def rating_for(tier: int, qid: str) -> int:
    base = TIER_BASE.get(tier, 1600)
    n = int(qid) if qid.isdigit() else 1
    spread = ((n % 9) - 4) * 12
    return max(900, min(2080, base + spread))


def main() -> None:
    count = 0
    for path in sorted(TOPICS.glob("*/*.answers.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        answers = data.get("answers", {})
        changed = False
        for qid, entry in answers.items():
            if entry.get("rating") is not None:
                continue
            tier = entry.get("tier", 2)
            entry["rating"] = rating_for(int(tier), str(qid))
            changed = True
            count += 1
        if changed:
            path.write_text(
                json.dumps(data, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
    print(f"Set rating on {count} answers")


if __name__ == "__main__":
    main()
