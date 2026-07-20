import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// PWA: register the offline-capable service worker in production builds.
// public/sw.js only ever handles same-origin GET requests, so API calls to
// Supabase/Gemini are never intercepted (the cause of the old "405" bug).
// In dev, keep unregistering any lingering workers so local changes are
// never served from a stale cache.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error) => console.warn('Service worker registration failed:', error));
    });
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      })
      .catch((error) => {
        // Ignore errors if document is in invalid state or SW access is restricted
        console.warn('Service worker cleanup skipped:', error);
      });
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
