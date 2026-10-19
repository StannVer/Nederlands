// The teacher's space: each learner's progress and hardest words, words to add after a conversation,
// questions and the lessons drafted in answer to them, and task submissions to give feedback on.
import * as sync from './sync.js';
import { retrievability } from './fsrs.js';
import { record } from './audio.js';
import { esc } from './util.js';

const view = () => document.getElementById('view');
const DAY = 864e5;
const fmt = (t) => new Date(t).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });

function streakOf(days = {}) {
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const d = new Date();
  if (!days[key(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export async function teacherPage(tab, ctx) {
  if (!(await sync.isTeacher())) { location.hash = '#/settings'; return; }
  const tabs = [['learners', 'Apprenants'], ['questions', 'Questions'], ['tasks', 'Opdrachten']];
  tab = tabs.some(([t]) => t === tab) ? tab : 'learners';
  view().innerHTML = `
    <a class="back" href="#/settings">‹ Réglages</a>
    <header class="hello"><p class="eyebrow">Espace enseignant</p><h1>${esc(tabs.find(([t]) => t === tab)[1])}</h1></header>
    <nav class="segmented">${tabs.map(([t, l]) => `<a href="#/teacher/${t}" class="${t === tab ? 'on' : ''}">${l}</a>`).join('')}</nav>
    <div id="tpane"><p class="small">Chargement…</p></div>`;
  const pane = document.getElementById('tpane');
  try {
    if (tab === 'learners') await learnersPane(pane, ctx);
    else if (tab === 'questions') await questionsPane(pane);
    else await tasksPane(pane);
  } catch (e) {
    pane.innerHTML = '<p class="ko">Chargement impossible — vérifiez la connexion.</p>';
    console.error(e);
  }
}

// ---------- learners: progress, hardest words, words to add ----------

async function learnersPane(pane, ctx) {
  const rows = (await sync.learners()).filter((r) => r.state);
  if (!rows.length) { pane.innerHTML = '<p class="lead">Aucun apprenant ne s\'est encore connecté.</p>'; return; }
  const ready = ctx.themeIndex.filter((t) => t.status === 'ready');
  const themes = Object.fromEntries(await Promise.all(ready.map(async (t) => [t.id, await ctx.loadTheme(t.id)])));
  const now = Date.now();

  const label = (key, st) => {
    const [tid, rest] = key.split('/');
    if (tid === 'perso') return (st.mywords || []).find((w) => w.id === rest)?.nl;
    if (tid === 'stan') return (st.teacherItems || []).find((w) => w.id === rest)?.nl;
    if (rest.includes('#')) { const [g, k] = rest.split('#'); return themes[tid]?.grammar?.[g]?.exercises[Number(k)]?.nl.replace('___', '…'); }
    return themes[tid]?.items.find((i) => i.id === rest)?.nl;
  };

  pane.innerHTML = rows.map((r) => {
    const st = r.state;
    const cards = Object.entries(st.cards || {});
    const due = cards.filter(([, c]) => c.due <= now).length;
    const mem = cards.length ? Math.round((cards.reduce((a, [, c]) => a + retrievability((now - c.last) / DAY, c.s), 0) / cards.length) * 100) : null;
    const hardest = cards.filter(([, c]) => (c.lapses || 0) > 0 || c.d > 7)
      .sort((a, b) => (b[1].lapses || 0) - (a[1].lapses || 0) || b[1].d - a[1].d).slice(0, 8);
    const steps = Object.keys(st.steps || {}).length;
    const totalSteps = Object.values(themes).reduce((a, t) => a + t.steps.length, 0);
    const checks = Object.entries(st.checks || {});
    const lastDay = Object.keys(st.days || {}).sort().pop();
    return `
      <section class="group learner" data-uid="${r.user_id}">
        <strong>${esc(r.learner_email || 'apprenant')}</strong>
        <small>dernière activité : ${lastDay ? esc(lastDay) : '—'} · série ${streakOf(st.days)} j · ${st.reviews || 0} exercices</small>
        <div class="stats">
          <div class="stat"><span>${cards.filter(([k]) => !k.includes('#')).length}</span><small>mots en mémoire</small></div>
          <div class="stat"><span>${mem === null ? '—' : mem + ' %'}</span><small>mémoire estimée</small></div>
          <div class="stat"><span>${steps}/${totalSteps}</span><small>étapes faites</small></div>
          <div class="stat"><span>${due}</span><small>révisions en attente</small></div>
        </div>
        ${checks.length ? `<p class="small">Bilans : ${checks.map(([t, c]) => `${esc(themes[t]?.nl || t)} ${Math.round(c.score * 10)}/10`).join(' · ')}</p>` : ''}
        <h2 class="section">Mots qui résistent</h2>
        ${hardest.length ? `<ul class="hard">${hardest.map(([k, c]) => `<li><span lang="nl">${esc(label(k, st) || k)}</span><small>${c.lapses || 0} oubli${(c.lapses || 0) > 1 ? 's' : ''}</small></li>`).join('')}</ul>`
          : '<p class="small">Rien de particulier pour l\'instant.</p>'}
        <h2 class="section">Ajouter des mots après une conversation</h2>
        <form class="additem">
          <input name="nl" lang="nl" placeholder="Néerlandais" autocapitalize="off" required>
          <input name="fr" placeholder="Français" required>
          <input name="note" placeholder="Note (facultatif : contexte, prononciation…)">
          <button class="btn primary">Ajouter à ses révisions</button>
        </form>
        <ul class="words added"><li class="small">…</li></ul>
      </section>`;
  }).join('');

  for (const sec of pane.querySelectorAll('.learner')) {
    const uid = sec.dataset.uid;
    const list = sec.querySelector('.added');
    const refresh = async () => {
      const items = await sync.teacherItemsFor(uid);
      list.innerHTML = items.map((i) => `<li><span><strong lang="nl">${esc(i.nl)}</strong><small>${esc(i.fr)}${i.note ? ` · ${esc(i.note)}` : ''} · ${fmt(i.created_at)}</small></span>
        <button class="link del" data-id="${i.id}" aria-label="Supprimer">✕</button></li>`).join('') || '<li class="small">Aucun mot ajouté.</li>';
      list.querySelectorAll('.del').forEach((b) => b.onclick = async () => { if (confirm('Retirer ce mot ?')) { await sync.deleteTeacherItem(b.dataset.id); refresh(); } });
    };
    refresh();
    sec.querySelector('.additem').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      await sync.addTeacherItem(uid, { nl: f.get('nl').trim(), fr: f.get('fr').trim(), note: f.get('note').trim() });
      e.target.reset();
      e.target.querySelector('input').focus();
      refresh();
    };
  }
}

// ---------- questions and draft lessons ----------

async function questionsPane(pane) {
  const [questions, drafts] = await Promise.all([sync.allQuestions(), sync.draftLessons()]);
  const urls = Object.fromEntries(await Promise.all(questions.filter((q) => q.audio_path).map(async (q) => [q.id, await sync.audioUrl(q.audio_path)])));
  const label = { new: 'nouvelle', drafting: 'leçon en préparation', answered: 'leçon publiée', dismissed: 'répondue autrement' };
  pane.innerHTML = `
    ${drafts.length ? `<h2 class="section">Leçons à valider</h2>
      ${drafts.map((d) => `<section class="group draft" data-id="${d.id}">
        <strong>${esc(d.theme.nl)} — ${esc(d.theme.fr)}</strong>
        <small>${fmt(d.created_at)} · ${d.theme.items?.length || 0} mots · ${Object.keys(d.theme.grammar || {}).length} point(s) de grammaire</small>
        ${d.theme.answer ? `<details><summary>La réponse</summary>${d.theme.answer.map((p) => `<p>${esc(p)}</p>`).join('')}</details>` : ''}
        <details><summary>Le contenu</summary><ul class="mini">${(d.theme.items || []).map((i) => `<li><span lang="nl"><strong>${esc(i.nl)}</strong></span><small>${esc(i.fr)}</small></li>`).join('')}</ul></details>
        <div class="row"><button class="btn archive">Écarter</button><button class="btn primary publish">Publier</button></div>
      </section>`).join('')}` : ''}
    <h2 class="section">Questions</h2>
    ${questions.length ? questions.map((q) => `<section class="group question" data-id="${q.id}">
      <small>${esc(q.learner_email)} · ${new Date(q.created_at).toLocaleString('fr-BE', { dateStyle: 'medium', timeStyle: 'short' })} · ${label[q.status]}</small>
      <p>${esc(q.text)}</p>
      ${urls[q.id] ? `<audio controls src="${esc(urls[q.id])}"></audio>` : ''}
      ${q.status === 'new' ? '<button class="btn small dismiss">Répondue en personne</button>' : ''}
    </section>`).join('') : '<p class="small">Aucune question pour l\'instant.</p>'}
    <p class="fineprint">Les nouvelles questions sont reprises par la tâche planifiée, qui prépare une leçon en brouillon. Elle n'apparaît chez l'apprenant qu'après « Publier ».</p>`;
  pane.querySelectorAll('.draft').forEach((sec) => {
    const id = sec.dataset.id;
    const d = drafts.find((x) => String(x.id) === id);
    sec.querySelector('.publish').onclick = async (e) => {
      e.target.disabled = true;
      await sync.setLessonStatus(id, 'published');
      if (d.question_id) await sync.setQuestionStatus(d.question_id, 'answered');
      sec.innerHTML = '<p class="ok">Publiée ✓ — l\'apprenant la verra dans « Mes leçons ».</p>';
    };
    sec.querySelector('.archive').onclick = async () => { await sync.setLessonStatus(id, 'archived'); sec.remove(); };
  });
  pane.querySelectorAll('.question .dismiss').forEach((b) => b.onclick = async () => {
    await sync.setQuestionStatus(b.closest('.question').dataset.id, 'dismissed');
    b.replaceWith(Object.assign(document.createElement('small'), { textContent: 'marquée ✓' }));
  });
}

// ---------- task submissions ----------

async function tasksPane(pane) {
  const rows = await sync.allSubmissions();
  const urls = Object.fromEntries(await Promise.all(rows.filter((r) => r.audio_path).map(async (r) => [r.id, await sync.audioUrl(r.audio_path)])));
  pane.innerHTML = rows.length ? `<ul class="submissions">${rows.map((r) => `
    <li class="group" data-id="${r.id}">
      <small>${esc(r.learner_email)} · ${esc(r.theme)} · ${new Date(r.created_at).toLocaleString('fr-BE', { dateStyle: 'medium', timeStyle: 'short' })}</small>
      <strong>${r.mode === 'recording' ? 'Enregistrement' : 'Fait en personne'}${r.feedback_at ? ' · répondu ✓' : ''}</strong>
      ${r.notes ? `<details><summary>Ses notes</summary><p lang="nl">${esc(r.notes).replace(/\n/g, '<br>')}</p></details>` : ''}
      ${urls[r.id] ? `<audio controls src="${esc(urls[r.id])}"></audio>` : ''}
      <textarea rows="3" placeholder="Votre retour (ce qui était bien, une ou deux corrections)…">${esc(r.feedback_text || '')}</textarea>
      <div class="row"><button class="btn rec">● Retour vocal</button><button class="btn primary save">Envoyer</button></div>
      <div class="fbaudio"></div>
    </li>`).join('')}</ul>` : '<p class="lead">Aucune opdracht pour l\'instant.</p>';
  pane.querySelectorAll('.submissions > li').forEach((li) => {
    const row = rows.find((r) => String(r.id) === li.dataset.id);
    let blob = null, current = null;
    const recBtn = li.querySelector('.rec');
    recBtn.onclick = async () => {
      if (current) { await current.stop(); return; }
      current = await record(120000);
      recBtn.textContent = '■ Arrêter';
      blob = await current.done;
      current = null;
      recBtn.textContent = '● Refaire';
      li.querySelector('.fbaudio').innerHTML = `<audio controls src="${URL.createObjectURL(blob)}"></audio>`;
    };
    li.querySelector('.save').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = 'Envoi…';
      try { await sync.saveFeedback(row, li.querySelector('textarea').value.trim(), blob); e.target.textContent = 'Envoyé ✓'; }
      catch (x) { e.target.disabled = false; e.target.textContent = 'Réessayer'; }
    };
  });
}
