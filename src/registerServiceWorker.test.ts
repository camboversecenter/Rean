// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { registerServiceWorker } from '../services/registerServiceWorker';

describe('registerServiceWorker', () => {
  const originalSecure = Object.getOwnPropertyDescriptor(window, 'isSecureContext');

  const setSecure = (value: boolean) =>
    Object.defineProperty(window, 'isSecureContext', { value, configurable: true });

  beforeEach(() => {
    setSecure(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (navigator as any).serviceWorker;
    if (originalSecure) Object.defineProperty(window, 'isSecureContext', originalSecure);
  });

  it('registers /sw.js on window load when supported and secure', () => {
    const register = vi.fn().mockResolvedValue({});
    (navigator as any).serviceWorker = { register };

    registerServiceWorker();
    // Registration is deferred to load, so nothing should have happened yet.
    expect(register).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));
    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('does nothing when the browser has no service worker support', () => {
    // No navigator.serviceWorker defined.
    expect(() => {
      registerServiceWorker();
      window.dispatchEvent(new Event('load'));
    }).not.toThrow();
  });

  it('does not register on an insecure origin', () => {
    const register = vi.fn().mockResolvedValue({});
    (navigator as any).serviceWorker = { register };
    setSecure(false);

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));

    expect(register).not.toHaveBeenCalled();
  });

  it('never throws if registration rejects', () => {
    const register = vi.fn().mockRejectedValue(new Error('boom'));
    (navigator as any).serviceWorker = { register };

    expect(() => {
      registerServiceWorker();
      window.dispatchEvent(new Event('load'));
    }).not.toThrow();
  });
});
