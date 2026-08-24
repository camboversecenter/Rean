/*
 * REAN service worker.
 *
 * Deliberately minimal and auditable. An earlier service worker on this project
 * intercepted API calls and caused "Status: 405" failures, so this one is built
 * so that it CANNOT touch anything dynamic:
 *
 *   - It only ever handles same-origin GET requests.
 *   - Every cross-origin request (Supabase, the Gemini edge function, Google
 *     Fonts) is left completely untouched: the fetch handler returns without
 *     calling respondWith, so the browser does exactly what it would with no
 *     service worker at all.
 *   - Every non-GET request (the POSTs that carry submissions, points, and AI
 *     calls) is likewise left untouched.
 *
 * Bump CACHE_VERSION to force old caches to be discarded on the next deploy.
 */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `rean-${CACHE_VERSION}`;

// The app shell. Hashed build assets under /assets/ are NOT listed here because
// their names change every build; they are cached at runtime on first request
// instead. Only stable, always-present paths belong in the precache.
const PRECACHE_URLS = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // addAll is atomic; if one file 404s nothing is cached. Precache each on
      // its own so a single missing file cannot break the whole install.
      .then((cache) => Promise.all(PRECACHE_URLS.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('rean-') && k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Allow the page to tell a waiting worker to take over immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only GET. Submissions, points, and AI calls are POST and must pass
  //    straight through to the network, exactly as if no SW existed.
  if (request.method !== 'GET') return;

  // 2. Only same origin. Supabase, the Gemini edge function, and Google Fonts
  //    are cross origin and are never touched.
  if (url.origin !== self.location.origin) return;

  // 3. Navigations: network first, so a fresh index.html (and thus the newest
  //    bundle) is used whenever the user is online; fall back to the cached
  //    shell only when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // 4. Static same-origin assets (hashed JS/CSS, icons, images): stale while
  //    revalidate. Serve the cached copy instantly, refresh it in the
  //    background. Hashed filenames make this safe: a new build requests new
  //    names, so a stale asset is never served for changed code.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
