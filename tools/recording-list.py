#!/usr/bin/env python3
"""Write the recording list for a theme: every line Stan reads aloud, with the file name it must get.

    python3 tools/recording-list.py kennismaken   ->  recording-lists/kennismaken.md
"""
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
theme_id = sys.argv[1]
t = json.loads((root / "app/content/themes" / f"{theme_id}.json").read_text(encoding="utf-8"))
audio = root / "app/audio" / theme_id
done = {p.stem for p in audio.glob("*.m4a")}

lines = [f"# Recording list — {t['nl']} ({t['fr']})", "",
         "Read each line naturally, at a calm everyday pace, in Flemish as you would say it to a colleague.",
         f"Save each file as `app/audio/{theme_id}/<file>.m4a`. Ticked lines are already recorded.", "",
         "## Words and phrases", "", "| | File | Say | Meaning |", "|---|---|---|---|"]
for it in t["items"]:
    lines.append(f"| {'✅' if it['id'] in done else '⬜'} | `{it['id']}` | **{it['nl'].replace('…', '').strip()}** | {it['fr']} |")
lines += ["", "## Example sentences", "", "| | File | Say |", "|---|---|---|"]
for it in t["items"]:
    f = f"{it['id']}-ex"
    lines.append(f"| {'✅' if f in done else '⬜'} | `{f}` | {it['ex_nl']} |")
lines += ["", f"## Dialogue — {t['dialogue']['title']}", "",
          "Two voices if possible: one person reads Sofie, another reads Karim.", "",
          "| | File | Who | Say |", "|---|---|---|---|"]
for l in t["dialogue"]["lines"]:
    lines.append(f"| {'✅' if l['id'] in done else '⬜'} | `{l['id']}` | {l['who']} | {l['nl']} |")
out = root / "recording-lists" / f"{theme_id}.md"
out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{out.relative_to(root)}: {len(t['items']) * 2 + len(t['dialogue']['lines'])} lines, {len(done)} recorded")
