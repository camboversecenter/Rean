// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import ThemeProvider, {
  useTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
} from '../components/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';

const Probe = () => {
  const { theme } = useTheme();
  return <span data-testid="theme">{theme}</span>;
};

const renderWithProvider = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
      <Probe />
    </ThemeProvider>
  );

const isDarkOnHtml = () => document.documentElement.classList.contains('dark');

describe('theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });
  afterEach(cleanup);

  it('defaults to light, so a phone set to dark still gets the light UI', () => {
    renderWithProvider();

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(isDarkOnHtml()).toBe(false);
  });

  it('restores a saved dark preference', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    renderWithProvider();

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(isDarkOnHtml()).toBe(true);
  });

  it('toggles both ways and persists the choice', () => {
    renderWithProvider();
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(isDarkOnHtml()).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    fireEvent.click(button);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(isDarkOnHtml()).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('labels the button with what pressing it will do', () => {
    renderWithProvider();

    expect(screen.getByRole('button').getAttribute('aria-label')).toMatch(/Switch to dark mode/);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button').getAttribute('aria-label')).toMatch(/Switch to light mode/);
  });

  it('falls back to light when the stored value is junk', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'solarized');
    expect(readStoredTheme()).toBe('light');
  });

  it('does not crash when localStorage is unavailable', () => {
    const original = window.localStorage.getItem;
    // Safari in private mode throws rather than returning null.
    window.localStorage.getItem = () => {
      throw new Error('denied');
    };

    expect(readStoredTheme()).toBe('light');

    window.localStorage.getItem = original;
  });
});
