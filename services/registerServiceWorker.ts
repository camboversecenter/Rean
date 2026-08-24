/**
 * Registers the PWA service worker.
 *
 * This replaces an earlier block that *unregistered* all service workers to
 * escape a bad one that intercepted API calls (the "Status: 405" bug). The new
 * worker in public/sw.js is safe by construction: it only ever touches
 * same-origin GET requests, so it cannot interfere with the Supabase or Gemini
 * calls that broke before. See the header of public/sw.js.
 *
 * Registration is deferred to the window load event so it never competes with
 * the initial render for bandwidth on a slow connection, which is the norm for
 * much of REAN's audience.
 */
export const registerServiceWorker = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Guards are re-checked here, at fire time, rather than up front: both are
    // stable within a page load, and checking inside the handler keeps the
    // function safe to call more than once.
    if (!('serviceWorker' in navigator)) return;
    // Only register on a secure origin. localhost counts as secure; a plain
    // http preview does not, and calling register there would throw.
    if (!window.isSecureContext) return;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      // A failed registration must never break the app; the site works fine
      // without the worker, just without offline support.
      console.warn('Service worker registration failed:', error);
    });
  });
};

export default registerServiceWorker;
