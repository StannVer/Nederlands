// Offline support: the app shell is cached on install; content and audio are cached as they are used
// and refreshed in the background, so new lessons appear on the next launch.
const VERSION = 'nl-v1.2.1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/fsrs.js', 'js/store.js', 'js/util.js', 'js/audio.js', 'js/exercises.js',
  'js/lesson.js', 'js/review.js', 'js/sync.js', 'js/config.js', 'js/extra.js', 'js/practice.js', 'js/teacher.js', 'js/goals.js', 'js/ui.js', 'fonts/Manrope-variable.ttf', 'fonts/Fraunces-variable.ttf',
  'vendor/supabase.js', 'content/pronunciation.json', 'content/stories.json', 'content/flemish.json',
  'content/themes/index.json', 'content/themes/kennismaken.json',
  'icons/icon-192.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first: online, the learner always gets the latest version; the cache is only the
// fallback when there is no connection. (Cache-first kept showing an old design after updates.)
// Audio and fonts never change, so those are served from the cache when present.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const path = new URL(e.request.url).pathname;
  const stable = /\/(audio|fonts|icons|vendor)\//.test(path);
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    if (stable && cached) return cached;
    try {
      const res = await fetch(e.request, { cache: 'no-cache' });
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      return cached || Response.error();
    }
  }));
});
