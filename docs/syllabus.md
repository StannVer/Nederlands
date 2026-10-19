# Syllabus — Flemish for a French speaker, zero to B1

Blueprint the theme files (`app/content/themes/<id>.json`) are written from. One theme =
two-to-four words steps, two grammar steps, a dialogue, a checkpoint and an *opdracht* done
with the teacher. Theme 1 (`kennismaken`) is finished and is the model for the others.

Draft v1 — 2026-10-19.

---

## 1. Principles

1. **Task-based themes.** Every theme is built backwards from a real thing the learner will
   do in Flanders (introduce yourself, order at a café, phone the doctor, complain about a
   repair). The *opdracht* at the end is that thing, done live with the teacher, who gives
   corrective feedback. Vocabulary and grammar are chosen because the task needs them.
2. **Grammar contrasted with French.** Two grammar points per theme, each introduced the
   moment the theme needs it, and each with one explicit contrast to French (`contrast`
   field). The big four for a French speaker are word order (V2, inversion, verb-final in
   subordinate clauses, the verbal "bracket"), de/het, separable verbs and the perfect with
   *hebben/zijn*. These get a theme each and are recycled in every later one.
3. **Vocabulary by frequency and usefulness.** Key words are picked from the theme's task,
   then sanity-checked against a frequency list (SUBTLEX-NL is the obvious reference; the
   lists below were NOT yet checked against it word by word). Function words and
   high-frequency verbs are favoured over rare nouns; chunks (`Ik had graag…`,
   `Wat scheelt er?`) are taught as single items before they are analysed.
4. **Spiral recycling.** Every theme reuses earlier words in its examples and dialogue, and
   every grammar point comes back in at least two later themes (see the "recycled in" column
   in §3). Spaced review (FSRS) does the rest.
5. **Flemish variety.** The target is the Dutch actually spoken and written in Flanders.
   Standard (Belgian) Dutch is what is taught for production; everyday Flemish forms
   (*goesting, frigo, zetel, ge/gij, -ke*) are taught as recognisable, flagged in the item
   `note`, and used in dialogues where a Fleming would use them. Where Belgian standard and
   Netherlands usage differ (*voormiddag, verlof, solden, kleed, gelijkvloers*), the Belgian
   word is the main item and the Netherlands word is mentioned.
6. **Levels.** A1 / A2 / B1 of the CEFR (Breakthrough / Waystage / Threshold). The Flemish
   adult NT2 programmes (CVO) use *richtgraden*; the usual reading is Richtgraad 1 ≈ A1,
   2 ≈ A2, 3 ≈ B1, 4 ≈ B2 — **not verified against the official opleidingsprofiel**.

---

## 2. Themes

### 2.1 Overview

| # | id | Dutch | French | Level | Grammar 1 | Grammar 2 |
|---|---|---|---|---|---|---|
| 1 | `kennismaken` | Kennismaken | Faire connaissance | A1 | present tense, singular (-t) | yes/no and wh-questions (inversion) |
| 2 | `getallen-en-tijd` | Getallen en tijd | Les nombres et l'heure | A1 | *zijn, hebben* + plural persons | V2: time first → inversion |
| 3 | `familie` | Familie en vrienden | La famille et les amis | A1 | *de / het / een* | possessives |
| 4 | `boodschappen` | Boodschappen | Faire les courses | A1 | noun plurals (-en / -s) + open/closed syllable spelling | *deze, die, dit, dat* |
| 5 | `op-cafe` | Op café | Au café | A1 | modal + infinitive at the end (*willen, mogen, kunnen*) | negation *niet / geen* |
| 6 | `thuis` | Thuis | À la maison | A1 | *er is / er zijn* + place prepositions | adjective -e |
| 7 | `mijn-dag` | Mijn dag | Ma journée | A1 | separable verbs | reflexive verbs |
| 8 | `onderweg` | Onderweg | En route | A1 | imperative | *gaan / moeten* + infinitive |
| 9 | `vrije-tijd` | Vrije tijd | Les loisirs | A2 | perfect with *hebben* (regular) | *graag, liever, het liefst* |
| 10 | `bij-de-dokter` | Bij de dokter | Chez le médecin | A2 | perfect with *zijn* + irregular participles | object pronouns |
| 11 | `kleren` | Kleren kopen | Acheter des vêtements | A2 | comparative and superlative | pronouns for things (*hem / het*) |
| 12 | `op-het-werk` | Op het werk | Au travail | A2 | *en, maar, want, of, dus* | subordinate clause: *dat, omdat* → verb last |
| 13 | `afspraken` | Afspreken | Prendre rendez-vous | A2 | *zullen*; *moeten / niet hoeven* | dates, ordinals, time prepositions |
| 14 | `eten-en-koken` | Eten en koken | Manger et cuisiner | A2 | diminutives | *er* + number (= *en*) |
| 15 | `het-weer` | Het weer | Le temps qu'il fait | A2 | imperfect, regular + *was, had* | *worden* |
| 16 | `vroeger` | Vroeger | Autrefois | A2 | imperfect, irregular verbs | perfect vs imperfect |
| 17 | `huren` | Een woning huren | Louer un logement | A2 | relative *die / dat* | separable verbs in perfect and subordinate clauses |
| 18 | `de-gemeente` | Op de gemeente | À la commune | A2 | indirect questions (*of, waar…*) | polite *zou(den)…* |
| 19 | `gezond-leven` | Gezond leven | Vivre sainement | B1 | prepositional verbs | *er* + preposition (*eraan, waarop*) |
| 20 | `werk-zoeken` | Werk zoeken | Chercher du travail | B1 | *(om) te* + infinitive | double infinitive in the perfect |
| 21 | `school` | School en opleiding | L'école et la formation | B1 | passive (present, past) | relative with preposition (*waar, met wie, waarin*) |
| 22 | `nieuws` | Het nieuws | L'actualité | B1 | indirect speech | passive perfect + impersonal *er wordt* |
| 23 | `op-reis` | Op reis | En voyage | B1 | pluperfect | conditional *als…, zou…* |
| 24 | `meningen` | Mijn mening | Donner son avis | B1 | connectors: adverb (inversion) vs conjunction (verb last) | modal particles |
| 25 | `feesten` | Feesten en tradities | Fêtes et traditions | B1 | adjectives as nouns, *iets nieuws* | verb clusters at the end of a subordinate clause |
| 26 | `klachten` | Een klacht | Se plaindre, régler un problème | B1 | *laten* (causative) | softening and formal register |
| 27 | `milieu` | Natuur en milieu | Nature et environnement | B1 | passive with a modal | the four uses of *er* (review) |
| 28 | `een-verhaal` | Een verhaal vertellen | Raconter une histoire | B1 | *toen / als / wanneer*, *nadat, voordat, zodra, terwijl* | subordinate clause first → inversion |

**Changes to the ids currently in `index.json`:**

- `op-café` → **`op-cafe`**. The id becomes a file name, a folder under `app/audio/` and a
  review-card prefix (`op-cafe/g1#0`). An accented character there is a trap: iOS and macOS
  store file names in decomposed Unicode (NFD), the JSON holds composed (NFC), and the two
  do not compare equal, so audio silently fails to load on one device and not another. The
  display title stays "Op café".
- `getallen-en-tijd`, `boodschappen`, `onderweg`, `bij-de-dokter`: kept.
- Order changed: `familie` is inserted at 3 (possessives and de/het are needed before
  shopping), `thuis` and `mijn-dag` at 6–7. `onderweg` moves to 8 (it needs the imperative
  and *moeten*, which come late in A1). `bij-de-dokter` stays A2, at 10, because explaining
  what happened ("ik ben gevallen") needs the perfect.

### 2.2 Size of a theme

Theme 1 has 12 items (2 words steps × 6). The target below is **20–25 key words per theme**,
so later themes need **3–4 words steps of 6** (A1: 3 steps, A2–B1: 4). Numbers, days and
months (theme 2) are taught as sets inside a step rather than one card each, otherwise theme 2
alone would be 60 cards. `kennismaken` stays as it is; its 12 items are recycled in theme 2–3
and a few useful extras (*ja, nee, sorry, ik ben, waar?, hoe?*) are added there.

### 2.3 Theme by theme

Format of each block: *Je peux…* goals (learner-facing, French) · grammar with the French
contrast · key words · Flemish notes · dialogue · *opdracht* with the teacher · sounds
practised (see §4).

---

#### 1. `kennismaken` — Kennismaken · Faire connaissance · A1 *(done — unchanged)*

- **Je peux…** saluer et prendre congé, poliment ou entre collègues · dire comment je
  m'appelle, d'où je viens et où j'habite · demander à quelqu'un son nom, où il habite et
  comment il va · comprendre une courte présentation dite lentement.
- **G1** present tense singular: *ik woon – u/je/hij woont*. FR: the *-t* is pronounced,
  unlike *j'habite / il habite*.
- **G2** questions: verb first (*Woont u in Gent?*), or question word + verb (*Waar woont u?*);
  *-t* drops after *je* (*Woon je…?*). FR: no *Vous habitez où ?* — the verb always moves up.
