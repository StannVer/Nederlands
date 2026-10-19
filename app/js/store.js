// Progress lives on the device (localStorage) and, when an account is signed in, is mirrored to
// the cloud by sync.js. Home-screen apps on iOS keep localStorage; Safari tabs can lose it after
// 7 days without a visit.

const KEY = 'nederlands_v1';
const listeners = new Set();

function fresh() {
  return { v: 2, cards: {}, days: {}, reviews: 0, steps: {}, checks: {}, tasks: {}, mywords: [], teacherItems: [], customLessons: [], pron: {}, stories: {}, settings: {} };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw), v: 2 };
  } catch (e) { /* private mode or blocked storage: start fresh */ }
  return fresh();
}

let data = load();

export const db = () => data;

export function onChange(fn) { listeners.add(fn); }

export function save() {
  data.updated = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
  listeners.forEach((fn) => fn(data));
}

export function dayKey(t = new Date()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function logActivity(n = 1) {
  const k = dayKey();
  data.days[k] = (data.days[k] || 0) + n;
  data.reviews += n;
  save();
}

export const todayCount = () => data.days[dayKey()] || 0;

export function streak() {
  let n = 0;
  const d = new Date();
  if (!data.days[dayKey(d)]) d.setDate(d.getDate() - 1); // today not done yet: the streak is still alive
  while (data.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// ----- spaced-repetition cards: "theme/itemId" for words, "theme/g1#0" for grammar exercises -----

export const getCard = (key) => data.cards[key] || null;
export function setCard(key, card) { data.cards[key] = card; save(); }

export function dueKeys(now = Date.now()) {
  return Object.entries(data.cards)
    .filter(([, c]) => c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([k]) => k);
}

// ----- course path -----

export const stepDone = (theme, step) => data.steps[`${theme}/${step}`] || null;
export function completeStep(theme, step, score) {
  const k = `${theme}/${step}`;
  const prev = data.steps[k];
  data.steps[k] = { first: prev?.first || Date.now(), last: Date.now(), score: Math.max(score ?? 0, prev?.score ?? 0) };
  save();
}

export const getCheck = (theme) => data.checks[theme] || null;
export function setCheck(theme, result) { data.checks[theme] = { ...result, date: Date.now() }; save(); }

// ----- tasks: the learner's notes and whether it was done with the teacher -----

export const getTask = (theme) => data.tasks[theme] || { notes: '', updated: 0 };
export function setTask(theme, patch) { data.tasks[theme] = { ...getTask(theme), ...patch, updated: Date.now() }; save(); }

// ----- extra vocabulary: the learner's own words, and the words the teacher adds -----

export function addMyWord({ nl, fr, note }) {
  const w = { id: `m${Date.now().toString(36)}`, nl: nl.trim(), fr: fr.trim(), note: (note || '').trim(), added: Date.now() };
  data.mywords = [...(data.mywords || []), w];
  save();
  return w;
}
export function removeMyWord(id) {
  data.mywords = (data.mywords || []).filter((w) => w.id !== id);
  delete data.cards[`perso/${id}`];
  save();
}
// The teacher's words live in the database; this cached copy keeps them available offline.
export function setTeacherItems(rows) {
  const items = rows.map((r) => ({ id: `t${r.id}`, nl: r.nl, fr: r.fr, note: r.note || '', added: Date.parse(r.created_at) }));
  if (JSON.stringify(items) !== JSON.stringify(data.teacherItems || [])) { data.teacherItems = items; save(); }
}

// Lessons made for this learner in answer to their questions (cached from the database).
export function setCustomLessons(rows) {
  const lessons = rows.map((r) => ({ ...r.theme, id: `q-${r.id}`, published: Date.parse(r.published_at) }));
  if (JSON.stringify(lessons) !== JSON.stringify(data.customLessons || [])) { data.customLessons = lessons; save(); }
}

// ----- practice scores -----

export function setPron(id, score) { data.pron = { ...(data.pron || {}), [id]: { best: Math.max(score, data.pron?.[id]?.best || 0), last: Date.now() } }; save(); }
export function setStoryRead(id, score) { data.stories = { ...(data.stories || {}), [id]: { score, date: Date.now() } }; save(); }

// ----- backup and cloud merge -----

export function exportJSON() { return JSON.stringify(data, null, 2); }

export function reset() { data = fresh(); save(); }

// Two devices, one learner: keep the most recent state of every card and step, the larger day counts.
export function merge(remote) {
  if (!remote || typeof remote !== 'object') return false;
  const before = JSON.stringify(data);
  for (const [k, c] of Object.entries(remote.cards || {})) {
    if (!data.cards[k] || (c.last || 0) > (data.cards[k].last || 0)) data.cards[k] = c;
  }
  for (const [k, n] of Object.entries(remote.days || {})) data.days[k] = Math.max(n, data.days[k] || 0);
  for (const [k, s] of Object.entries(remote.steps || {})) {
    const l = data.steps[k];
    data.steps[k] = l ? { first: Math.min(l.first, s.first), last: Math.max(l.last, s.last), score: Math.max(l.score || 0, s.score || 0) } : s;
  }
  for (const [k, c] of Object.entries(remote.checks || {})) {
    if (!data.checks[k] || c.date > data.checks[k].date) data.checks[k] = c;
  }
  for (const [k, t] of Object.entries(remote.tasks || {})) {
    if (!data.tasks[k] || (t.updated || 0) > (data.tasks[k].updated || 0)) data.tasks[k] = t;
  }
  const mine = new Map((data.mywords || []).map((w) => [w.id, w]));
  for (const w of remote.mywords || []) if (!mine.has(w.id)) mine.set(w.id, w);
  data.mywords = [...mine.values()].sort((a, b) => a.added - b.added);
  for (const key of ['pron', 'stories']) {
    for (const [k, v] of Object.entries(remote[key] || {})) {
      const l = (data[key] || {})[k];
      if (!l || (v.last || v.date || 0) > (l.last || l.date || 0)) data[key] = { ...(data[key] || {}), [k]: v };
    }
  }
  data.reviews = Math.max(data.reviews, remote.reviews || 0);
  const changed = JSON.stringify(data) !== before;
  if (changed) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  return changed;
}

export function requestPersistence() {
  try { navigator.storage?.persist?.(); } catch (e) { /* not supported */ }
}
