#!/usr/bin/env python3
"""The server side of "ask a question, get a lesson".

The learner asks a question in the app (typed, or dictated and transcribed on the phone). A scheduled
Claude task runs this script to pick the questions up, writes a lesson in the course's theme format,
and stores it as a DRAFT. The teacher publishes it from the teacher page; only then does the learner
see it.

    python3 tools/questions.py pending              new questions + what the learner already knows (JSON)
    python3 tools/questions.py claim <id>           mark a question as being worked on
    python3 tools/questions.py draft <id> <file>    validate a lesson JSON and store it as a draft
    python3 tools/questions.py skip <id>            leave a question to the teacher (e.g. voice-only)

Credentials: the Supabase access token in ~/.supabase/access-token (Management API). The service key
is fetched with it at run time and never written anywhere.
"""
import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate import check_theme  # noqa: E402

REF = "rjkckukuepufkoxucjra"
TOKEN = (Path.home() / ".supabase" / "access-token").read_text().strip()
ROOT = Path(__file__).resolve().parents[1]


def api(method, url, body=None, headers=None):
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def sql(query):
    return api("POST", f"https://api.supabase.com/v1/projects/{REF}/database/query", {"query": query},
               {"Authorization": f"Bearer {TOKEN}"})


def lit(s):
    return "'" + str(s).replace("'", "''") + "'"


def pending():
    rows = sql("""
      select q.id, q.learner_email, q.text, q.context, q.created_at, q.audio_path is not null as has_audio,
             p.state -> 'cards' as cards, p.state -> 'steps' as steps
      from public.questions q left join public.progress p on p.user_id = q.user_id
      where q.status = 'new' order by q.created_at""")
    out = []
    for r in rows:
        cards = r.pop("cards") or {}
        steps = r.pop("steps") or {}
        r["learner_knows"] = {
            "themes_steps_done": sorted(steps.keys()),
            "known_item_keys": sorted(k for k in cards if "#" not in k),
        }
        r["voice_only"] = r["has_audio"] and r["text"].strip() in ("", "(message vocal)")
        out.append(r)
    print(json.dumps(out, ensure_ascii=False, indent=2))


def set_status(qid, status):
    sql(f"update public.questions set status = {lit(status)} where id = {int(qid)}")
    print(f"question {qid}: {status}")


def draft(qid, path):
    theme = json.loads(Path(path).read_text(encoding="utf-8"))
    theme.setdefault("id", f"q-draft-{qid}")
    errors, warnings = check_theme(theme, custom=True)
    for w in warnings:
        print(f"  · {w}")
    if errors:
        for e in errors:
            print(f"  ✗ {e}")
        sys.exit("lesson does not validate: nothing stored")
    q = sql(f"select user_id, text from public.questions where id = {int(qid)}")
    if not q:
        sys.exit(f"no question {qid}")
    theme["question"] = q[0]["text"]
    payload = json.dumps(theme, ensure_ascii=False)
    sql(f"""insert into public.custom_lessons (learner_id, question_id, theme, status)
            values ({lit(q[0]['user_id'])}, {int(qid)}, {lit(payload)}::jsonb, 'draft');
            update public.questions set status = 'drafting' where id = {int(qid)};""")
    print(f"question {qid}: draft stored — the teacher publishes it from the teacher page")


if __name__ == "__main__":
    cmd, *args = sys.argv[1:] or ["help"]
    if cmd == "pending":
        pending()
    elif cmd == "claim":
        set_status(args[0], "drafting")
    elif cmd == "skip":
        set_status(args[0], "new")
        sql(f"update public.questions set context = coalesce(context, '') || ' [left for the teacher]' where id = {int(args[0])}")
    elif cmd == "draft":
        draft(*args)
    else:
        print(__doc__)
