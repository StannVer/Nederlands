import { Rating, schedule, intervalLabel, retrievability } from './fsrs.js';
import * as store from './store.js';

const view = document.getElementById('view');
const nav = document.getElementById('nav');
const themes = {};      // id -> full theme json
let themeIndex = [];    // [{id, nl, fr, level, status}]

// ---------- helpers ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/…|\.\.\./g, ' ').replace(/[.,!?;:¿¡'"«»—-]/g, ' ').replace(/\s+/g, ' ').trim();

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function isCorrect(item, answer) {
  const given = norm(answer);
  return given !== '' && [item.nl, ...(item.accept || [])].some((a) => norm(a) === given);
}

function itemByKey(key) {
  const [themeId, id] = key.split('/');
  const item = themes[themeId]?.items.find((i) => i.id === id);
  return item ? { themeId, item } : null;
}

async function loadTheme(id) {
  if (!themes[id]) themes[id] = await fetch(`content/themes/${id}.json`).then((r) => r.json());
  return themes[id];
}

// ---------- audio: Stan's recordings first, a synthetic voice as a stand-in ----------

let lastAudio = null;
function speak(themeId, id, text) {
  if (lastAudio) lastAudio.pause();
  speechSynthesis?.cancel?.();
  const a = new Audio(`audio/${themeId}/${id}.m4a`);
  lastAudio = a;
  a.play().catch(() => tts(text));
}

function tts(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(String(text).replace(/…/g, ''));
  const voices = speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang === 'nl-BE') || voices.find((x) => x.lang?.startsWith('nl'));
  if (v) u.voice = v;
  u.lang = v?.lang || 'nl-BE';
  u.rate = 0.85;
  speechSynthesis.speak(u);
}

const speakBtn = (themeId, id, text, label = 'Écouter') =>
  `<button class="speak" data-speak="${esc(themeId)}|${esc(id)}|${esc(text)}" aria-label="${label}">
     <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
   </button>`;

view.addEventListener('click', (e) => {
  const b = e.target.closest('[data-speak]');
  if (!b) return;
  const [t, id, text] = b.dataset.speak.split('|');
  speak(t, id, text);
});

// ---------- views ----------

function setNav(active) {
  const due = store.dueKeys().length;
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.tab === active));
  const badge = nav.querySelector('[data-badge]');
  badge.textContent = due;
  badge.hidden = due === 0;
}

function themeCounts(theme) {
  const now = Date.now();
  let fresh = 0, learning = 0, known = 0;
  for (const it of theme.items) {
    const c = store.getCard(theme.id, it.id);
    if (!c) fresh++;
    else if (retrievability((now - c.last) / 864e5, c.s) > 0.9 && c.s >= 7) known++;
    else learning++;
  }
  return { fresh, learning, known, total: theme.items.length };
}

