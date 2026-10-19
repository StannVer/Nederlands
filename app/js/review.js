// Daily review: everything due, from every theme, mixed. Word cards rotate between three ways of
// being asked (say it, type it, hear it) so a word is known by ear and by hand, not only by sight.
import * as ex from './exercises.js';
import * as store from './store.js';
import { schedule, Rating } from './fsrs.js';
import { stop } from './audio.js';

const view = () => document.getElementById('view');
const autoGrade = { exact: Rating.Good, near: Rating.Hard, wrong: Rating.Again };

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

export async function review(themes, loadTheme) {
  const keys = store.dueKeys();
  await Promise.all([...new Set(keys.map((k) => k.split('/')[0]))].map(loadTheme));
  const queue = keys.filter((k) => resolveKey(k, themes));
  if (queue.length === 0) {
    view().innerHTML = `<div class="session end"><p class="eyebrow">Révisions</p><h1>Tout est à jour.</h1>
      <p class="lead">Les mots reviennent juste avant que vous ne les oubliiez. Revenez demain — ou continuez le parcours.</p>
      <a class="btn primary wide" href="#/">Accueil</a></div>`;
    return;
  }
  const total = queue.length;
  const again = new Set();
  let done = 0;

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
      const mode = ['say', 'type', 'listen'][(card.reps || 0) % 3];
      if (mode === 'say') grade = await ex.sayReveal(head, r.theme.id, r.item, card);
      else if (mode === 'type') grade = autoGrade[await ex.typeRecall(head, r.theme.id, r.item)];
      else grade = autoGrade[await ex.listenChoose(head, r.theme.id, r.item, r.theme.items)];
    }
    // A card forgotten twice in one session is not shown a third time today: it is due again soon anyway.
    if (grade === Rating.Again && !again.has(key)) { again.add(key); queue.push(key); }
    else done++;
    store.setCard(key, schedule(card, grade));
    store.logActivity(1);
  }
  stop();
  view().innerHTML = `<div class="session end"><p class="eyebrow">Révisions terminées</p><h1>Super!</h1>
    <p class="lead">${total} élément${total > 1 ? 's' : ''} révisé${total > 1 ? 's' : ''}${again.size ? `, dont ${again.size} à revoir bientôt` : ''}.</p>
    <a class="btn primary wide" href="#/">Accueil</a></div>`;
}
