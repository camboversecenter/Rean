import React from 'react';
import { Sun, Moon } from './Icons';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  /** `full` shows a label beside the icon, for the mobile drawer. */
  variant?: 'icon' | 'full';
  className?: string;
}

/**
 * Switches between the light and dark themes. The icon shows what you will get
 * by pressing it, not the state you are in, which is what people expect from a
 * single-button switch.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const goingDark = theme === 'light';
  const label = goingDark
    ? 'ប្តូរទៅផ្ទាំងងងឹត (Switch to dark mode)'
    : 'ប្តូរទៅផ្ទាំងភ្លឺ (Switch to light mode)';
  const Icon = goingDark ? Moon : Sun;

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-content-soft hover:bg-surface-3 transition-colors ${className}`}
      >
        <Icon className="h-5 w-5 text-content-muted" aria-hidden="true" />
        <span className="font-medium">
          {goingDark ? 'ផ្ទាំងងងឹត (Dark)' : 'ផ្ទាំងភ្លឺ (Light)'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`p-2 rounded-full text-content-muted hover:text-content hover:bg-surface-3 transition-colors ${className}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggle;