async function home() {
  setNav('home');
  const due = store.dueKeys().length;
  const st = store.streak();
  const ready = themeIndex.filter((t) => t.status === 'ready');
  await Promise.all(ready.map((t) => loadTheme(t.id)));
  const next = ready.find((t) => themeCounts(themes[t.id]).fresh > 0);

  view.innerHTML = `
    <header class="hello">
      <p class="eyebrow">${st > 0 ? `${st} jour${st > 1 ? 's' : ''} d'affilée` : 'Bienvenue'}</p>
      <h1>Goeiedag!</h1>
    </header>

    <section class="today">
      ${due > 0 ? `
        <a class="card primary" href="#/review">
          <span class="big">${due}</span>
          <span><strong>Révisions du jour</strong><br><small>Environ ${Math.max(1, Math.round(due * 0.25))} min</small></span>
        </a>` : `
        <div class="card calm">
          <strong>Rien à réviser pour l'instant.</strong>
          <small>Les mots reviennent juste avant que vous ne les oubliiez.</small>
        </div>`}
      ${next ? `
        <a class="card" href="#/lesson/${next.id}">
          <span class="label">Nouvelle leçon</span>
          <strong>${esc(next.nl)}</strong> <small>${esc(next.fr)}</small>
        </a>` : ''}
    </section>

    <h2 class="section">Thèmes</h2>
    <ul class="themes">
      ${themeIndex.map((t) => {
        if (t.status !== 'ready') return `
          <li class="theme soon"><span class="lvl">${esc(t.level)}</span>
            <span><strong>${esc(t.nl)}</strong><small>${esc(t.fr)}</small></span><em>bientôt</em></li>`;
        const c = themeCounts(themes[t.id]);
        const pct = Math.round(((c.known + c.learning * 0.5) / c.total) * 100);
        return `
          <li><a class="theme" href="#/theme/${t.id}"><span class="lvl">${esc(t.level)}</span>
            <span><strong>${esc(t.nl)}</strong><small>${esc(t.fr)}</small>
            <span class="bar"><i style="width:${pct}%"></i></span></span>
            <em>${c.total - c.fresh}/${c.total}</em></a></li>`;
      }).join('')}
    </ul>`;
}

async function themePage(id) {
  setNav('home');
  const t = await loadTheme(id);
  const c = themeCounts(t);
  const status = (it) => {
    const card = store.getCard(id, it.id);
    if (!card) return ['new', 'nouveau'];
    return card.s >= 7 ? ['known', 'acquis'] : ['learning', 'en cours'];
  };
  view.innerHTML = `
    <a class="back" href="#/">‹ Accueil</a>
    <header class="theme-head">
      <p class="eyebrow">${esc(t.level)} · ${esc(t.fr)}</p>
      <h1>${esc(t.nl)}</h1>
      <p class="lead">${esc(t.intro)}</p>
      ${c.fresh > 0 ? `<a class="btn primary" href="#/lesson/${id}">Commencer la leçon</a>` : `<p class="done">Tous les mots sont en cours d'apprentissage.</p>`}
    </header>

    <h2 class="section">Vocabulaire</h2>
    <ul class="words">
      ${t.items.map((it) => { const [cls, lbl] = status(it); return `
        <li>${speakBtn(id, it.id, it.nl)}
          <span><strong lang="nl">${esc(it.nl)}</strong><small>${esc(it.fr)}</small></span>
          <span class="dot ${cls}" title="${lbl}">${lbl}</span></li>`; }).join('')}
    </ul>

    <h2 class="section">Dialogue — ${esc(t.dialogue.title)}</h2>
    <ol class="dialogue">
      ${t.dialogue.lines.map((l) => `
        <li>${speakBtn(id, l.id, l.nl)}
          <span><b>${esc(l.who)}</b> <span lang="nl">${esc(l.nl)}</span>
          <details><summary>traduction</summary>${esc(l.fr)}</details></span></li>`).join('')}
    </ol>

    <h2 class="section">Bon à savoir</h2>
    <div class="tips">${t.tips.map((tp) => `<div class="tip"><strong>${esc(tp.title)}</strong><p>${esc(tp.text)}</p></div>`).join('')}</div>`;
}

// ----- lesson: introduce new items, then drill them until each is recalled twice -----

async function lesson(id) {
  setNav('home');
  const t = await loadTheme(id);
  const n = store.db().settings.newPerLesson;
  const batch = t.items.filter((it) => !store.getCard(id, it.id)).slice(0, n);
  if (batch.length === 0) { location.hash = `#/theme/${id}`; return; }

  let i = 0;
  const introduce = () => {
    const it = batch[i];
    view.innerHTML = `
      <div class="session">
        ${progressBar(i, batch.length * 3, 'Découverte')}
        <article class="flash intro">
          <p class="eyebrow">Nouveau · ${i + 1}/${batch.length}</p>
          <h1 lang="nl">${esc(it.nl)}</h1>
          ${speakBtn(id, it.id, it.nl)}
          <p class="fr">${esc(it.fr)}</p>
          <div class="example">${speakBtn(id, `${it.id}-ex`, it.ex_nl, 'Écouter l\'exemple')}<div><p lang="nl">${esc(it.ex_nl)}</p><p class="fr">${esc(it.ex_fr)}</p></div></div>
          ${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
        </article>
        <button class="btn primary wide" id="next">${i + 1 < batch.length ? 'Suivant' : 'On s\'entraîne'}</button>
      </div>`;
    speak(id, it.id, it.nl);
    document.getElementById('next').onclick = () => { i++; i < batch.length ? introduce() : drill(); };
  };

  // Each item must pass a recognition task, then a typed recall. A miss sends it back into the queue.
  const state = Object.fromEntries(batch.map((it) => [it.id, { need: ['mc', 'type'], errors: 0 }]));
  let queue = shuffle(batch.map((it) => it.id));
  const totalSteps = batch.length * 3;
  let doneSteps = batch.length;

  const drill = () => {
    if (queue.length === 0) return finish();
    const it = batch.find((x) => x.id === queue[0]);
    const task = state[it.id].need[0];
    task === 'mc' ? mc(it) : typed(it);
  };

  const answered = (it, ok, correctHtml) => {
    const s = state[it.id];
    if (ok) { s.need.shift(); doneSteps++; } else { s.errors++; s.need = ['type']; }
    queue.shift();
    if (s.need.length) queue.splice(Math.min(queue.length, 2 + Math.floor(Math.random() * 2)), 0, it.id);
    const fb = document.getElementById('feedback');
    fb.className = `feedback ${ok ? 'ok' : 'ko'}`;
    fb.innerHTML = `<strong>${ok ? 'Juste !' : 'Pas tout à fait.'}</strong> ${correctHtml}
      <button class="btn primary wide" id="cont">Continuer</button>`;
    speak(id, it.id, it.nl);
    document.getElementById('cont').onclick = drill;
    document.getElementById('cont').focus();
  };

  const mc = (it) => {
    const options = shuffle([it, ...shuffle(t.items.filter((x) => x.id !== it.id)).slice(0, 3)]);
    view.innerHTML = `
      <div class="session">
        ${progressBar(doneSteps, totalSteps, 'Reconnaître')}
        <article class="flash">
          <p class="eyebrow">Que veut dire…</p>
          <h1 lang="nl">${esc(it.nl)}</h1>
          ${speakBtn(id, it.id, it.nl)}
        </article>
        <div class="choices">${options.map((o) => `<button class="choice" data-id="${o.id}">${esc(o.fr)}</button>`).join('')}</div>
        <div id="feedback" class="feedback"></div>
      </div>`;
    speak(id, it.id, it.nl);
    view.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
      const ok = b.dataset.id === it.id;
      view.querySelectorAll('.choice').forEach((x) => {
        x.disabled = true;
        if (x.dataset.id === it.id) x.classList.add('right');
        else if (x === b) x.classList.add('wrong');
      });
      answered(it, ok, ok ? '' : `<span lang="nl">${esc(it.nl)}</span> = ${esc(it.fr)}`);
    });
  };

  const typed = (it) => {
    view.innerHTML = `
      <div class="session">
        ${progressBar(doneSteps, totalSteps, 'Retrouver')}
        <article class="flash">
          <p class="eyebrow">Comment dit-on…</p>
          <h1 class="fr-prompt">${esc(it.fr)}</h1>
        </article>
        <form id="f" class="typed">
          <input id="a" lang="nl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="En néerlandais…" enterkeyhint="done">
          <div class="row"><button type="button" class="btn ghost" id="idk">Je ne sais pas</button><button class="btn primary">Vérifier</button></div>
        </form>
        <div id="feedback" class="feedback"></div>
      </div>`;
    const input = document.getElementById('a');
    input.focus();
    const submit = (given) => {
      document.getElementById('f').remove();
      const ok = isCorrect(it, given);
      answered(it, ok, `<span lang="nl" class="answer">${esc(it.nl)}</span>${!ok && given ? `<small>Vous avez écrit : ${esc(given)}</small>` : ''}`);
    };
    document.getElementById('f').onsubmit = (e) => { e.preventDefault(); submit(input.value); };
    document.getElementById('idk').onclick = () => submit('');
  };

  const finish = () => {
    const now = Date.now();
    for (const it of batch) {
      const e = state[it.id].errors;
      store.setCard(id, it.id, schedule(null, e === 0 ? Rating.Good : e === 1 ? Rating.Hard : Rating.Again, now));
    }
    store.logActivity(batch.length);
    const perfect = batch.filter((it) => state[it.id].errors === 0).length;
    view.innerHTML = `
      <div class="session end">
        <p class="eyebrow">Leçon terminée</p>
        <h1>Goed gedaan!</h1>
        <p class="lead">${batch.length} nouveaux mots — ${perfect} sans erreur.<br>Ils reviendront en révision dans les prochains jours, juste avant que vous ne les oubliiez.</p>
        <a class="btn primary wide" href="#/">Retour à l'accueil</a>
      </div>`;
  };

  introduce();
}

