#!/usr/bin/env python3
"""Add tier 1|2|3 to every answer entry from worksheet section headings."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPICS = ROOT / "content/tenants/archer/subjects/maths/topics"


def tier_from_section(section: str) -> int:
    s = section.lower()
    if "fluency" in s or "more fluency" in s:
        return 1
    if "reasoning" in s or "mixed" in s:
        return 2
    return 3


def question_sections(body: str) -> dict[str, int]:
    section = ""
    out: dict[str, int] = {}
    for line in body.split("\n"):
        if line.startswith("---") or line.startswith("*GCSE"):
            break
        if line.startswith("## "):
            section = line[3:].strip()
            continue
        m = re.match(r"^(\d+)\.\s+", line)
        if m:
            out[m[1]] = tier_from_section(section)
    return out


def main() -> None:
    n = 0
    for md in TOPICS.glob("*/*.md"):
        code = md.stem
        aj = md.with_name(f"{code}.answers.json")
        if not aj.is_file():
            continue
        body = md.read_text().split("---", 2)[-1]
        tiers = question_sections(body)
        data = json.loads(aj.read_text())
        answers = data.get("answers", {})
        for qid, entry in answers.items():
            if qid in tiers:
                entry["tier"] = tiers[qid]
                n += 1
        aj.write_text(json.dumps(data, indent=2) + "\n")
    print(f"set tier on {n} entries")


if __name__ == "__main__":
    main()
