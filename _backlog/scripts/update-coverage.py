#!/usr/bin/env python3
"""Regenerate _backlog/state/coverage.json from spine + content tree."""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPINE = ROOT / "_backlog/state/gcse-foundation-spine.json"
CONTENT = ROOT / "content/tenants/archer/subjects/maths/topics"
OUT = ROOT / "_backlog/state/coverage.json"


def main() -> None:
    spine = json.loads(SPINE.read_text())
    rows = []
    for t in spine["topics"]:
        domain, code = t["domain"], t["code"]
        md = CONTENT / domain / f"{code}.md"
        aj = CONTENT / domain / f"{code}.answers.json"
        q = 0
        if md.is_file():
            body = md.read_text().split("---", 2)[-1]
            q = len(re.findall(r"^(\d+)\.", body, re.M))
        rows.append(
            {
                "code": code,
                "domain": domain,
                "slug": f"{domain}/{code}",
                "hasWorksheet": md.is_file(),
                "hasAnswers": aj.is_file(),
                "questionCount": q,
            }
        )
    missing = [r["slug"] for r in rows if not r["hasWorksheet"]]
    partial = [
        r["slug"]
        for r in rows
        if r["hasWorksheet"] and r["questionCount"] < 30
    ]
    state = {
        "updatedAt": date.today().isoformat(),
        "totalSpine": len(rows),
        "withWorksheet": sum(1 for r in rows if r["hasWorksheet"]),
        "missingCount": len(missing),
        "missingSlugs": missing,
        "partialUnder30": partial,
        "topics": rows,
    }
    OUT.write_text(json.dumps(state, indent=2) + "\n")
    print(
        f"worksheets {state['withWorksheet']}/{state['totalSpine']} "
        f"missing {state['missingCount']} partial {len(partial)}"
    )


if __name__ == "__main__":
    main()
