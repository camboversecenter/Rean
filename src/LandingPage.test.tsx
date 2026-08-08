// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

describe('LandingPage', () => {
  it('renders the hero, features, and call-to-action links', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Learn by doing.')).toBeDefined();
    expect(screen.getByText('គ្រូ AI (Kru Rean)')).toBeDefined();

    const loginLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/login');
    expect(loginLinks.length).toBeGreaterThan(0);

    const exploreLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/explore');
    expect(exploreLinks.length).toBeGreaterThan(0);

    // About must be reachable straight from the front page, not only the footer.
    const aboutLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/about');
    expect(aboutLinks.length).toBeGreaterThan(0);
  });
});
