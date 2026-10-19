// The course path: every theme is a short sequence of steps (words, grammar, dialogue, checkpoint).
import * as ex from './exercises.js';
import * as store from './store.js';
import { schedule, Rating } from './fsrs.js';
import { speak, speakButton, stop } from './audio.js';
import { esc, shuffle, tiles } from './util.js';

const view = () => document.getElementById('view');
const firstGrade = (errors) => (errors === 0 ? Rating.Good : errors === 1 ? Rating.Hard : Rating.Again);

export function nextStep(theme) {
  return theme.steps.find((s) => !store.stepDone(theme.id, s.id)) || null;
}

export async function runStep(theme, stepId) {
  const step = theme.steps.find((s) => s.id === stepId);
  if (!step) { location.hash = `#/theme/${theme.id}`; return; }
  const run = { words, grammar, dialogue, checkpoint }[step.type];
  await run(theme, step);
}

function endScreen(theme, step, title, lead) {
  stop();
  const next = nextStep(theme);
  view().innerHTML = `
    <div class="session end">
      <p class="eyebrow">${esc(step.title)} · terminé</p>
      <h1>${esc(title)}</h1>
      <p class="lead">${lead}</p>
      ${next ? `<a class="btn primary wide" href="#/step/${theme.id}/${next.id}">Étape suivante : ${esc(next.title)}</a>` : ''}
      <a class="btn wide" href="#/theme/${theme.id}">Retour au thème</a>
    </div>`;
}

// Re-insert a missed exercise two or three places later: soon enough to fix it, late enough to need recall.
const requeue = (queue, id) => queue.splice(Math.min(queue.length, 2 + Math.floor(Math.random() * 2)), 0, id);

// ---------- words: present, then listen → recall → build the sentence ----------

async function words(theme, step) {
  const items = step.items.map((id) => theme.items.find((i) => i.id === id)).filter(Boolean);
  const state = Object.fromEntries(items.map((it) => {
    const need = ['listen', 'type'];
    if (tiles(it.ex_nl).words.length >= 3) need.push('order');
    return [it.id, { need, errors: 0 }];
  }));
  const total = items.length + Object.values(state).reduce((a, s) => a + s.need.length, 0);
  let done = 0, exercises = 0;

  for (let i = 0; i < items.length; i++) {
    await ex.present(ex.header(done, total, 'Découverte'), theme.id, items[i], `Nouveau · ${i + 1}/${items.length}`);
    done++;
  }

  const queue = shuffle(items.map((it) => it.id));
  while (queue.length) {
    const id = queue.shift();
    const it = items.find((x) => x.id === id);
    const s = state[id];
    const label = { listen: 'Écouter', type: 'Retrouver', order: 'Construire' }[s.need[0]];
    const head = ex.header(done, total, label);
    const outcome = s.need[0] === 'listen' ? await ex.listenChoose(head, theme.id, it, theme.items)
      : s.need[0] === 'type' ? await ex.typeRecall(head, theme.id, it)
      : await ex.orderSentence(head, theme.id, { nl: it.ex_nl, fr: it.ex_fr, audioId: `${it.id}-ex` });
    exercises++;
    if (outcome === 'wrong') { s.errors++; requeue(queue, id); }
    else { s.need.shift(); done++; if (s.need.length) requeue(queue, id); }
  }

  const now = Date.now();
  for (const it of items) {
    const key = `${theme.id}/${it.id}`;
    if (!store.getCard(key)) store.setCard(key, schedule(null, firstGrade(state[it.id].errors), now));
  }
  const perfect = items.filter((it) => state[it.id].errors === 0).length;
  store.completeStep(theme.id, step.id, perfect / items.length);
  store.logActivity(exercises);
  endScreen(theme, step, 'Goed gedaan!',
    `${items.length} nouveaux mots — ${perfect} sans aucune erreur.<br>Ils reviendront en révision au bon moment, juste avant que vous ne les oubliiez.`);
}

// ---------- grammar: explain (with the French contrast), then practise ----------

