import { retrievability } from './fsrs.js';
import * as store from './store.js';
import * as sync from './sync.js';
import { runStep, nextStep } from './lesson.js';
import { review } from './review.js';
import { speakButton, stop, canRecord, record } from './audio.js';
import { esc, norm } from './util.js';
import { CONFIG } from './config.js';
import { VIRTUAL, virtualTheme, pending } from './extra.js';
import { practice } from './practice.js';
import { teacherPage } from './teacher.js';
import { onboarding, weekWidget, weekProgress, reminderFile, levelStatus, certificatePage, stepMinutes } from './goals.js';
import { speakingOn } from './exercises.js';
import { kees, keesSays, icon, stars, starsFor, hueOf } from './ui.js';

const VERSION = '1.0';
const view = document.getElementById('view');
const sidebar = document.getElementById('sidebar');
const tabbar = document.getElementById('nav');
const themes = {};
let themeIndex = [];
let isTeacher = false;

// Course themes come from content files; "perso" and "stan" are built from the learner's data, and
// "q-…" lessons were made for this learner in answer to a question. Those are rebuilt every time.
async function loadTheme(id) {
  if (VIRTUAL.includes(id)) return (themes[id] = virtualTheme(id));
  if (id.startsWith('q-')) {
    const l = (store.db().customLessons || []).find((x) => x.id === id);
    if (!l) throw new Error(`no custom lesson ${id}`);
    return (themes[id] = l);
  }
  if (!themes[id]) {
    const text = await fetch(`content/themes/${id}.json`).then((r) => r.text());
    themes[id] = JSON.parse(text.replaceAll('{teacher}', CONFIG.teacherName));
  }
  return themes[id];
}

const readyThemes = () => themeIndex.filter((t) => t.status === 'ready');
const learnerName = () => store.db().settings.name || CONFIG.learnerName || '';
const hue = (id) => hueOf(Math.max(0, themeIndex.findIndex((t) => t.id === id)));
const STEP_KIND = { words: 'Mots', grammar: 'Grammaire', dialogue: 'Dialogue', checkpoint: 'Bilan', task: 'Opdracht' };

// ---------- chrome: sidebar (desktop) and tab bar (phone) ----------

const NAV = [
  ['home', '#/', 'today', 'Aujourd\'hui'],
  ['path', '#/path', 'path', 'Parcours'],
  ['review', '#/review', 'review', 'Réviser'],
  ['practice', '#/practice', 'practice', 'Pratique'],
  ['vocab', '#/vocab', 'vocab', 'Vocabulaire', 'desktop'],
  ['progress', '#/progress', 'progress', 'Progrès'],
  ['settings', '#/settings', 'settings', 'Réglages', 'desktop'],
];

function renderChrome() {
  const due = store.dueKeys().length;
  const w = weekProgress();
  const badge = (id) => (id === 'review' && due ? `<span class="badge">${due}</span>` : '');
  sidebar.innerHTML = `
    <a class="brand" href="#/">${kees('happy', 46)}<span><strong>Nederlands</strong><small>le flamand de ${esc(learnerName() || 'Monia')}</small></span></a>
    <nav class="side-nav">${NAV.map(([id, href, ic, label]) => `<a href="${href}" data-tab="${id}">${icon(ic)}${label}${badge(id)}</a>`).join('')}
      ${isTeacher ? `<a href="#/teacher" data-tab="teacher">${icon('teacher')}Espace enseignant</a>` : ''}</nav>
    <div class="side-card">
      <div class="streak"><span class="flame">🔥</span>${store.streak()} jour${store.streak() > 1 ? 's' : ''} d'affilée</div>
      <div class="dots">${w.days.map((x) => `<i class="${x.active ? 'on' : ''} ${x.today ? 'today' : ''}">${x.label}</i>`).join('')}</div>
      <small>${w.done}/${w.goal} jours cette semaine</small>
    </div>`;
  tabbar.innerHTML = NAV.filter((n) => n[4] !== 'desktop').map(([id, href, ic, label]) =>
    `<a href="${href}" data-tab="${id}">${icon(ic)}${label}${badge(id)}</a>`).join('');
}

function setNav(active) {
  renderChrome();
  document.querySelectorAll('[data-tab]').forEach((a) => a.classList.toggle('active', a.dataset.tab === active));
}

// Lessons, reviews and drills take the whole screen: no navigation to tap by mistake.
function setFocus(on) { document.body.classList.toggle('focus', on); }

function wordStatus(themeId, itemId) {
  const c = store.getCard(`${themeId}/${itemId}`);
  if (!c) return 'new';
  return c.s >= 21 ? 'known' : 'learning';
}

