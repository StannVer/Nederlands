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
