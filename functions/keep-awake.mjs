// Keeps the course database awake. Supabase's free plan pauses a project after seven days without
// activity, and a paused project refuses every sign-in. Any request counts as activity, so Netlify
// runs this once a day (same pattern as the EPSO course). It uses only the publishable key, which
// every visitor's browser already carries; row-level security makes the query come back empty.
// Check it with:  netlify logs:function keep-awake

const SUPABASE_URL = 'https://rjkckukuepufkoxucjra.supabase.co';
const PUBLISHABLE = 'sb_publishable__iy46T0tg-3EEuVgF1fClg_i8JXbs8J';

export default async () => {
  const results = [];
  const ping = async (label, url, headers) => {
    try {
      const started = Date.now();
      const res = await fetch(url, { headers });
      results.push(`${label}: ${res.status} in ${Date.now() - started}ms`);
      return res.ok;
    } catch (err) {
      results.push(`${label}: failed — ${err.message}`);
      return false;
    }
  };
  const authOk = await ping('auth', `${SUPABASE_URL}/auth/v1/health`, { apikey: PUBLISHABLE });
  const dbOk = await ping('rest', `${SUPABASE_URL}/rest/v1/progress?select=user_id&limit=1`, { apikey: PUBLISHABLE });
  const ok = authOk && dbOk;
  console.log(`keep-awake ${ok ? 'OK' : 'PROBLEM'} — ${results.join(' | ')}`);
  return new Response(JSON.stringify({ ok, results }, null, 2), { status: ok ? 200 : 503, headers: { 'Content-Type': 'application/json' } });
};

export const config = { schedule: '@daily' };
