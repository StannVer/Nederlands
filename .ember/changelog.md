# Nederlands — Changelog

## 2026-10-19

### Phase 0: Tracking infrastructure and plan
- Created `.ember/` with project.json, memory.md, changelog.md, sessions/, prompts/
- Created `content/themes/`, `audio/`, `app/`
- Feasibility reflection done: PWA first, Stan's own recordings, FSRS review, French-contrast teaching

### Phase 1: App shell — PWA, review engine, first slice of Kennismaken
- `app/`: installable web app (manifest, icons, offline service worker), four tabs: Accueil, Réviser, Progrès, Réglages
- Theme 1 'Kennismaken' content: 12 items with examples and notes for French speakers, an 8-line dialogue, 3 tips; 5 further themes listed as 'bientôt'
- Lesson flow (discover -> recognise -> recall, misses re-queued), FSRS review with self-grading, progress page (streak, estimated memory, 28-day activity, per theme)
- Audio: plays Stan's recordings when present, synthetic voice otherwise; microphone test in Réglages
- `tools/recording-list.py` + `recording-lists/kennismaken.md` (32 lines to record)
- Tested in WebKit at iPhone size: full lesson, deliberate mistake re-queued, review with Again re-shown, progress, settings, dark mode; no errors

### Phase 4: Course frame v0.2
- Theme path with 6 steps; 7 exercise types (present + record/compare, listen & choose, read & choose, typed recall with typo tolerance, word order, grammar gap, say-aloud self-grade) plus dialogue comprehension and role play
- Grammar blocks with French contrast; checkpoint with CEFR can-do self-assessment
- Mixed review across modalities and themes; grammar exercises become review cards
- Method page ("Pourquoi ça marche") with sources; "Pour aller plus loin" links per theme (NedBox, Franel, Wablieft — checked, all resolve)
- Accounts and cloud sync ready (Supabase, vendored supabase-js 2.45.4), off until configured; `supabase/schema.sql`
- `tools/validate.py`, `publish.sh` (personal-token check, validation gate)
- Tested in WebKit at iPhone size: all 6 steps of Kennismaken + 24-item mixed review, no errors; fixed tiles giving away sentence boundaries

### Phase 4b: Task step with the teacher (v0.3)
- New step type `task` (opdracht), last in each theme: scenario, goals, useful phrases with audio, written preparation (saved, synced), then done for real with the teacher in person — or recorded and sent
- Teacher feedback: written and/or spoken, shown on the theme page; a "Stan vous a répondu" card on the home screen; teacher page `#/teacher` lists every submission with its notes and recording
- Database: `teachers`, `task_submissions` (learner sees own, teacher sees all; a trigger limits learner updates to `seen_at`), private storage bucket `tasks` with one folder per learner
- `{teacher}` placeholder in content, filled from `CONFIG.teacherName`
- validate.py checks task steps; tested in WebKit (in-person path). Recording and the online feedback loop are untested until the Supabase project exists.

### Phase 5 (started): hosting
- First deploy to the personal Netlify account: https://monianederlands.netlify.app (site id in deploy/site.json). Netlify visitor protection is on: only logged-in Netlify team members can open it, which suits the preview; switch off once the course's own login works.
- Supabase: the desktop token manages the EPSO project but may not create projects in the org (403). Decision: Stan creates the `nederlands` project in the dashboard (Frankfurt); everything else via the Management API.

### Phase 5: accounts live
- Supabase project `nederlands` (ref rjkckukuepufkoxucjra, eu-west-1). schema.sql applied: progress, teachers, task_submissions (RLS on all), private bucket `tasks`. Sign-up switched off.
- Teacher account stanverschaeve@gmail.com created and registered as teacher; password in C:\Users\sverschaeve\.personal\nederlands-teacher-login.txt (not in git, not in OneDrive).
- App connected (URL + publishable key in config.js). Checked: anonymous reads return nothing, anonymous sign-up refused.
- End-to-end test against the real database: wrong password refused; progress synced and restored on a second device; in-person task → teacher page → written feedback → home card + theme page. Test data deleted afterwards.
- Daily keep-awake Netlify function (free plan pauses after 7 idle days), deployed with publish.sh.
- Checkpoint step icon changed to a flag: a check mark looked like "done".
- Not yet: learner account (Stan reviews the course first); Netlify visitor protection still on.

