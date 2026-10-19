import { retrievability } from './fsrs.js';
import * as store from './store.js';
import * as sync from './sync.js';
import { runStep, nextStep } from './lesson.js';
import { review } from './review.js';
import { speakButton, stop, canRecord, record } from './audio.js';
import { esc } from './util.js';

const VERSION = '0.2';
const view = document.getElementById('view');
const nav = document.getElementById('nav');
const themes = {};
let themeIndex = [];

async function loadTheme(id) {
  if (!themes[id]) themes[id] = await fetch(`content/themes/${id}.json`).then((r) => r.json());
  return themes[id];
}

const readyThemes = () => themeIndex.filter((t) => t.status === 'ready');
const STEP_KIND = { words: 'Mots', grammar: 'Grammaire', dialogue: 'Dialogue', checkpoint: 'Bilan' };
const STEP_ICON = {
  words: '<path d="M5 5h14v10H9l-4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  grammar: '<path d="M4 7h16M4 12h10M4 17h13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  dialogue: '<path d="M3 6h11v7H7l-4 3zM10 16h6l4 3v-9h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  checkpoint: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
};

function setNav(active) {
  const due = store.dueKeys().length;
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.tab === active));
  const badge = nav.querySelector('[data-badge]');
  badge.textContent = due;
  badge.hidden = due === 0;
}

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

// ---------- home ----------

