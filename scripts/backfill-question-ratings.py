#!/usr/bin/env python3
"""Deprecated: use scripts/assign-question-ratings.py (500–2000 from worksheet sections)."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSIGN = ROOT / "scripts" / "assign-question-ratings.py"


def main() -> None:
    print("backfill-question-ratings.py → assign-question-ratings.py", file=sys.stderr)
    raise SystemExit(subprocess.call([sys.executable, str(ASSIGN)], cwd=ROOT))


if __name__ == "__main__":
    main()
