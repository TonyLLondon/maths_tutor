#!/usr/bin/env python3
"""
Assign integer rating 500–2000 to every answer from worksheet section + order.
Overwrites existing rating. Syncs tier from section for legacy fields.

Run: python3 scripts/assign-question-ratings.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPICS = ROOT / "content/tenants/archer/subjects/maths/topics"

MIN_RATING = 500
MAX_RATING = 2000  # GCSE hard anchor

# (section keyword, tier, band lo, band hi) — first match wins
SECTION_RULES: list[tuple[str, int, int, int]] = [
    ("getting started", 1, 500, 780),
    ("fluency (ao1)", 1, 760, 1050),
    ("fluency", 1, 760, 1050),
    ("more fluency", 1, 980, 1220),
    ("reasoning", 2, 1180, 1480),
    ("more practice", 2, 1240, 1620),
    ("mixed", 2, 1420, 1680),
    ("problem", 3, 1620, 1920),
    ("stretch", 3, 1860, MAX_RATING),
]


def tier_from_section(section: str) -> tuple[int, int, int]:
    s = section.lower()
    for key, tier, lo, hi in SECTION_RULES:
        if key in s:
            return tier, lo, hi
    return 3, 1500, MAX_RATING


def parse_worksheet(body: str) -> list[tuple[str, str]]:
    """Return [(question_id, section_heading), ...] in worksheet order."""
    section = ""
    out: list[tuple[str, str]] = []
    for line in body.split("\n"):
        if line.startswith("---") or line.startswith("*GCSE"):
            break
        if line.startswith("## "):
            section = line[3:].strip()
            continue
        m = re.match(r"^(\d+)\.\s+", line)
        if m:
            out.append((m[1], section))
    return out


def spread_in_band(index: int, count: int, lo: int, hi: int) -> int:
    if count <= 1:
        return (lo + hi) // 2
    t = index / (count - 1)
    return round(lo + t * (hi - lo))


def assign_ratings(ordered: list[tuple[str, str]]) -> dict[str, dict[str, int]]:
    """question_id -> {rating, tier}"""
    # group consecutive ids by section
    sections: list[tuple[str, list[str]]] = []
    for qid, sec in ordered:
        if sections and sections[-1][0] == sec:
            sections[-1][1].append(qid)
        else:
            sections.append((sec, [qid]))

    result: dict[str, dict[str, int]] = {}
    for sec, ids in sections:
        tier, lo, hi = tier_from_section(sec)
        for i, qid in enumerate(ids):
            result[qid] = {
                "rating": max(MIN_RATING, min(MAX_RATING, spread_in_band(i, len(ids), lo, hi))),
                "tier": tier,
            }
    return result


def audit_coverage(all_ratings: list[int]) -> None:
    if not all_ratings:
        return
    lo, hi = min(all_ratings), max(all_ratings)
    print(f"  corpus rating range: {lo}–{hi} (n={len(all_ratings)})")


def main() -> None:
    topics_ok = 0
    entries = 0
    all_ratings: list[int] = []
    gaps: list[str] = []

    for md in sorted(TOPICS.glob("*/*.md")):
        aj = md.with_suffix("").with_name(f"{md.stem}.answers.json")
        if not aj.is_file():
            gaps.append(f"missing answers {md.relative_to(ROOT)}")
            continue
        body = md.read_text(encoding="utf-8").split("---", 2)[-1]
        ordered = parse_worksheet(body)
        if not ordered:
            gaps.append(f"no questions in {md.relative_to(ROOT)}")
            continue
        ratings = assign_ratings(ordered)
        data = json.loads(aj.read_text(encoding="utf-8"))
        answers = data.setdefault("answers", {})
        for qid, _sec in ordered:
            if qid not in answers:
                gaps.append(f"{aj.relative_to(ROOT)}: missing answer Q{qid}")
                continue
            meta = ratings[qid]
            answers[qid]["rating"] = meta["rating"]
            answers[qid]["tier"] = meta["tier"]
            all_ratings.append(meta["rating"])
            entries += 1
        aj.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        topics_ok += 1

    print(f"Rated {entries} answers across {topics_ok} topics")
    audit_coverage(all_ratings)
    if gaps:
        print(f"{len(gaps)} gap(s):")
        for g in gaps[:30]:
            print(f"  {g}")
        if len(gaps) > 30:
            print(f"  … and {len(gaps) - 30} more")


if __name__ == "__main__":
    main()
