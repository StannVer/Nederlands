#!/usr/bin/env python3
"""Merge app/content/stories-extra/*.json into app/content/stories.json, and check every story.

    python3 tools/merge-stories.py           merge and check (exit 1 on errors)
    python3 tools/merge-stories.py --check   check stories.json only

Checks: unique ids, "after" is a real unit, answer indexes in range, and every word of every line is
either taught in a unit up to "after" or in the story's glossary (names of the cast excepted).
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "app" / "content"
NAMES = {"monia", "jef", "lotte", "stan", "sofie", "karim", "kees", "rita", "tom", "an", "celine", "dion"}


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"…|\.\.\.", " ", s)
    s = re.sub(r"[.,!?;:¿¡'\"«»—–\-]", " ", s)
    return [w for w in s.split() if w]


def taught_words(index, upto):
    words = set()
    for t in index["themes"]:
        f = CONTENT / "themes" / f"{t['id']}.json"
        if f.exists():
            th = json.loads(f.read_text(encoding="utf-8"))
            for it in th["items"]:
                for x in (it["nl"], it.get("ex_nl", "")):
                    words.update(norm(x))
        if t["id"] == upto:
            break
    return words


def check(stories, index):
    errors, warnings = [], []
    ids = [s["id"] for s in stories]
    for d in {i for i in ids if ids.count(i) > 1}:
        errors.append(f"duplicate story id {d}")
    units = {t["id"] for t in index["themes"]}
    for s in stories:
        if s.get("after") not in units:
            errors.append(f"{s['id']}: 'after' {s.get('after')!r} is not a unit")
            continue
        for k, q in enumerate(s["questions"]):
            if not 0 <= q["answer"] < len(q["options"]):
                errors.append(f"{s['id']}: question {k + 1} answer out of range")
        known = taught_words(index, s["after"]) | set(s.get("glossary", {})) | NAMES
        missing = sorted({w for l in s["lines"] for w in norm(l["nl"]) if w not in known})
        if missing:
            warnings.append(f"{s['id']}: not taught and not in glossary: {', '.join(missing[:12])}")
    return errors, warnings


def main():
    index = json.loads((CONTENT / "themes" / "index.json").read_text(encoding="utf-8"))
    main_file = CONTENT / "stories.json"
    data = json.loads(main_file.read_text(encoding="utf-8"))
    if "--check" not in sys.argv:
        by_id = {s["id"]: s for s in data["stories"]}
        for f in sorted((CONTENT / "stories-extra").glob("*.json")):
            for s in json.loads(f.read_text(encoding="utf-8"))["stories"]:
                by_id[s["id"]] = s
        order = {t["id"]: i for i, t in enumerate(index["themes"])}
        data["stories"] = sorted(by_id.values(), key=lambda s: (order.get(s.get("after"), 99), s["id"]))
        main_file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"stories.json: {len(data['stories'])} stories")
    errors, warnings = check(data["stories"], index)
    for e in errors:
        print(f"  ✗ {e}")
    for w in warnings:
        print(f"  · {w}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
