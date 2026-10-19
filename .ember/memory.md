# Nederlands — Persistent Memory

## Decisions Made
- 2026-10-19: Personal project. NOT recorded in Metis (no project, task or memory there); tracked here in `.ember/` only.
- 2026-10-19: Learner is a French speaker starting from zero; target variety is Flemish (Belgian Dutch), not Netherlands Dutch.
- 2026-10-19: Private, for one learner — installed like the EPSO and statistics courses, never public.
- 2026-10-19: Web app installed on the iPhone home screen (PWA) first. A native app (Capacitor + Apple Developer Program, ~€99/yr, needs a Mac) only if the PWA proves itself. A free Apple ID install expires after 7 days.
- 2026-10-19: Audio is Stan's own recorded Flemish voice, from per-theme recording lists. No synthetic voices as the default.
- 2026-10-19: Pronunciation feedback in v1 = record-and-compare. Automatic scoring left out (Belgian Dutch support unconfirmed).
- 2026-10-19: Repository goes to StannVer (personal GitHub, private) once the desktop SSH key is added there.

## Pedagogy (evidence base)
- Spaced retrieval over rereading (meta-analysis of 29 studies, g = 0.74; spacing matters more than the exact schedule).
- New items get several repetitions in their first lesson before entering the spaced queue (spacing only helps once recall succeeds).
- Plenty of understandable listening: short dialogues per theme at the learner's level.
- Teach the contrasts with French: V2 / verb-final word order, de/het, sounds g/ch ui eu ij, false friends (brave, slim, …).
- Themes on the CEFR scale (A1 first), added along the way.

## Architecture Notes
- `app/` is the published site (no build step: vanilla JS modules, CSS, service worker).
- Content is data, separate from code: `app/content/themes/index.json` lists themes, `app/content/themes/<id>.json` holds items (nl, fr, accept, ex_nl, ex_fr, note), a dialogue and tips. A new theme is writing, not programming.
- Audio: `app/audio/<theme>/<id>.m4a` (word), `<id>-ex.m4a` (example), `d01.m4a`… (dialogue). Missing file -> synthetic nl-BE voice as a stand-in.
- `python3 tools/recording-list.py <theme>` writes `recording-lists/<theme>.md`, ticking what is already recorded.
- Scheduler: FSRS-4.5, default weights, 90 % retention, max interval 365 days (`app/js/fsrs.js`).
- Lesson = introduce a batch (default 5) -> each item must pass recognition (MC) then typed recall; a miss sends it back to typed recall. Errors set the first FSRS grade (0 Good, 1 Hard, 2+ Again).
- Review = French prompt, say it aloud, reveal, grade yourself (4 buttons with the next interval shown). Again comes back in the same session.
- Progress on the device (localStorage `nederlands_v1`, persistence requested). Home-screen apps on iOS keep it; Safari tabs may lose it after 7 days. Supabase sync later (same pattern as EPSO).
- UI in French; Dutch text tagged lang="nl". Design: system font + serif display, one Flemish-yellow accent (#ffd400), light and dark.

## Open questions
- Test microphone recording in an installed PWA on the real iPhone before building Phase 4 on it.
- Second voice for dialogues (someone other than Stan)?

## 2026-10-19 (later) — course frame v0.2
- A theme is a path of steps: words (×2, 6 items each) → grammar (×2) → dialogue → checkpoint. Steps are never locked; the next one is suggested.
- Words step: present (hear, see, example, French-speaker note, optional record-and-compare) → listen & choose → type from memory → put the example in order. A miss re-queues the same task 2–3 places later.
- Typos: within 1 letter (2 for 10+ letters) count as right ("presque"), graded Hard in review.
- Grammar step: explanation + table with audio + explicit contrast with French, then gap/order exercises; every exercise also becomes a review card (`theme/g1#0`).
- Dialogue step: listen with blurred text → comprehension questions → read with translation → role play as the learner's character.
- Checkpoint: 10 mixed items + CEFR "je peux…" self-assessment; pass mark 8/10.
- Review: all themes mixed; word cards rotate say-aloud / typed / listening by repetition count; Again is re-shown once per session.
- Method page in French explains each principle with its source (Roediger & Karpicke 2006; Cepeda et al. 2006; Latimier, Peyre & Ramus 2021; Ye et al. 2022; Mayer 2009; Krashen 1982; Norris & Ortega 2000; CEFR).
- `tools/validate.py` must pass before publishing (`publish.sh` enforces it).

## Content strategy (decided 2026-10-19)
- Stan does NOT record everything. Audio = Flemish neural voices (Azure nl-BE Dena/Arnaud, to confirm) generated once per theme into files; Stan's recordings optional. Until then the device's Dutch voice stands in.
- Copy only what the licence allows: Tatoeba text (CC BY 2.0 FR, with credit; audio per contributor), Common Voice (CC0). Everything else (NedBox, Franel, Wablieft, VRT/Ketnet, VDAB) is linked, never copied — per theme under "Pour aller plus loin".
- Scale: ~28 themes A1 → B1, ~2,000 words, same structure per theme; Stan spot-checks rather than reading every line.

## Hosting (decided 2026-10-19)
- No App Store, nothing installed: a web page with login. Netlify (personal account) + Supabase (org Sver, project to create).
- Accounts created by Stan in the Supabase dashboard; sign-up off. `supabase/schema.sql`: one `progress` row per learner, row-level security.
- Supabase URL + publishable key go into `app/js/config.js` (public by design). Empty config = no login, device-only progress.
- Desktop (239GX64) has no personal Netlify token or Supabase login yet (2026-10-19).

## 2026-10-19 — task step and audio sources
- Each theme ends with an opdracht done WITH Stan (in person by default; a recording is optional). Stan answers in the app (text and/or voice). Rationale: task-based teaching (Flemish TBLT tradition, Van den Branden 2006) + corrective feedback are what an app alone cannot give.
- Audio sources checked: Lingua Libre (CC BY-SA 4.0, words, speaker location known — usable), Common Voice (CC0, accent rarely tagged), Tatoeba (text CC BY 2.0 FR; audio per contributor), Forvo (NOT reusable since 2019), CGN (audio not in the free licence). Podcasts/VRT/Ketnet: links only.
- Sources on the method page are from memory and NOT yet verified against the papers — verify before the learner sees them.
- Access: Metis records only WHERE credentials live (accounts.json), never the keys. Personal Netlify token and Supabase CLI login exist only on the laptop; desktop needs its own (Netlify personal access token → C:\Users\sverschaeve\.personal\netlify-token.txt; Supabase access token → ~/.supabase/access-token).

## 2026-10-19 — v0.4 decisions
- Custom lessons are DRAFTS until Stan publishes them (generated content gets a native-speaker check). The scheduled task never publishes.
- Voice-only questions are left to Stan (no audio transcription server-side); typed or dictated questions (on-device speech recognition, fr-BE) are answered.
- The scheduled run uses headless Claude Code (`tools/run-answer-questions.sh`), not Claude Desktop: it needs the shell, the WSL Supabase token and the course files. Not yet registered in Windows Task Scheduler (Stan to decide).
- Syllabus open points (docs/syllabus.md §uncertain): theme size (20–25 words → 3–4 word steps), vocabulary target (~700 as cards + optional recognition-only extra words), minimal pairs to check by a native speaker.
