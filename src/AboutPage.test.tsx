// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import CommunityLicensePage from '../pages/CommunityLicensePage';

const renderAbout = () =>
  render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>
  );

const hrefsOf = (nodes: HTMLElement[]) => nodes.map((n) => n.getAttribute('href'));

describe('AboutPage', () => {
  afterEach(cleanup);

  it('describes the project the same way the README does', () => {
    renderAbout();

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText(/About REAN/)).toBeDefined();
    expect(screen.getByText(/means "to learn" in Khmer/)).toBeDefined();
    expect(screen.getByText(/free for everyone in Cambodia/)).toBeDefined();
    // Sustainability model, straight from the README. It appears in both the
    // mission statement and the closing call to action.
    expect(screen.getAllByText(/donations, grants, and training/).length).toBeGreaterThan(0);
  });

  it('states the licensing exactly as the repository does', () => {
    renderAbout();

    expect(screen.getByText(/Apache License 2.0/)).toBeDefined();
    expect(screen.getByText(/Creative Commons Attribution-ShareAlike 4.0/)).toBeDefined();
    // The trademark carve-out must be present, since Apache-2.0 does not cover it.
    expect(screen.getByText(/trademarks and are/)).toBeDefined();
    expect(screen.getByText(/Forks must use a different name/)).toBeDefined();
  });

  it('links every partner to its official site', () => {
    renderAbout();

    const links = screen.getAllByRole('link') as HTMLElement[];
    const hrefs = hrefsOf(links);

    expect(hrefs).toContain('https://numuniversity.com/');
    expect(hrefs).toContain('https://camboverse.world/');
    expect(hrefs).toContain('https://www.e-khmer.com/en');
    expect(hrefs).toContain('https://github.com/camboversecenter/Rean');
    expect(hrefs).toContain('https://rean.camboverse.world');
  });

  it('opens external links safely in a new tab', () => {
    renderAbout();

    const external = (screen.getAllByRole('link') as HTMLElement[]).filter((a) =>
      a.getAttribute('href')?.startsWith('http')
    );

    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link.getAttribute('target')).toBe('_blank');
      // Without noopener the new tab can reach back into this one.
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('points each partner at its committed logo asset', () => {
    renderAbout();

    expect(screen.getByAltText('National University of Management logo').getAttribute('src')).toBe(
      '/partners/num.webp'
    );
    expect(screen.getByAltText('CamboVerse Center logo').getAttribute('src')).toBe(
      '/partners/camboverse.png'
    );
    expect(screen.getByAltText('E-KHMER Technology Co., Ltd. logo').getAttribute('src')).toBe(
      '/partners/e-khmer.png'
    );
  });

  it('falls back to a lettermark if a partner logo fails to load', () => {
    renderAbout();

    const logo = screen.getByAltText('CamboVerse Center logo');

    // Simulate the asset not being deployed yet.
    fireEvent.error(logo);

    expect(screen.queryByAltText('CamboVerse Center logo')).toBeNull();
    expect(screen.getByText('CV')).toBeDefined();
  });
});

describe('CommunityLicensePage', () => {
  afterEach(cleanup);

  it('matches the repository licence instead of claiming the code is closed', () => {
    const { container } = render(
      <MemoryRouter>
        <CommunityLicensePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Open Source: Apache-2.0/)).toBeDefined();
    expect(screen.getByText(/source code is public under the Apache License 2.0/)).toBeDefined();

    // The old copy promised open sourcing only after a token sale and forbade
    // copying. Both contradict the Apache-2.0 licence now in the repository.
    const text = container.textContent || '';
    expect(text).not.toMatch(/Closed Source/i);
    expect(text).not.toMatch(/Token Sale/i);
    expect(text).not.toMatch(/Reverse Engineering/i);
    expect(text).not.toMatch(/proprietary/i);
  });

  it('keeps the trademark carve-out and the warranty disclaimer', () => {
    render(
      <MemoryRouter>
        <CommunityLicensePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/name and logo are trademarks/)).toBeDefined();
    expect(screen.getByText(/without warranty of any kind/)).toBeDefined();
  });

  it('credits the incubator', () => {
    const { container } = render(
      <MemoryRouter>
        <CommunityLicensePage />
      </MemoryRouter>
    );

    expect(within(container).getByText(/CamboVerse Center/)).toBeDefined();
    expect(within(container).getByText(/National University of Management/)).toBeDefined();
  });
});
