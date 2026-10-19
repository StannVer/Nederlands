// Daily review: everything due, from every theme. The learner picks how to be asked (mixed by
// default, or only cards, listening, speaking or writing) and how many items; the scheduler decides
// which items, weakest and most overdue first.
import * as ex from './exercises.js';
import * as store from './store.js';
import { schedule, Rating } from './fsrs.js';
import { stop } from './audio.js';

const view = () => document.getElementById('view');
const autoGrade = { exact: Rating.Good, near: Rating.Hard, wrong: Rating.Again };

const MODES = {
  mixte: { label: 'Mixte', note: 'Recommandé : un peu de tout, en alternance' },
  cartes: { label: 'Cartes', note: 'Dites la réponse, puis évaluez-vous' },
  ecoute: { label: 'Écoute', note: 'Reconnaître à l\'oreille' },
  oral: { label: 'Oral', note: 'Dites-le : le téléphone vérifie', needs: () => ex.speakingOn() },
  ecrit: { label: 'Écrit', note: 'Écrire le mot ou la phrase entendue' },
};

function resolveKey(key, themes) {
  const [themeId, rest] = key.split('/');
  const theme = themes[themeId];
  if (!theme) return null;
  if (rest.includes('#')) {
    const [stepId, k] = rest.split('#');
    const e = theme.grammar?.[stepId]?.exercises[Number(k)];
    return e ? { theme, kind: 'grammar', e } : null;
  }
  const item = theme.items.find((i) => i.id === rest);
  return item ? { theme, kind: 'word', item } : null;
}

async function loadAll(keys, loadTheme) {
  await Promise.all([...new Set(keys.map((k) => k.split('/')[0]))].map((id) => loadTheme(id).catch(() => null)));
}

export async function review(themes, loadTheme, mode, size) {
  const keys = store.dueKeys();
  await loadAll(keys, loadTheme);
  const due = keys.filter((k) => resolveKey(k, themes));
  if (due.length === 0) {
    view().innerHTML = `<div class="session end"><p class="eyebrow">Révisions</p><h1>Tout est à jour.</h1>
      <p class="lead">Les mots reviennent juste avant que vous ne les oubliiez. Revenez demain — ou continuez le parcours.</p>
      <a class="btn primary wide" href="#/">Accueil</a></div>`;
    return;
  }
  if (!mode || !MODES[mode]) return chooser(due.length);
  const n = size === 'tout' ? due.length : Math.min(due.length, Number(size) || 20);
  await run(due.slice(0, n), themes, mode);
}

function chooser(count) {
  const s = store.db().settings || {};
  const last = MODES[s.reviewMode] && (!MODES[s.reviewMode].needs || MODES[s.reviewMode].needs()) ? s.reviewMode : 'mixte';
  view().innerHTML = `
    <header class="hello"><p class="eyebrow">${count} élément${count > 1 ? 's' : ''} à revoir</p><h1>Révisions</h1></header>
    <h2 class="section">Comment ?</h2>
    <div class="modes">${Object.entries(MODES).filter(([, m]) => !m.needs || m.needs()).map(([id, m]) => `
      <button class="mode ${id === last ? 'on' : ''}" data-mode="${id}"><strong>${m.label}</strong><small>${m.note}</small></button>`).join('')}
    </div>
    <h2 class="section">Combien ?</h2>
    <div class="yn sizes">${[10, 20, 'tout'].filter((x) => x === 'tout' || x < count).map((x) => `
      <button class="chip ${x === (count > 20 ? 20 : 'tout') ? 'on' : ''}" data-size="${x}">${x === 'tout' ? `Tout (${count})` : x}</button>`).join('')}
    </div>
    <button class="btn primary wide" id="go">Commencer</button>`;
  let mode = last;
  let size = count > 20 ? 20 : 'tout';
  document.querySelectorAll('.mode').forEach((b) => b.onclick = () => {
    mode = b.dataset.mode;
    document.querySelectorAll('.mode').forEach((x) => x.classList.toggle('on', x === b));
  });
  document.querySelectorAll('.sizes .chip').forEach((b) => b.onclick = () => {
    size = b.dataset.size;
    document.querySelectorAll('.sizes .chip').forEach((x) => x.classList.toggle('on', x === b));
  });
  document.getElementById('go').onclick = () => {
    store.db().settings.reviewMode = mode;
    store.save();
    location.hash = `#/review/${mode}/${size}`;
  };
}

function pickWordMode(mode, item, card) {
  const hasEx = !!item.ex_nl;
  if (mode === 'cartes') return 'say';
  if (mode === 'ecoute') return 'listen';
  if (mode === 'oral') return ex.speakingOn() ? 'speak' : 'say';
  if (mode === 'ecrit') return hasEx && (card.reps || 0) % 2 ? 'dictate' : 'type';
  const modes = ['say', 'type', 'listen', ...(hasEx ? ['dictate'] : []), ...(ex.speakingOn() ? ['speak'] : [])];
  return modes[(card.reps || 0) % modes.length];
}

async function run(keys, themes, mode) {
  const queue = [...keys];
  const total = queue.length;
  const again = new Set();
  let done = 0, right = 0;

  while (queue.length) {
    const key = queue.shift();
    const r = resolveKey(key, themes);
    const card = store.getCard(key);
    const head = ex.header(done, total, `${total - done} restante${total - done > 1 ? 's' : ''}`);
    let grade;
    if (r.kind === 'grammar') {
      const outcome = r.e.type === 'order'
        ? await ex.orderSentence(head, r.theme.id, { nl: r.e.nl, fr: r.e.fr })
        : await ex.choiceGap(head, r.theme.id, r.e);
      grade = autoGrade[outcome];
    } else {
      const m = pickWordMode(mode, r.item, card);
      if (m === 'say') grade = await ex.sayReveal(head, r.theme.id, r.item, card);
      else if (m === 'type') grade = autoGrade[await ex.typeRecall(head, r.theme.id, r.item)];
      else if (m === 'dictate') grade = autoGrade[await ex.dictation(head, r.theme.id, { id: `${r.item.id}-ex`, nl: r.item.ex_nl, fr: r.item.ex_fr })];
      else if (m === 'speak') grade = autoGrade[await ex.speakCheck(head, r.theme.id, r.item, 'produce')];
      else grade = autoGrade[await ex.listenChoose(head, r.theme.id, r.item, r.theme.items)];
    }
    if (grade >= Rating.Good) right++;
    // A card forgotten twice in one session is not shown a third time today: it is due again soon anyway.
    if (grade === Rating.Again && !again.has(key)) { again.add(key); queue.push(key); }
    else done++;
    store.setCard(key, schedule(card, grade));
    store.logActivity(1);
  }
  stop();
  const left = store.dueKeys().length;
  view().innerHTML = `<div class="session end"><p class="eyebrow">Révisions terminées</p><h1>Super!</h1>
    <p class="lead">${total} élément${total > 1 ? 's' : ''} révisé${total > 1 ? 's' : ''}${again.size ? `, dont ${again.size} à revoir bientôt` : ''}.${left ? `<br>Encore ${left} en attente.` : ''}</p>
    ${left ? '<a class="btn primary wide" href="#/review">Continuer</a>' : ''}
    <a class="btn ${left ? '' : 'primary'} wide" href="#/">Accueil</a></div>`;
  return { total, right };
}

