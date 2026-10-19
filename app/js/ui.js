// Visual building blocks: Kees the garden gnome (mascot), the comic-strip cast, icons and stars.
import { esc } from './util.js';

// ---------- Kees, the tuinkabouter ----------

export function kees(mood = 'happy', size = 72) {
  const mouth = {
    happy: '<path d="M27 47c3 3 7 3 10 0" fill="none" stroke="#5b3a29" stroke-width="2" stroke-linecap="round"/>',
    wow: '<ellipse cx="32" cy="48" rx="3" ry="3.6" fill="#5b3a29"/>',
    think: '<path d="M28 48h8" stroke="#5b3a29" stroke-width="2" stroke-linecap="round"/>',
  }[mood] || '';
  return `<svg class="kees" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 2 L50 30 H14 Z" fill="#d33b4f"/><path d="M32 2 L41 16 H23 Z" fill="#e85a6c" opacity=".55"/>
    <circle cx="32" cy="38" r="13" fill="#f6c9a8"/>
    <path d="M19 41c0 13 6 21 13 21s13-8 13-21c-3 4-7 6-13 6s-10-2-13-6z" fill="#fbf7f1" stroke="#e6ddd0"/>
    <circle cx="27" cy="36" r="2" fill="#2b2b2b"/><circle cx="37" cy="36" r="2" fill="#2b2b2b"/>
    <circle cx="32" cy="41" r="3" fill="#ec9f86"/>${mouth}
    <rect x="12" y="28" width="40" height="5" rx="2.5" fill="#b02c40"/>
  </svg>`;
}

// A speech bubble from Kees (comic strip style). `nl` is the Dutch line, `fr` the small French gloss.
export function keesSays(nl, fr = '', mood = 'happy') {
  return `<div class="kees-says">${kees(mood, 56)}<div class="bubble-c"><strong lang="nl">${esc(nl)}</strong>${fr ? `<small>${esc(fr)}</small>` : ''}</div></div>`;
}

const PRAISE = [['Goed zo!', 'Bien joué !'], ['Prima!', 'Parfait !'], ['Amai, super!', 'Waouh, super !'], ['Heel goed!', 'Très bien !'], ['Schitterend!', 'Magnifique !'], ['Dat is het!', 'C\'est ça !']];
const COMFORT = [['Bijna!', 'Presque !'], ['Geen probleem!', 'Pas de souci !'], ['Allez, nog eens!', 'Allez, encore une fois !'], ['Rustig aan…', 'Doucement…']];
export const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];
export const comfort = () => COMFORT[Math.floor(Math.random() * COMFORT.length)];

// ---------- the cast: simple comic faces ----------

const CAST = {
  Monia: { skin: '#e9b48f', hair: '#3b2418', style: 'long', shirt: '#d6457b' },
  Jef: { skin: '#f1c4a3', hair: '#cfcac2', style: 'bald', shirt: '#2e6b4f', cap: true },
  Lotte: { skin: '#f5cfb1', hair: '#e2a93b', style: 'bob', shirt: '#1d7f86' },
  Stan: { skin: '#efc19e', hair: '#5a3d2b', style: 'short', shirt: '#33475b' },
  Sofie: { skin: '#f3c9a6', hair: '#7a4b2a', style: 'bob', shirt: '#8a5cc2' },
  Karim: { skin: '#c99872', hair: '#1f1a17', style: 'short', shirt: '#c46a2b' },
};

