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
