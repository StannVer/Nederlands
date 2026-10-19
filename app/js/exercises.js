// Every exercise renders into the view and resolves with its outcome once the learner continues.
// Outcomes: 'exact' | 'near' (typo, counted as right) | 'wrong'; sayReveal resolves with a grade 1–4.
import { esc, shuffle, judge, tiles, sameOrder, norm } from './util.js';
import { speak, speakButton, canRecord, record, canRecognize, listen } from './audio.js';
import * as store from './store.js';
import { keesSays, praise, comfort } from './ui.js';
import { intervalLabel } from './fsrs.js';

const view = () => document.getElementById('view');

export function header(done, total, label) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<div class="progress"><a href="#/" class="close" aria-label="Quitter">✕</a>
    <span class="bar"><i style="width:${pct}%"></i></span><small>${esc(label)}</small></div>`;
}

function render(head, body) {
  view().innerHTML = `<div class="session">${head}${body}<div id="feedback" class="feedback" aria-live="polite"></div></div>`;
}

function feedback(outcome, html, theme, audio) {
  const fb = document.getElementById('feedback');
  const [nl, fr] = outcome === 'wrong' ? comfort() : praise();
  const extra = outcome === 'near' ? '<small>Presque parfait — attention à l\'orthographe :</small>' : '';
  fb.className = `feedback ${outcome === 'wrong' ? 'ko' : 'ok'}`;
  fb.innerHTML = `${keesSays(nl, fr, outcome === 'wrong' ? 'think' : 'happy')}${extra}${html}<button class="btn primary wide" id="cont">Continuer</button>`;
  if (audio) speak(theme, audio.id, audio.text);
  const btn = document.getElementById('cont');
  btn.focus({ preventScroll: true });
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return new Promise((resolve) => { btn.onclick = () => resolve(outcome); });
}

// ---------- 1. present: hear it, see it, say it, compare ----------

export function present(head, theme, item, label) {
  render(head, `
    <article class="flash intro">
      <p class="eyebrow">${esc(label)}</p>
      <div class="hear">${speakButton(theme, item.id, item.nl, 'Écouter', true)}<h1 lang="nl">${esc(item.nl)}</h1></div>
      <p class="fr">${esc(item.fr)}</p>
      ${item.ex_nl ? `<div class="example">${speakButton(theme, `${item.id}-ex`, item.ex_nl, 'Écouter l\'exemple')}
        <div><p lang="nl">${esc(item.ex_nl)}</p><p class="fr">${esc(item.ex_fr)}</p></div></div>` : ''}
      ${item.note ? `<p class="note">${esc(item.note)}</p>` : ''}
      ${canRecord() ? `<div class="shadow"><button class="btn small" id="rec">● Répéter et m'enregistrer</button><div id="recout"></div></div>` : ''}
    </article>
    <button class="btn primary wide" id="next">Suivant</button>`);
  speak(theme, item.id, item.nl);
  const rec = document.getElementById('rec');
  if (rec) rec.onclick = () => shadow(rec, theme, item);
  return new Promise((resolve) => { document.getElementById('next').onclick = resolve; });
}

async function shadow(btn, theme, item) {
  const out = document.getElementById('recout');
  try {
    btn.disabled = true;
    const r = await record(5000);
    out.innerHTML = '<p class="small">Parlez… <button class="link" id="recstop">terminé</button></p>';
    document.getElementById('recstop').onclick = () => r.stop();
    const blob = await r.done;
    const mine = URL.createObjectURL(blob);
    out.innerHTML = `<div class="compare">
      <button class="btn small" id="pmodel">▶ Modèle</button><button class="btn small" id="pmine">▶ Moi</button></div>`;
    document.getElementById('pmodel').onclick = () => speak(theme, item.id, item.nl);
    document.getElementById('pmine').onclick = () => new Audio(mine).play();
    new Audio(mine).play();
  } catch (e) {
    out.innerHTML = '<p class="small ko">Micro indisponible.</p>';
  } finally {
    btn.disabled = false;
    btn.textContent = '● Recommencer';
  }
}

// ---------- 2. listen and choose: the ear before the eye ----------

export function listenChoose(head, theme, item, pool) {
  const options = shuffle([item, ...shuffle(pool.filter((x) => x.id !== item.id)).slice(0, 3)]);
  render(head, `
    <article class="flash center">
      <p class="eyebrow">Écoutez. Que veut dire…</p>
      ${speakButton(theme, item.id, item.nl, 'Réécouter', true)}
      <p class="hidden-text" id="reveal" hidden lang="nl">${esc(item.nl)}</p>
    </article>
    <div class="choices">${options.map((o) => `<button class="choice" data-id="${o.id}">${esc(o.fr)}</button>`).join('')}</div>`);
  speak(theme, item.id, item.nl);
  return choose(item.id, () => {
    document.getElementById('reveal').hidden = false;
    return `<p><span lang="nl">${esc(item.nl)}</span> = ${esc(item.fr)}</p>`;
  });
}

// ---------- 3. read and choose ----------

export function readChoose(head, theme, item, pool) {
  const options = shuffle([item, ...shuffle(pool.filter((x) => x.id !== item.id)).slice(0, 3)]);
  render(head, `
    <article class="flash">
      <p class="eyebrow">Que veut dire…</p>
      <div class="hear">${speakButton(theme, item.id, item.nl)}<h1 lang="nl">${esc(item.nl)}</h1></div>
    </article>
    <div class="choices">${options.map((o) => `<button class="choice" data-id="${o.id}">${esc(o.fr)}</button>`).join('')}</div>`);
  return choose(item.id, () => `<p><span lang="nl">${esc(item.nl)}</span> = ${esc(item.fr)}</p>`);
}

function choose(rightId, explain, audio) {
  return new Promise((resolve) => {
    document.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
      const ok = b.dataset.id === String(rightId);
      document.querySelectorAll('.choice').forEach((x) => {
        x.disabled = true;
        if (x.dataset.id === String(rightId)) x.classList.add('right');
        else if (x === b) x.classList.add('wrong');
      });
      const outcome = ok ? 'exact' : 'wrong';
      feedback(outcome, explain(ok), audio?.theme, audio).then(resolve);
    });
  });
}

// ---------- 4. recall: French to Dutch, typed ----------

export function typeRecall(head, theme, item) {
  render(head, `
    <article class="flash">
      <p class="eyebrow">Comment dit-on…</p>
      <h1 class="fr-prompt">${esc(item.fr)}</h1>
    </article>
    <form id="f" class="typed">
      <input id="a" lang="nl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="En néerlandais…" enterkeyhint="done">
      <div class="row"><button type="button" class="btn ghost" id="idk">Je ne sais pas</button><button class="btn primary">Vérifier</button></div>
    </form>`);
  const input = document.getElementById('a');
  input.focus({ preventScroll: true });
  return new Promise((resolve) => {
    const submit = (given) => {
      document.getElementById('f').remove();
      const outcome = judge(given, [item.nl, ...(item.accept || [])]);
      const shown = outcome === 'exact' ? '' : `<p class="answer" lang="nl">${esc(item.nl)}</p>${given ? `<small>Vous avez écrit : ${esc(given)}</small>` : ''}`;
      feedback(outcome, shown, theme, { id: item.id, text: item.nl }).then(resolve);
    };
    document.getElementById('f').onsubmit = (e) => { e.preventDefault(); submit(input.value); };
    document.getElementById('idk').onclick = () => submit('');
  });
}

// ---------- 5. word order: build the sentence ----------

export function orderSentence(head, theme, { nl, fr, audioId }) {
  const { words, end } = tiles(nl);
  let bank = shuffle(words.map((w, i) => ({ w, i })));
  if (bank.every((t, k) => t.i === k) && bank.length > 1) bank = [...bank.slice(1), bank[0]];
  const chosen = [];
  render(head, `
    <article class="flash">
      <p class="eyebrow">Remettez dans l'ordre</p>
      <h1 class="fr-prompt">${esc(fr)}</h1>
      <div class="built" id="built" aria-label="Votre phrase"></div>
    </article>
    <div class="bank" id="bank"></div>
    <button class="btn primary wide" id="check" disabled>Vérifier</button>`);
  const draw = () => {
    document.getElementById('built').innerHTML = chosen.length
      ? chosen.map((t, k) => `<button class="tile in" data-k="${k}" lang="nl">${esc(t.w)}</button>`).join('') + `<span class="end">${esc(end)}</span>`
      : '<span class="placeholder">Touchez les mots dans le bon ordre</span>';
    document.getElementById('bank').innerHTML = bank.map((t) =>
      `<button class="tile" data-i="${t.i}" lang="nl" ${chosen.includes(t) ? 'disabled' : ''}>${esc(t.w)}</button>`).join('');
    document.getElementById('check').disabled = chosen.length !== words.length;
    document.querySelectorAll('#bank .tile').forEach((b) => b.onclick = () => { chosen.push(bank.find((t) => t.i === Number(b.dataset.i))); draw(); });
    document.querySelectorAll('#built .tile').forEach((b) => b.onclick = () => { chosen.splice(Number(b.dataset.k), 1); draw(); });
  };
  draw();
  return new Promise((resolve) => {
    document.getElementById('check').onclick = () => {
      const ok = sameOrder(chosen.map((t) => t.w), nl);
      document.getElementById('check').remove();
      document.querySelectorAll('.tile').forEach((t) => t.disabled = true);
      feedback(ok ? 'exact' : 'wrong', ok ? '' : `<p class="answer" lang="nl">${esc(nl)}</p>`,
        theme, audioId ? { id: audioId, text: nl } : null).then(resolve);
    };
  });
}

// ---------- 6. grammar gap: choose the right form ----------

export function choiceGap(head, theme, ex) {
  const [before, after] = ex.nl.split('___');
  render(head, `
    <article class="flash">
      <p class="eyebrow">Complétez</p>
      <h1 lang="nl" class="gap">${esc(before)}<span class="blank" id="blank">___</span>${esc(after)}</h1>
      <p class="fr">${esc(ex.fr)}</p>
    </article>
    <div class="choices inline">${shuffle(ex.options).map((o) => `<button class="choice" data-id="${esc(o)}" lang="nl">${esc(o)}</button>`).join('')}</div>`);
  return choose(ex.answer, () => {
    document.getElementById('blank').textContent = ex.answer;
    document.getElementById('blank').classList.add('filled');
    return `<p lang="nl">${esc(ex.nl.replace('___', ex.answer))}</p>${ex.why ? `<small>${esc(ex.why)}</small>` : ''}`;
  });
}

// ---------- 7. say it aloud, reveal, grade yourself (review) ----------

export function sayReveal(head, theme, item, card) {
  render(head, `
    <article class="flash">
      <p class="eyebrow">Dites-le à voix haute</p>
      <h1 class="fr-prompt">${esc(item.fr)}</h1>
      <div id="answer" hidden>
        <div class="hear">${speakButton(theme, item.id, item.nl)}<p class="answer" lang="nl">${esc(item.nl)}</p></div>
        ${item.ex_nl ? `<div class="example">${speakButton(theme, `${item.id}-ex`, item.ex_nl, 'Écouter l\'exemple')}
          <div><p lang="nl">${esc(item.ex_nl)}</p><p class="fr">${esc(item.ex_fr)}</p></div></div>` : ''}
      </div>
    </article>
    <button class="btn primary wide" id="reveal">Afficher la réponse</button>
    <div class="grades" id="grades" hidden>
      ${[[1, 'Oublié'], [2, 'Difficile'], [3, 'Bien'], [4, 'Facile']].map(([g, l]) =>
        `<button class="grade g${g}" data-g="${g}"><strong>${l}</strong><small>${intervalLabel(card, g)}</small></button>`).join('')}
    </div>`);
  document.getElementById('reveal').onclick = (e) => {
    e.target.remove();
    document.getElementById('answer').hidden = false;
    document.getElementById('grades').hidden = false;
    speak(theme, item.id, item.nl);
  };
  return new Promise((resolve) => {
    document.querySelectorAll('.grade').forEach((b) => b.onclick = () => resolve(Number(b.dataset.g)));
  });
}

// ---------- 8. dictation: hear a sentence, type it ----------

export function dictation(head, theme, { id, nl, fr }) {
  render(head, `
    <article class="flash center">
      <p class="eyebrow">Dictée — écoutez et écrivez</p>
      ${speakButton(theme, id, nl, 'Réécouter', true)}
      <button class="link" id="slow">écouter plus lentement</button>
    </article>
    <form id="f" class="typed">
      <input id="a" lang="nl" autocomplete="off" autocapitalize="sentences" autocorrect="off" spellcheck="false" placeholder="Ce que vous entendez…" enterkeyhint="done">
      <div class="row"><button type="button" class="btn ghost" id="idk">Je ne sais pas</button><button class="btn primary">Vérifier</button></div>
    </form>`);
  speak(theme, id, nl);
  document.getElementById('slow').onclick = () => speak('_slow', id, nl);
  const input = document.getElementById('a');
  input.focus({ preventScroll: true });
  return new Promise((resolve) => {
    const submit = (given) => {
      document.getElementById('f').remove();
      const outcome = judge(given, [nl]);
      feedback(outcome, `<p class="answer" lang="nl">${esc(nl)}</p><small>${esc(fr)}</small>${outcome !== 'exact' && given ? `<small>Vous avez écrit : ${esc(given)}</small>` : ''}`).then(resolve);
    };
    document.getElementById('f').onsubmit = (e) => { e.preventDefault(); submit(input.value); };
    document.getElementById('idk').onclick = () => submit('');
  });
}

// ---------- 9. say it, the phone checks (speech recognition) ----------
// mode 'repeat': the Dutch is shown and heard, the learner repeats it.
// mode 'produce': only the French is shown, the learner says it in Dutch.
// Recognition is imperfect: two tries, and the learner can always move on.

export const speakingOn = () => canRecognize() && store.db().settings?.speaking !== false
  && !(store.db().settings?.speakingPausedUntil > Date.now());

export function speakCheck(head, theme, { id, nl, fr, accept = [] }, mode = 'produce') {
  render(head, `
    <article class="flash ${mode === 'repeat' ? '' : ''}">
      <p class="eyebrow">${mode === 'repeat' ? 'Écoutez, puis répétez' : 'Dites-le en néerlandais'}</p>
      ${mode === 'repeat'
        ? `<div class="hear">${speakButton(theme, id, nl)}<h1 lang="nl">${esc(nl)}</h1></div><p class="fr">${esc(fr)}</p>`
        : `<h1 class="fr-prompt">${esc(fr)}</h1>`}
      <p class="heard" id="heard" lang="nl"></p>
    </article>
    <button class="mic-btn" id="mic" aria-label="Parler"><svg viewBox="0 0 24 24"><path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11.5a6 6 0 0 0 12 0M12 17.5V20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Toucher et parler</span></button>
    <div class="row"><button class="btn ghost" id="later">Je ne peux pas parler maintenant</button><button class="btn ghost" id="skip">Passer</button></div>`);
  if (mode === 'repeat') speak(theme, id, nl);
  let tries = 0;
  return new Promise((resolve) => {
    const finish = (outcome, said) => {
      document.getElementById('mic')?.remove();
      document.querySelector('.session .row')?.remove();
      feedback(outcome, `<p class="answer" lang="nl">${esc(nl)}</p>${said ? `<small>Entendu : « ${esc(said)} »</small>` : ''}`, theme, { id, text: nl }).then(resolve);
    };
    document.getElementById('skip').onclick = () => finish('wrong', '');
    document.getElementById('later').onclick = () => {
      store.db().settings.speakingPausedUntil = Date.now() + 3600e3;
      store.save();
      finish('exact', '');
    };
    const mic = document.getElementById('mic');
    mic.onclick = async () => {
      mic.classList.add('on');
      mic.querySelector('span').textContent = 'J\'écoute…';
      const heard = document.getElementById('heard');
      try {
        const { best, alts } = await listen('nl-BE', (t) => { heard.textContent = t; });
        mic.classList.remove('on');
        tries++;
        const outcomes = alts.map((a) => judge(a, [nl, ...accept]));
        const outcome = outcomes.includes('exact') ? 'exact' : outcomes.includes('near') ? 'near' : 'wrong';
        if (outcome !== 'wrong' || tries >= 2) return finish(outcome === 'near' ? 'exact' : outcome, best);
        heard.textContent = best ? `Entendu : « ${best} » — essayez encore` : 'Rien entendu — essayez encore';
        mic.querySelector('span').textContent = 'Réessayer';
      } catch (e) {
        mic.classList.remove('on');
        heard.textContent = 'Le micro ou la reconnaissance vocale ne répond pas.';
        mic.querySelector('span').textContent = 'Réessayer';
      }
    };
  });
}

// ---------- 10. match the pairs ----------

// Translations that share a word ("Au revoir !" and "Salut ! / Au revoir !") would make two answers
// right, so a round never holds both.
function distinctSet(items, n) {
  const words = (t) => new Set(norm(t).split(' ').filter((w) => w.length >= 4));
  const set = [];
  for (const it of shuffle(items)) {
    const w = words(it.fr);
    if (set.every((x) => ![...words(x.fr)].some((y) => w.has(y)) && norm(x.nl) !== norm(it.nl))) set.push(it);
    if (set.length === n) break;
  }
  return set;
}

export function matchPairs(head, theme, items) {
  const set = distinctSet(items, 5);
  const left = shuffle(set.map((it) => ({ id: it.id, text: it.nl, lang: 'nl' })));
  const right = shuffle(set.map((it) => ({ id: it.id, text: it.fr, lang: 'fr' })));
  render(head, `
    <article class="flash"><p class="eyebrow">Associez les paires</p><h1 class="fr-prompt">Touchez un mot, puis sa traduction.</h1></article>
    <div class="match">
      <div>${left.map((x) => `<button class="choice m" data-id="${x.id}" data-side="l" lang="nl">${esc(x.text)}</button>`).join('')}</div>
      <div>${right.map((x) => `<button class="choice m" data-id="${x.id}" data-side="r">${esc(x.text)}</button>`).join('')}</div>
    </div>`);
  let picked = null, mistakes = 0, found = 0;
  return new Promise((resolve) => {
    document.querySelectorAll('.match .m').forEach((b) => b.onclick = () => {
      if (b.disabled) return;
      if (b.dataset.side === 'l') speak(theme, b.dataset.id, b.textContent);
      if (!picked || picked.dataset.side === b.dataset.side) {
        picked?.classList.remove('sel');
        picked = b; b.classList.add('sel');
        return;
      }
      if (picked.dataset.id === b.dataset.id) {
        [picked, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('right'); x.disabled = true; });
        found++;
        if (found === set.length) setTimeout(() => feedback(mistakes ? 'near' : 'exact', mistakes ? `<small>${mistakes} erreur${mistakes > 1 ? 's' : ''}</small>` : '').then(() => resolve(mistakes === 0 ? 'exact' : 'near')), 350);
      } else {
        mistakes++;
        const p = picked;
        [p, b].forEach((x) => x.classList.add('wrong'));
        setTimeout(() => [p, b].forEach((x) => x.classList.remove('wrong', 'sel')), 600);
      }
      picked = null;
    });
  });
}

// ---------- 11. a multiple-choice question about a text (dialogue comprehension) ----------

export function question(head, q, idx) {
  render(head, `
    <article class="flash"><p class="eyebrow">Compréhension · ${idx}</p><h1 class="fr-prompt">${esc(q.q)}</h1></article>
    <div class="choices">${q.options.map((o, k) => `<button class="choice" data-id="${k}">${esc(o)}</button>`).join('')}</div>`);
  return choose(q.answer, () => '');
}