function progressBar(done, total, label) {
  return `<div class="progress"><a href="#/" class="close" aria-label="Quitter">✕</a>
    <span class="bar"><i style="width:${Math.round((done / total) * 100)}%"></i></span><small>${label}</small></div>`;
}

// ----- review: French prompt, say it aloud, reveal, grade yourself -----

async function review() {
  setNav('review');
  const keys = store.dueKeys();
  if (keys.length === 0) {
    view.innerHTML = `<div class="session end"><p class="eyebrow">Révisions</p><h1>Tout est à jour.</h1>
      <p class="lead">Revenez demain — ou commencez une nouvelle leçon.</p><a class="btn primary wide" href="#/">Accueil</a></div>`;
    return;
  }
  await Promise.all([...new Set(keys.map((k) => k.split('/')[0]))].map(loadTheme));
  const queue = keys.filter(itemByKey);
  const total = queue.length;
  let done = 0;

  const next = () => {
    if (queue.length === 0) {
      view.innerHTML = `<div class="session end"><p class="eyebrow">Révisions terminées</p><h1>Super!</h1>
        <p class="lead">${total} révision${total > 1 ? 's' : ''} aujourd'hui.</p><a class="btn primary wide" href="#/">Accueil</a></div>`;
      setNav('review');
      return;
    }
    const key = queue[0];
    const { themeId, item } = itemByKey(key);
    const card = store.getCard(themeId, item.id);
    view.innerHTML = `
      <div class="session">
        ${progressBar(done, total, `${total - done} restantes`)}
        <article class="flash">
          <p class="eyebrow">Dites-le à voix haute</p>
          <h1 class="fr-prompt">${esc(item.fr)}</h1>
          <div id="answer" hidden>
            <p class="answer" lang="nl">${esc(item.nl)}</p>
            ${speakBtn(themeId, item.id, item.nl)}
            <div class="example">${speakBtn(themeId, `${item.id}-ex`, item.ex_nl, 'Écouter l\'exemple')}<div><p lang="nl">${esc(item.ex_nl)}</p><p class="fr">${esc(item.ex_fr)}</p></div></div>
          </div>
        </article>
        <button class="btn primary wide" id="reveal">Afficher la réponse</button>
        <div class="grades" id="grades" hidden>
          ${[[Rating.Again, 'Oublié'], [Rating.Hard, 'Difficile'], [Rating.Good, 'Bien'], [Rating.Easy, 'Facile']].map(([g, l]) =>
            `<button class="grade g${g}" data-g="${g}"><strong>${l}</strong><small>${intervalLabel(card, g)}</small></button>`).join('')}
        </div>
      </div>`;
    document.getElementById('reveal').onclick = (e) => {
      e.target.remove();
      document.getElementById('answer').hidden = false;
      document.getElementById('grades').hidden = false;
      speak(themeId, item.id, item.nl);
    };
    view.querySelectorAll('.grade').forEach((b) => b.onclick = () => {
      const g = Number(b.dataset.g);
      const updated = schedule(card, g);
      store.setCard(themeId, item.id, updated);
      store.logActivity(1);
      queue.shift();
      if (g === Rating.Again) queue.push(key); else done++;
      next();
    });
  };
  next();
}