async function grammar(theme, step) {
  const g = theme.grammar[step.id];
  await new Promise((resolve) => {
    view().innerHTML = `
      <div class="session">
        ${ex.header(0, g.exercises.length + 1, 'Comprendre')}
        <article class="flash grammar">
          <p class="eyebrow">Grammaire</p>
          <h1 lang="nl">${esc(g.title)}</h1>
          ${g.explain.map((p) => `<p>${esc(p)}</p>`).join('')}
          <table class="gtable">${g.table.map(([nl, fr], k) => `
            <tr><td>${speakButton(theme.id, `${step.id}-t${k + 1}`, nl)}</td><td lang="nl"><strong>${esc(nl)}</strong></td><td>${esc(fr)}</td></tr>`).join('')}
          </table>
          <p class="note"><strong>Français / néerlandais :</strong> ${esc(g.contrast)}</p>
        </article>
        <button class="btn primary wide" id="go">S'exercer</button>
      </div>`;
    document.getElementById('go').onclick = resolve;
  });

  const errors = g.exercises.map(() => 0);
  const queue = g.exercises.map((_, k) => k);
  let done = 1;
  const total = g.exercises.length + 1;
  while (queue.length) {
    const k = queue.shift();
    const e = g.exercises[k];
    const head = ex.header(done, total, 'S\'exercer');
    const outcome = e.type === 'order'
      ? await ex.orderSentence(head, theme.id, { nl: e.nl, fr: e.fr })
      : await ex.choiceGap(head, theme.id, e);
    if (outcome === 'wrong') { errors[k]++; if (errors[k] < 3) queue.push(k); else done++; }
    else done++;
  }
  const now = Date.now();
  g.exercises.forEach((_, k) => {
    const key = `${theme.id}/${step.id}#${k}`;
    if (!store.getCard(key)) store.setCard(key, schedule(null, firstGrade(errors[k]), now));
  });
  const perfect = errors.filter((e) => e === 0).length;
  store.completeStep(theme.id, step.id, perfect / errors.length);
  store.logActivity(g.exercises.length);
  endScreen(theme, step, 'Compris !', `${perfect} sur ${errors.length} du premier coup. Ces exercices reviendront aussi dans vos révisions.`);
}

// ---------- dialogue: listen first, understand, read, then take a role ----------

async function dialogue(theme, step) {
  const d = theme.dialogue;
  const speakers = [...new Set(d.lines.map((l) => l.who))];
  const variant = (who) => speakers.indexOf(who);
  const total = 4;

  const playAll = async (btn) => {
    btn.disabled = true;
    for (const l of d.lines) {
      const el = document.querySelector(`[data-line="${l.id}"]`);
      el?.classList.add('playing');
      await speak(theme.id, l.id, l.nl, variant(l.who));
      el?.classList.remove('playing');
    }
    btn.disabled = false;
  };

  const bubbles = (blur) => `<ol class="bubbles">${d.lines.map((l) => `
    <li class="bubble ${variant(l.who) ? 'right' : ''}" data-line="${l.id}">
      <b>${esc(l.who)}</b>${speakButton(theme.id, l.id, l.nl, 'Écouter', false, variant(l.who))}
      <p lang="nl" class="${blur ? 'blur' : ''}">${esc(l.nl)}</p>
      ${blur ? '' : `<details><summary>traduction</summary>${esc(l.fr)}</details>`}
    </li>`).join('')}</ol>`;

  // 1. listen without reading
  await new Promise((resolve) => {
    view().innerHTML = `
      <div class="session">
        ${ex.header(0, total, 'Écouter')}
        <article class="flash">
          <p class="eyebrow">Dialogue · ${esc(d.title)}</p>
          <h1 class="fr-prompt">Écoutez d'abord, sans lire.</h1>
          <p class="small">Vous ne comprendrez pas tout — c'est normal. Cherchez les noms, les villes, les mots connus.</p>
          <button class="btn primary" id="play">▶ Écouter le dialogue</button>
        </article>
        ${bubbles(true)}
        <button class="btn wide" id="go">Répondre aux questions</button>
      </div>`;
    document.getElementById('play').onclick = (e) => playAll(e.target);
    document.getElementById('go').onclick = () => { stop(); resolve(); };
  });

  // 2. comprehension
  let right = 0;
  for (let k = 0; k < d.questions.length; k++) {
    const r = await ex.question(ex.header(1, total, 'Comprendre'), d.questions[k], `${k + 1}/${d.questions.length}`);
    if (r === 'exact') right++;
  }

  // 3. read with the text and translation
  await new Promise((resolve) => {
    view().innerHTML = `
      <div class="session">
        ${ex.header(2, total, 'Lire')}
        <article class="flash">
          <p class="eyebrow">${right}/${d.questions.length} bonnes réponses</p>
          <h1 class="fr-prompt">Maintenant, lisez en écoutant.</h1>
          <button class="btn primary" id="play">▶ Écouter le dialogue</button>
        </article>
        ${bubbles(false)}
        <button class="btn wide primary" id="go">Jouer le rôle de ${esc(d.roles.learner)}</button>
      </div>`;
    document.getElementById('play').onclick = (e) => playAll(e.target);
    document.getElementById('go').onclick = () => { stop(); resolve(); };
  });

  // 4. role play: the other speaker talks, the learner answers aloud
  for (const l of d.lines) {
    const mine = l.who === d.roles.learner;
    await new Promise((resolve) => {
      view().innerHTML = `
        <div class="session">
          ${ex.header(3, total, 'À vous')}
          <article class="flash">
            <p class="eyebrow">${mine ? `À vous — vous êtes ${esc(l.who)}` : esc(l.who)}</p>
            ${mine ? `<h1 class="fr-prompt">${esc(l.fr)}</h1>
              <p class="small">Dites-le à voix haute en néerlandais, puis vérifiez.</p>
              <div id="ans" hidden><div class="hear">${speakButton(theme.id, l.id, l.nl, 'Écouter', false, variant(l.who))}<p class="answer" lang="nl">${esc(l.nl)}</p></div></div>`
            : `<div class="hear">${speakButton(theme.id, l.id, l.nl, 'Écouter', false, variant(l.who))}<h1 lang="nl">${esc(l.nl)}</h1></div><p class="fr">${esc(l.fr)}</p>`}
          </article>
          <button class="btn primary wide" id="go">${mine ? 'Vérifier' : 'Continuer'}</button>
        </div>`;
      const go = document.getElementById('go');
      if (!mine) { speak(theme.id, l.id, l.nl, variant(l.who)); go.onclick = resolve; }
      else go.onclick = () => {
        document.getElementById('ans').hidden = false;
        speak(theme.id, l.id, l.nl, variant(l.who));
        go.textContent = 'Continuer';
        go.onclick = resolve;
      };
    });
  }
  store.completeStep(theme.id, step.id, right / d.questions.length);
  store.logActivity(d.questions.length + d.lines.length);
  endScreen(theme, step, 'Heel goed!', `Vous avez écouté, compris (${right}/${d.questions.length}) et joué le dialogue.`);
}

