// First-run onboarding (name, motivation, experience with an optional placement test, weekly goal,
// calendar reminder), the weekly goal on the home screen, and level certificates.
import * as store from './store.js';
import * as ex from './exercises.js';
import { esc, shuffle } from './util.js';
import { CONFIG } from './config.js';

const view = () => document.getElementById('view');
const settings = () => store.db().settings;

// ---------- weekly goal ----------

export function weekProgress() {
  const goal = settings().weeklyGoal || 5;
  const d = new Date();
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(monday); x.setDate(monday.getDate() + i);
    days.push({ label: 'LMMJVSD'[i], active: !!store.db().days[store.dayKey(x)], today: store.dayKey(x) === store.dayKey(d), future: x > d });
  }
  return { goal, done: days.filter((x) => x.active).length, days };
}

export function weekWidget() {
  const w = weekProgress();
  return `<a class="week" href="#/settings">
    <span><strong>${w.done}/${w.goal} jours cette semaine</strong><small>${w.done >= w.goal ? 'Objectif atteint — bravo !' : `Objectif : ${w.goal} jours par semaine`}</small></span>
    <span class="dots">${w.days.map((x) => `<i class="${x.active ? 'on' : ''} ${x.today ? 'today' : ''}" title="${x.label}">${x.label}</i>`).join('')}</span></a>`;
}

// ---------- calendar reminder: a repeating event, no app or notification permission needed ----------