// ----- progress -----

async function progress() {
  setNav('progress');
  const ready = themeIndex.filter((t) => t.status === 'ready');
  await Promise.all(ready.map((t) => loadTheme(t.id)));
  const cards = Object.values(store.db().cards);
  const now = Date.now();
  const avgR = cards.length ? cards.reduce((a, c) => a + retrievability((now - c.last) / 864e5, c.s), 0) / cards.length : 0;
  const days = [];
  for (let i = 27; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(store.db().days[store.dayKey(d)] || 0); }
  const max = Math.max(1, ...days);

  view.innerHTML = `
    <header class="hello"><p class="eyebrow">Votre parcours</p><h1>Progrès</h1></header>
    <div class="stats">
      <div class="stat"><span>${cards.length}</span><small>mots appris</small></div>
      <div class="stat"><span>${store.streak()}</span><small>jours d'affilée</small></div>
      <div class="stat"><span>${cards.length ? Math.round(avgR * 100) + ' %' : '—'}</span><small>mémoire estimée</small></div>
      <div class="stat"><span>${store.db().reviews}</span><small>exercices faits</small></div>
    </div>
    <h2 class="section">Les 4 dernières semaines</h2>
    <div class="heat" role="img" aria-label="Activité des 28 derniers jours">
      ${days.map((n) => `<i style="--a:${n ? 0.25 + 0.75 * (n / max) : 0}" title="${n}"></i>`).join('')}
    </div>
    <h2 class="section">Par thème</h2>
    <ul class="themes">
      ${ready.map((t) => { const c = themeCounts(themes[t.id]); return `
        <li class="theme"><span class="lvl">${esc(t.level)}</span>
          <span><strong>${esc(t.nl)}</strong><small>${c.known} acquis · ${c.learning} en cours · ${c.fresh} nouveaux</small>
          <span class="bar"><i style="width:${Math.round(((c.known + c.learning * 0.5) / c.total) * 100)}%"></i></span></span></li>`; }).join('')}
    </ul>
    <p class="fineprint">« Mémoire estimée » : la probabilité moyenne de retrouver un mot aujourd'hui, selon l'algorithme de répétition espacée.</p>`;
}