- **Words (12):** hallo, goeiedag, dag, hoe gaat het?, goed dank u, tot ziens, ik heet,
  hoe heet u?, aangenaam, ik kom uit, ik woon in, ik spreek een beetje Nederlands.
- **Flemish:** *goeiedag*, *merci*, *alles goed?*, Belgian city names.
- **Dialogue:** meeting a colleague at work (Sofie / Karim).
- **Opdracht:** introduce yourself to the teacher at the coffee machine.
- **Sounds:** g vs h vs k; oe.

#### 2. `getallen-en-tijd` — Getallen en tijd · Les nombres et l'heure · A1

- **Je peux…**
  - comprendre et dire les nombres de 0 à 100, un prix et un numéro de téléphone ;
  - demander et dire l'heure ;
  - dire quel jour on est et quand je travaille ou suis libre ;
  - fixer une heure simple (« à huit heures », « lundi »).
- **G1** *zijn* and *hebben* + the plural persons (*wij, jullie, zij* → stem + *-en*:
  *wij wonen, wij zijn, wij hebben*). FR: only two irregular verbs to learn at this stage,
  and *jullie* = vous (pluriel) is a separate word from *u* = vous (poli).
- **G2** V2: when a time word comes first, verb and subject swap (*Om acht uur begin ik.*
  *Maandag werk ik niet.*). FR: *Lundi, je travaille* — French keeps subject + verb; Dutch
  keeps the verb in 2nd place.
- **Words (≈22 + number/day/month sets):** de getallen 0–100 *(set)*, honderd, duizend,
  hoeveel?, hoe laat is het?, het is … uur, half (*half drie* = 2 h 30), kwart over,
  kwart voor, de minuut, om … uur, vandaag, morgen, gisteren, de dag, de week,
  maandag…zondag *(set)*, het weekend, de maand, januari…december *(set)*, de voormiddag,
  de namiddag, 's avonds, wanneer?, vroeg, laat, mijn nummer is…
- **Flemish:** *voormiddag / namiddag* are Belgian standard (NL: ochtend / middag);
  *kwart na* is heard next to *kwart over*; *'s noens* = à midi (colloquial). Note for a
  Belgian francophone: Dutch says *eenentwintig* (one-and-twenty) — the units come first.
- **Dialogue:** on the phone with a colleague, setting a time to meet; a phone number
  dictated.
- **Opdracht:** the teacher dictates five phone numbers and prices; then you agree a day and
  an hour for your next lesson, in Dutch only.
- **Sounds:** aa / a, ee / e (twee, zeven, elf, acht, twaalf, half).

#### 3. `familie` — Familie en vrienden · La famille et les amis · A1

- **Je peux…**
  - présenter ma famille (nom, âge, où ils habitent) ;
  - demander à quelqu'un s'il a des enfants, des frères et sœurs ;
  - décrire une personne en quelques mots (grand, jeune, gentil) ;
  - comprendre quelqu'un qui me montre des photos de famille.
- **G1** *de / het / een*. Two-thirds of nouns are *de*; *het* has to be learned with the
  word; diminutives are always *het*; every plural is *de*. FR: de/het does not map onto
  le/la — *de man, de vrouw, het kind*; learn the article as part of the word.
- **G2** possessives *mijn, je/jouw, uw, zijn, haar, ons/onze, jullie, hun*. FR: *zijn* = son/sa
  *of him*, *haar* = son/sa *of her* — chosen by the owner, not the thing (*zijn moeder* =
  sa mère à lui).
- **Words (≈24):** de familie, het gezin, de ouders, de vader, de moeder, de broer, de zus,
  het kind / de kinderen, de zoon, de dochter, de man, de vrouw, getrouwd, de vriend,
  de vriendin, de grootouders, de oma / de opa, de tante, de oom, hoe oud ben je?,
  ik ben … jaar, heb je kinderen?, jong, oud, groot, klein, vriendelijk.
- **Flemish:** *nonkel* (= oom), *bomma / bompa* (= oma / opa), *meter / peter* (godparents,
  important in Flemish families), *de zuster* (= zus), *mama / papa* used by adults.
  *Gezin* = household (parents + children), *familie* = the wider family.
- **Dialogue:** a colleague shows photos from a family party.
- **Opdracht:** bring two or three photos; present the people to the teacher and answer his
  questions about them.
- **Sounds:** ij / ee (mijn, zijn, wij); schwa vs ee (ze / zee).

#### 4. `boodschappen` — Boodschappen · Faire les courses · A1

- **Je peux…**
  - demander un produit et une quantité au magasin ;
  - comprendre un prix et payer ;
  - dire ce que je veux et ne veux pas (« celui-ci », « celui-là ») ;
  - répondre à « Anders nog iets? ».
- **G1** noun plurals: *-en* (*de tomaat – de tomaten*), *-s* after
  unstressed *-el, -er, -en, -je* and most loans (*de appels, de bakkers*); open/closed
  syllable spelling (*de boon – de bonen, de kat – de katten*). FR: the plural ending is
  heard; the spelling of the vowel changes, not the vowel.
- **G2** *deze / die* (de-words, plurals), *dit / dat* (het-words). FR: *ce…-ci / ce…-là*,
  but the choice follows de/het, not masculine/feminine.
- **Words (≈24):** de winkel, de supermarkt, de bakker, het brood, de melk, de kaas,
  het vlees, de groenten, het fruit, de appel, de tomaat, de aardappel, het ei / de eieren,
  de fles, een kilo, een pak, hoeveel kost…?, de euro, duur, goedkoop, ik had graag…,
  anders nog iets?, dat is alles, alstublieft, de kassa, betalen.
- **Flemish:** *Ik had graag…* is THE Flemish shop phrase (literally "I had gladly"; NL
  *ik wil graag*) — taught as a chunk; *patatten* (= aardappelen), *de beenhouwer* (= slager),
  *met Bancontact betalen*, *een zakske*, *alstublieft* when handing something over, *merci*.
- **Dialogue:** at the bakery and the till of a small supermarket.
- **Opdracht:** the teacher runs a shop with real items or pictures and prices; you buy a
  shopping list of six things, ask a price and pay.
- **Sounds:** oo / o, oe / oo (brood, boter, kost, koek).

#### 5. `op-cafe` — Op café · Au café · A1

- **Je peux…**
  - commander à boire et à manger dans un café ;
  - demander l'addition et payer, ensemble ou séparément ;
  - dire ce que je ne veux pas (« sans sucre », « pas de lait ») ;
  - comprendre les questions du serveur.
- **G1** modal + infinitive at the end: *Ik wil een koffie. Mag ik de rekening (hebben)?
  Kunt u dat herhalen?* FR: *je veux payer* puts both verbs together; Dutch splits them —
  the infinitive goes to the very end (*Ik wil nu betalen*). First taste of the "bracket".
- **G2** negation: *geen* before a noun with *een* or no article (*geen suiker*), *niet*
  elsewhere (*niet lekker, ik betaal niet*). FR: one *ne…pas*, two Dutch words.
- **Words (≈24):** de koffie, de thee, het water, plat water, spuitwater, het bier,
  een pintje, de wijn (rood / wit), de frisdrank, het broodje, de soep, de kaart, wat neemt u?,
  ik neem…, voor mij…, met melk, zonder suiker, nog een…, de rekening, samen of apart?,
  lekker, mag ik…?, een tafel voor twee, gezondheid / schol!
- **Flemish:** *op café* (NL: in het café), *een pintje* (a draught beer), *een tas koffie*
  (NL kopje), *spuitwater* (NL bruisend water), *Schol!*, *Wablieft?* (= Pardon ?, comment ?).
- **Dialogue:** two friends and a waiter on a terrace in Gent.
- **Opdracht:** the teacher is the waiter; order for yourself and a friend, change one order,
  ask for the bill and split it.
- **Sounds:** ui / eu, ui / ij (thuis, bruin, keuze, wijn).

#### 6. `thuis` — Thuis · À la maison · A1

- **Je peux…**
  - décrire mon logement (pièces, taille, étage) ;
  - dire où se trouvent les choses ;
  - comprendre une petite annonce ou la description d'un appartement ;
  - donner mon adresse.
- **G1** *er is / er zijn* + prepositions *in, op, onder, naast, achter, voor, tussen*. FR:
  *il y a* never changes; *er is* agrees with the noun (*er zijn twee kamers*).
- **G2** adjective *-e*: *het huis is groot – een groot huis – het grote huis – een grote
  kamer*. FR: the ending is not about gender or number of the noun but about de/het and the
  article; no *-e* only with *een* + het-word, or after the verb.
- **Words (≈24):** het huis, het appartement, de kamer, de slaapkamer, de keuken,
  de badkamer, het toilet, de tuin, de deur, het raam, de trap, boven, beneden,
  de verdieping, de tafel, de stoel, de kast, het bed, de zetel, de frigo, groot, klein,
  licht, donker, nieuw, oud, mooi, de buren, het adres.
- **Flemish:** *de zetel* (NL bank = canapé), *de frigo* (NL koelkast), *de living*
  (NL woonkamer), *de lavabo* (NL wastafel), *het kot* (student room), *de gang*.