function themeProgress(t) {
  const steps = t.steps.filter((s) => store.stepDone(t.id, s.id)).length;
  const words = t.items.map((i) => wordStatus(t.id, i.id));
  return {
    steps, totalSteps: t.steps.length,
    known: words.filter((w) => w === 'known').length,
    learning: words.filter((w) => w === 'learning').length,
    fresh: words.filter((w) => w === 'new').length,
    pct: Math.round((steps / t.steps.length) * 100),
  };
}

const newLessons = () => (store.db().customLessons || []).filter((l) => !(l.steps || []).some((s) => store.stepDone(l.id, s.id)));

// The same word all day long, from the current theme.
function wordOfTheDay(theme) {
  if (!theme?.items?.length) return null;
  const n = Number(store.dayKey().replace(/-/g, ''));
  return theme.items[n % theme.items.length];
}

// ---------- home: today's plan ----------

async function home() {
  setNav('home');
  view.className = 'view home';
  await Promise.all(readyThemes().map((t) => loadTheme(t.id)));
  const due = store.dueKeys().length;
  const current = readyThemes().map((t) => themes[t.id]).find((t) => nextStep(t));
  const step = current && nextStep(current);
  const name = learnerName();
  const hour = new Date().getHours();
  const greet = hour < 12 ? ['Goeiemorgen', 'Bonjour (le matin)'] : hour < 18 ? ['Goeiemiddag', 'Bon après-midi'] : ['Goeienavond', 'Bonsoir'];
  const wod = wordOfTheDay(current || themes[readyThemes()[0]?.id]);
  const plan = [];
  if (due) plan.push(`<a class="card primary" href="#/review"><span class="big">${due}</span>
    <span><strong>Révisions du jour</strong><small>≈ ${Math.max(1, Math.round(due * 0.3))} min · à faire en premier : c'est ce qui ancre la mémoire</small></span></a>`);
  if (step) plan.push(`<a class="card next" href="#/step/${current.id}/${step.id}">
    <span class="stepicon">${icon(step.type)}</span>
    <span><span class="label">${esc(current.nl)} · étape ${current.steps.indexOf(step) + 1}/${current.steps.length} · ≈ ${stepMinutes(step, current)} min</span><strong>${esc(step.title)}</strong></span></a>`);
  plan.push(`<a class="card" href="#/practice/${['stories', 'paires', 'pron', 'ecoute'][new Date().getDay() % 4]}">
    <span class="stepicon">${icon(['vocab', 'practice', 'practice', 'music'][new Date().getDay() % 4])}</span>
    <span><span class="label">Bonus</span><strong>${['Une histoire à lire', 'Le jeu des paires', 'Un son à travailler', 'Écoute libre au jardin'][new Date().getDay() % 4]}</strong></span></a>`);

  view.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${store.streak() > 0 ? `🔥 ${store.streak()} jour${store.streak() > 1 ? 's' : ''} d'affilée` : 'Bienvenue'}</p>
      <h1>${greet[0]}${name ? `, ${esc(name)}` : ''}!</h1>
      ${keesSays(due || step ? 'Zullen we beginnen?' : 'Alles is klaar voor vandaag!', due || step ? 'On commence ? Voici votre programme du jour.' : 'Tout est fait pour aujourd\'hui. À demain !')}
    </section>
    <div class="home-grid">
      <div>
        <div id="notices" class="today"></div>
        <h2 class="section">Votre programme</h2>
        <div class="plan">${plan.map((p, k) => p.replace('<a class="card', `<a data-n="${k + 1}" class="card`)).join('')}</div>
        <a class="method-link" href="#/method">Comment fonctionne cette méthode ? ›</a>
      </div>
      <aside class="side-col">
        ${weekWidget()}
        ${wod ? `<div class="group word-day"><p class="eyebrow">Le mot du jour</p>
          <div class="hear">${speakButton(current?.id || readyThemes()[0].id, wod.id, wod.nl)}<span><strong lang="nl">${esc(wod.nl)}</strong><br><small>${esc(wod.fr)}</small></span></div>
          ${wod.ex_nl ? `<small lang="nl">« ${esc(wod.ex_nl)} »</small>` : ''}</div>` : ''}
        ${current?.culture ? `<div class="group culture"><p class="eyebrow">Vlaanderen</p><strong>${esc(current.culture.title)}</strong><small>${esc(current.culture.text)}</small></div>` : ''}
      </aside>
    </div>`;

  const notices = [];
  if (pending('stan').length) notices.push(`<a class="card feedback-card" href="#/practice/stan/learn"><span class="stepicon">${icon('teacher')}</span>
    <span><span class="label">De ${esc(CONFIG.teacherName)}</span><strong>${pending('stan').length} nouveau${pending('stan').length > 1 ? 'x' : ''} mot${pending('stan').length > 1 ? 's' : ''} à apprendre</strong></span></a>`);
  if (newLessons().length) notices.push(`<a class="card feedback-card" href="#/theme/${newLessons()[0].id}"><span class="stepicon">${icon('grammar')}</span>
    <span><span class="label">Votre question</span><strong>Une leçon vous attend : ${esc(newLessons()[0].nl)}</strong></span></a>`);
  document.getElementById('notices').innerHTML = notices.join('');
  if (sync.currentUser()) {
    sync.unseenFeedback().then((rows) => {
      const slot = document.getElementById('notices');
      if (!slot || !rows.length) return;
      slot.insertAdjacentHTML('afterbegin', `<a class="card feedback-card" href="#/theme/${rows[0].theme}"><span class="stepicon">${icon('task')}</span>
        <span><span class="label">Nouveau</span><strong>${esc(CONFIG.teacherName)} vous a répondu</strong></span></a>`);
    }).catch(() => {});
  }
}

// ---------- the course map (Duolingo-style path) ----------

const ZIGZAG = [0, 56, 84, 56, 0, -56, -84, -56];

async function pathPage() {
  setNav('path');
  await Promise.all(readyThemes().map((t) => loadTheme(t.id)));
  const levels = [['A1', 'Les bases', 'Se présenter, compter, faire ses courses, se débrouiller au quotidien'],
    ['A2', 'Le quotidien', 'Raconter, prendre rendez-vous, parler de ses loisirs et du passé'],
    ['B1', 'L\'autonomie', 'Donner son avis, raconter une histoire, régler un problème']];
  const status = levelStatus(themeIndex);
  let currentMarked = false;
  const unitHtml = (t, idx) => {
    const hueCls = `u-${hueOf(idx)}`;
    if (t.status !== 'ready') {
      return `<section class="unit locked"><div class="unit-head">${icon(t.icon || 'lock')}<span><small>Unité ${idx + 1} · ${esc(t.level)}</small><strong>${esc(t.nl)}</strong><small>${esc(t.fr)}</small></span>${icon('lock')}</div></section>`;
    }
    const th = themes[t.id];
    const p = themeProgress(th);
    const nodes = th.steps.map((s, k) => {
      const done = store.stepDone(t.id, s.id);
      const isCurrent = !done && !currentMarked;
      if (isCurrent) currentMarked = true;
      return `<div class="node-wrap ${isCurrent ? 'has-tip' : ''}" style="--x:${ZIGZAG[k % ZIGZAG.length]}px">
        ${isCurrent ? '<span class="start-tip">Commencer</span>' : ''}
        <a class="node ${done ? 'done' : isCurrent ? 'current' : ''} ${s.type === 'task' ? 'task' : ''}" href="#/step/${t.id}/${s.id}" aria-label="${esc(s.title)}">${icon(done ? 'done' : s.type)}</a>
        <span class="node-label">${esc(s.title)}</span>
        ${done ? stars(starsFor(done.score)) : `<small>${STEP_KIND[s.type]} · ${stepMinutes(s, th)} min</small>`}
      </div>`;
    }).join('');
    return `<section class="unit ${hueCls}">
      <a class="unit-head" href="#/theme/${t.id}">${icon(th.icon || t.icon || 'wave')}<span><small>Unité ${idx + 1} · ${esc(t.level)} · ${p.steps}/${p.totalSteps} étapes</small><strong>${esc(th.nl)}</strong><small>${esc(th.fr)}</small></span><span class="btn small">Voir</span></a>
      <div class="nodes">${nodes}${idx === 0 ? `<div class="map-kees">${kees('happy', 70)}</div>` : ''}</div>
    </section>`;
  };
  view.className = 'view';
  view.innerHTML = `
    <header class="hello"><p class="eyebrow">Votre chemin</p><h1>Parcours</h1>
      <p class="lead">${themeIndex.length} unités, du premier « goeiedag » au niveau B1. Chaque étape dure 5 à 15 minutes.</p></header>
    ${levels.map(([lvl, title, sub]) => {
      const units = themeIndex.map((t, i) => [t, i]).filter(([t]) => t.level === lvl);
      const L = status[lvl] || { passed: 0, total: units.length };
      return `<div class="level-banner"><span class="lvl-pill">${lvl}</span><span><strong>${title}</strong><small>${sub}</small></span></div>
        ${units.map(([t, i]) => unitHtml(t, i)).join('')}
        <div class="nodes"><div class="node-wrap"><a class="node trophy" href="#/certificate/${lvl}" aria-label="Attestation ${lvl}">${icon('trophy')}</a>
          <span class="node-label">Attestation ${lvl}</span><small>${L.passed}/${L.total} unités validées</small></div></div>`;
    }).join('')}`;
}

// ---------- theme page ----------

async function themePage(id) {
  setNav('path');
  view.className = 'view';
  const t = await loadTheme(id);
  const next = nextStep(t);
  const check = store.getCheck(id);
  const custom = id.startsWith('q-');
  view.innerHTML = `
    <a class="back" href="${custom ? '#/practice/lessons' : '#/path'}">‹ ${custom ? 'Mes leçons' : 'Parcours'}</a>
    <header class="theme-banner u-${custom ? 'plum' : hue(id)}">
      ${icon(t.icon || (custom ? 'grammar' : 'wave'))}
      <p class="eyebrow">${esc(t.level || '')}${t.level ? ' · ' : ''}${esc(t.fr)}</p>
      <h1 lang="nl">${esc(t.nl)}</h1>
      <p>${esc(t.intro)}</p>
      ${next ? `<a class="btn" href="#/step/${id}/${next.id}" style="justify-self:start">${store.stepDone(id, t.steps[0].id) ? 'Continuer' : 'Commencer'} : ${esc(next.title)}</a>` : ''}
    </header>

    ${t.question ? `<div class="tip asked"><small>Votre question</small><p>${esc(t.question)}</p></div>` : ''}
    ${t.answer?.length ? `<h2 class="section">La réponse</h2><div class="answer-text">${t.answer.map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}

    ${t.cando?.length ? `<h2 class="section">À la fin de l'unité, je peux…</h2>
    <ul class="goals">${t.cando.map((c, k) => `<li class="${check?.cando?.[k] ? 'met' : ''}">${esc(c.replace(/^Je peux /, ''))}</li>`).join('')}</ul>` : ''}

    <h2 class="section">Étapes</h2>
    <ol class="path">
      ${t.steps.map((s, k) => {
        const done = store.stepDone(id, s.id);
        const state = done ? 'done' : s === next ? 'next' : '';
        const count = s.type === 'words' ? ` · ${s.items.length} mots` : '';
        return `<li class="${state}"><a href="#/step/${id}/${s.id}">
          <span class="stepicon">${icon(done ? 'done' : s.type)}</span>
          <span><small>${k + 1} · ${STEP_KIND[s.type]}${count} · ≈ ${stepMinutes(s, t)} min</small><strong>${esc(s.title)}</strong></span>
          <em>${done ? `${stars(starsFor(done.score))}<span>refaire</span>` : s === next ? 'commencer' : ''}</em></a></li>`;
      }).join('')}
    </ol>

    <div id="theme-feedback"></div>

    ${t.culture ? `<h2 class="section">Vlaanderen</h2><div class="group culture"><strong>${esc(t.culture.title)}</strong><p class="small">${esc(t.culture.text)}</p></div>` : ''}

    <h2 class="section">Vocabulaire de l'unité</h2>
    <ul class="words">
      ${t.items.map((it) => { const s = wordStatus(id, it.id); return `
        <li>${speakButton(id, it.id, it.nl)}
          <span><strong lang="nl">${esc(it.nl)}</strong><small>${esc(it.fr)}</small></span>
          <span class="dot ${s}">${{ new: 'nouveau', learning: 'en cours', known: 'acquis' }[s]}</span></li>`; }).join('')}
    </ul>

    ${t.tips?.length ? `<h2 class="section">Bon à savoir</h2>
    <div class="tips">${t.tips.map((tp) => `<div class="tip"><strong>${esc(tp.title)}</strong><p>${esc(tp.text)}</p></div>`).join('')}</div>` : ''}

    ${t.further?.length ? `
      <h2 class="section">Pour aller plus loin</h2>
      <ul class="further">${t.further.map((f) => `
        <li><a href="${esc(f.url)}" target="_blank" rel="noopener">
          <span class="kind">${esc(f.kind)} · ${esc(f.level)}</span><strong>${esc(f.title)}</strong><small>${esc(f.note)}</small></a></li>`).join('')}
      </ul>` : ''}`;
  if (sync.currentUser() && t.task) showFeedback(id).catch(() => {});
}

// The teacher's answers to this theme's task, newest first; opening them marks them as seen.
async function showFeedback(themeId) {
  const rows = (await sync.mySubmissions(themeId)).filter((r) => r.feedback_at);
  const slot = document.getElementById('theme-feedback');
  if (!slot || !rows.length) return;
  const items = await Promise.all(rows.map(async (r) => ({ r, url: r.feedback_audio_path ? await sync.audioUrl(r.feedback_audio_path) : null })));
  slot.innerHTML = `<h2 class="section">Retour de ${esc(CONFIG.teacherName)}</h2>
    ${items.map(({ r, url }) => `<div class="tip teacher ${r.seen_at ? '' : 'unseen'}">
      <small>${new Date(r.feedback_at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' })} · ${r.mode === 'recording' ? 'votre enregistrement' : 'en personne'}</small>
      ${r.feedback_text ? `<p>${esc(r.feedback_text).replace(/\n/g, '<br>')}</p>` : ''}
      ${url ? `<audio controls src="${esc(url)}"></audio>` : ''}</div>`).join('')}`;
  sync.markSeen(rows.filter((r) => !r.seen_at).map((r) => r.id)).catch(() => {});
}

// ---------- vocabulary: everything met so far, searchable ----------

async function vocab() {
  setNav('vocab');
  view.className = 'view';
  const sources = [...readyThemes().map((t) => t.id), 'perso', 'stan', ...(store.db().customLessons || []).map((l) => l.id)];
  const all = (await Promise.all(sources.map((id) => loadTheme(id).catch(() => null)))).filter(Boolean)
    .flatMap((t) => t.items.map((it) => ({ ...it, theme: t.id, themeName: t.nl, status: wordStatus(t.id, it.id) })));
  const counts = { known: 0, learning: 0, new: 0 };
  all.forEach((w) => counts[w.status]++);
  view.innerHTML = `
    <header class="hello"><p class="eyebrow">${all.length} mots et expressions</p><h1>Vocabulaire</h1></header>
    <div class="vocab-tools">
      <input id="q" class="field" type="search" placeholder="Chercher en néerlandais ou en français…" autocomplete="off">
      <select id="f" class="field small-field"><option value="">Tous</option><option value="learning">en cours (${counts.learning})</option><option value="known">acquis (${counts.known})</option><option value="new">pas encore vus (${counts.new})</option></select>
    </div>
    <ul class="words" id="list"></ul>`;
  const draw = () => {
    const q = norm(document.getElementById('q').value);
    const f = document.getElementById('f').value;
    const list = all.filter((w) => (!f || w.status === f) && (!q || norm(w.nl).includes(q) || norm(w.fr).includes(q)));
    document.getElementById('list').innerHTML = list.map((w) => `
      <li>${speakButton(w.theme, w.id, w.nl)}<span><strong lang="nl">${esc(w.nl)}</strong><small>${esc(w.fr)} · ${esc(w.themeName)}</small></span>
        <span class="dot ${w.status}">${{ new: 'nouveau', learning: 'en cours', known: 'acquis' }[w.status]}</span></li>`).join('')
      || '<li><span class="small">Aucun mot ne correspond.</span></li>';
  };
  document.getElementById('q').oninput = draw;
  document.getElementById('f').onchange = draw;
  draw();
}

// ---------- progress ----------

async function progress() {
  setNav('progress');
  view.className = 'view';
  await Promise.all(readyThemes().map((t) => loadTheme(t.id)));
  const cards = Object.entries(store.db().cards);
  const wordCards = cards.filter(([k]) => !k.includes('#'));
  const now = Date.now();
  const avgR = cards.length ? cards.reduce((a, [, c]) => a + retrievability((now - c.last) / 864e5, c.s), 0) / cards.length : 0;
  const days = [];
  for (let i = 27; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(store.db().days[store.dayKey(d)] || 0); }
  const max = Math.max(1, ...days);
  const canDo = readyThemes().flatMap((t) => (store.getCheck(t.id)?.cando || []).filter(Boolean)).length;
  const totalStars = readyThemes().reduce((a, t) => a + themes[t.id].steps.reduce((b, s) => b + starsFor(store.stepDone(t.id, s.id)?.score ?? null), 0), 0);

  view.innerHTML = `
    <header class="hello"><p class="eyebrow">Votre parcours</p><h1>Progrès</h1></header>
    <div class="stats">
      <div class="stat"><span>${wordCards.length}</span><small>mots et expressions</small></div>
      <div class="stat"><span>${store.streak()}</span><small>jours d'affilée</small></div>
      <div class="stat"><span>${cards.length ? Math.round(avgR * 100) + ' %' : '—'}</span><small>mémoire estimée</small></div>
      <div class="stat"><span>${totalStars} ★</span><small>étoiles gagnées</small></div>
      <div class="stat"><span>${canDo}</span><small>« je peux… » acquis</small></div>
    </div>
    <h2 class="section">Les 4 dernières semaines</h2>
    <div class="heat" role="img" aria-label="Activité des 28 derniers jours">
      ${days.map((n) => `<i style="--a:${n ? 0.25 + 0.75 * (n / max) : 0}" title="${n}"></i>`).join('')}
    </div>
    <h2 class="section">Par unité</h2>
    <ul class="themes">
      ${readyThemes().map((t) => { const p = themeProgress(themes[t.id]); const c = store.getCheck(t.id); return `
        <li><a class="theme" href="#/theme/${t.id}"><span class="lvl">${icon(themes[t.id].icon || 'wave')}</span>
          <span><strong>${esc(t.nl)}</strong><small>${p.steps}/${p.totalSteps} étapes · ${p.known} acquis · ${p.learning} en cours${c ? ` · bilan ${Math.round(c.score * 10)}/10` : ''}</small>
          <span class="bar"><i style="width:${p.pct}%"></i></span></span></a></li>`; }).join('')}
    </ul>
    <h2 class="section">Attestations</h2>
    <ul class="themes">${Object.entries(levelStatus(themeIndex)).map(([lvl, L]) => `
      <li><a class="theme" href="#/certificate/${lvl}"><span class="lvl">${lvl}</span>
        <span><strong>Attestation ${lvl}</strong><small>${L.passed}/${L.total} unités validées${L.passed === L.total ? ' · disponible' : ''}</small>
        <span class="bar"><i style="width:${Math.round((L.passed / L.total) * 100)}%"></i></span></span></a></li>`).join('')}
    </ul>
    <p class="fineprint">« Mémoire estimée » : la probabilité moyenne de retrouver aujourd'hui ce que vous avez appris, selon l'algorithme de répétition espacée. Un mot est « acquis » quand il tient au moins trois semaines.</p>
    <a class="btn wide" href="#/settings" style="margin-top:16px">${icon('settings')} Réglages</a>`;
}

// ---------- method: why the app works the way it does ----------

function method() {
  setNav('settings');
  view.className = 'view';
  const P = [
    ['Se tester plutôt que relire', 'Chercher une réponse dans sa mémoire la fait mieux tenir dans le temps que la relire. Presque chaque écran vous demande donc de retrouver quelque chose.', 'Roediger & Karpicke, 2006, Psychological Science'],
    ['Espacer les révisions', 'Répartir les révisions dans le temps plutôt que tout revoir d\'un coup est l\'un des effets les plus solides de la psychologie de l\'apprentissage. L\'application estime pour chaque mot le moment où vous risquez de l\'oublier et le fait revenir à ce moment-là (algorithme FSRS) ; à mesure que le mot s\'ancre, les intervalles s\'allongent.', 'Cepeda et al., 2006, Psychological Bulletin · Latimier, Peyre & Ramus, 2021, Educational Psychology Review · Ye, Su & Cao, 2022, KDD'],
    ['Bien apprendre avant d\'espacer', 'Un mot nouveau est répété plusieurs fois dans la leçon jusqu\'à être retrouvé sans aide ; ce n\'est qu\'ensuite qu\'il entre dans les révisions espacées.', ''],
    ['L\'oreille avant l\'œil', 'On écoute d\'abord, on lit ensuite. Lire en écoutant aide à comprendre la langue parlée et à retenir les mots nouveaux.', 'Montero Perez, Van den Noortgate & Desmet, 2013, System'],
    ['Beaucoup d\'écoute compréhensible', 'Les dialogues sont à votre niveau, juste un peu au-dessus : on comprend l\'essentiel grâce au contexte.', 'Krashen, 1982, Principles and Practice in Second Language Acquisition'],
    ['Expliquer la grammaire, en partant du français', 'Pour les adultes, une règle expliquée clairement aide. Chaque point est comparé au français : ce qui est pareil, ce qui piège.', 'Norris & Ortega, 2000, Language Learning · Spada & Tomita, 2010, Language Learning'],
    ['Mélanger', 'Les révisions mélangent les thèmes et les façons d\'interroger (dire, écrire, écouter) : c\'est plus difficile sur le moment, et plus durable.', ''],
    ['Parler tout de suite', 'Répéter à voix haute, s\'enregistrer et comparer, jouer un rôle : la production orale commence dès la première leçon.', ''],
    ['Des objectifs clairs', 'Chaque thème annonce ce que vous saurez faire (« je peux… », comme le Cadre européen de référence) et se termine par un bilan.', 'Conseil de l\'Europe, CECR, 2001 · Volume complémentaire, 2020'],
  ];
  view.innerHTML = `
    <a class="back" href="#/settings">‹ Réglages</a>
    <header class="theme-head"><p class="eyebrow">La méthode</p><h1>Pourquoi ça marche</h1>
      <p class="lead">Chaque choix de l'application repose sur des résultats de recherche sur l'apprentissage — pas sur des gadgets.</p></header>
    <ol class="principles">${P.map(([h, p, r]) => `<li><strong>${esc(h)}</strong><p>${esc(p)}</p>${r ? `<small>${esc(r)}</small>` : ''}</li>`).join('')}</ol>`;
}

// ---------- settings ----------

function settings() {
  setNav('settings');
  view.className = 'view';
  const u = sync.currentUser();
  const st = store.db().settings;
  view.innerHTML = `
    <header class="hello"><p class="eyebrow">Application</p><h1>Réglages</h1></header>
    ${sync.enabled() ? `
      <h2 class="section">Compte</h2>
      <div class="group">
        <p class="small">${u ? `Connectée : <strong>${esc(u.email)}</strong><br>Progression sauvegardée en ligne ${{ ok: '✓', pending: '(en cours…)', error: '— hors ligne, réessai automatique', off: '' }[sync.syncStatus()]}` : 'Non connecté.'}</p>
        ${u ? `${isTeacher ? '<a class="btn" href="#/teacher">Espace enseignant</a>' : ''}<button class="btn" id="logout">Se déconnecter</button>` : ''}
      </div>` : ''}
    <h2 class="section">Mon apprentissage</h2>
    <div class="group">
      <label class="row-setting">Prénom <input id="sname" class="field small-field" value="${esc(st.name || '')}" placeholder="Votre prénom"></label>
      <label class="row-setting">Objectif
        <select id="sgoal">${[3, 4, 5, 7].map((n) => `<option value="${n}" ${n === (st.weeklyGoal || 5) ? 'selected' : ''}>${n} jours / semaine</option>`).join('')}</select></label>
      <label class="row-setting">Rappel quotidien <input id="stime" class="field small-field" type="time" value="${esc(st.reminder || '19:00')}"></label>
      <button class="btn" id="scal">Ajouter le rappel à mon agenda</button>
      <label class="row-setting">Exercices oraux (reconnaissance vocale)
        <select id="sspeak"><option value="on" ${st.speaking !== false ? 'selected' : ''}>activés</option><option value="off" ${st.speaking === false ? 'selected' : ''}>désactivés</option></select></label>
      <p class="small">${speakingOn() ? 'La reconnaissance vocale fonctionne sur cet appareil.' : st.speaking === false ? 'Les exercices oraux sont désactivés.' : 'La reconnaissance vocale n\'est pas disponible sur cet appareil (ou en pause pour une heure).'}</p>
    </div>
    <h2 class="section">Micro</h2>
    <div class="group">
      <p class="small">Vérifie que l'enregistrement fonctionne sur cet appareil (pour vous écouter et comparer).</p>
      <button class="btn" id="mic">Tester le micro (3 s)</button>
      <div id="micout" class="micout"></div>
    </div>
    <h2 class="section">À propos</h2>
    <div class="group">
      <a class="btn" href="#/method">La méthode : pourquoi ça marche</a>
      <button class="btn" id="export">Exporter ma progression</button>
      <button class="btn danger" id="reset">Effacer la progression de cet appareil</button>
    </div>
    <p class="fineprint">Version ${VERSION}</p>`;

  document.getElementById('logout')?.addEventListener('click', async () => { await sync.signOut(); location.hash = '#/'; boot(); });
  document.getElementById('mic').onclick = micTest;
  document.getElementById('sname').onchange = (e) => { st.name = e.target.value.trim(); store.save(); renderChrome(); };
  document.getElementById('sgoal').onchange = (e) => { st.weeklyGoal = Number(e.target.value); store.save(); renderChrome(); };
  document.getElementById('stime').onchange = (e) => { st.reminder = e.target.value; store.save(); };
  document.getElementById('scal').onclick = () => reminderFile(document.getElementById('stime').value);
  document.getElementById('sspeak').onchange = (e) => { st.speaking = e.target.value === 'on'; delete st.speakingPausedUntil; store.save(); settings(); };
  document.getElementById('export').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' }));
    a.download = `nederlands-progression-${store.dayKey()}.json`;
    a.click();
  };
  document.getElementById('reset').onclick = () => {
    if (confirm('Effacer la progression de cet appareil ? Si vous êtes connectée, elle reviendra depuis votre compte.')) { store.reset(); location.hash = '#/'; }
  };
}

async function micTest() {
  const out = document.getElementById('micout');
  const btn = document.getElementById('mic');
  if (!canRecord()) { out.innerHTML = '<p class="ko">Enregistrement non pris en charge ici.</p>'; return; }
  try {
    btn.disabled = true;
    const r = await record(3000);
    let left = 3;
    out.innerHTML = `<p>Parlez… ${left}</p>`;
    const tick = setInterval(() => { left--; if (left > 0) out.innerHTML = `<p>Parlez… ${left}</p>`; else clearInterval(tick); }, 1000);
    const blob = await r.done;
    const ok = blob.size > 1000;
    out.innerHTML = `<p class="${ok ? 'ok' : 'ko'}">${ok ? 'Le micro fonctionne.' : 'Enregistrement vide — le micro ne fonctionne pas ici.'}</p>
      <audio controls src="${URL.createObjectURL(blob)}"></audio><small>${esc(r.mimeType || 'format inconnu')} · ${Math.round(blob.size / 1024)} Ko</small>`;
  } catch (e) {
    out.innerHTML = `<p class="ko">Accès au micro refusé ou impossible (${esc(e.name)}).</p>`;
  } finally {
    btn.disabled = false;
  }
}

// ---------- router ----------

const FOCUS_PRACTICE = /^(pron\/.+|paires|parler|dictee|ecoute\/.+|mywords\/learn|stan\/learn)$/;

async function route() {
  stop();
  const [, page, a, b] = location.hash.split('/');
  window.scrollTo(0, 0);
  setFocus(page === 'step' || (page === 'review' && !!a) || (page === 'practice' && FOCUS_PRACTICE.test([a, b].filter(Boolean).join('/'))));
  try {
    if (page === 'theme') await themePage(a);
    else if (page === 'path') await pathPage();
    else if (page === 'step') { setNav('path'); view.className = 'view'; await runStep(await loadTheme(a), b); }
    else if (page === 'review') { setNav('review'); view.className = 'view'; await review(themes, loadTheme, a, b); setNav('review'); }
    else if (page === 'vocab') await vocab();
    else if (page === 'progress') await progress();
    else if (page === 'settings') settings();
    else if (page === 'method') method();
    else if (page === 'certificate') { setNav('progress'); view.className = 'view'; certificatePage(a, themeIndex); }
    else if (page === 'teacher') { setNav('teacher'); view.className = 'view'; await teacherPage(a, { themeIndex, loadTheme }); }
    else if (page === 'practice') { setNav('practice'); view.className = 'view'; await practice(a, b, { themeIndex, loadTheme }); }
    else await home();
  } catch (e) {
    view.innerHTML = `<div class="session end">${keesSays('Oei!', 'Le contenu n\'a pas pu être chargé. Vérifiez la connexion et réessayez.', 'wow')}<a class="btn primary" href="#/">Accueil</a></div>`;
    console.error(e);
  }
}

let routing = false;
async function boot() {
  if (sync.enabled()) {
    let user = null;
    try { user = await sync.restore(); } catch (e) { /* offline with no library cached: fall through to local mode */ }
    if (!user && navigator.onLine) {
      document.body.classList.add('locked');
      sync.loginScreen(view, () => { document.body.classList.remove('locked'); boot(); });
      return;
    }
    if (user) {
      sync.isTeacher().then((yes) => { isTeacher = yes; renderChrome(); }).catch(() => {});
      Promise.all([sync.pull(), sync.refreshLearnerData().catch(() => false)])
        .then(([a, b]) => (a || b) && store.db().settings.onboarded && !document.body.classList.contains('focus') && route());
    }
  }
  if (!store.db().settings.onboarded) {
    document.body.classList.add('locked');
    await onboarding(themeIndex, loadTheme);
    document.body.classList.remove('locked');
    location.hash = '#/';
  }
  if (!routing) { window.addEventListener('hashchange', route); routing = true; }
  route();
}

async function init() {
  themeIndex = (await fetch('content/themes/index.json').then((r) => r.json())).themes;
  store.requestPersistence();
  sync.start();
  store.onChange(() => { if (!document.body.classList.contains('focus')) renderChrome(); });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js');
  }
  renderChrome();
  boot();
}

init();