// ---------- checkpoint: mixed quiz, then "I can…" ----------

async function checkpoint(theme, step) {
  const tasks = [
    ...shuffle(theme.items).slice(0, 4).map((it) => ['type', it]),
    ...shuffle(theme.items).slice(0, 2).map((it) => ['listen', it]),
    ...shuffle(theme.items.filter((it) => tiles(it.ex_nl).words.length >= 3)).slice(0, 2).map((it) => ['order', it]),
    ...shuffle(Object.values(theme.grammar).flatMap((g) => g.exercises)).slice(0, 2).map((e) => ['grammar', e]),
  ];
  const quiz = shuffle(tasks);
  let right = 0;
  for (let k = 0; k < quiz.length; k++) {
    const [kind, x] = quiz[k];
    const head = ex.header(k, quiz.length + 1, 'Bilan');
    const outcome = kind === 'type' ? await ex.typeRecall(head, theme.id, x)
      : kind === 'listen' ? await ex.listenChoose(head, theme.id, x, theme.items)
      : kind === 'order' ? await ex.orderSentence(head, theme.id, { nl: x.ex_nl, fr: x.ex_fr, audioId: `${x.id}-ex` })
      : x.type === 'order' ? await ex.orderSentence(head, theme.id, { nl: x.nl, fr: x.fr })
      : await ex.choiceGap(head, theme.id, x);
    if (outcome !== 'wrong') right++;
  }
  const score = right / quiz.length;

  const cando = await new Promise((resolve) => {
    const answers = theme.cando.map(() => null);
    view().innerHTML = `
      <div class="session">
        ${ex.header(quiz.length, quiz.length + 1, 'Je peux…')}
        <article class="flash">
          <p class="eyebrow">Quiz : ${right}/${quiz.length}</p>
          <h1 class="fr-prompt">Et vous, qu'en pensez-vous ?</h1>
          <ul class="cando">${theme.cando.map((c, k) => `
            <li><p>${esc(c)}</p><div class="yn" data-k="${k}">
              <button class="chip" data-v="1">Oui</button><button class="chip" data-v="0">Pas encore</button></div></li>`).join('')}
          </ul>
        </article>
        <button class="btn primary wide" id="go" disabled>Terminer</button>
      </div>`;
    document.querySelectorAll('.yn').forEach((row) => row.querySelectorAll('.chip').forEach((b) => b.onclick = () => {
      row.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b));
      answers[Number(row.dataset.k)] = b.dataset.v === '1';
      document.getElementById('go').disabled = answers.includes(null);
    }));
    document.getElementById('go').onclick = () => resolve(answers);
  });

  store.setCheck(theme.id, { score, cando });
  store.completeStep(theme.id, step.id, score);
  store.logActivity(quiz.length);
  const passed = score >= 0.8;
  endScreen(theme, step, passed ? 'Thème validé !' : 'Presque !',
    passed ? `${right}/${quiz.length} au quiz. Les mots du thème continuent de revenir en révision pour ne pas s'oublier.`
      : `${right}/${quiz.length} au quiz. Faites vos révisions quelques jours, puis refaites le bilan — l'objectif est 8/10.`);
}