// ----- settings, including the microphone test for the iPhone -----

function settings() {
  setNav('settings');
  const s = store.db().settings;
  view.innerHTML = `
    <header class="hello"><p class="eyebrow">Application</p><h1>Réglages</h1></header>
    <div class="group">
      <label class="row-setting">Nouveaux mots par leçon
        <select id="npl">${[3, 5, 8].map((n) => `<option ${n === s.newPerLesson ? 'selected' : ''}>${n}</option>`).join('')}</select>
      </label>
    </div>
    <h2 class="section">Micro</h2>
    <div class="group">
      <p class="small">Vérifie que l'enregistrement fonctionne sur cet appareil (nécessaire pour comparer votre prononciation).</p>
      <button class="btn" id="mic">Tester le micro (3 s)</button>
      <div id="micout" class="micout"></div>
    </div>
    <h2 class="section">Données</h2>
    <div class="group">
      <button class="btn" id="export">Exporter ma progression</button>
      <button class="btn danger" id="reset">Tout effacer</button>
    </div>
    <p class="fineprint">Version 0.1 · Phase 1</p>`;

  document.getElementById('npl').onchange = (e) => { s.newPerLesson = Number(e.target.value); store.save(); };
  document.getElementById('mic').onclick = micTest;
  document.getElementById('export').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' }));
    a.download = `nederlands-progression-${store.dayKey()}.json`;
    a.click();
  };
  document.getElementById('reset').onclick = () => {
    if (confirm('Effacer toute la progression ? Cette action est définitive.')) { store.reset(); location.hash = '#/'; }
  };
}

async function micTest() {
  const out = document.getElementById('micout');
  const btn = document.getElementById('mic');
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    out.innerHTML = '<p class="ko">Enregistrement non pris en charge ici.</p>';
    return;
  }
  try {
    btn.disabled = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType });
      const ok = blob.size > 1000;
      out.innerHTML = `<p class="${ok ? 'ok' : 'ko'}">${ok ? 'Le micro fonctionne.' : 'Enregistrement vide — le micro ne fonctionne pas ici.'}</p>
        <audio controls src="${URL.createObjectURL(blob)}"></audio>
        <small>${esc(rec.mimeType || 'format inconnu')} · ${Math.round(blob.size / 1024)} Ko</small>`;
      btn.disabled = false;
    };
    rec.start();
    let left = 3;
    out.innerHTML = `<p>Parlez… ${left}</p>`;
    const tick = setInterval(() => { left--; out.innerHTML = `<p>Parlez… ${left}</p>`; if (left <= 0) { clearInterval(tick); rec.stop(); } }, 1000);
  } catch (e) {
    btn.disabled = false;
    out.innerHTML = `<p class="ko">Accès au micro refusé ou impossible (${esc(e.name)}).</p>`;
  }
}

// ---------- router ----------

async function route() {
  const [, page, arg] = location.hash.split('/');
  window.scrollTo(0, 0);
  try {
    if (page === 'theme') await themePage(arg);
    else if (page === 'lesson') await lesson(arg);
    else if (page === 'review') await review();
    else if (page === 'progress') await progress();
    else if (page === 'settings') settings();
    else await home();
  } catch (e) {
    view.innerHTML = `<div class="session end"><h1>Oups.</h1><p class="lead">Le contenu n'a pas pu être chargé. Vérifiez la connexion et réessayez.</p><a class="btn primary" href="#/">Accueil</a></div>`;
    console.error(e);
  }
}

async function init() {
  themeIndex = (await fetch('content/themes/index.json').then((r) => r.json())).themes;
  store.requestPersistence();
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js');
  }
}

init();
