import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ThemeProvider from './components/ThemeProvider';
import './index.css';
// Bundled rather than pulled from a CDN. Without this stylesheet every formula
// renders as unstyled fragments, and students on a slow or filtered connection
// were the ones most likely to see that.
import 'katex/dist/katex.min.css';
import { registerServiceWorker } from './services/registerServiceWorker';

// Installs the PWA service worker. It only caches the app shell and static
// assets, and never touches API calls; see public/sw.js and the note in
// services/registerServiceWorker.ts about the old 405 bug this avoids.
registerServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
