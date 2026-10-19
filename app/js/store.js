// Progress lives on the device (localStorage) and, when an account is signed in, is mirrored to
// the cloud by sync.js. Home-screen apps on iOS keep localStorage; Safari tabs can lose it after
// 7 days without a visit.

const KEY = 'nederlands_v1';
const listeners = new Set();

function fresh() {
  return { v: 2, cards: {}, days: {}, reviews: 0, steps: {}, checks: {}, settings: {} };
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
