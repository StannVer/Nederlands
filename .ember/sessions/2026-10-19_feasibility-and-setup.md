# 2026-10-19 — Feasibility and setup (desktop, 239GX64)

- Question: is a professional app/website to learn Flemish, for a French speaker, feasible?
- Answer: yes. The code is moderate work; the real workload is content, which Stan checks and records.
- Landscape: the big apps teach Netherlands Dutch from English. Good Belgian resources exist (NedBox, Franel,
  Flemish government portals) but none is an app with review and progress for French speakers. Link to them, don't copy.
- iPhone: PWA via Safari "Add to Home Screen". Microphone recording in an installed PWA must be tested on the real phone.
- Next: Phase 1 + a first slice of Theme 1 'Kennismaken', end to end, installed on Stan's iPhone.

## Phase 1 built (same session)
- Desktop SSH key added to StannVer; `git@github-personal` works. EmberMCP confirmed on StannVer.
- App built and tested in WebKit (iPhone 13 viewport). Still to do on the real iPhone: install from Safari, microphone test.
- Open: create the private `StannVer/Nederlands` repo, push; hosting (Phase 5) is needed before the iPhone can install it (service worker + microphone need https).