export function reminderFile(time = '19:00') {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const day = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const endMin = Math.min(h * 60 + m + 15, 23 * 60 + 59);
  const start = `${day}T${pad(h)}${pad(m)}00`;
  const end = `${day}T${pad(Math.floor(endMin / 60) % 24)}${pad(endMin % 60)}00`;
  const url = location.origin + location.pathname;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nederlands//FR', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:nederlands-reminder-${Date.now()}@nederlands`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${start}`, `DTEND:${end}`, 'RRULE:FREQ=DAILY',
    'SUMMARY:Nederlands — 10 minutes', `DESCRIPTION:Révisions du jour et une étape du parcours.\\n${url}`, `URL:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Nederlands — 10 minutes', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'rappel-nederlands.ics';
  a.click();
}

// ---------- onboarding ----------

const MOTIVATIONS = [
  ['travail', 'Pour le travail', 'Collègues, réunions, clients'],
  ['proches', 'Pour mes proches', 'Famille, amis, belle-famille'],
  ['quotidien', 'Pour la vie de tous les jours', 'Commune, magasins, école, médecin'],
  ['plaisir', 'Par plaisir', 'Culture, voyages, curiosité'],
];

function screen(step, total, body, cta = 'Continuer') {
  view().innerHTML = `
    <div class="session onboarding">
      <div class="progress"><span class="bar"><i style="width:${Math.round((step / total) * 100)}%"></i></span><small>${step}/${total}</small></div>
      ${body}
      <button class="btn primary wide" id="next">${cta}</button>
    </div>`;
  return new Promise((resolve) => { document.getElementById('next').onclick = resolve; });
}

function choose(selector, attr, onPick) {
  document.querySelectorAll(selector).forEach((b) => b.onclick = () => {
    document.querySelectorAll(selector).forEach((x) => x.classList.toggle('on', x === b));
    onPick(b.dataset[attr]);
  });
}

export async function onboarding(themeIndex, loadTheme) {
  const s = settings();
  const TOTAL = 5;

  await screen(1, TOTAL, `
    <article class="flash"><p class="eyebrow">Bienvenue</p><h1>Goeiedag!</h1>
      <p class="lead">Ce cours vous apprend le néerlandais tel qu'on le parle en Flandre, pas à pas, avec ${esc(CONFIG.teacherName)} à vos côtés. Quelques questions pour l'adapter à vous.</p>
      <label class="notes-label" for="name">Comment vous appelez-vous ?</label>
      <input id="name" class="field" autocomplete="given-name" placeholder="Votre prénom" value="${esc(s.name || '')}"></article>`);
  s.name = document.getElementById('name')?.value.trim() || s.name || '';
  store.save();

  let motivation = s.motivation || null;
  const pMot = screen(2, TOTAL, `
    <article class="flash"><p class="eyebrow">Votre objectif</p><h1 class="fr-prompt">Pourquoi apprenez-vous le néerlandais ?</h1>
      <div class="modes">${MOTIVATIONS.map(([id, t, n]) => `<button class="mode ${id === motivation ? 'on' : ''}" data-v="${id}"><strong>${t}</strong><small>${n}</small></button>`).join('')}</div></article>`);
  choose('.mode', 'v', (v) => { motivation = v; });
  await pMot;
  s.motivation = motivation;

  let level = s.experience || 'jamais';
  const pExp = screen(3, TOTAL, `
    <article class="flash"><p class="eyebrow">Votre niveau</p><h1 class="fr-prompt">Avez-vous déjà appris le néerlandais ?</h1>
      <div class="modes">${[['jamais', 'Jamais', 'Je pars de zéro'], ['un-peu', 'Un peu', 'À l\'école, il y a longtemps'], ['bases', 'Je connais les bases', 'Je comprends des phrases simples']]
        .map(([id, t, n]) => `<button class="mode ${id === level ? 'on' : ''}" data-v="${id}"><strong>${t}</strong><small>${n}</small></button>`).join('')}</div></article>`);
  choose('.mode', 'v', (v) => { level = v; });
  await pExp;
  s.experience = level;
  store.save();

  if (level !== 'jamais') await placement(themeIndex, loadTheme);

  let goal = s.weeklyGoal || 5;
  const pGoal = screen(4, TOTAL, `
    <article class="flash"><p class="eyebrow">Votre rythme</p><h1 class="fr-prompt">Combien de jours par semaine ?</h1>
      <p class="small">10 à 15 minutes suffisent. La régularité compte plus que la durée : la mémoire se renforce entre les séances.</p>
      <div class="yn goal">${[3, 4, 5, 7].map((n) => `<button class="chip ${n === goal ? 'on' : ''}" data-v="${n}">${n} jours</button>`).join('')}</div></article>`);
  choose('.goal .chip', 'v', (v) => { goal = Number(v); });
  await pGoal;
  s.weeklyGoal = goal;
  store.save();

  const pRem = screen(5, TOTAL, `
    <article class="flash"><p class="eyebrow">Un rappel</p><h1 class="fr-prompt">À quelle heure voulez-vous un petit rappel ?</h1>
      <p class="small">Le rappel est ajouté à l'agenda de votre téléphone, chaque jour à cette heure. Vous pouvez le supprimer quand vous voulez.</p>
      <input id="time" class="field" type="time" value="${esc(s.reminder || '19:00')}">
      <button class="btn wide" id="cal">Ajouter le rappel à mon agenda</button></article>`, 'Commencer');
  document.getElementById('cal').onclick = () => { s.reminder = document.getElementById('time').value; store.save(); reminderFile(s.reminder); };
  await pRem;
  s.reminder = document.getElementById('time')?.value || s.reminder;
  s.onboarded = Date.now();
  store.save();
}

// ---------- placement: a few items from the available themes, to suggest where to start ----------

async function placement(themeIndex, loadTheme) {
  const themes = await Promise.all(themeIndex.filter((t) => t.status === 'ready').map((t) => loadTheme(t.id)));
  const pool = shuffle(themes.flatMap((t) => t.items.map((it) => ({ t, it })))).slice(0, 8);
  let right = 0;
  for (let k = 0; k < pool.length; k++) {
    const { t, it } = pool[k];
    const r = await ex.readChoose(ex.header(k, pool.length, `Test ${k + 1}/${pool.length}`), t.id, it, t.items);
    if (r === 'exact') right++;
  }
  const strong = right >= 6;
  settings().placement = { score: right, of: pool.length, date: Date.now() };
  store.save();
  await screen(3, 5, `
    <article class="flash"><p class="eyebrow">Résultat : ${right}/${pool.length}</p>
      <h1 class="fr-prompt">${strong ? 'Vous connaissez déjà ces bases.' : 'On commence au début — ça ira vite.'}</h1>
      <p class="small">${strong ? 'Vous pouvez passer directement au bilan des thèmes que vous connaissez : s\'il est réussi, passez au thème suivant.' : 'Les premières leçons vous sembleront faciles : c\'est voulu, elles installent la prononciation et les réflexes.'}</p></article>`);
}

// ---------- certificates: every theme of a level validated (checkpoint ≥ 8/10) ----------

export function levelStatus(themeIndex) {
  const levels = {};
  for (const t of themeIndex) {
    const L = (levels[t.level] ||= { total: 0, ready: 0, passed: 0 });
    L.total++;
    if (t.status === 'ready') L.ready++;
    if ((store.getCheck(t.id)?.score || 0) >= 0.8) L.passed++;
  }
  return levels;
}

export function certificatePage(level, themeIndex) {
  const L = levelStatus(themeIndex)[level];
  const name = settings().name || '';
  if (!L || L.passed < L.total) {
    view().innerHTML = `<a class="back" href="#/progress">‹ Progrès</a>
      <div class="session end"><p class="eyebrow">Attestation ${esc(level)}</p><h1>${L ? `${L.passed}/${L.total} thèmes validés` : 'Niveau inconnu'}</h1>
      <p class="lead">L'attestation ${esc(level)} se débloque quand le bilan de chaque thème du niveau est réussi (8/10 ou plus).</p>
      <a class="btn primary wide" href="#/">Continuer le parcours</a></div>`;
    return;
  }
  const date = new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  view().innerHTML = `
    <a class="back no-print" href="#/progress">‹ Progrès</a>
    <div class="certificate">
      <p class="eyebrow">Nederlands · le flamand pas à pas</p>
      <h1>Attestation de niveau ${esc(level)}</h1>
      <p>Nous attestons que</p>
      <p class="who">${esc(name || '—')}</p>
      <p>a validé les ${L.total} thèmes du niveau ${esc(level)} du Cadre européen commun de référence (CECR), bilans à l'appui.</p>
      <p class="sign">${esc(date)} · ${esc(CONFIG.teacherName)}</p>
    </div>
    <button class="btn primary wide no-print" onclick="window.print()">Imprimer ou enregistrer en PDF</button>`;
}

// ---------- estimated minutes for a step ----------

export function stepMinutes(step, theme) {
  if (step.type === 'words') return Math.max(5, Math.round((step.items?.length || 6) * 1.6));
  if (step.type === 'grammar') return Math.max(4, Math.round(2 + (theme.grammar?.[step.id]?.exercises.length || 5) * 0.7));
  if (step.type === 'dialogue') return 8;
  if (step.type === 'checkpoint') return 7;
  if (step.type === 'task') return 15;
  return 5;
}
