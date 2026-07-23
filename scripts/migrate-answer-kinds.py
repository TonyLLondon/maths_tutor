#!/usr/bin/env python3
"""Set kind:self-check on legacy any:true answers; upgrade known bar-chart items."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPICS = ROOT / "content/tenants/archer/subjects/maths/topics"

BAR_CHARTS: dict[str, dict] = {
    "statistics/S1": {
        "19": {
            "kind": "bar-chart",
            "bars": {
                "labels": ["car", "bus", "bike", "walk"],
                "heights": [12, 3, 4, 1],
            },
        }
    }
}


def main() -> None:
    changed = 0
    for aj in TOPICS.glob("*/*.answers.json"):
        data = json.loads(aj.read_text())
        answers = data.get("answers", {})
        code = aj.name.replace(".answers.json", "")
        rel = f"{aj.parent.name}/{code}"
        overrides = BAR_CHARTS.get(rel, {})
        file_changed = False
        for qid, entry in answers.items():
            if qid in overrides:
                entry.update(overrides[qid])
                entry.pop("any", None)
                file_changed = True
                continue
            if entry.get("any") is True and entry.get("kind") != "bar-chart":
                entry["kind"] = "self-check"
                entry.pop("any", None)
                file_changed = True
        if file_changed:
            aj.write_text(json.dumps(data, indent=2) + "\n")
            changed += 1
    print(f"updated {changed} answer files")


if __name__ == "__main__":
    main()
