// "Pratique": everything outside the course path — pronunciation, graded stories, dictation, own
// words, the teacher's words, custom lessons, questions, a grammar reference and the Flemish corner.
import * as ex from './exercises.js';
import * as store from './store.js';
import * as sync from './sync.js';
import { learnItems } from './lesson.js';
import { virtualTheme, pending } from './extra.js';
import { speak, speakButton, stop, canRecord, record, speakFr } from './audio.js';
import { esc, norm, shuffle } from './util.js';
import { CONFIG } from './config.js';

const view = () => document.getElementById('view');
const cache = {};
const content = async (name) => (cache[name] ||= await fetch(`content/${name}.json`).then((r) => r.json()));
const back = (href = '#/practice', label = 'Pratique') => `<a class="back" href="${href}">‹ ${esc(label)}</a>`;

const ICON = {
  pron: '<path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11.5a6 6 0 0 0 12 0M12 17.5V20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  stories: '<path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM17 7.5h2V20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  dictee: '<path d="M4 19l4-1 10-10-3-3L5 15zM13.5 6.5l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  mywords: '<path d="M6 4h12v16l-6-4-6 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  stan: '<circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 20c1-4 3.8-6 7-6s6 2 7 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  lessons: '<path d="M4 6l8-3 8 3-8 3zM7 7.5V13c0 1.5 2.5 3 5 3s5-1.5 5-3V7.5M20 6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  ask: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 9a2 2 0 1 1 3 1.7c-.6.3-1 .8-1 1.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  grammar: '<path d="M4 7h16M4 12h10M4 17h13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  vlaams: '<path d="M6 21V4M6 4.5h11l-2.5 4 2.5 4H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  paires: '<rect x="3.5" y="5" width="7" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="5" width="7" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>',
  ecoute: '<path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM17 14h3v5h-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  parler: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.5 10.5h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};

export async function practice(sub, arg, ctx) {
  stop();
  const pages = { pron, stories, story, dictee, mywords, stan, lessons, ask, grammar, vlaams, paires, ecoute, parler };
  if (pages[sub]) return pages[sub](arg, ctx);
  return hub(ctx);
}

// ---------- hub ----------

function hub() {
  const p = (id) => pending(id).length;
  const teacherWords = (store.db().teacherItems || []).length;
  const custom = (store.db().customLessons || []).length;
  const tiles = [
    ['pron', 'Prononciation', 'Entendre puis dire les sons difficiles'],
    ...(ex.speakingOn() ? [['parler', 'Parler', 'Le téléphone vérifie votre prononciation']] : []),
    ['ecoute', 'Écoute libre', 'Sans écran : en marchant, en voiture'],
    ['paires', 'Jeu des paires', 'Vos mots, en vitesse'],
    ['stories', 'Histoires', 'Lire et écouter des textes à votre niveau'],
    ['dictee', 'Dictée', 'Écouter et écrire'],
    ['mywords', 'Mes mots', p('perso') ? `${p('perso')} à apprendre` : 'Ajoutez vos propres mots'],
    ...(teacherWords ? [['stan', `Mots de ${CONFIG.teacherName}`, p('stan') ? `${p('stan')} nouveau${p('stan') > 1 ? 'x' : ''}` : `${teacherWords} mots`]] : []),
    ...(custom ? [['lessons', 'Mes leçons', `${custom} leçon${custom > 1 ? 's' : ''} préparée${custom > 1 ? 's' : ''} pour vous`]] : []),
    ...(sync.currentUser() ? [['ask', 'Poser une question', `${CONFIG.teacherName} vous prépare une leçon`]] : []),
    ['grammar', 'Grammaire', 'Toutes les règles vues'],
    ['vlaams', 'Coin flamand', 'Ce qu\'on entend vraiment en Flandre'],
  ];
  view().innerHTML = `
    <header class="hello"><p class="eyebrow">En plus du parcours</p><h1>Pratique</h1></header>
    <div class="tiles">${tiles.map(([id, t, s]) => `
      <a class="tile-card" href="#/practice/${id}">
        <span class="stepicon"><svg viewBox="0 0 24 24">${ICON[id]}</svg></span>
        <strong>${esc(t)}</strong><small>${esc(s)}</small></a>`).join('')}
    </div>`;
}

// ---------- pronunciation: hear the difference, then produce it ----------

async function pron(id) {
  const c = await content('pronunciation');
  if (!id) {
    view().innerHTML = `${back()}
      <header class="theme-head"><p class="eyebrow">Prononciation</p><h1>Les sons du néerlandais</h1><p class="lead">${esc(c.intro)}</p></header>
      <ul class="themes">${c.contrasts.map((k) => { const s = store.db().pron?.[k.id]; return `
        <li><a class="theme" href="#/practice/pron/${k.id}"><span class="lvl" lang="nl">${esc(k.title.split(' · ')[0])}</span>
          <span><strong lang="nl">${esc(k.title)}</strong><small>${k.pairs.length} paires${s ? ` · meilleur score ${s.best}/8` : ''}</small></span></a></li>`; }).join('')}
      </ul>`;
    return;
  }
  const k = c.contrasts.find((x) => x.id === id);
  const sp = (w) => speakButton('pron', `${k.id}-${norm(w)}`, w);

  // 1. listen to the pairs
  await new Promise((resolve) => {
    view().innerHTML = `
      <div class="session">${ex.header(0, 3, 'Écouter')}
        <article class="flash">
          <p class="eyebrow">Prononciation</p><h1 lang="nl">${esc(k.title)}</h1>
          <p>${esc(k.explain)}</p>
          <ul class="pairs">${k.pairs.map((p) => `<li>
            <span>${sp(p.a)}<strong lang="nl">${esc(p.a)}</strong><small>${esc(p.a_fr)}</small></span>
            <span>${sp(p.b)}<strong lang="nl">${esc(p.b)}</strong><small>${esc(p.b_fr)}</small></span></li>`).join('')}
          </ul>
        </article>
        <button class="btn primary wide" id="go">Je suis prêt(e) : test d'écoute</button>
      </div>`;
    document.getElementById('go').onclick = resolve;
  });

  // 2. discrimination: which of the two did you hear?
  let right = 0;
  const rounds = shuffle([...k.pairs, ...k.pairs]).slice(0, 8);
  for (let r = 0; r < rounds.length; r++) {
    const p = rounds[r];
    const target = Math.random() < 0.5 ? 'a' : 'b';
    const word = p[target];
    const ok = await new Promise((resolve) => {
      view().innerHTML = `
        <div class="session">${ex.header(1, 3, `Écoute ${r + 1}/8`)}
          <article class="flash center"><p class="eyebrow">Quel mot entendez-vous ?</p>
            <button class="speak big" id="again" aria-label="Réécouter"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></article>
          <div class="choices inline">${['a', 'b'].map((s) => `<button class="choice" data-s="${s}" lang="nl">${esc(p[s])}<small>${esc(p[`${s}_fr`])}</small></button>`).join('')}</div>
          <div id="feedback" class="feedback"></div>
        </div>`;
      const play = () => speak('pron', `${k.id}-${norm(word)}`, word);
      play();
      document.getElementById('again').onclick = play;
      document.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
        const good = b.dataset.s === target;
        document.querySelectorAll('.choice').forEach((x) => { x.disabled = true; if (x.dataset.s === target) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
        const fb = document.getElementById('feedback');
        fb.className = `feedback ${good ? 'ok' : 'ko'}`;
        fb.innerHTML = `<strong>${good ? 'Juste !' : `C'était « ${esc(word)} ».`}</strong>
          <div class="compare">${sp(p.a)}<span lang="nl">${esc(p.a)}</span>${sp(p.b)}<span lang="nl">${esc(p.b)}</span></div>
          <button class="btn primary wide" id="cont">Continuer</button>`;
        document.getElementById('cont').onclick = () => resolve(good);
      });
    });
    if (ok) right++;
  }
  store.setPron(k.id, right);
  store.logActivity(rounds.length);

  // 3. say them: record and compare
  await new Promise((resolve) => {
    view().innerHTML = `
      <div class="session">${ex.header(2, 3, 'Dire')}
        <article class="flash">
          <p class="eyebrow">Test d'écoute : ${right}/8</p>
          <h1 class="fr-prompt">${right >= 7 ? 'Votre oreille fait la différence. À vous de la faire entendre !' : 'Cette différence demande encore de l\'écoute. Répétez les paires, puis refaites le test un autre jour.'}</h1>
          ${canRecord() ? '<p class="small">Écoutez un mot, dites-le, enregistrez-vous et comparez.</p>' : '<p class="small">Écoutez chaque paire et répétez-la à voix haute.</p>'}
          <ul class="pairs">${k.pairs.map((p, i) => `<li>
            <span>${sp(p.a)}<strong lang="nl">${esc(p.a)}</strong></span><span>${sp(p.b)}<strong lang="nl">${esc(p.b)}</strong></span>
            ${canRecord() ? `<button class="btn small rec" data-i="${i}">● Moi</button>` : ''}</li>`).join('')}
          </ul>
          <div id="mine"></div>
        </article>
        <a class="btn primary wide" href="#/practice/pron">Terminer</a>
      </div>`;
    document.querySelectorAll('.rec').forEach((b) => b.onclick = async () => {
      try {
        b.disabled = true; b.textContent = '● …';
        const r = await record(3500);
        const blob = await r.done;
        const url = URL.createObjectURL(blob);
        new Audio(url).play();
        b.textContent = '▶ Moi';
        b.disabled = false;
        b.onclick = () => new Audio(url).play();
      } catch (e) { b.textContent = 'micro ?'; }
    });
    resolve();
  });
}

// ---------- graded stories ----------

async function stories(_, ctx) {
  const c = await content('stories');
  const units = ctx.themeIndex.filter((t) => c.stories.some((s) => s.after === t.id));
  const started = (id) => Object.keys(store.db().steps || {}).some((k) => k.startsWith(`${id}/`));
  view().innerHTML = `${back()}
    <header class="theme-head"><p class="eyebrow">Lire et écouter</p><h1>Histoires</h1><p class="lead">${esc(c.intro)}</p></header>
    ${units.map((u) => `
      <h2 class="section">Après l'unité « ${esc(u.nl)} »${started(u.id) ? '' : ' · à lire plus tard'}</h2>
      <ul class="themes">${c.stories.filter((s) => s.after === u.id).map((s) => { const r = store.db().stories?.[s.id]; return `
        <li><a class="theme ${started(u.id) ? '' : 'soon'}" href="#/practice/story/${s.id}"><span class="lvl">${r ? '✓' : esc(s.level)}</span>
          <span><strong lang="nl">${esc(s.title)}</strong><small>${esc(s.fr)}${r ? ` · lue · ${r.score}/${s.questions.length}` : ''}</small></span></a></li>`; }).join('')}
      </ul>`).join('')}`;
}

async function story(id, ctx) {
  const c = await content('stories');
  const s = c.stories.find((x) => x.id === id);
  if (!s) { location.hash = '#/practice/stories'; return; }
  // Words the learner has met in the course: every word of every learned item counts.
  // Words met anywhere in the course so far (every learned item of every unit) count as known.
  const all = await Promise.all(ctx.themeIndex.filter((t) => t.status === 'ready').map((t) => ctx.loadTheme(t.id)));
  const theme = { items: all.flatMap((t) => t.items) };
  const learned = new Set();
  for (const t of all) for (const it of t.items) if (store.getCard(`${t.id}/${it.id}`)) [it.nl, it.ex_nl].forEach((x) => norm(x || '').split(' ').forEach((w) => w && learned.add(w)));
  (store.db().mywords || []).forEach((w) => norm(w.nl).split(' ').forEach((x) => learned.add(x)));
  const tokens = s.lines.flatMap((l) => norm(l.nl).split(' ').filter(Boolean));
  const coverage = tokens.length ? Math.round((tokens.filter((w) => learned.has(w)).length / tokens.length) * 100) : 0;

  const wordBtn = (raw) => {
    const key = norm(raw);
    return key ? `<button class="w ${learned.has(key) ? '' : 'new'}" data-w="${esc(key)}">${esc(raw)}</button>` : esc(raw);
  };
  const lineHtml = (l) => l.nl.split(/(\s+)/).map((part) => (/\s+/.test(part) ? part : wordBtn(part))).join('');

  view().innerHTML = `${back('#/practice/stories', 'Histoires')}
    <header class="theme-head"><p class="eyebrow">${esc(s.level)} · ${esc(s.fr)}</p><h1 lang="nl">${esc(s.title)}</h1>
      <p class="small">${coverage ? `Vous connaissez déjà environ ${coverage} % des mots.` : 'Faites d\'abord le thème « Kennismaken » : vous comprendrez presque tout.'} Les mots soulignés sont nouveaux : touchez-les.</p>
      <button class="btn" id="playall">▶ Écouter l'histoire</button></header>
    <ol class="story">${s.lines.map((l, k) => `
      <li data-k="${k}">${speakButton('stories', `${s.id}-${k}`, l.nl)}
        <span><span lang="nl">${lineHtml(l)}</span><details><summary>traduction</summary>${esc(l.fr)}</details></span></li>`).join('')}
    </ol>
    <div id="gloss" class="gloss" hidden></div>
    <button class="btn primary wide" id="quiz">Questions de compréhension</button>`;

  document.getElementById('playall').onclick = async (e) => {
    e.target.disabled = true;
    for (let k = 0; k < s.lines.length; k++) {
      const li = document.querySelector(`.story li[data-k="${k}"]`);
      li?.classList.add('playing');
      await speak('stories', `${s.id}-${k}`, s.lines[k].nl);
      li?.classList.remove('playing');
    }
    e.target.disabled = false;
  };
  const gloss = document.getElementById('gloss');
  document.querySelectorAll('.story .w').forEach((b) => b.onclick = () => {
    const w = b.dataset.w;
    const fr = s.glossary[w] || theme?.items.find((it) => norm(it.nl) === w)?.fr || '';
    const mine = (store.db().mywords || []).some((m) => norm(m.nl) === w);
    gloss.hidden = false;
    gloss.innerHTML = `${speakButton('stories', `w-${w}`, b.textContent)}<span><strong lang="nl">${esc(b.textContent.replace(/[".,!?«»]/g, ''))}</strong><small>${esc(fr || 'pas de traduction')}</small></span>
      ${fr && !mine ? '<button class="btn small" id="addw">+ Mes mots</button>' : mine ? '<small>dans vos mots ✓</small>' : ''}
      <button class="link" id="closeg">fermer</button>`;
    speak('stories', `w-${w}`, b.textContent);
    document.getElementById('closeg').onclick = () => { gloss.hidden = true; };
    document.getElementById('addw')?.addEventListener('click', (e) => {
      store.addMyWord({ nl: b.textContent.replace(/[".,!?«»]/g, ''), fr, note: `Lu dans « ${s.title} »` });
      e.target.replaceWith(Object.assign(document.createElement('small'), { textContent: 'ajouté ✓' }));
    });
  });
  document.getElementById('quiz').onclick = async () => {
    stop();
    let right = 0;
    for (let k = 0; k < s.questions.length; k++) {
      if ((await ex.question(ex.header(k, s.questions.length, 'Compréhension'), s.questions[k], `${k + 1}/${s.questions.length}`)) === 'exact') right++;
    }
    store.setStoryRead(s.id, right);
    store.logActivity(s.questions.length);
    view().innerHTML = `<div class="session end"><p class="eyebrow">${esc(s.title)}</p><h1>${right === s.questions.length ? 'Parfait !' : 'Bien lu !'}</h1>
      <p class="lead">${right}/${s.questions.length} bonnes réponses.</p>
      <a class="btn primary wide" href="#/practice/stories">Autres histoires</a><a class="btn wide" href="#/practice/story/${s.id}">Relire</a></div>`;
  };
}

// ---------- dictation from learned sentences ----------

async function dictee(_, ctx) {
  const themes = await Promise.all(ctx.themeIndex.filter((t) => t.status === 'ready').map((t) => ctx.loadTheme(t.id)));
  const pool = themes.flatMap((t) => t.items.filter((it) => it.ex_nl && store.getCard(`${t.id}/${it.id}`)).map((it) => ({ theme: t.id, id: `${it.id}-ex`, nl: it.ex_nl, fr: it.ex_fr })));
  if (pool.length < 3) {
    view().innerHTML = `${back()}<div class="session end"><p class="eyebrow">Dictée</p><h1>Un peu de patience</h1>
      <p class="lead">La dictée utilise les phrases que vous avez déjà apprises. Faites d'abord une leçon de mots.</p><a class="btn primary wide" href="#/">Au parcours</a></div>`;
    return;
  }
  const items = shuffle(pool).slice(0, 8);
  let right = 0;
  for (let k = 0; k < items.length; k++) {
    if ((await ex.dictation(ex.header(k, items.length, `Dictée ${k + 1}/${items.length}`), items[k].theme, items[k])) !== 'wrong') right++;
  }
  store.logActivity(items.length);
  view().innerHTML = `<div class="session end"><p class="eyebrow">Dictée</p><h1>${right}/${items.length}</h1>
    <p class="lead">${right === items.length ? 'Votre oreille et votre orthographe sont d\'accord !' : 'Les erreurs d\'orthographe proches comptent comme justes : ce qui compte, c\'est d\'avoir entendu.'}</p>
    <a class="btn primary wide" href="#/practice/dictee">Encore une</a><a class="btn wide" href="#/practice">Pratique</a></div>`;
}

// ---------- own words and the teacher's words ----------

async function mywords(arg) {
  const t = virtualTheme('perso');
  if (arg === 'learn') { const p = pending('perso'); if (p.length) return learnItems(t, p.slice(0, 8), '#/practice/mywords', 'Mes mots'); }
  const p = pending('perso');
  view().innerHTML = `${back()}
    <header class="theme-head"><p class="eyebrow">Vocabulaire personnel</p><h1>Mes mots</h1>
      <p class="lead">Un mot entendu au travail, lu sur une affiche, dans une histoire ? Ajoutez-le : il entrera dans vos révisions.</p></header>
    <form id="addf" class="group">
      <input id="nl" lang="nl" placeholder="En néerlandais (ex. de trein)" autocapitalize="off" autocomplete="off" required>
      <input id="fr" placeholder="En français (ex. le train)" required>
      <input id="note" placeholder="Note (facultatif)">
      <button class="btn primary">Ajouter</button>
    </form>
    ${p.length ? `<a class="btn primary wide" href="#/practice/mywords/learn">Apprendre ${p.length > 8 ? '8 de mes' : 'mes'} ${p.length} nouveau${p.length > 1 ? 'x' : ''} mot${p.length > 1 ? 's' : ''}</a>` : ''}
    <ul class="words">${[...t.items].reverse().map((it) => `
      <li>${speakButton('perso', it.id, it.nl)}<span><strong lang="nl">${esc(it.nl)}</strong><small>${esc(it.fr)}${it.note ? ` · ${esc(it.note)}` : ''}</small></span>
        <span class="dot ${store.getCard(`perso/${it.id}`) ? 'learning' : 'new'}">${store.getCard(`perso/${it.id}`) ? 'en cours' : 'nouveau'}</span>
        <button class="link del" data-id="${it.id}" aria-label="Supprimer">✕</button></li>`).join('') || '<li><span class="small">Aucun mot pour l\'instant.</span></li>'}
    </ul>`;
  document.getElementById('addf').onsubmit = (e) => {
    e.preventDefault();
    store.addMyWord({ nl: document.getElementById('nl').value, fr: document.getElementById('fr').value, note: document.getElementById('note').value });
    mywords();
  };
  document.querySelectorAll('.del').forEach((b) => b.onclick = () => { if (confirm('Supprimer ce mot ?')) { store.removeMyWord(b.dataset.id); mywords(); } });
}

async function stan(arg) {
  if (sync.currentUser()) await sync.refreshLearnerData().catch(() => {});
  const t = virtualTheme('stan');
  const p = pending('stan');
  if (arg === 'learn' && p.length) return learnItems(t, p.slice(0, 8), '#/practice/stan', t.nl);
  view().innerHTML = `${back()}
    <header class="theme-head"><p class="eyebrow">Après vos conversations</p><h1>${esc(t.nl)}</h1>
      <p class="lead">Les mots et expressions que ${esc(CONFIG.teacherName)} a notés pour vous. Ils entrent dans vos révisions dès que vous les avez appris.</p></header>
    ${p.length ? `<a class="btn primary wide" href="#/practice/stan/learn">Apprendre ${p.length} nouveau${p.length > 1 ? 'x' : ''} mot${p.length > 1 ? 's' : ''}</a>` : ''}
    <ul class="words">${[...t.items].reverse().map((it) => `
      <li>${speakButton('stan', it.id, it.nl)}<span><strong lang="nl">${esc(it.nl)}</strong><small>${esc(it.fr)}${it.note ? ` · ${esc(it.note)}` : ''}</small></span>
        <span class="dot ${store.getCard(`stan/${it.id}`) ? 'learning' : 'new'}">${store.getCard(`stan/${it.id}`) ? 'en cours' : 'nouveau'}</span></li>`).join('')}
    </ul>`;
}

// ---------- custom lessons and questions ----------

async function lessons() {
  if (sync.currentUser()) await sync.refreshLearnerData().catch(() => {});
  const list = [...(store.db().customLessons || [])].reverse();
  view().innerHTML = `${back()}
    <header class="theme-head"><p class="eyebrow">Préparées pour vous</p><h1>Mes leçons</h1>
      <p class="lead">Chaque leçon répond à une de vos questions.</p></header>
    <ul class="themes">${list.map((l) => `
      <li><a class="theme" href="#/theme/${l.id}"><span class="lvl">${esc(l.level || '?')}</span>
        <span><strong>${esc(l.nl)}</strong><small>${esc(l.fr)}</small></span></a></li>`).join('') || '<li class="small">Aucune leçon pour l\'instant.</li>'}
    </ul>`;
}

async function ask() {
  if (!sync.currentUser()) { location.hash = '#/practice'; return; }
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  view().innerHTML = `${back()}
    <header class="theme-head"><p class="eyebrow">Une question ?</p><h1>Demandez</h1>
      <p class="lead">Un mot, une règle, une phrase entendue que vous ne comprenez pas ? Écrivez-la ou dites-la, en français. ${esc(CONFIG.teacherName)} vous prépare une petite leçon sur mesure : explication, exemples et exercices.</p></header>
    <form id="qf" class="group">
      <textarea id="q" rows="4" placeholder="Par exemple : quand est-ce qu'on dit « de » et quand « het » ?" required></textarea>
      <div class="row">
        ${Rec ? '<button type="button" class="btn" id="dict">🎤 Dicter</button>' : ''}
        ${canRecord() ? '<button type="button" class="btn" id="voice">● Message vocal</button>' : ''}
      </div>
      <div id="voiceout"></div>
      <button class="btn primary wide">Envoyer la question</button>
      <p id="qerr" class="small ko" hidden></p>
    </form>
    <h2 class="section">Mes questions</h2>
    <ul class="questions" id="mine"><li class="small">…</li></ul>`;

  let blob = null;
  const q = document.getElementById('q');
  document.getElementById('dict')?.addEventListener('click', (e) => {
    const r = new Rec();
    r.lang = 'fr-BE';
    r.interimResults = true;
    const start = q.value;
    e.target.textContent = '🎤 …';
    r.onresult = (ev) => { q.value = `${start}${start ? ' ' : ''}${[...ev.results].map((x) => x[0].transcript).join('')}`; };
    r.onend = () => { e.target.textContent = '🎤 Dicter'; };
    r.onerror = () => { e.target.textContent = '🎤 Dicter'; };
    r.start();
  });
  document.getElementById('voice')?.addEventListener('click', async (e) => {
    const b = e.target;
    try {
      b.disabled = true;
      const r = await record(120000);
      b.disabled = false;
      b.textContent = '■ Arrêter';
      b.onclick = () => r.stop();
      blob = await r.done;
      b.textContent = '● Refaire';
      b.onclick = null;
      document.getElementById('voiceout').innerHTML = `<audio controls src="${URL.createObjectURL(blob)}"></audio>`;
    } catch (x) { b.disabled = false; b.textContent = 'Micro indisponible'; }
  });
  document.getElementById('qf').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn.primary');
    btn.disabled = true; btn.textContent = 'Envoi…';
    try {
      await sync.askQuestion({ text: q.value.trim() || '(message vocal)', blob, context: 'pratique' });
      ask();
    } catch (x) {
      btn.disabled = false; btn.textContent = 'Envoyer la question';
      const er = document.getElementById('qerr'); er.hidden = false; er.textContent = 'Envoi impossible — vérifiez la connexion.';
    }
  };
  const label = { new: 'reçue', drafting: 'leçon en préparation', answered: 'leçon prête', dismissed: 'répondue en personne' };
  sync.myQuestions().then((rows) => {
    document.getElementById('mine').innerHTML = rows.map((r) => `<li><p>${esc(r.text)}</p><small>${new Date(r.created_at).toLocaleDateString('fr-BE')} · ${label[r.status]}</small>
      ${r.status === 'answered' ? ' · <a href="#/practice/lessons">voir</a>' : ''}</li>`).join('') || '<li class="small">Aucune question pour l\'instant.</li>';
  }).catch(() => {});
}

// ---------- pairs game: the learned words, five at a time ----------

async function learnedItems(ctx) {
  const ready = ctx.themeIndex.filter((t) => t.status === 'ready').map((t) => t.id);
  const themes = await Promise.all([...ready, 'perso', 'stan'].map((id) => ctx.loadTheme(id).catch(() => null)));
  return themes.filter(Boolean).flatMap((t) => t.items.filter((it) => store.getCard(`${t.id}/${it.id}`)).map((it) => ({ ...it, theme: t.id })));
}

async function paires(_, ctx) {
  const pool = await learnedItems(ctx);
  if (pool.length < 5) {
    view().innerHTML = `${back()}<div class="session end"><p class="eyebrow">Jeu des paires</p><h1>Encore quelques mots</h1>
      <p class="lead">Le jeu utilise les mots que vous avez appris : il en faut au moins 5. Faites d'abord une leçon.</p><a class="btn primary wide" href="#/">Au parcours</a></div>`;
    return;
  }
  const rounds = 3;
  let perfect = 0;
  const started = Date.now();
  for (let r = 0; r < rounds; r++) {
    const set = shuffle(pool).slice(0, 5);
    if ((await ex.matchPairs(ex.header(r, rounds, `Manche ${r + 1}/${rounds}`), set[0].theme, set)) === 'exact') perfect++;
  }
  store.logActivity(rounds);
  const secs = Math.round((Date.now() - started) / 1000);
  view().innerHTML = `<div class="session end"><p class="eyebrow">Jeu des paires</p><h1>${perfect === rounds ? 'Sans faute !' : 'Bien joué !'}</h1>
    <p class="lead">${rounds} manches en ${Math.floor(secs / 60)} min ${secs % 60} s · ${perfect}/${rounds} sans erreur.</p>
    <a class="btn primary wide" href="#/practice/paires">Rejouer</a><a class="btn wide" href="#/practice">Pratique</a></div>`;
}

// ---------- hands-free listening: Dutch, pause, Dutch again, French, example ----------

async function ecoute(themeId, ctx) {
  const ready = ctx.themeIndex.filter((t) => t.status === 'ready');
  if (!themeId) {
    view().innerHTML = `${back()}
      <header class="theme-head"><p class="eyebrow">Sans écran</p><h1>Écoute libre</h1>
        <p class="lead">Mettez vos écouteurs et rangez le téléphone : chaque mot est dit en néerlandais, répété après une pause — répétez-le à voix haute — puis traduit, puis utilisé dans une phrase.</p></header>
      <ul class="themes">${ready.map((t) => `<li><a class="theme" href="#/practice/ecoute/${t.id}"><span class="lvl">${esc(t.level)}</span><span><strong>${esc(t.nl)}</strong><small>${esc(t.fr)}</small></span></a></li>`).join('')}
        ${(store.db().mywords || []).length ? '<li><a class="theme" href="#/practice/ecoute/perso"><span class="lvl">★</span><span><strong>Mes mots</strong><small>vos mots à vous</small></span></a></li>' : ''}</ul>`;
    return;
  }
  const t = await ctx.loadTheme(themeId);
  let playing = true;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  view().innerHTML = `${back('#/practice/ecoute', 'Écoute libre')}
    <div class="session end listen-mode">
      <p class="eyebrow">${esc(t.nl)}</p><h1 id="now" lang="nl">…</h1><p class="lead" id="nowfr"></p>
      <p class="small" id="count"></p>
      <button class="btn primary wide" id="stopit">Arrêter</button></div>`;
  document.getElementById('stopit').onclick = () => { playing = false; stop(); location.hash = '#/practice/ecoute'; };
  const items = t.items;
  for (let k = 0; k < items.length && playing; k++) {
    const it = items[k];
    if (!document.getElementById('now')) return;
    document.getElementById('count').textContent = `${k + 1} / ${items.length}`;
    document.getElementById('now').textContent = it.nl;
    document.getElementById('nowfr').textContent = '';
    await speak(t.id, it.id, it.nl); if (!playing) break;
    await wait(2200);                                           // time to repeat aloud
    await speak(t.id, it.id, it.nl); if (!playing) break;
    document.getElementById('nowfr').textContent = it.fr;
    await speakFr(it.fr.replace(/[!?]/g, '')); if (!playing) break;
    if (it.ex_nl) { await wait(500); await speak(t.id, `${it.id}-ex`, it.ex_nl); }
    await wait(1200);
  }
  if (playing && document.getElementById('now')) {
    store.logActivity(1);
    document.getElementById('now').textContent = 'Klaar!';
    document.getElementById('nowfr').textContent = 'Terminé.';
    document.getElementById('stopit').textContent = 'Retour';
  }
}

// ---------- speaking trainer: say it, the phone checks ----------

async function parler(_, ctx) {
  if (!ex.speakingOn()) { location.hash = '#/practice'; return; }
  const pool = await learnedItems(ctx);
  const ready = await Promise.all(ctx.themeIndex.filter((t) => t.status === 'ready').map((t) => ctx.loadTheme(t.id)));
  const lines = ready.flatMap((t) => (t.steps.some((s) => s.type === 'dialogue' && store.stepDone(t.id, s.id)) ? t.dialogue.lines.map((l) => ({ ...l, theme: t.id })) : []));
  const tasks = shuffle([...shuffle(pool).slice(0, 6).map((it) => ({ theme: it.theme, it })), ...shuffle(lines).slice(0, 4).map((l) => ({ theme: l.theme, it: { id: l.id, nl: l.nl, fr: l.fr } }))]);
  if (tasks.length < 3) {
    view().innerHTML = `${back()}<div class="session end"><p class="eyebrow">Parler</p><h1>Un peu de patience</h1>
      <p class="lead">L'entraînement oral utilise ce que vous avez appris. Faites d'abord une leçon.</p><a class="btn primary wide" href="#/">Au parcours</a></div>`;
    return;
  }
  let right = 0;
  for (let k = 0; k < tasks.length; k++) {
    if ((await ex.speakCheck(ex.header(k, tasks.length, `Parler ${k + 1}/${tasks.length}`), tasks[k].theme, tasks[k].it, 'produce')) !== 'wrong') right++;
  }
  store.logActivity(tasks.length);
  view().innerHTML = `<div class="session end"><p class="eyebrow">Parler</p><h1>${right}/${tasks.length}</h1>
    <p class="lead">La reconnaissance vocale n'est pas parfaite : si elle ne vous comprend pas, réécoutez le modèle et réessayez plus lentement.</p>
    <a class="btn primary wide" href="#/practice/parler">Encore</a><a class="btn wide" href="#/practice">Pratique</a></div>`;
}

// ---------- grammar reference ----------

async function grammar(_, ctx) {
  const themes = await Promise.all(ctx.themeIndex.filter((t) => t.status === 'ready').map((t) => ctx.loadTheme(t.id)));
  const custom = store.db().customLessons || [];
  const blocks = [...themes, ...custom].flatMap((t) => Object.entries(t.grammar || {}).map(([sid, g]) => ({ t, sid, g })));
  view().innerHTML = `${back()}
    <header class="theme-head"><p class="eyebrow">Référence</p><h1>Grammaire</h1><p class="lead">Toutes les règles rencontrées, au même endroit.</p></header>
    <div class="ref">${blocks.map(({ t, sid, g }) => `
      <details class="group"><summary><strong lang="nl">${esc(g.title)}</strong><small>${esc(t.nl)}</small></summary>
        ${g.explain.map((p) => `<p>${esc(p)}</p>`).join('')}
        <table class="gtable">${g.table.map(([nl, fr], k) => `<tr><td>${speakButton(t.id, `${sid}-t${k + 1}`, nl)}</td><td lang="nl"><strong>${esc(nl)}</strong></td><td>${esc(fr)}</td></tr>`).join('')}</table>
        <p class="note"><strong>Français / néerlandais :</strong> ${esc(g.contrast)}</p>
      </details>`).join('')}
    </div>`;
}

// ---------- Flemish corner ----------

async function vlaams() {
  const c = await content('flemish');
  const mine = new Set((store.db().mywords || []).map((w) => norm(w.nl)));
  view().innerHTML = `${back()}
    <header class="theme-head"><p class="eyebrow">Vlaams</p><h1>Coin flamand</h1><p class="lead">${esc(c.intro)}</p></header>
    <ul class="vlaams">${c.entries.map((e, k) => `
      <li class="group">
        <div class="hear">${speakButton('vlaams', `v${k}`, e.vl)}<span><strong lang="nl">${esc(e.vl)}</strong><small>${esc(e.fr)} · standard : <span lang="nl">${esc(e.std)}</span></small></span></div>
        <p lang="nl">${speakButton('vlaams', `v${k}-ex`, e.ex)} ${esc(e.ex)}</p><small>${esc(e.ex_fr)}</small>
        ${e.note ? `<p class="note">${esc(e.note)}</p>` : ''}
        ${mine.has(norm(e.vl)) ? '<small>dans vos mots ✓</small>' : `<button class="btn small add" data-k="${k}">+ Mes mots</button>`}
      </li>`).join('')}
    </ul>`;
  document.querySelectorAll('.vlaams .add').forEach((b) => b.onclick = () => {
    const e = c.entries[Number(b.dataset.k)];
    store.addMyWord({ nl: e.vl, fr: e.fr, note: `flamand · standard : ${e.std}` });
    b.replaceWith(Object.assign(document.createElement('small'), { textContent: 'ajouté ✓' }));
  });
}