async function home() {
  setNav('home');
  await Promise.all(readyThemes().map((t) => loadTheme(t.id)));
  const due = store.dueKeys().length;
  const st = store.streak();
  const current = readyThemes().map((t) => themes[t.id]).find((t) => nextStep(t));
  const step = current && nextStep(current);
  const today = store.todayCount();

  view.innerHTML = `
    <header class="hello">
      <p class="eyebrow">${st > 0 ? `${st} jour${st > 1 ? 's' : ''} d'affilée` : 'Bienvenue'}${today ? ` · ${today} exercice${today > 1 ? 's' : ''} aujourd'hui` : ''}</p>
      <h1>Goeiedag!</h1>
    </header>

    <section class="today">
      ${due > 0 ? `
        <a class="card primary" href="#/review">
          <span class="big">${due}</span>
          <span><strong>Révisions du jour</strong><br><small>Environ ${Math.max(1, Math.round(due * 0.3))} min · à faire en premier</small></span>
        </a>` : ''}
      ${step ? `
        <a class="card next" href="#/step/${current.id}/${step.id}">
          <span class="stepicon"><svg viewBox="0 0 24 24">${STEP_ICON[step.type]}</svg></span>
          <span><span class="label">Continuer · ${esc(current.nl)} · étape ${current.steps.indexOf(step) + 1}/${current.steps.length}</span>
          <strong>${esc(step.title)}</strong></span>
        </a>` : ''}
      ${!due && !step ? `<div class="card calm"><strong>Tout est fait pour aujourd'hui.</strong><small>Revenez demain : les mots reviendront au bon moment.</small></div>` : ''}
    </section>

    <h2 class="section">Parcours</h2>
    <ul class="themes">
      ${themeIndex.map((t) => {
        if (t.status !== 'ready') return `
          <li class="theme soon"><span class="lvl">${esc(t.level)}</span>
            <span><strong>${esc(t.nl)}</strong><small>${esc(t.fr)}</small></span><em>bientôt</em></li>`;
        const p = themeProgress(themes[t.id]);
        return `
          <li><a class="theme" href="#/theme/${t.id}"><span class="lvl">${esc(t.level)}</span>
            <span><strong>${esc(t.nl)}</strong><small>${esc(t.fr)}</small>
            <span class="bar"><i style="width:${p.pct}%"></i></span></span>
            <em>${p.steps}/${p.totalSteps}</em></a></li>`;
      }).join('')}
    </ul>
    <a class="method-link" href="#/method">Comment fonctionne cette méthode ? ›</a>`;
}

// ---------- theme: the path ----------

async function themePage(id) {
  setNav('home');
  const t = await loadTheme(id);
  const next = nextStep(t);
  const check = store.getCheck(id);
  view.innerHTML = `
    <a class="back" href="#/">‹ Accueil</a>
    <header class="theme-head">
      <p class="eyebrow">${esc(t.level)} · ${esc(t.fr)}</p>
      <h1>${esc(t.nl)}</h1>
      <p class="lead">${esc(t.intro)}</p>
    </header>

    <h2 class="section">Objectifs</h2>
    <ul class="goals">${t.cando.map((c, k) => `<li class="${check?.cando?.[k] ? 'met' : ''}">${esc(c)}</li>`).join('')}</ul>

    <h2 class="section">Étapes</h2>
    <ol class="path">
      ${t.steps.map((s, k) => {
        const done = store.stepDone(id, s.id);
        const state = done ? 'done' : s === next ? 'next' : '';
        const count = s.type === 'words' ? ` · ${s.items.length}` : '';
        return `<li class="${state}"><a href="#/step/${id}/${s.id}">
          <span class="stepicon"><svg viewBox="0 0 24 24">${done ? STEP_ICON.checkpoint : STEP_ICON[s.type]}</svg></span>
          <span><small>${k + 1} · ${STEP_KIND[s.type]}${count}</small><strong>${esc(s.title)}</strong></span>
          <em>${done ? (s.type === 'checkpoint' && check ? `${Math.round(check.score * 10)}/10` : 'refaire') : s === next ? 'commencer' : ''}</em></a></li>`;
      }).join('')}
    </ol>

    <h2 class="section">Vocabulaire du thème</h2>
    <ul class="words">
      ${t.items.map((it) => { const s = wordStatus(id, it.id); return `
        <li>${speakButton(id, it.id, it.nl)}
          <span><strong lang="nl">${esc(it.nl)}</strong><small>${esc(it.fr)}</small></span>
          <span class="dot ${s}">${{ new: 'nouveau', learning: 'en cours', known: 'acquis' }[s]}</span></li>`; }).join('')}
    </ul>

    <h2 class="section">Bon à savoir</h2>
    <div class="tips">${t.tips.map((tp) => `<div class="tip"><strong>${esc(tp.title)}</strong><p>${esc(tp.text)}</p></div>`).join('')}</div>

    ${t.further?.length ? `
      <h2 class="section">Pour aller plus loin</h2>
      <ul class="further">${t.further.map((f) => `
        <li><a href="${esc(f.url)}" target="_blank" rel="noopener">
          <span class="kind">${esc(f.kind)} · ${esc(f.level)}</span><strong>${esc(f.title)}</strong><small>${esc(f.note)}</small></a></li>`).join('')}
      </ul>` : ''}`;
}

// ---------- progress ----------

async function progress() {
  setNav('progress');
  await Promise.all(readyThemes().map((t) => loadTheme(t.id)));
  const cards = Object.entries(store.db().cards);
  const wordCards = cards.filter(([k]) => !k.includes('#'));
  const now = Date.now();
  const avgR = cards.length ? cards.reduce((a, [, c]) => a + retrievability((now - c.last) / 864e5, c.s), 0) / cards.length : 0;
  const days = [];
  for (let i = 27; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(store.db().days[store.dayKey(d)] || 0); }
  const max = Math.max(1, ...days);
  const canDo = readyThemes().flatMap((t) => (store.getCheck(t.id)?.cando || []).filter(Boolean)).length;

  view.innerHTML = `
    <header class="hello"><p class="eyebrow">Votre parcours</p><h1>Progrès</h1></header>
    <div class="stats">
      <div class="stat"><span>${wordCards.length}</span><small>mots et expressions</small></div>
      <div class="stat"><span>${store.streak()}</span><small>jours d'affilée</small></div>
      <div class="stat"><span>${cards.length ? Math.round(avgR * 100) + ' %' : '—'}</span><small>mémoire estimée</small></div>
      <div class="stat"><span>${canDo}</span><small>« je peux… » acquis</small></div>
    </div>
    <h2 class="section">Les 4 dernières semaines</h2>
    <div class="heat" role="img" aria-label="Activité des 28 derniers jours">
      ${days.map((n) => `<i style="--a:${n ? 0.25 + 0.75 * (n / max) : 0}" title="${n}"></i>`).join('')}
    </div>
    <h2 class="section">Par thème</h2>
    <ul class="themes">
      ${readyThemes().map((t) => { const p = themeProgress(themes[t.id]); const c = store.getCheck(t.id); return `
        <li><a class="theme" href="#/theme/${t.id}"><span class="lvl">${esc(t.level)}</span>
          <span><strong>${esc(t.nl)}</strong><small>${p.steps}/${p.totalSteps} étapes · ${p.known} acquis · ${p.learning} en cours${c ? ` · bilan ${Math.round(c.score * 10)}/10` : ''}</small>
          <span class="bar"><i style="width:${p.pct}%"></i></span></span></a></li>`; }).join('')}
    </ul>
    <p class="fineprint">« Mémoire estimée » : la probabilité moyenne de retrouver aujourd'hui ce que vous avez appris, selon l'algorithme de répétition espacée. Un mot est « acquis » quand il tient au moins trois semaines.</p>`;
}

// ---------- method: why the app works the way it does ----------

function method() {
  setNav('settings');
  const P = [
    ['Se tester plutôt que relire', 'Chercher une réponse dans sa mémoire la renforce bien plus que la relire. Presque chaque écran vous demande donc de retrouver quelque chose.', 'Roediger & Karpicke, 2006'],
    ['Espacer les révisions', 'Revoir un mot juste avant de l\'oublier, à des intervalles de plus en plus longs, est l\'un des effets les plus solides de la psychologie de l\'apprentissage. L\'application calcule ce moment pour chaque mot (algorithme FSRS).', 'Cepeda et al., 2006 · Latimier, Peyre & Ramus, 2021 · Ye et al., 2022'],
    ['Bien apprendre avant d\'espacer', 'Un mot nouveau est répété plusieurs fois dans la leçon jusqu\'à être retrouvé sans aide ; ce n\'est qu\'ensuite qu\'il entre dans les révisions espacées.', ''],
    ['L\'oreille avant l\'œil', 'On écoute d\'abord, on lit ensuite. Le son et l\'écrit ensemble s\'ancrent mieux qu\'un seul des deux.', 'Mayer, 2009'],
    ['Beaucoup d\'écoute compréhensible', 'Les dialogues sont à votre niveau, juste un peu au-dessus : on comprend l\'essentiel grâce au contexte.', 'Krashen, 1982'],
    ['Expliquer la grammaire, en partant du français', 'Pour les adultes, une règle expliquée clairement aide. Chaque point est comparé au français : ce qui est pareil, ce qui piège.', 'Norris & Ortega, 2000'],
    ['Mélanger', 'Les révisions mélangent les thèmes et les façons d\'interroger (dire, écrire, écouter) : c\'est plus difficile sur le moment, et plus durable.', ''],
    ['Parler tout de suite', 'Répéter à voix haute, s\'enregistrer et comparer, jouer un rôle : la production orale commence dès la première leçon.', ''],
    ['Des objectifs clairs', 'Chaque thème annonce ce que vous saurez faire (« je peux… », comme le Cadre européen de référence) et se termine par un bilan.', 'Conseil de l\'Europe, CECR'],
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
  const u = sync.currentUser();
  view.innerHTML = `
    <header class="hello"><p class="eyebrow">Application</p><h1>Réglages</h1></header>
    ${sync.enabled() ? `
      <h2 class="section">Compte</h2>
      <div class="group">
        <p class="small">${u ? `Connecté : <strong>${esc(u.email)}</strong><br>Progression sauvegardée en ligne ${{ ok: '✓', pending: '(en cours…)', error: '— hors ligne, réessai automatique', off: '' }[sync.syncStatus()]}` : 'Non connecté.'}</p>
        ${u ? '<button class="btn" id="logout">Se déconnecter</button>' : ''}
      </div>` : ''}
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
  document.getElementById('export').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' }));
    a.download = `nederlands-progression-${store.dayKey()}.json`;
    a.click();
  };
  document.getElementById('reset').onclick = () => {
    if (confirm('Effacer la progression de cet appareil ? Si vous êtes connecté, elle reviendra depuis votre compte.')) { store.reset(); location.hash = '#/'; }
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

async function route() {
  stop();
  const [, page, a, b] = location.hash.split('/');
  window.scrollTo(0, 0);
  try {
    if (page === 'theme') await themePage(a);
    else if (page === 'step') { setNav('home'); await runStep(await loadTheme(a), b); }
    else if (page === 'review') { setNav('review'); await review(themes, loadTheme); setNav('review'); }
    else if (page === 'progress') await progress();
    else if (page === 'settings') settings();
    else if (page === 'method') method();
    else await home();
  } catch (e) {
    view.innerHTML = `<div class="session end"><h1>Oups.</h1><p class="lead">Le contenu n'a pas pu être chargé. Vérifiez la connexion et réessayez.</p><a class="btn primary" href="#/">Accueil</a></div>`;
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
    if (user) sync.pull().then((changed) => changed && route());
  }
  if (!routing) { window.addEventListener('hashchange', route); routing = true; }
  route();
}

async function init() {
  themeIndex = (await fetch('content/themes/index.json').then((r) => r.json())).themes;
  store.requestPersistence();
  sync.start();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js');
  }
  boot();
}

init();
