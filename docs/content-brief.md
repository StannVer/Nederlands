# Content brief — writing a theme for Monia

Read with: `docs/syllabus.md` (what each theme teaches), `app/content/themes/kennismaken.json` (the
format), `tools/validate.py` (must pass).

## The learner

**Monia**: an adult French speaker learning Flemish (Belgian Dutch) from zero, with her teacher **Stan**
(a Flemish native speaker who checks everything). She loves:
- **gardening** (her own garden, vegetables, flowers, seasons, the weather for the garden);
- **Céline Dion** and the music of the **80s and 90s**;
- the French TV series **Plus belle la vie** (Marseille, the Mistral bar, the Place du Mistral);
- **Stéphane Marie**, the presenter of the gardening programme *Silence, ça pousse !* (France 5).

Use her world to make the course feel written *for her*: examples, dialogues, stories, tasks. Keep it
light and warm, with a touch of humour (a comic-strip feel). Do not overdo it: one or two personal
references per item list, the dialogue and the task — not every sentence.

## The recurring cast (comic strip)

- **Monia** — the learner; the dialogues put her in situations she will live.
- **Jef** — her Flemish neighbour, retired, about 65, proud of his *moestuin* (vegetable garden), a bit
  of a joker, speaks warm everyday Flemish (*goeiedag*, *amai*, *allez*, *efkes*, *merci*).
- **Lotte** — Jef's niece, about 30, works with Monia, crazy about 80s and 90s music.
- **Stan** — the teacher; can appear in tasks (the learner talks to him for real).
- **Kees** — the garden gnome (*tuinkabouter*) mascot of the app; may appear in a tip.

## Copyright and real people

- **Never quote song lyrics** (not even a line) or dialogue from the series. Titles, years, facts and
  places are fine: "Céline Dion komt uit Canada", "Ik luister naar muziek uit de jaren negentig".
- Real people (Céline Dion, Stéphane Marie): only neutral, true facts. Never invent quotes, opinions or
  events about them.
- Plus belle la vie: mention the series, Marseille, "het café" — do not reuse character storylines.

## Language rules

- **Belgian Dutch as spoken in Flanders**, standard enough to be correct in writing: *goeiedag*, *merci*,
  *u/je*, *frieten*, *GSM*. A spoken Flemish form (*ge/gij*, *efkes*, *goesting*) only where a note
  explains it.
- **At the learner's level**: only the grammar of this theme and earlier ones (see the syllabus order);
  new words only from the theme's list. Short sentences. Examples must be natural, not textbook-stiff.
- **Every Dutch sentence must be correct.** If unsure of a form, choose a simpler sentence you are sure
  of. Stan checks, but should find little.
- French: natural Belgian/French French, warm, "vous" to the learner.
- Notes for French speakers: pronunciation traps, false friends, the contrast with French.

## Format (exactly the course format)

As `kennismaken.json`, plus two fields:
- `"icon"`: one of `wave, clock, family, basket, coffee, house, sun, route, garden, music, tv, heart`.
- `"culture"`: `{ "title": "...", "text": "..." }` — one short note about life in Flanders tied to the
  theme (French).

Structure per theme: `cando` (3–4), steps `words` ×3 (6–8 items each, 18–24 items total), `grammar` ×2
(the syllabus's two points, each with explain, table, contrast, 5–6 exercises), `dialogue` (8–10 lines,
Monia is the learner role, 4 comprehension questions), `checkpoint`, `task` (with Stan, in real life,
using `{teacher}` for his name), `tips` (2–3), `further` (2–3 real, working https links — only sites
you have verified exist: NedBox, Wablieft, VRT, Franel…).

Item ids: lowercase, hyphens, unique, stable. Every example sentence (`ex_nl`) must have at least 3
words. Run `python3 tools/validate.py <theme-id>` until it passes.