- **Dialogue:** a friend visits the new flat; video call showing the rooms.
- **Opdracht:** draw a plan of your home; describe it to the teacher, who draws it from your
  words — then compare the two drawings.
- **Sounds:** ou / au vs oe (oud, blauw, goud / goed); eu / uu (deur / duur).

#### 7. `mijn-dag` — Mijn dag · Ma journée · A1

- **Je peux…**
  - raconter ma journée type dans l'ordre ;
  - dire à quelle fréquence je fais quelque chose (toujours, souvent, jamais) ;
  - demander à quelqu'un comment se passe sa journée ;
  - comprendre une description simple de journée.
- **G1** separable verbs: *opstaan → ik sta om zeven uur op; thuiskomen → ik kom om zes uur
  thuis*. FR: no equivalent — the particle goes to the end of the sentence, like the
  infinitive after a modal.
- **G2** reflexive verbs *ik was me, je wast je, hij wast zich*. FR: familiar idea, but the
  pronoun comes after the verb, and some French reflexives are not reflexive in Dutch
  (*se lever = opstaan*, *se promener = wandelen*).
- **Words (≈24):** opstaan, zich wassen, douchen, zich aankleden, ontbijten, het ontbijt,
  vertrekken, beginnen, werken, de middagpauze, thuiskomen, koken, eten, afwassen,
  boodschappen doen, tv kijken, slapen gaan, altijd, meestal, vaak, soms, nooit, eerst,
  dan, daarna, moe.
- **Flemish:** *boterhammen* (the packed bread lunch — a Flemish institution), *'s noens*,
  *de afwas doen*, *goesting hebben* (avoir envie).
- **Dialogue:** two colleagues compare their mornings; one has a baby.
- **Opdracht:** tell the teacher your Monday in eight sentences, then ask him about his;
  find three differences.
- **Sounds:** ie / i (zit / ziet), short u / i (lucht / licht).

#### 8. `onderweg` — Onderweg · En route · A1

- **Je peux…**
  - demander et comprendre un chemin simple ;
  - acheter un billet de train ou de bus ;
  - comprendre une annonce simple en gare (voie, retard) ;
  - dire comment je me déplace.
- **G1** imperative = stem, no subject: *Ga rechtdoor. Neem de tweede straat links.* Polite:
  *Gaat u…* or *alstublieft*. FR: no *-ez* ending — one form for everyone.
- **G2** *gaan* / *moeten* + infinitive at the end: *Ik ga de trein nemen. U moet in Gent
  overstappen.* FR: *je vais prendre* = same idea, but the infinitive goes last.
- **Words (≈25):** de trein, de bus, de tram, het station, het perron, het ticket,
  enkel, heen en terug, de fiets, te voet, de auto, de straat, links, rechts, rechtdoor,
  de hoek, het kruispunt, de halte, vertrekken, aankomen, overstappen, hoe kom ik naar…?,
  ver, dichtbij, de vertraging.
- **Flemish:** *De Lijn* (buses, trams), *NMBS* (trains), *een retour* / *een enkel*,
  *de statie* (colloquial for station). First contact with *ge / gij*: *Ge moet hier
  rechtdoor.* (= je moet) — recognised, not produced yet.
- **Dialogue:** asking the way from Gent-Sint-Pieters to the centre; buying a ticket.
- **Opdracht:** on a real map, the teacher asks you the way to three places from your home
  and you guide him; then buy a return ticket from him.
- **Sounds:** w / v, v / f (Flemish keeps v voiced); first look at final devoicing (*stad*).

---

#### 9. `vrije-tijd` — Vrije tijd · Les loisirs · A2

- **Je peux…**
  - parler de mes loisirs et de ce que j'aime faire ;
  - raconter ce que j'ai fait le week-end dernier ;
  - proposer une activité et réagir à une proposition ;
  - comprendre un programme d'activités (cinéma, sport, sortie).
- **G1** perfect with *hebben*, regular: *ge- + stem + -d/-t* (*'t kofschip*: *gewerkt,
  gespeeld*), participle at the end: *Ik heb gisteren tennis gespeeld.* FR: *j'ai joué* —
  same tense, but the participle goes to the end.
- **G2** *graag / liever / het liefst* with any verb: *Ik lees graag, ik zwem liever, ik fiets
  het liefst.* FR: *aimer / préférer* + infinitive is a different construction; Dutch adds an
  adverb.
- **Words (≈25):** de vrije tijd, de hobby, sporten, fietsen, wandelen, zwemmen, lopen,
  voetballen, lezen, naar muziek luisteren, het concert, de film, uitgaan, op restaurant
  gaan, vrienden zien, de zee / de kust, leuk, saai, plezant, vorig weekend, wat heb je
  gedaan?, ik heb … gespeeld, samen, zin hebben in, zalig.
- **Flemish:** *plezant*, *zalig*, *naar de cinema* (NL bioscoop), *op restaurant gaan*,
  *naar de kust* (Belgian coast), *goesting hebben om…*.
- **Dialogue:** Monday morning, two colleagues talk about their weekend.
- **Opdracht:** tell the teacher about last weekend (at least five verbs in the perfect);
  he asks follow-up questions; then plan something for next weekend together.
- **Sounds:** word stress (Dutch stresses the first syllable, French the last); unstressed
  *ge-*.

#### 10. `bij-de-dokter` — Bij de dokter · Chez le médecin · A2

- **Je peux…**
  - prendre rendez-vous chez le médecin par téléphone ;
  - dire où j'ai mal et depuis quand ;
  - expliquer ce qui m'est arrivé ;
  - comprendre une posologie simple à la pharmacie.
- **G1** perfect with *zijn* (movement to a place, change of state, *zijn, worden, blijven*:
  *Ik ben gevallen. Ik ben ziek geworden.*) + the common irregular participles (*geweest,
  gehad, gegeten, gedaan, gezien, gekomen, gegaan*). FR: the *être* list overlaps but not
  fully — *j'ai été malade = ik ben ziek geweest*.
- **G2** object pronouns *me, je, u, hem, haar, ons, jullie, ze* after the verb: *Ik zie hem
  morgen. Kunt u me helpen?* FR: *je le vois* puts the pronoun before the verb; Dutch never.
- **Words (≈25):** de huisarts, de afspraak, het lichaam, het hoofd, de keel, de buik,
  de rug, de arm, het been, de voet, de hand, pijn hebben aan, ziek, de koorts, hoesten,
  verkouden, de griep, de apotheek, het geneesmiddel, het voorschrift, sinds wanneer?,
  wat scheelt er?, beter worden, drie keer per dag, het ziektebriefje.
