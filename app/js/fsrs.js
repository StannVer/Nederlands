// FSRS-4.5 scheduler (Free Spaced Repetition Scheduler, the algorithm Anki uses).
// Default weights; target retention 90 %. A card is { s, d, last, due, reps, lapses }.

const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474,
  0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5;
const FACTOR = 19 / 81;
const RETENTION = 0.9;
const DAY = 864e5;
const RELEARN_MS = 10 * 60e3;
const MAX_DAYS = 365;

export const Rating = { Again: 1, Hard: 2, Good: 3, Easy: 4 };

const clampD = (d) => Math.min(10, Math.max(1, d));
const initD = (g) => clampD(W[4] - (g - 3) * W[5]);

export function retrievability(elapsedDays, s) {
  return Math.pow(1 + FACTOR * elapsedDays / s, DECAY);
}

function intervalDays(s) {
  return Math.min(MAX_DAYS, Math.max(1, Math.round(s / FACTOR * (Math.pow(RETENTION, 1 / DECAY) - 1))));
}

function nextD(d, g) {
  return clampD(W[7] * initD(4) + (1 - W[7]) * (d - W[6] * (g - 3)));
}

function recallS(d, s, r, g) {
  const hard = g === Rating.Hard ? W[15] : 1;
  const easy = g === Rating.Easy ? W[16] : 1;
  return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy);
}

function forgetS(d, s, r) {
  return W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
}

export function schedule(card, g, now = Date.now()) {
  const reps = (card?.reps || 0) + 1;
  let lapses = card?.lapses || 0;
  let s, d;
  if (!card || !card.s) {
    s = W[g - 1];
    d = initD(g);
  } else {
    const r = retrievability(Math.max(0, (now - card.last) / DAY), card.s);
    d = nextD(card.d, g);
    if (g === Rating.Again) {
      s = Math.min(forgetS(card.d, card.s, r), card.s);
      lapses++;
    } else {
      s = recallS(card.d, card.s, r, g);
    }
  }
  // A forgotten review comes back in the same session; a new card is never due before tomorrow.
  const isNew = !card || !card.s;
  const due = g === Rating.Again && !isNew ? now + RELEARN_MS : now + intervalDays(s) * DAY;
  return { s, d, last: now, due, reps, lapses };
}

export function intervalLabel(card, g, now = Date.now()) {
  const next = schedule(card, g, now);
  const ms = next.due - now;
  if (ms < DAY) return `${Math.round(ms / 60e3)} min`;
  const days = Math.round(ms / DAY);
  if (days < 31) return `${days} j`;
  if (days < 365) return `${Math.round(days / 30)} mois`;
  return `${(days / 365).toFixed(1)} an`;
}
