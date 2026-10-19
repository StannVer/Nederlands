// Stan's recordings first (audio/<theme>/<id>.m4a); a synthetic Flemish voice stands in until they exist.
import { esc } from './util.js';

let current = null;

export function stop() {
  if (current) { current.pause(); current = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function tts(text, variant = 0, rate = 0.85) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(String(text).replace(/…/g, ''));
    const voices = speechSynthesis.getVoices();
    // Two speakers in a dialogue: a second Dutch voice if the device has one, otherwise a different pitch.
    const nl = voices.filter((x) => x.lang?.replace('_', '-').startsWith('nl'));
    const be = nl.filter((x) => x.lang.replace('_', '-') === 'nl-BE');
    const pool = be.length > variant ? be : nl.length > variant ? nl : (be.length ? be : nl);
    const v = pool[variant % Math.max(1, pool.length)];
    if (v) u.voice = v;
    if (variant && pool.length <= variant) u.pitch = 0.8;
    u.lang = v?.lang || 'nl-BE';
    u.rate = rate;
    u.onend = u.onerror = () => resolve();
    speechSynthesis.speak(u);
    setTimeout(resolve, 2500 + 160 * String(text).length); // some browsers never fire onend
  });
}

// Resolves when playback has finished, so dialogue lines can be chained.
export function speak(theme, id, text, variant = 0) {
  stop();
  if (theme === '_slow') return tts(text, variant, 0.6);
  return new Promise((resolve) => {
    const a = new Audio(`audio/${theme}/${id}.m4a`);
    current = a;
    a.onended = () => resolve();
    a.play().catch(() => { if (current === a) current = null; tts(text, variant).then(resolve); });
  });
}

export const speakButton = (theme, id, text, label = 'Écouter', big = false, variant = 0) =>
  `<button class="speak${big ? ' big' : ''}" data-speak="${esc(theme)}|${esc(id)}|${esc(text)}|${variant}" aria-label="${esc(label)}">
     <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
   </button>`;

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-speak]');
  if (!b) return;
  const [t, id, text, variant] = b.dataset.speak.split('|');
  speak(t, id, text, Number(variant) || 0);
});

// French, for the hands-free listening mode (the device's own French voice).
export function speakFr(text) {
  stop();
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(String(text).replace(/…/g, ''));
    const v = speechSynthesis.getVoices().find((x) => x.lang?.replace('_', '-').startsWith('fr'));
    if (v) u.voice = v;
    u.lang = v?.lang || 'fr-BE';
    u.rate = 0.95;
    u.onend = u.onerror = () => resolve();
    speechSynthesis.speak(u);
    setTimeout(resolve, 2500 + 120 * String(text).length);
  });
}

// ----- speech recognition: the phone listens and writes down what it heard (Dutch) -----

const Recognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;
export const canRecognize = () => !!Recognition();

// Resolves with the transcript (best guess), or '' if nothing was understood.
export function listen(lang = 'nl-BE', onPartial = () => {}) {
  return new Promise((resolve, reject) => {
    const R = Recognition();
    if (!R) return reject(new Error('no recognition'));
    stop();
    const r = new R();
    r.lang = lang;
    r.interimResults = true;
    r.maxAlternatives = 3;
    let best = '';
    let alts = [];
    r.onresult = (e) => {
      const res = [...e.results];
      best = res.map((x) => x[0].transcript).join(' ');
      alts = res.length === 1 ? [...res[0]].map((a) => a.transcript) : [best];
      onPartial(best);
    };
    r.onerror = (e) => (e.error === 'no-speech' ? resolve({ best: '', alts: [] }) : reject(e));
    r.onend = () => resolve({ best, alts: alts.length ? alts : [best] });
    r.start();
    setTimeout(() => { try { r.stop(); } catch (x) { /* already stopped */ } }, 8000);
  });
}

// ----- recording, for "listen, repeat, compare" -----

export const canRecord = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

export async function record(maxMs = 6000) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise((resolve) => {
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(chunks, { type: rec.mimeType }));
    };
  });
  rec.start();
  const timer = setTimeout(() => rec.state === 'recording' && rec.stop(), maxMs);
  return {
    stop: () => { clearTimeout(timer); if (rec.state === 'recording') rec.stop(); return done; },
    done,
    mimeType: rec.mimeType,
  };
}
