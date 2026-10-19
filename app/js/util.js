export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Lenient comparison: case, accents, punctuation and the "…" placeholder do not count.
export const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/…|\.\.\./g, ' ').replace(/[.,!?;:¿¡'"«»—–-]/g, ' ').replace(/\s+/g, ' ').trim();

export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

// 'exact' | 'near' (a typo: counted as right, with the spelling shown) | 'wrong'
export function judge(given, accepted) {
  const g = norm(given);
  if (!g) return 'wrong';
  let best = Infinity, target = '';
  for (const a of accepted) {
    const t = norm(a);
    if (t === g) return 'exact';
    const d = levenshtein(g, t);
    if (d < best) { best = d; target = t; }
  }
  const allowed = target.length >= 10 ? 2 : target.length >= 4 ? 1 : 0;
  return best <= allowed ? 'near' : 'wrong';
}

// Words of a sentence for the word-order exercise. Punctuation is stripped from the tiles: a tile
// reading "u." would give away where the first sentence ends.
export function tiles(sentence) {
  const end = (sentence.match(/[.!?…]+$/) || [''])[0];
  const words = sentence.slice(0, sentence.length - end.length).split(/\s+/).map((w) => w.replace(/[,.;:!?…]+$/, ''));
  return { words, end };
}

export const sameOrder = (given, sentence) => norm(given.join(' ')) === norm(sentence);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
