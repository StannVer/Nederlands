// Progress lives on the device (localStorage). Home-screen apps on iOS keep it;
// Safari tabs can lose it after 7 days without a visit, so install the app.

const KEY = 'nederlands_v1';

function fresh() {
  return { v: 1, cards: {}, days: {}, reviews: 0, settings: { newPerLesson: 5 } };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch (e) { /* private mode or blocked storage: start fresh */ }
  return fresh();
}

let data = load();

export const db = () => data;

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
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

export function streak() {
  let n = 0;
  const d = new Date();
  if (!data.days[dayKey(d)]) d.setDate(d.getDate() - 1); // today not done yet: the streak is still alive
  while (data.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const cardKey = (theme, id) => `${theme}/${id}`;

export function setCard(theme, id, card) {
  data.cards[cardKey(theme, id)] = card;
  save();
}

export function getCard(theme, id) {
  return data.cards[cardKey(theme, id)] || null;
}

export function dueKeys(now = Date.now()) {
  return Object.entries(data.cards)
    .filter(([, c]) => c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([k]) => k);
}

export function exportJSON() {
  return JSON.stringify(data, null, 2);
}

export function reset() {
  data = fresh();
  save();
}

// Ask the browser not to evict our data under storage pressure.
export function requestPersistence() {
  try { navigator.storage?.persist?.(); } catch (e) { /* not supported */ }
}
