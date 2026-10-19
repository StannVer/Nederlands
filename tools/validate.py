#!/usr/bin/env python3
"""Check every theme before it is published. Exit code 1 if anything is wrong.

    python3 tools/validate.py            all themes listed in index.json
    python3 tools/validate.py kennismaken

Checks the structure (steps point at real items, every item is taught exactly once, grammar and
dialogue answers are valid) and reports what is missing but not fatal (audio files, links).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
STEP_TYPES = {"words", "grammar", "dialogue", "checkpoint", "task"}


def words(s):
    return [w for w in re.sub(r"[.!?…,]", " ", s).split() if w]


def audio_ids(t):
    ids = []
    for it in t["items"]:
        ids += [it["id"], f"{it['id']}-ex"]
    for sid, g in t.get("grammar", {}).items():
        ids += [f"{sid}-t{k + 1}" for k in range(len(g["table"]))]
    ids += [l["id"] for l in t["dialogue"]["lines"]]
    return ids


def check(theme_id):
    t = json.loads((APP / "content/themes" / f"{theme_id}.json").read_text(encoding="utf-8"))
    errors, warnings = check_theme(t)
    if t.get("id") != theme_id:
        errors.append(f"id '{t.get('id')}' does not match file name")
    have = {p.stem for p in (APP / "audio" / theme_id).glob("*.m4a")}
    missing = [a for a in audio_ids(t) if a not in have]
    if missing:
        warnings.append(f"{len(missing)}/{len(audio_ids(t))} audio files missing (synthetic voice used instead)")
    return errors, warnings


def check_theme(t, custom=False):
    """Structure checks on a theme dict. custom=True: a lesson made in answer to a question, which
    needs an answer and at least one step, but no dialogue, checkpoint or task."""
    errors, warnings = [], []
    items = {it["id"]: it for it in t.get("items", [])}

    required = ("nl", "fr", "intro", "steps", "items", "answer") if custom else ("id", "nl", "fr", "level", "intro", "cando", "steps", "items", "dialogue", "tips")
    for key in required:
        if key not in t:
            errors.append(f"missing field '{key}'")
    if errors:
        return errors, warnings
    if custom and (not isinstance(t["answer"], list) or not all(isinstance(p, str) for p in t["answer"])):
        errors.append("answer must be a list of paragraphs (strings)")

    taught = []
    for s in t["steps"]:
        if s["type"] not in STEP_TYPES:
            errors.append(f"step {s['id']}: unknown type {s['type']}")
        if s["type"] == "words":
            for i in s["items"]:
                if i not in items:
                    errors.append(f"step {s['id']}: item '{i}' does not exist")
            taught += s["items"]
        if s["type"] == "grammar" and s["id"] not in t.get("grammar", {}):
            errors.append(f"step {s['id']}: no grammar block with that id")
        if s["type"] == "task":
            tk = t.get("task") or {}
            for key in ("scenario", "goals", "phrases", "prepare", "perform", "record"):
                if not tk.get(key):
                    errors.append(f"task: missing '{key}'")
            for i in tk.get("phrases", []):
                if i not in items:
                    errors.append(f"task: phrase '{i}' is not an item of this theme")
    for i in items:
        n = taught.count(i)
        if n != 1:
            errors.append(f"item '{i}' is taught in {n} word steps (should be 1)")
    kinds = [s["type"] for s in t["steps"]]
    if custom:
        if not kinds:
            errors.append("no steps")
        if set(kinds) - {"words", "grammar"}:
            errors.append("a custom lesson may only have words and grammar steps")
    elif "checkpoint" not in kinds:
        warnings.append("no checkpoint step")
    if not custom and "task" not in kinds:
        warnings.append("no task step: nothing is done with a real person in this theme")

    for i, it in items.items():
        for key in ("nl", "fr", "ex_nl", "ex_fr"):
            if not it.get(key):
                errors.append(f"item '{i}': missing {key}")
        if len(words(it.get("ex_nl", ""))) < 3:
            warnings.append(f"item '{i}': example has fewer than 3 words (no word-order exercise)")

    for sid, g in t.get("grammar", {}).items():
        for k, e in enumerate(g["exercises"]):
            if e["type"] == "choice":
                if "___" not in e["nl"]:
                    errors.append(f"grammar {sid}#{k}: no ___ gap")
                if e["answer"] not in e["options"]:
                    errors.append(f"grammar {sid}#{k}: answer not among options")
            elif e["type"] == "order":
                if len(words(e["nl"])) < 2:
                    errors.append(f"grammar {sid}#{k}: sentence too short to order")
            else:
                errors.append(f"grammar {sid}#{k}: unknown type {e['type']}")

    d = t.get("dialogue")
    if d:
        whos = {l["who"] for l in d["lines"]}
        if d.get("roles", {}).get("learner") not in whos:
            errors.append("dialogue: learner role is not one of the speakers")
        for k, q in enumerate(d.get("questions", [])):
            if not 0 <= q["answer"] < len(q["options"]):
                errors.append(f"dialogue question {k + 1}: answer index out of range")

    for f in t.get("further", []):
        if not f.get("url", "").startswith("https://"):
            errors.append(f"further: '{f.get('title')}' has no https link")

    return errors, warnings


def main():
    index = json.loads((APP / "content/themes/index.json").read_text(encoding="utf-8"))
    ids = sys.argv[1:] or [t["id"] for t in index["themes"] if t["status"] == "ready"]
    failed = False
    for tid in ids:
        errors, warnings = check(tid)
        print(f"{tid}: {'OK' if not errors else 'FAILED'}")
        for e in errors:
            print(f"  ✗ {e}")
        for w in warnings:
            print(f"  · {w}")
        failed |= bool(errors)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
