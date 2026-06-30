import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// SAFETY: Unregister any existing service workers that might be intercepting API calls
// This fixes the "Status: 405" error caused by stale service workers from previous deployments
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(function (registrations) {
      for (let registration of registrations) {
        console.log('Unregistering service worker:', registration);
        registration.unregister();
      }
    })
    .catch((error) => {
      // Ignore errors if document is in invalid state or SW access is restricted
      console.warn('Service worker cleanup skipped:', error);
    });
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
