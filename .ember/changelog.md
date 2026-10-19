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
