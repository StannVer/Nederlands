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