### v0.4 — practice, teacher dashboard, questions → lessons (2026-10-19)
- Practice tab: pronunciation trainer (7 contrasts, minimal pairs: listen → discriminate 8 rounds → record and compare), graded stories (2, tap a word → translation → add to own words, comprehension questions), dictation (from learned example sentences; also a 4th review mode), own words, words from Stan, custom lessons, ask a question (typed / dictated with on-device speech recognition / voice message), grammar reference, Flemish corner (14 entries)
- Teacher space with tabs: learners (memory, steps, due reviews, checkpoint scores, hardest words by lapses, add words after a conversation), questions + draft lessons (publish / discard), opdrachten
- Database part 2 (supabase/schema-v2.sql): teacher reads all progress, teacher_items, questions, custom_lessons (draft → published); learner e-mail now sent explicitly (supabase-js upserts send null for missing columns, so column defaults never applied)
- Question → lesson pipeline: tools/questions.py (pending/claim/draft/skip/release), tools/answer-questions.md (the task's instructions and lesson format), tools/run-answer-questions.sh (headless Claude, restricted tools, skips when there is nothing to do, releases stuck claims). Tested for real: example question 2 answered with a correct A1 lesson, stored as draft. Permission lesson: absolute paths in Claude Code rules need '//' (Edit(//tmp/...)), and Write rules don't apply, only Edit.
- Method page sources verified (13 references, 11 DOIs resolve); 5 corrections, incl. Mayer 2009 replaced by Montero Perez et al. 2013 (Mayer's redundancy principle contradicts the claim).
- docs/syllabus.md: 28 themes A1 → B1, 56 grammar points in order, 17 pronunciation contrasts with minimal pairs, vocabulary estimates. index.json follows it; op-café → op-cafe (NFC/NFD risk on Apple devices).
- Tested in WebKit against the real database: all practice pages, teacher dashboard, add word → learner learns it, publish draft → learner does the lesson; no errors.
- Example data on Stan's own account (marked EXEMPLE): question 1 + published lesson "de of het?", question 2 + draft lesson, teacher word "de trein", own word "het station". Remove before the learner starts? They are on Stan's account only.

### v0.5 — Babbel-equivalent workflow (2026-10-19)
Checked against Babbel's own description (how-babbel-works, babbel-review) and reviews. Added:
- Onboarding: name, motivation, experience → optional 8-item placement test, weekly goal (days/week), daily reminder as a repeating calendar event (.ics, no app or push permission needed)
- Home: greeting by name, weekly goal with day dots; step durations (≈ min) on the path and the "continue" card
- Speaking with speech recognition (on-device, nl-BE, Web Speech API): in every word lesson ("dites-le", two tries, never blocks), in the dialogue role play (guided speaking), as a review mode, and a "Parler" trainer; "je ne peux pas parler maintenant" pauses speaking for an hour; can be switched off in settings
- "Match the pairs" warm-up after the presentation in each word lesson + a pairs game in Practice; rounds never hold two overlapping translations
- Review manager: choose the mode (mixte, cartes, écoute, oral, écrit) and the size (10/20/all); remembers the last mode
- Hands-free listening ("écoute libre"): Dutch, pause to repeat, Dutch, French, example — per theme or own words
- Level certificates (A1/A2/B1): unlocked when every theme of the level has a checkpoint ≥ 8/10; printable
- Not copied, on purpose: Babbel Live (Stan's opdrachten instead), push notifications (calendar instead). AI conversation partner: for Stan to decide (API key, cost, privacy).
- Tested in WebKit with a simulated speech recogniser: onboarding + placement, lesson with pairs and 6 speaking exercises, oral review, pairs game, hands-free mode, settings, certificate page; no errors. Real recognition to be tested on the iPhone.

### v1.0 — professional redesign, personalised content, 5 A1 units (2026-10-19)
- Design system "jardin rétro": Fraunces + Manrope (self-hosted, OFL, from the statistics course), warm paper palette with garden green, 80s coral, Flemish yellow, teal; light and dark
- App shell: left sidebar on desktop (brand, navigation, streak + week dots), tab bar on phone; lessons and reviews take the whole screen (focus mode)
- Course map (Duolingo-style): A1/A2/B1 banners, one coloured unit per theme, zigzag step nodes (done with stars, current pulsing with "Commencer", upcoming), locked future units, a certificate trophy per level
- Home as a daily plan (reviews → next step → bonus), word of the day, Flanders culture note, weekly goal; vocabulary page with search and filters; stars (1–3) per step from the score
- Comic aspect: Kees the garden gnome (mascot) reacts to every answer in a speech bubble (Dutch + French gloss) and on end screens; dialogues as comic strips with the cast's faces (Monia, Jef, Lotte, Stan…)
- Content (written by three helpers from docs/content-brief.md, all validated): kennismaken reworked for Monia (18 items, neighbour Jef over the hedge), getallen-en-tijd, familie, boodschappen, op-cafe (each ~24 items, 2 grammar blocks, comic dialogue, culture note, task with Stan); 6 personal stories (garden, 90s evening with Céline Dion facts, Plus belle la vie, Silence ça pousse). No lyrics, no invented quotes.
- A noun typed without its article counts as a near miss.
- Tested in WebKit: all 8 steps + review for each of the 5 units (35–36 cards each, no errors); desktop and phone screenshots reviewed; fixes: tip overlapping a label, unit button overlapping the title on phone, plan numbering.
- docs/to-check-by-stan.md: every sentence and fact the writers flagged.

### v1.1–1.2 — level A1 complete (2026-10-19)
- Units 6 thuis, 7 mijn-dag, 8 onderweg written by helpers (24 items each, 2 grammar blocks, comic dialogue, culture, task), validated and tested end to end (8 steps + review each, no errors). Level A1 = 8 units, ~190 words and expressions, 16 grammar points.
- 20 stories (2 per unit + 4 personal), merged from stories-extra/ with tools/merge-stories.py (checks ids, units, answers, and that every word is taught or glossed). Jef's wife unified as Rita.
- Pronunciation programme: 17 contrasts in syllabus order (4 minimal pairs each).
- Sounds (synthesised), confetti, unit-complete celebration; stories grouped by unit and listed on each unit page; story "words known" counts every unit.
- docs/to-check-by-stan.md extended with every flagged sentence and fact of units 6–8 and the new stories.