- **Flemish:** *Wat scheelt er?* (= qu'est-ce qui ne va pas ?), *het voorschrift* (NL recept),
  *de mutualiteit / het ziekenfonds*, *ik heb de valling* (dialect for a cold), *het
  doktersbriefje*.
- **Dialogue:** phone call to the practice, then the consultation.
- **Opdracht:** the teacher is the doctor; you phone for an appointment, then explain a
  (pretend) fall last weekend and understand his instructions.
- **Sounds:** final devoicing (*hand, hoofd* end in [t]); *-d / -t* in participles.

#### 11. `kleren` — Kleren kopen · Acheter des vêtements · A2

- **Je peux…**
  - demander une taille, une couleur, essayer un vêtement ;
  - comparer deux articles (plus grand, moins cher, le plus beau) ;
  - dire si quelque chose me va et me plaît ;
  - rapporter un article et demander un échange.
- **G1** comparative *-er (dan)*, superlative *het -st*: *groter dan, het goedkoopst; goed –
  beter – best; veel – meer – meest*. FR: an ending, not *plus*; *dan* = que.
- **G2** pronouns for things: de-word → *hem* (*Ik neem hem* — de jas), het-word → *het*,
  plural → *ze*. FR: *le / la* follows gender; Dutch follows de/het.
- **Words (≈24):** de kleren, de broek, het hemd, de pull, de jas, de rok, het kleed,
  de schoenen, de maat, passen, de paskamer, staan (*het staat u goed*), te groot, te klein,
  de kleur, rood, blauw, zwart, wit, grijs, groen, de solden, de korting, ruilen,
  het kasticket.
- **Flemish:** *het kleed* (= robe; NL jurk — in NL *kleed* is a rug!), *de pull*
  (NL trui), *het hemd* (NL overhemd), *de solden*, *het kasticket* (NL bonnetje). In
  careful Flemish, feminine de-words take *ze/haar* (*de deur – ik sluit ze*); *hem* for all
  de-words is correct and is what is taught.
- **Dialogue:** in a clothes shop during the *solden*.
- **Opdracht:** with the teacher as shop assistant (or in a real shop together), buy one item
  after comparing two, then bring it "back" and exchange it.
- **Sounds:** schwa and the dropped *-n* (*grote, kleine, broeken*).

#### 12. `op-het-werk` — Op het werk · Au travail · A2

- **Je peux…**
  - décrire mon travail, mes tâches et mon horaire ;
  - expliquer pourquoi je fais quelque chose ;
  - participer à une conversation simple entre collègues (pause, réunion) ;
  - comprendre un court e-mail de travail.
- **G1** *en, maar, want, of, dus* join two main clauses and change nothing: *Ik werk thuis,
  want ik ben ziek.* FR: like *et, mais, car, ou, donc*.
- **G2** subordinate clauses with *dat, omdat* (and *als* = if): the verb goes to the end
  (*Ik werk thuis omdat ik ziek ben. Ik denk dat hij komt.*). FR: *parce que je suis malade*
  keeps the order; Dutch moves the verb to the end — *want* and *omdat* mean the same and
  differ only in word order, which makes the rule easy to see.
- **Words (≈25):** het werk, de job, het kantoor, de collega, de chef, de vergadering,
  de mail, de klant, de afdeling, het project, voltijds, deeltijds, thuiswerken, de pauze,
  het verlof, druk, bezig zijn met, beginnen, stoppen, de computer, verantwoordelijk,
  omdat, want, ik denk dat, ik vind dat.
- **Flemish:** *de job*, *de chef*, *verlof* (= vacances d'un salarié), *bediende*
  (employé·e), *een fulltime / een halftijdse job*, *'t is druk*.
- **Dialogue:** first day: a colleague explains the team and the rhythm of the week.
- **Opdracht:** explain your real job to the teacher (what, where, with whom, why you like or
  don't like part of it), with at least three *omdat / dat* sentences.
- **Sounds:** sentence intonation (statements fall, yes/no questions rise); linking.

#### 13. `afspraken` — Afspreken · Prendre rendez-vous · A2

- **Je peux…**
  - inviter quelqu'un, accepter et refuser poliment ;
  - proposer, déplacer ou annuler un rendez-vous ;
  - dire une date complète ;
  - laisser un message court au téléphone ou par SMS.
- **G1** *zullen*: proposal (*Zullen we morgen afspreken?*) and promise/future (*Ik zal je
  bellen*); *moeten* vs *niet hoeven (te)*. FR: *on se voit demain ?* ≈ *zullen we…?*;
  *il ne faut pas* vs *pas besoin de*.
- **G2** dates, ordinals and time prepositions: *op maandag, op 3 mei, in mei, om drie uur,
  van … tot, vanaf, de eerste, de tweede, de derde, de achtste*. FR: *le lundi, en mai, à
  trois heures* — different prepositions; learn them as chunks.
- **Words (≈24):** uitnodigen, de uitnodiging, het feest, de verjaardag, zin hebben, zullen we…?,
  past het?, dat past (niet), afspreken, afgesproken!, afzeggen, verplaatsen, de agenda,
  overmorgen, volgende week, de datum, de eerste…, bellen, het berichtje, jammer, graag,
  ik kan niet, misschien, tot dan.
- **Flemish:** *Hebt ge goesting?*, *Afgesproken!*, *'t is goed*, *Allee, tot dan!*,
  *sms'en*. Important: in Flanders *je moet niet komen* commonly means "you don't have to
  come" (NL: *je hoeft niet te komen*); both are taught, the Flemish one for recognition.
- **Dialogue:** a voice message and a call to move a dinner.
- **Opdracht:** by phone or message, invite the teacher to something real; he refuses the
  first date, you find another one.
- **Sounds:** numbers and dates at speed (recycle aa/a, ee/e, ij); *-de / -ste*.

#### 14. `eten-en-koken` — Eten en koken · Manger et cuisiner · A2

- **Je peux…**
  - comprendre et suivre une recette simple ;
  - dire ce que j'aime manger et ce que je ne mange pas ;
  - parler des repas et des habitudes alimentaires en Belgique ;
  - commander au restaurant et réagir au plat.
- **G1** diminutives *-je, -tje, -pje, -etje* (*het broodje, het kopje, het pintje*), always
  *het*. FR: *-ette* exists but is rare; in Dutch the diminutive is everyday and often just
  means "a nice little…".
- **G2** *er* + number: *Hoeveel uien heb je? Ik heb er drie.* FR: exactly *j'en ai trois* —
  *er* = *en* here.
- **Words (≈25):** koken, het recept, de pan, de oven, snijden, bakken, toevoegen, roeren,
  het zout, de peper, de boter, de olie, de ui, de look, de wortel, de rijst, de frieten,
  het gerecht, het middageten, het avondeten, vegetarisch, de saus, een stuk, smakelijk!,
  het smaakt.
- **Flemish:** the spoken diminutive is *-ke* (*een koffieke, een pintje / pintske*);
  *de look* (NL knoflook), *frieten, het frietkot, stoofvlees*, *smakelijk!*,
  *warm eten 's middags*.
- **Dialogue:** cooking stoofvlees with a Flemish friend who gives instructions.
- **Opdracht:** explain a recipe from your own family to the teacher, step by step with the
  imperative — or cook something simple together and narrate it.
- **Sounds:** recycle ui / ij / eu; *-tje* [tjə] and *-ke*.

#### 15. `het-weer` — Het weer · Le temps qu'il fait · A2

- **Je peux…**
  - parler du temps qu'il fait et qu'il a fait ;
  - comprendre une météo simple à la radio ;
  - décrire les saisons et ce que j'y fais ;
  - faire la conversation (« small talk ») sur le temps.
- **G1** imperfect, regular: *-te(n) / -de(n)* (*'t kofschip* again: *werkte, woonde*) +
  *was / waren, had / hadden*. FR: like the *imparfait* for states (*het was koud* = il
  faisait froid).
- **G2** *worden* = devenir, and for weather changes: *Het wordt koud. Hij wordt dokter.*
  FR: *il va faire froid / il devient médecin*.
- **Words (≈24):** het weer, de zon, de regen, het regent, de wind, het waait, de sneeuw,
  het sneeuwt, de wolk, bewolkt, het onweer, warm, koud, fris, nat, droog, de graden,
  de lente, de zomer, de herfst, de winter, het weerbericht, de paraplu, gisteren was het…
- **Flemish:** *'t is wreed koud* (*wreed* = very, colloquial), *'t is fris vandaag*,
  *een miezerige dag*, *de weerman / weervrouw* on VRT.
- **Dialogue:** at the bus stop, rain; radio weather forecast.
- **Opdracht:** compare today's real weather with last week's, and the weather in your
  childhood place, with the teacher.
- **Sounds:** recycle w / v (*wind / vind*, *weer*); final devoicing (*het werd / ze werden*).

#### 16. `vroeger` — Vroeger · Autrefois · A2

- **Je peux…**
  - raconter mon enfance et mon parcours ;
  - décrire comment c'était avant (école, maison, habitudes) ;
  - comparer avant et maintenant ;
  - comprendre quelqu'un qui raconte un souvenir.
- **G1** imperfect of irregular verbs (*ging, kwam, zag, deed, at, kon, wou/wilde, moest*).
  FR: as with French *passé simple*, the forms just have to be learned — but these are
  common.
- **G2** perfect vs imperfect. FR: close to *passé composé / imparfait* (habits and
  background → imperfect), but spoken Dutch uses the perfect for most single events, even in
  a story.
- **Words (≈24):** vroeger, als kind, de jeugd, opgroeien, het dorp, verhuizen, de school,
  de juf, de meester, spelen, het speelgoed, de vakantie, toen, jaren geleden, ik herinner me,
  de herinnering, ik woonde, ik ging, ik had, ik was, nu, sindsdien, veranderen, missen.
- **Flemish:** *de juf / de meester* (primary-school teachers), *de lagere school*,
  *het middelbaar*, *wou* (more common than *wilde* in Flanders).
- **Dialogue:** a grandmother tells her granddaughter about her childhood.
- **Opdracht:** bring a childhood photo; tell the teacher about it; he tells you about his.
- **Sounds:** ij / ee in the past forms (*kijk / keek, blijf / bleef*).

#### 17. `huren` — Een woning huren · Louer un logement · A2

- **Je peux…**
  - comprendre une petite annonce de location ;
  - téléphoner pour visiter un appartement et poser des questions ;
  - comprendre l'essentiel d'un bail (loyer, garantie, charges) ;
  - signaler un problème au propriétaire.
- **G1** relative *die* (de-words, plurals) and *dat* (het-words), verb last: *de flat die ik
  huur, het huis dat te koop staat*. FR: *qui / que* depends on subject/object; Dutch depends
  on de/het.
- **G2** separable verbs in the perfect and in subordinate clauses: *Hij heeft opgebeld. …
  omdat hij morgen terugbelt.* FR: none — the particle sticks to the verb again
  (*opgebeld, terugbelt*).
- **Words (≈25):** huren, de huur, de huurprijs, de eigenaar, het huurcontract,
  de waarborg, de kosten, de verwarming, de elektriciteit, het gas, gemeubeld, de lift,
  het gelijkvloers, de eerste verdieping, de buurt, het zoekertje, het immokantoor,
  bezichtigen, kapot, herstellen, lekken, de loodgieter, opbellen, terugbellen, vrij.
- **Flemish:** *de (huur)waarborg* (NL borg), *het gelijkvloers* (NL begane grond),
  *het zoekertje* (petite annonce), *het immokantoor*, *herstellen* (NL repareren),
  *de chauffage*.
- **Dialogue:** call to an immokantoor, then the visit.
- **Opdracht:** pick a real ad from a Flemish property site; phone the teacher (as the
  owner), ask five questions and make an appointment.
- **Sounds:** recycle oe / ou / ui; stress in separable verbs (*OPbellen, TERUGbellen*).

#### 18. `de-gemeente` — Op de gemeente · À la commune · A2

- **Je peux…**
  - faire une démarche administrative simple (adresse, carte d'identité, attestation) ;
  - demander poliment un renseignement à un guichet ;
  - remplir un formulaire simple ;
  - comprendre les instructions d'un employé.
- **G1** indirect questions: *Weet u waar het loket is? Ik vraag of het open is.* — verb
  last; *of* = si. FR: *Savez-vous où est le guichet ?* — French can invert, Dutch sends the
  verb to the end.
- **G2** polite *zou(den)…*: *Zou u dat kunnen herhalen? Ik zou graag een afspraak maken.*
  FR: same idea as *pourriez-vous / je voudrais*.
- **Words (≈25):** het gemeentehuis, het stadhuis, het loket, het nummertje, de wachtrij,
  de identiteitskaart, het rijksregisternummer, het formulier, invullen, ondertekenen,
  de handtekening, het attest, het bewijs, aanvragen, de adreswijziging, de domicilie,
  de bank, de rekening, de overschrijving, het postkantoor, het pakje, de brief, kunt u me
  helpen?, zou u…?, weet u waar…?
- **Flemish/Belgian:** *het attest* (NL verklaring), *de domicilie*, *het
  rijksregisternummer*, *de wijkagent* (comes to check a new address), *de bediende*.
- **Dialogue:** registering a change of address at the town hall counter.
- **Opdracht:** do (or role-play) a real errand with the teacher as the clerk, starting from
  a real form of your commune.
- **Sounds:** connected speech: *weet u* → [weːty], *heb je* → [hɛpjə].

---

#### 19. `gezond-leven` — Gezond leven · Vivre sainement · B1

- **Je peux…**
  - parler de mes habitudes de santé et de ce que je voudrais changer ;
  - comprendre et donner des conseils de santé ;
  - expliquer un souci (stress, sommeil) et ce qui m'aide ;
  - comprendre un court article de prévention.
- **G1** verbs with a fixed preposition: *wachten op, denken aan, zich ergeren aan, zorgen
  voor, stoppen met, deelnemen aan*. FR: the prepositions do not translate (*penser à =
  denken aan* but *attendre qqn = wachten op*); learn them as units.
- **G2** *er* + preposition (and *waar* + preposition): *Ik denk eraan. Waarop wacht je?
  Daar ben ik mee gestopt.* FR: like *y / en* (*j'y pense*), but the preposition is split
  off and goes to the end.
- **Words (≈25):** gezond, ongezond, bewegen, de beweging, de voeding, het gewicht, afvallen,
  de stress, zich ontspannen, de slaap, slecht slapen, de gewoonte, het advies, aanraden,
  vermijden, voldoende, stoppen met roken, zich zorgen maken over, zich ergeren aan,
  de kinesist, de diëtist, het ziekenhuis, de spoed, de wachtzaal, verzorgen.
- **Flemish/Belgian:** *de kiné / de kinesist* (NL fysiotherapeut), *de spoed*
  (= les urgences), *de wachtzaal* (NL wachtkamer).
- **Dialogue:** a radio phone-in about sleep and stress.
- **Opdracht:** give the teacher advice on a real health habit he wants to change, and
  explain one of your own.
- **Sounds:** g / ch in clusters (*gezond, slecht, gewicht*); *-ig* [əx].

#### 20. `werk-zoeken` — Werk zoeken · Chercher du travail · B1

- **Je peux…**
  - comprendre une offre d'emploi ;
  - présenter mon parcours, mes compétences et mes motivations ;
  - répondre aux questions d'un entretien d'embauche ;
  - écrire un court e-mail de candidature.
- **G1** *te* + infinitive after many verbs, *om … te* for purpose: *Ik probeer Nederlands te
  leren. Ik leer Nederlands om in Gent te werken.* FR: *essayer de / pour + infinitif*;
  Dutch puts *te* + infinitive at the end.
- **G2** double infinitive in the perfect: *Ik heb moeten werken. Ik heb het niet kunnen
  doen.* FR: *j'ai dû travailler* — Dutch uses the infinitive, not a participle, when a
  modal has another verb.
- **Words (≈25):** de vacature, solliciteren, de sollicitatie, het cv, de motivatiebrief,
  het sollicitatiegesprek, de ervaring, het diploma, de opleiding, de vaardigheid,
  de sterke punten, de werkgever, de werknemer, het loon, het contract, beschikbaar,
  de stage, het interimkantoor, de VDAB, ervaring hebben met, verantwoordelijk zijn voor,
  zich voorstellen, waarom wilt u…?, gemotiveerd, de kans.
- **Flemish/Belgian:** *de VDAB* (Flemish employment agency), *het loon* (NL salaris also
  used), *een interimjob*, *een vast contract / bepaalde duur*.
- **Dialogue:** a job interview for a post in a Flemish organisation.
- **Opdracht:** a 10-minute mock interview with the teacher for a real vacancy you choose;
  he gives feedback on content and language.
- **Sounds:** stress in long words and compounds: the compound keeps the main stress of its
  first member (*sollici**TA**tiegesprek*, ***WERK**gever*); see §4.3, word stress.

#### 21. `school` — School en opleiding · L'école et la formation · B1

- **Je peux…**
  - comprendre et expliquer le système scolaire flamand ;
  - parler avec un enseignant d'un enfant (bulletin, devoirs, comportement) ;
  - comprendre une lettre ou un message de l'école ;
  - parler de ma propre formation et de mes projets d'apprentissage.
- **G1** passive with *worden*: *De brief wordt verstuurd. Het feest werd georganiseerd door de
  ouders.* FR: *être + participe* → Dutch uses *worden*, not *zijn*, for the action.
- **G2** relative with preposition: *de school waar mijn zoon naartoe gaat, de juf met wie ik
  gesproken heb, het lokaal waarin…* FR: *où / avec qui / dans lequel*; *waar* + preposition
  replaces *dont / lequel* for things.
- **Words (≈25):** de kleuterschool, de lagere school, het secundair onderwijs,
  de hogeschool, de universiteit, de leerkracht, de directeur, de klas, het rapport,
  de punten, het oudercontact, het huiswerk, de examens, slagen, buizen, inschrijven,
  de inschrijving, de opvang, de speeltijd, de turnles, de boekentas, de cursus,
  het diploma, leren, studeren.
- **Flemish:** *de punten* (NL cijfers), *buizen* (= rater, NL zakken), *het oudercontact*,
  *de speeltijd* (= récréation), *de boekentas*, *turnen*, *de cursus* (= syllabus).
- **Dialogue:** a parent–teacher meeting (*oudercontact*).
- **Opdracht:** explain to the teacher the school system in your country and compare it with
  the Flemish one; or role-play an *oudercontact*.
- **Sounds:** recycle short u / uu / eu (*buizen, punten, huiswerk, leuk*).

#### 22. `nieuws` — Het nieuws · L'actualité · B1

- **Je peux…**
  - comprendre l'essentiel d'un journal télévisé simple ou d'un article de Wablieft ;
  - rapporter ce que quelqu'un a dit ;
  - résumer une information en quelques phrases ;
  - donner une première réaction à une nouvelle.
- **G1** indirect speech: *Hij zegt dat de trein later komt. Ze vroeg of ik kwam.* — verb last,
  tense shifts as in French. FR: *il dit que / elle a demandé si* — same logic, Dutch word
  order.
- **G2** passive perfect and impersonal passive: *De school is gesloten* (*a été fermée* —
  no *geweest*!), *Er wordt gestaakt.* FR: *a été + participe* → *is + participe*; *on fait
  grève* → *er wordt gestaakt*.
- **Words (≈25):** het nieuws, het journaal, de krant, het artikel, de journalist, de kop,
  de radio, online, het bericht, de regering, de minister, de verkiezingen, de partij,
  het gewest, de gemeenschap, het land, de staking, staken, volgens, melden, beweren,
  ontkennen, het onderwerp, het ongeval, de gevolgen.
- **Belgian:** *het gewest / de gemeenschap* (the two layers of Belgian federalism),
  *VRT NWS*, *het journaal*, *de staking* (frequent!), *het ongeval* (NL ongeluk).
- **Dialogue:** two friends discuss a news item they heard on the radio.
- **Opdracht:** read one Wablieft article; summarise it to the teacher in five sentences,
  report one quote indirectly, and say what you think.
- **Sounds:** listening to news-speed Dutch: reductions (*'t, 'k, d'r*).

#### 23. `op-reis` — Op reis · En voyage · B1

- **Je peux…**
  - organiser un voyage (réserver, se renseigner, modifier) ;
  - régler un problème en voyage (bagage perdu, retard, annulation) ;
  - raconter un voyage passé avec ses détails ;
  - parler de ce que je ferais si…
- **G1** pluperfect *had / was + participle*: *Ik had al geboekt. De trein was al vertrokken.*
  FR: = *plus-que-parfait*, same choice of auxiliary as the perfect.
- **G2** conditional: *Als ik tijd had, zou ik naar Spanje gaan.* FR: *si j'avais… j'irais* —
  same tenses, but the main clause starts with the verb because the *als*-clause takes
  first place (*…, zou ik…*).
- **Words (≈25):** de reis, op reis gaan, boeken, reserveren, annuleren, het hotel,
  de jeugdherberg, de camping, het vliegtuig, de luchthaven, de vlucht, de valies,
  de bagage, het paspoort, het verblijf, de bezienswaardigheid, het uitzicht, de gids,
  de reisverzekering, het buitenland, de grens, verloren, gestolen, de vertraging,
  de terugreis.
- **Flemish:** *de valies* (NL koffer), *op reis / op vakantie*, *Zaventem* (= the airport),
  *een citytrip*.
- **Dialogue:** at an airline desk: lost suitcase.
- **Opdracht:** tell the teacher about your best or worst trip (pluperfect for what had
  happened before); then plan an imaginary dream trip (*als…, zou…*).
- **Sounds:** recycle v / f, z / s (*valies, verloren, zee*).

#### 24. `meningen` — Mijn mening · Donner son avis · B1

- **Je peux…**
  - donner mon avis et le justifier ;
  - dire que je suis d'accord ou pas, avec nuance ;
  - peser le pour et le contre ;
  - participer à une discussion simple sur un sujet de société.
- **G1** two kinds of connectors: adverbs that take the first place and cause inversion
  (*daarom ga ik, toch doe ik het, bovendien is het, nochtans…*) vs conjunctions that send the
  verb to the end (*hoewel ik…, terwijl hij…, zodat we…*). FR: *c'est pourquoi / pourtant /
  bien que* — the meanings are easy; the word order is the skill.
- **G2** modal particles *wel, toch, eens, maar, even, hoor, zeker*: *Kom maar binnen. Dat is
  toch duidelijk? Kijk eens.* FR: like *donc, quand même, hein, un peu* — they soften and
  colour; untranslatable one-to-one.
- **Words (≈25):** de mening, vinden, volgens mij, het eens zijn met, akkoord, het voordeel,
  het nadeel, enerzijds, anderzijds, daarom, toch, nochtans, hoewel, terwijl, zodat,
  bovendien, eigenlijk, inderdaad, het argument, overtuigen, de oplossing, belangrijk,
  dat klopt, dat hangt ervan af, ik twijfel.
- **Flemish:** *akkoord!* (NL mee eens), *nochtans* (Belgian, = pourtant), *zeker?*
  (= n'est-ce pas ?), *allee*, *ja maar*, *bon* (borrowed from French).
- **Dialogue:** a debate at the dinner table: should cars be banned from the city centre?
- **Opdracht:** the teacher defends one side of a topic you choose; you defend the other for
  ten minutes, then you swap sides.
- **Sounds:** sentence stress and contrastive stress (*IK vind dat niet*).

#### 25. `feesten` — Feesten en tradities · Fêtes et traditions · B1

- **Je peux…**
  - parler des fêtes et traditions belges et flamandes ;
  - féliciter, souhaiter et remercier dans les bonnes formules ;
  - comparer avec les traditions de mon pays ;
  - comprendre une invitation ou un faire-part.
- **G1** adjectives as nouns and *iets / niets + -s*: *de ouderen, het leuke is dat…, iets
  nieuws, niets bijzonders*. FR: *les anciens, le bon côté, quelque chose de nouveau* — Dutch
  adds *-s* instead of *de*.
- **G2** verb clusters at the end of a subordinate clause: *…dat hij heeft moeten werken,
  …omdat ze zal komen.* FR: no equivalent. Flemish speakers often put the participle first
  (*…dat hij gewerkt heeft*) where NL prefers *heeft gewerkt*; both are correct.
- **Words (≈24):** het feest, vieren, de verjaardag, Sinterklaas, Kerstmis, Nieuwjaar,
  Pasen, de communie, het lentefeest, het huwelijk, trouwen, de kermis, de carnaval,
  de stoet, de traditie, het cadeau, wensen, de wens, proficiat!, gelukkige verjaardag!,
  zalig kerstfeest, gelukkig nieuwjaar, de gewoonte, de rommelmarkt.
- **Flemish/Belgian:** *Proficiat!* (NL gefeliciteerd), *Zalig Kerstfeest / Zalig Pasen*,
  new-year wishes all of January, *de communie / het lentefeest*, *11 juli* (Flemish
  community day), *de kermis*, *de meter / peter* (recycled from theme 3).
- **Dialogue:** a colleague explains Sinterklaas to a newcomer.
- **Opdracht:** present a feast from your country to the teacher (what, when, how, why it
  matters), and ask him about one Flemish feast.
- **Sounds:** recycle ij / ei homophones (*wij / wei*), *-ig* (*zalig, gelukkig*).

#### 26. `klachten` — Een klacht · Se plaindre, régler un problème · B1

- **Je peux…**
  - signaler un problème et demander une solution, oralement et par écrit ;
  - insister poliment ;
  - comprendre une réponse officielle (garantie, remboursement) ;
  - écrire un e-mail de réclamation clair.
- **G1** *laten*: causative and "let": *Ik laat de wasmachine herstellen. Laat me even
  nadenken.* FR: *faire réparer / laisser* — one verb for both.
- **G2** softening and formal register: *eigenlijk, misschien, even, zou… kunnen*; letter
  formulas *Geachte heer/mevrouw, Met vriendelijke groeten*. FR: *Madame, Monsieur… Veuillez
  agréer* is far heavier — Dutch formal mail is short and direct.
- **Words (≈25):** de klacht, klagen, het probleem, kapot, defect, het werkt niet,
  de garantie, de herstelling, de technieker, terugbetalen, de terugbetaling, ruilen,
  de klantendienst, de factuur, de levering, te laat, beschadigd, teleurgesteld,
  de oplossing, dringend, het spijt me, het is niet de bedoeling dat…, opvolgen, binnen
  de week, het dossiernummer.
- **Flemish:** *de herstelling* (NL reparatie), *de technieker* (NL technicus),
  *de factuur*, *binnen de week*.
- **Dialogue:** a call to a customer service about a washing machine.
- **Opdracht:** write a real or realistic complaint e-mail (8–10 sentences); then phone the
  teacher, who plays a not very helpful customer-service agent.
- **Sounds:** politeness intonation; recycle all vowels in fast speech.

#### 27. `milieu` — Natuur en milieu · Nature et environnement · B1

- **Je peux…**
  - parler de ce que je fais pour l'environnement ;
  - comprendre les règles de tri des déchets de ma commune ;
  - discuter d'une mesure écologique (pour, contre) ;
  - décrire un paysage ou une promenade.
- **G1** passive with a modal: *Het afval moet gesorteerd worden. Dat kan gerecycleerd
  worden.* FR: *doit être trié* → *moet gesorteerd worden* (*worden* last).
- **G2** review of the four uses of *er*: place (*ik woon er*), number (*ik heb er twee*),
  with a preposition (*ik denk eraan*), and "dummy" subject (*er is…, er wordt…*). FR: *y, en,
  il y a* cover three of them.
- **Words (≈25):** de natuur, het milieu, het klimaat, de opwarming, het afval, sorteren,
  de PMD-zak, het GFT, het recyclagepark, de vervuiling, de energie, besparen,
  de zonnepanelen, duurzaam, het openbaar vervoer, beschermen, verspillen, verminderen,
  de maatregel, het bos, de rivier, het dier, de plant, de wandeling, het landschap.
- **Flemish/Belgian:** *PMD* (plastic, metal, drink cartons), *GFT* (compost),
  *het recyclagepark* (NL milieustraat), *gerecycleerd* (NL gerecycled).
- **Dialogue:** neighbours argue about the sorting of rubbish.
- **Opdracht:** explain to the teacher how sorting works where you live, and argue for or
  against one local environmental measure.
- **Sounds:** recycle g / ch / k and h.

#### 28. `een-verhaal` — Een verhaal vertellen · Raconter une histoire · B1

- **Je peux…**
  - raconter un événement vécu de façon claire et vivante, dans l'ordre ;
  - situer les événements les uns par rapport aux autres (avant, pendant, après) ;
  - réagir à l'histoire de quelqu'un ;
  - comprendre une histoire racontée à l'oral, dans ses grandes lignes.
- **G1** time conjunctions *toen* (one event in the past), *als / wanneer* (present, future,
  repeated), *nadat, voordat, zodra, terwijl, sinds, totdat*. FR: *quand* splits into three
  Dutch words; *toen* is the most common error.
- **G2** subordinate clause first → the main clause starts with its verb: *Toen ik thuiskwam,
  ging de telefoon.* FR: *Quand je suis rentré, le téléphone a sonné* — Dutch keeps the verb
  in second place, counting the whole subordinate clause as place one. Capstone of the V2
  thread that began in theme 2.
- **Words (≈25):** het verhaal, gebeuren, plots, ineens, eerst, toen, daarna, uiteindelijk,
  nadat, voordat, zodra, terwijl, sinds, totdat, het ongeval, de politie, de getuige,
  schrikken, opletten, gelukkig, jammer genoeg, raar, achteraf, amai!, echt waar?
- **Flemish:** *plots* (NL plotseling), *amai!* (= waouh / aïe), *allee!*, *awel*,
  *echt waar?*
- **Dialogue:** a friend tells how she missed her train and ended up at a wedding.
- **Opdracht:** tell the teacher a true story from your life in 3–4 minutes without notes;
  he interrupts with questions. This is the B1 final task — record it and compare with your
  recording from theme 1.
- **Sounds:** full review: the learner's personal weak contrasts from the trainer's history.

---

## 3. Grammar progression

Order of introduction. *Recycled in* = later themes whose dialogues and exercises must use the
point on purpose.

| # | Point | Theme | French-speaker contrast | Recycled in |
|---|---|---|---|---|
| 1 | Present tense singular, *-t* | 1 kennismaken | *-t* is heard | all |
| 2 | Questions: inversion, *wh*-word + verb | 1 | no *Vous habitez où ?* | all |
| 3 | *zijn, hebben*; plural persons *-en* | 2 getallen-en-tijd | *jullie* ≠ *u* | all |
| 4 | **V2 word order**: inversion after time/place first | 2 | *Lundi, je…* keeps S-V | 7, 12, 24, 28 |
| 5 | **de / het / een** | 3 familie | not masc/fem | 4, 6, 11, 14, 17 |
| 6 | Possessives | 3 | *zijn/haar* by owner | 10, 16 |
| 7 | Noun plurals *-en / -s*; open/closed syllable spelling | 4 boodschappen | vowel spelling changes | 6, 11, 14 |
| 8 | *deze / die / dit / dat* | 4 | follows de/het | 11, 17 |
| 9 | Modal verbs *willen, mogen, kunnen* + infinitive at the end | 5 op-cafe | *je veux payer* together | 8, 13, 18, 20, 27 |
| 10 | Negation *niet / geen* | 5 | two words for *ne…pas* | all |
| 11 | *er is / er zijn*; place prepositions | 6 thuis | *il y a* is invariable | 14, 19, 27 |
| 12 | Adjective *-e* | 6 | rule = article + de/het | 11, 15, 25 |
| 13 | **Separable verbs** | 7 mijn-dag | none in French | 8, 9, 17 |
| 14 | Reflexive verbs | 7 | pronoun after verb; *se lever = opstaan* | 10, 19 |
| 15 | Imperative | 8 onderweg | one form, no *-ez* | 14, 26 |
| 16 | *gaan / moeten* + infinitive | 8 | infinitive last | 13, 20 |
| 17 | **Perfect with *hebben***, regular, *'t kofschip* | 9 vrije-tijd | participle last | all from 9 |
| 18 | *graag / liever / het liefst* | 9 | adverb, not *aimer* | 11, 14 |
| 19 | **Perfect with *zijn***; irregular participles | 10 bij-de-dokter | *j'ai été = ik ben geweest* | all from 10 |
| 20 | Object pronouns | 10 | after the verb | 11, 13, 26 |
| 21 | Comparative, superlative | 11 kleren | ending, not *plus* | 15, 24 |
| 22 | Pronouns for things *hem / het / ze* | 11 | follows de/het | 14, 26 |
| 23 | Coordinating *en, maar, want, of, dus* | 12 op-het-werk | as in French | all |
| 24 | **Subordinate clause: verb last** (*dat, omdat, als*) | 12 | *parce que je suis* | 13–28 |
| 25 | *zullen*; *moeten* vs *niet hoeven (te)* | 13 afspraken | Flemish *moet niet* = *hoeft niet* | 18, 23 |
| 26 | Dates, ordinals, time prepositions | 13 | *le lundi / en mai* | 16, 22 |
| 27 | Diminutives | 14 eten-en-koken | always *het*; Flemish *-ke* | 15, 25 |
| 28 | *er* + number | 14 | = *en* | 27 |
| 29 | **Imperfect**, regular; *was, had* | 15 het-weer | ≈ *imparfait* for states | 16, 22, 23, 28 |
| 30 | *worden* | 15 | *devenir / il va faire* | 21, 22, 27 |
| 31 | Imperfect, irregular | 16 vroeger | learn like *passé simple* forms | 22, 23, 28 |
| 32 | Perfect vs imperfect | 16 | spoken Dutch prefers the perfect | 23, 28 |
| 33 | Relative *die / dat* | 17 huren | depends on de/het, not subject/object | 21, 22, 25 |
| 34 | Separable verbs in perfect and subordinate clauses | 17 | particle rejoins | 20, 28 |
| 35 | Indirect questions (*of, waar, wanneer…*) | 18 de-gemeente | verb last; *of* = *si* | 22, 26 |
| 36 | Polite *zou(den)* | 18 | *pourriez-vous* | 23, 26 |
| 37 | Prepositional verbs | 19 gezond-leven | prepositions don't translate | 20–28 |
| 38 | *er / waar* + preposition | 19 | ≈ *y / en*, split preposition | 21, 24, 27 |
| 39 | *(om) te* + infinitive | 20 werk-zoeken | *essayer de / pour* | 24, 26, 27 |
| 40 | Double infinitive in the perfect | 20 | *j'ai dû travailler* | 23, 25, 28 |
| 41 | Passive present and past (*worden*) | 21 school | *être* → *worden* | 22, 27 |
| 42 | Relative with preposition (*waar, met wie, waarin*) | 21 | *où / dont / lequel* | 24, 27 |
| 43 | Indirect speech | 22 nieuws | same logic, verb last | 24, 28 |
| 44 | Passive perfect; impersonal *er wordt* | 22 | *a été* → *is* | 27 |
| 45 | Pluperfect | 23 op-reis | = *plus-que-parfait* | 28 |
| 46 | Conditional *als…, zou…* | 23 | inversion after the *als*-clause | 24, 26 |
| 47 | Connectors: adverb (inversion) vs conjunction (verb last) | 24 meningen | *pourtant / bien que* | 25–28 |
| 48 | Modal particles | 24 | *donc, quand même, hein* | 25–28 |
| 49 | Adjectives as nouns; *iets nieuws* | 25 feesten | *quelque chose de* | 27 |
| 50 | Verb clusters at the end | 25 | none; Flemish order variant | 26–28 |
| 51 | *laten* | 26 klachten | *faire faire / laisser* | 27, 28 |
| 52 | Formal register, softening | 26 | lighter than French letters | — |
| 53 | Passive with a modal | 27 milieu | *doit être trié* | — |
| 54 | The four uses of *er* (review) | 27 | *y, en, il y a* | 28 |
| 55 | *toen / als / wanneer*; time conjunctions | 28 een-verhaal | *quand* splits in three | — |
| 56 | Subordinate clause first → inversion | 28 | V2 counts the clause as place one | — |

The word-order thread, which is the single biggest difficulty for a French speaker, is
deliberately spread out: verb second (2) → verb first in questions (1) → infinitive last (5, 8)
→ particle last (7) → participle last (9) → verb last in subordinate clauses (12) → verb clusters
(25) → whole clause in first place (28). A one-page "word order map" (*de tangconstructie /
la pince*) should be added to the method page and reopened at each of these themes.

---

## 4. Pronunciation progression (for the trainer)

### 4.1 What is easy and what is hard for a French speaker

- **Easy (already in French):** *uu / u* long (*u, nu, duur*) = French *u*; *eu* = French *eu*
  (*peu*); *oe* = French *ou*; *ie* = French *i*; *j* = French *y*. Flemish *ee* and *oo* are
  pure vowels (not diphthongs as in the Netherlands) — close to French *é* and *ô*, which makes
  Flemish easier than NL here.
- **Hard:** *g / ch* (and keeping *g, h, k* apart); the *h* (French speakers drop it); *ui*;
  *ij / ei*; short lax *i* and *u*; vowel length (*man / maan*); *w* vs *v*; final devoicing;
  first-syllable stress.
- **Spelling traps** (French reading habits): *oe* is NOT "o-é"; *ou / au* are NOT French
  *ou / au* (they sound the same as each other, roughly "aou"); *eu* is NOT "e-u";
  *-en* is a schwa (and the *n* is usually dropped); *sch* = s + ch; *-isch* = [is];
  *-ig* = [əx].
- **Not a problem in Flanders:** the French uvular *r* is used by many Flemings; no need to
  learn a rolled *r*.

### 4.2 Order (sound ↔ theme)

| Theme | Sounds introduced | Recycled |
|---|---|---|
| 1 kennismaken | g / h / k; h / zero; oe | — |
| 2 getallen-en-tijd | aa / a; ee / e | g |
| 3 familie | ij / ee; schwa / ee | aa / a |
| 4 boodschappen | oo / o; oe / oo | ee / e |
| 5 op-cafe | ui / eu; ui / ij | oe |
| 6 thuis | ou-au / oe; eu / uu | ij |
| 7 mijn-dag | ie / i; short u / i | ui |
| 8 onderweg | w / v; v / f; final devoicing (intro) | g / h |
| 9 vrije-tijd | word stress; unstressed *ge-* | schwa |
| 10 bij-de-dokter | final devoicing; *-d / -t* | all vowels |
| 11 kleren | schwa and *-n* drop | eu / uu |
| 12 op-het-werk | sentence intonation | w / v |
| 13–18 | stress in separable verbs and compounds; connected speech | personal weak spots |
| 19–28 | reductions (*'k, 't, da's*), Flemish everyday forms (*ge, nie, da, -ke*), sentence and contrastive stress | personal weak spots |

### 4.3 Minimal pairs

All words are real Dutch words; the French gloss is the sense meant. A few members are rare
or literary (marked *rare*) — usable in a listening trainer, not to be taught as vocabulary.
**To be checked by the teacher before recording.**

**g / h** — the French speaker's *g* comes out as *h* or zero; keep all three apart.

| g | h |
|---|---|
| goed — bon | hoed — chapeau |
| geel — jaune | heel — entier ; très |
| gaan — aller | haan — coq |
| gooi — (je) lance | hooi — foin |
| gal — bile | hal — hall |

**h / zero**

| h | — |
|---|---|
| hik — hoquet | ik — je |
| heet — (il) s'appelle ; chaud | eet — (il) mange |
| houd — (je) tiens | oud — vieux |
| hal — hall | al — déjà |

**g / k**

| g | k |
|---|---|
| gat — trou | kat — chat |
| geel — jaune | keel — gorge |
| gom — gomme | kom — bol ; (je) viens |
| gras — herbe | kras — égratignure |

**aa / a** (long / short)

| aa | a |
|---|---|
| maan — lune | man — homme |
| taak — tâche | tak — branche |
| vaak — souvent | vak — matière ; case |
| raam — fenêtre | ram — bélier |
| laat — tard | lat — latte |
| staat — État ; (il) est debout | stad — ville |

**ee / e** (long / short)

| ee | e |
|---|---|
| weet — (il) sait | wet — loi |
| been — jambe | ben — (je) suis |
| heel — entier ; très | hel — enfer |
| mees — mésange | mes — couteau |
| week — semaine | wek — réveille ! |

**schwa / ee** — the short "e" of *de, ze, we* vs the long *ee*.

| schwa | ee |
|---|---|
| ze — elle, ils | zee — mer |
| te — trop | thee — thé |
| me — me | mee — avec (adv.) |
| we — nous | wee — douleur (*rare*) |

**ij-ei / ee** — French speakers say *ij* as "è"; it must glide.

| ij | ee |
|---|---|
| kijk — regarde ! | keek — regardait |
| blijf — reste ! | bleef — restait |
| wijk — quartier | week — semaine |
| lijst — liste | leest — (il) lit |
| mijn — mon | meen — (je) pense (*menen*) |

*ij = ei* (same sound, homophones — useful for spelling, not for listening): wij / wei
(nous / prairie), leiden / lijden (mener / souffrir), reizen / rijzen (voyager / s'élever),
peil / pijl (niveau / flèche).

**oo / o** (long / short)

| oo | o |
|---|---|
| zoon — fils | zon — soleil |
| poot — patte | pot — pot |
| boot — bateau | bot — os |
| rook — fumée | rok — jupe |
| koop — achat | kop — tasse ; tête |

**oe / oo** — *oe* is French *ou*; *oo* is French *ô*.

| oe | oo |
|---|---|
| koek — biscuit | kook — (je) cuisine |
| roes — ivresse | roos — rose |
| voer — fourrage | voor — devant ; pour |
| loep — loupe | loop — (je) cours |
| boer — fermier | boor — foret |

**ou-au / oe** — the trap for French readers: *ou* is not French *ou*.

| ou / au | oe |
|---|---|
| zout — sel | zoet — sucré |
| goud — or | goed — bon |
| kou — froid | koe — vache |
| hout — bois | hoed — chapeau |
| touw — corde | toe — fermé ; vers |

*ou = au* (homophones): rouw / rauw (deuil / cru) is the one clean pair; teach the rule with
*koud, oud, blauw, saus, auto*.

**ui / eu**

| ui | eu |
|---|---|
| buik — ventre | beuk — hêtre |
| ruis — souffle (bruit) | reus — géant |
| kuis — nettoyage (Flemish) | keus — choix |
| duin — dune | deun — rengaine (*rare*) |

**ui / ij**

| ui | ij |
|---|---|
| ruim — spacieux | rijm — rime |
| buil — bosse | bijl — hache |
| vuil — sale | vijl — lime |
| kruid — herbe aromatique | krijt — craie |
| huis — maison | hijs — hisse ! |

**eu / uu**

| eu | uu |
|---|---|
| deur — porte | duur — cher ; durée |
| geur — odeur | guur — rude (temps) |
| keur — choix ; label | kuur — cure |
| zeur — (je) râle | zuur — acide |

**ie / i** — French speakers say both as French *i*; Dutch short *i* is lax, close to *é*.

| ie | i |
|---|---|
| ziet — (il) voit | zit — (il) est assis |
| lied — chanson | lid — membre |
| vies — sale | vis — poisson |
| riet — roseau | rit — trajet |

**short u / i**

| u | i |
|---|---|
| lucht — air | licht — lumière |
| kust — côte | kist — caisse |
| put — puits | pit — noyau |
| mus — moineau | mis — messe |
| hut — cabane | hit — tube (chanson) |

**w / v** — Flemish *w* is made with both lips, without rounding — never English *w* ("oui").

| w | v |
|---|---|
| wet — loi | vet — gras |
| wind — vent | vind — (je) trouve |
| wat — quoi | vat — tonneau |
| wel — bien | vel — peau ; feuille |
| wee — douleur (*rare*) | vee — bétail |

**v / f** — Flemish keeps *v* voiced (in much of the Netherlands it sounds like *f*); a
French speaker's *v* is right.

| v | f |
|---|---|
| vier — quatre | fier — fier |
| vel — peau | fel — vif, violent |
| vee — bétail | fee — fée |
| vaal — terne | faal — (j')échoue |

**Final devoicing** — *b, d* at the end of a word sound as *p, t*; *z, v* in the plural come
back. Not minimal pairs but alternations, plus homophones.

| singular (voiceless) | plural (voiced) |
|---|---|
| hond — chien [t] | honden [d] |
| huis — maison [s] | huizen [z] |
| brief — lettre [f] | brieven [v] |
| web — toile [p] | webben [b] |
| rood — rouge [t] | rode [d] |

Homophones (same sound, different spelling): hard / hart (dur / cœur), rad / rat (roue / rat),
raad / raat (conseil / rayon de miel), *hij wordt / ik word*.

**Word stress** — same spelling, stress changes the meaning.

| first syllable | second syllable |
|---|---|
| VOORkomen — se produire | voorKOMen — prévenir |
| ONdergaan — se coucher (soleil) | onderGAAN — subir |
| OVERkomen — venir (en visite) | overKOMen — arriver (à qqn) |
| DOORlopen — continuer à marcher | doorLOPen — parcourir |

Compounds are stressed on the first member (*SLAAPkamer, ZIEKenhuis, HUISarts*); most
words of French origin keep their final-ish stress (*stuDENT, kanTOOR, inforMAtie,
solliciTAtie*) — the one place where French habits help.

### 4.4 Flemish everyday speech (recognition, from theme 8 on)

*ge / gij* (= je / jij; *ge zijt* = je bent), *nie* (= niet), *da* (= dat), *'k* (= ik),
*'t* (= het), *-ke* diminutive, *ne / nen* (= een, before masculine nouns), dropped final *-n*,
*efkes* (= even). Taught as listening items in dialogues, flagged in notes; the learner is not
asked to produce them.

---

## 5. Vocabulary estimate

| Level | Themes | Key words taught as cards | Cumulative cards | Receptive target (incl. dialogues, recycling, "Pour aller plus loin") |
|---|---|---|---|---|
| A1 | 1–8 | ≈ 180 + sets (numbers, days, months ≈ 40) | ≈ 220 | ≈ 600–800 |
| A2 | 9–18 | ≈ 245 | ≈ 465 | ≈ 1,300–1,600 |
| B1 | 19–28 | ≈ 250 | ≈ 715 | ≈ 2,000–2,500 |

Reference point: measured receptive vocabulary of learners of **French** at each CEFR level is
about 1,160 (A1), 1,650 (A2) and 2,420 (B1) of the 5,000 most frequent words (Milton &
Alexiou, X-Lex test; reproduced in their GALA 2010 paper). For English the figures are higher.
No equivalent study for Dutch was found.

**Gap to decide.** `.ember/memory.md` says "~28 themes, ~2,000 words". At 20–25 key words per
theme the app teaches ≈ 700 words as cards; the remaining ≈ 1,300 can only come from exposure
(dialogues, grammar examples, extra reading). Two options:

1. Keep 20–25 cards per theme and count on exposure + the "Pour aller plus loin" reading for
   the rest (realistic for one learner with a teacher; B1 is reached on speaking/understanding
   with a ≈ 700 active core).
2. Raise to ≈ 50–70 cards per theme from A2 on (8–12 words steps), which makes each theme
   2–3 times longer to write and to review.

Recommendation: option 1, plus an optional "extra words" step per theme (frequency-ranked,
recognition only) from A2 on, so the card count can grow to ≈ 1,200 without lengthening the
core path.