export function avatar(name, size = 44) {
  const c = CAST[name] || { skin: '#e8c3a4', hair: '#6b4b35', style: 'short', shirt: '#7b8794' };
  const hair = {
    long: `<path d="M12 26c0-11 7-18 20-18s20 7 20 18v18h-7V27c-3-4-8-6-13-6s-10 2-13 6v17h-7z" fill="${c.hair}"/>`,
    bob: `<path d="M13 30c0-13 8-20 19-20s19 7 19 20v6h-6v-8c-4-3-8-5-13-5s-9 2-13 5v8h-6z" fill="${c.hair}"/>`,
    short: `<path d="M15 26c0-10 7-16 17-16s17 6 17 16c-4-4-10-6-17-6s-13 2-17 6z" fill="${c.hair}"/>`,
    bald: `<path d="M16 30c0-3 1-5 2-6M48 30c0-3-1-5-2-6" stroke="${c.hair}" stroke-width="4" stroke-linecap="round"/>`,
  }[c.style];
  const cap = c.cap ? '<path d="M16 22c2-9 9-13 16-13s14 4 16 13z" fill="#2e6b4f"/><rect x="12" y="20" width="26" height="4" rx="2" fill="#24543e"/>' : '';
  return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 64 64" aria-label="${esc(name)}" role="img">
    <circle cx="32" cy="32" r="31" fill="var(--avatar-bg)"/>
    <path d="M10 64c2-12 11-18 22-18s20 6 22 18z" fill="${c.shirt}"/>
    <circle cx="32" cy="31" r="14" fill="${c.skin}"/>${hair}${cap}
    <circle cx="27" cy="31" r="1.8" fill="#2b2b2b"/><circle cx="37" cy="31" r="1.8" fill="#2b2b2b"/>
    <path d="M27.5 37c2.5 2.2 6.5 2.2 9 0" fill="none" stroke="#7a3e2e" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

// ---------- icons ----------

const P = (d, extra = '') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
export const ICONS = {
  // navigation
  today: P('M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z'),
  path: P('M6 20c0-4 4-4 6-7s-2-5 0-8M17 5.5a2 2 0 1 1 0 .1M6.5 19.5a1.5 1.5 0 1 1 0 .1'),
  review: P('M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4'),
  practice: P('M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11.5a6 6 0 0 0 12 0M12 17.5V20'),
  vocab: P('M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM17 7.5h2V20'),
  progress: P('M5 20V12M12 20V5M19 20v-9'),
  settings: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3'),
  teacher: '<circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M5 20c1-4 3.8-6 7-6s6 2 7 6'),
  // steps
  words: P('M5 5h14v10H9l-4 4z'),
  grammar: P('M4 7h16M4 12h10M4 17h13'),
  dialogue: P('M3 6h11v7H7l-4 3zM10 16h6l4 3v-9h-3'),
  checkpoint: P('M6 21V4M6 4.5h11l-2.5 4 2.5 4H6'),
  task: '<circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5M15 6.5h5M15 10h3.5'),
  done: P('M5 12.5l4.5 4.5L19 7.5', ' stroke-width="2.6"'),
  lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M8 11V8a4 4 0 0 1 8 0v3'),
  trophy: P('M8 4h8v4a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 12v4M8.5 20h7M10 16h4v4h-4z'),
  // themes
  wave: P('M7 13V6a1.5 1.5 0 0 1 3 0v5M10 11V4.5a1.5 1.5 0 0 1 3 0V11M13 11V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4.3 14a1.6 1.6 0 0 1 2.7-1.7L7 13'),
  clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M12 7.5V12l3 2'),
  family: '<circle cx="8" cy="7" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="7" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M3.5 19c.5-4 2.2-6.5 4.5-6.5s4 2.5 4.5 6.5M11.5 19c.5-4 2.2-6.5 4.5-6.5s4 2.5 4.5 6.5'),
  basket: P('M4 10h16l-1.6 9a1.5 1.5 0 0 1-1.5 1.2H7.1A1.5 1.5 0 0 1 5.6 19zM8 10l3-6M16 10l-3-6M9.5 14v3M14.5 14v3'),
  coffee: P('M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3'),
  house: P('M4 11 12 4l8 7v9H4zM10 20v-5h4v5'),
  sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8'),
  route: P('M6 20V9a3 3 0 0 1 3-3h7M13 3l3 3-3 3M18 20V11'),
  garden: P('M12 21v-8M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zM12 11c0-4 2.5-6.5 6.5-6.5 0 4-2.5 6.5-6.5 6.5M5 21h14'),
  music: P('M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 9 18zM19 16a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 19 16z'),
  tv: '<rect x="3" y="7" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>' + P('M8 3l4 4 4-4'),
  heart: P('M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z'),
};

export const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.wave}</svg>`;

// ---------- stars for a finished step ----------

export function starsFor(score) {
  if (score == null) return 0;
  return score >= 0.9 ? 3 : score >= 0.7 ? 2 : 1;
}

export function stars(n, max = 3) {
  return `<span class="stars" aria-label="${n} étoile${n > 1 ? 's' : ''} sur ${max}">${Array.from({ length: max }, (_, k) =>
    `<svg viewBox="0 0 24 24" class="${k < n ? 'on' : ''}"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/></svg>`).join('')}</span>`;
}

// Theme colour, cycling through the palette so each unit on the map has its own band.
const HUES = ['garden', 'coral', 'sun', 'teal', 'plum'];
export const hueOf = (index) => HUES[index % HUES.length];

// ---------- sound effects: synthesised with Web Audio, so there are no files to download ----------

let audioCtx = null;
const soundOn = () => { try { return JSON.parse(localStorage.getItem('nederlands_v1') || '{}').settings?.sounds !== false; } catch (e) { return true; } };

function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, audioCtx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(audioCtx.currentTime + start);
  o.stop(audioCtx.currentTime + start + dur + 0.05);
}

export function sfx(kind) {
  if (!soundOn()) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (kind === 'right') { tone(784, 0, 0.12, 'triangle'); tone(1047, 0.09, 0.2, 'triangle'); }
    else if (kind === 'wrong') { tone(220, 0, 0.18, 'sine', 0.1); tone(196, 0.12, 0.22, 'sine', 0.08); }
    else if (kind === 'done') { [523, 659, 784, 1047].forEach((f, k) => tone(f, k * 0.09, 0.25, 'triangle', 0.1)); }
    else if (kind === 'level') { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, k) => tone(f, k * 0.1, 0.3, 'triangle', 0.1)); }
  } catch (e) { /* no audio: silently skip */ }
}

// ---------- confetti: a short burst in the course colours ----------

export function confetti(n = 90) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#2e6b4f', '#c93d6f', '#f2b72c', '#1d7480', '#6e4fa3'];
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    p.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
    p.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    if (i % 3 === 0) p.style.borderRadius = '50%';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3600);
}
