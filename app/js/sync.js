// Accounts and cloud progress. Accounts are created by Stan in the Supabase dashboard (sign-up is
// switched off), so the login screen only signs in. The device copy stays the working copy; the
// cloud row is a mirror that lets the learner switch phones without losing anything.
import { CONFIG } from './config.js';
import * as store from './store.js';
import { esc } from './util.js';

let sb = null;
let user = null;
let timer = null;
let status = 'off'; // off | ok | pending | error

export const enabled = () => !!(CONFIG.supabaseUrl && CONFIG.supabaseKey);
export const currentUser = () => user;
export const syncStatus = () => status;

function loadLibrary() {
  if (window.supabase) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/supabase.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function client() {
  if (sb) return sb;
  await loadLibrary();
  sb = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });
  return sb;
}

// Resolves with the signed-in user, or null when a login is needed.
export async function restore() {
  const c = await client();
  const { data } = await c.auth.getSession();
  user = data.session?.user || null;
  return user;
}

export async function signIn(email, password) {
  const c = await client();
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  user = data.user;
  return user;
}

export async function signOut() {
  const c = await client();
  await c.auth.signOut();
  user = null;
}

export async function pull() {
  if (!user) return false;
  try {
    const c = await client();
    const { data, error } = await c.from('progress').select('state').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    const changed = data ? store.merge(data.state) : false;
    status = 'ok';
    push(); // the cloud gets anything this device had that it did not
    return changed;
  } catch (e) {
    status = 'error';
    return false;
  }
}

async function push() {
  if (!user) return;
  try {
    const c = await client();
    const { error } = await c.from('progress').upsert({ user_id: user.id, state: store.db(), updated_at: new Date().toISOString() });
    if (error) throw error;
    status = 'ok';
  } catch (e) {
    status = 'error';
  }
}

// ----- tasks: submissions to the teacher and feedback -----

const ext = (blob) => (blob.type.includes('mp4') || blob.type.includes('aac') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm');

export async function submitTask({ theme, mode, notes, blob }) {
  const c = await client();
  let audio_path = null;
  if (blob) {
    audio_path = `${user.id}/${theme}/${Date.now()}.${ext(blob)}`;
    const up = await c.storage.from('tasks').upload(audio_path, blob, { contentType: blob.type || 'audio/webm' });
    if (up.error) throw up.error;
  }
  const { error } = await c.from('task_submissions').insert({ theme, mode, notes, audio_path });
  if (error) throw error;
}

export async function mySubmissions(theme) {
  if (!user) return [];
  const c = await client();
  const { data, error } = await c.from('task_submissions').select('*').eq('user_id', user.id).eq('theme', theme).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function unseenFeedback() {
  if (!user) return [];
  const c = await client();
  const { data } = await c.from('task_submissions').select('id, theme').eq('user_id', user.id).not('feedback_at', 'is', null).is('seen_at', null);
  return data || [];
}

export async function markSeen(ids) {
  if (!ids.length) return;
  const c = await client();
  await c.from('task_submissions').update({ seen_at: new Date().toISOString() }).in('id', ids);
}

export async function audioUrl(path) {
  const c = await client();
  const { data, error } = await c.storage.from('tasks').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function isTeacher() {
  if (!user) return false;
  const c = await client();
  const { data } = await c.rpc('is_teacher');
  return data === true;
}

export async function allSubmissions() {
  const c = await client();
  const { data, error } = await c.from('task_submissions').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  return data;
}

export async function saveFeedback(row, text, blob) {
  const c = await client();
  let feedback_audio_path = row.feedback_audio_path;
  if (blob) {
    feedback_audio_path = `${row.user_id}/${row.theme}/feedback-${row.id}-${Date.now()}.${ext(blob)}`;
    const up = await c.storage.from('tasks').upload(feedback_audio_path, blob, { contentType: blob.type || 'audio/webm' });
    if (up.error) throw up.error;
  }
  const { error } = await c.from('task_submissions')
    .update({ feedback_text: text || null, feedback_audio_path, feedback_at: new Date().toISOString(), seen_at: null })
    .eq('id', row.id);
  if (error) throw error;
}

export function start() {
  store.onChange(() => {
    if (!user) return;
    status = 'pending';
    clearTimeout(timer);
    timer = setTimeout(push, 2000);
  });
  window.addEventListener('online', () => user && push());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && user && status === 'pending') push(); });
}

export function loginScreen(view, onDone) {
  view.innerHTML = `
    <div class="session end login">
      <p class="eyebrow">Nederlands</p>
      <h1>Goeiedag!</h1>
      <p class="lead">Connectez-vous pour retrouver votre parcours. Votre compte a été créé pour vous — demandez le mot de passe à Stan si besoin.</p>
      <form id="login" class="typed">
        <input id="email" type="email" autocomplete="username" placeholder="Adresse e-mail" required>
        <input id="pw" type="password" autocomplete="current-password" placeholder="Mot de passe" required>
        <button class="btn primary wide">Se connecter</button>
        <p id="err" class="small ko" hidden></p>
      </form>
    </div>`;
  document.getElementById('login').onsubmit = async (e) => {
    e.preventDefault();
    const err = document.getElementById('err');
    err.hidden = true;
    try {
      await signIn(document.getElementById('email').value.trim(), document.getElementById('pw').value);
      await pull();
      onDone();
    } catch (x) {
      err.hidden = false;
      err.textContent = navigator.onLine ? 'Adresse ou mot de passe incorrect.' : 'Pas de connexion internet.';
      console.error(esc(x.message));
    }
  };
}
