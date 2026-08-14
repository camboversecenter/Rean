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

    expect(hrefs).toContain('https://num.edu.kh/');
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

  it('shows the team with photos where available and initials otherwise', () => {
    renderAbout();

    expect(screen.getByText(/Meet the team/)).toBeDefined();
    // All ten members from about-us.md on main.
    for (const name of [
      'Van sopha',
      'Phorn sreytey',
      'Tie Porching',
      'Khorn Aliza',
      'Hong hana',
      'Soeun Chanliza',
      'MCheat Mouyyean',
      'Eng leakhena',
      'Soeun somera',
      'Chiv chan seyha',
    ]) {
      expect(screen.getByText(name)).toBeDefined();
    }

    // Eight members have photos wired up; the remaining two show initials.
    expect(screen.getByAltText('Van sopha')).toBeDefined();
    expect(screen.getByAltText('Tie Porching')).toBeDefined();
    // Soeun Chanliza and Soeun somera have no local photo yet.
    expect(screen.getByText('SC')).toBeDefined();
    expect(screen.getByText('SS')).toBeDefined();

    // Placeholder rows from about-us.md must never reach the public site.
    expect(screen.queryByText(/Member \d+ Name/)).toBeNull();
    expect(screen.queryByText('Role / Title')).toBeNull();
  });

  it('never renders a placeholder LinkedIn URL as a live link', () => {
    renderAbout();

    const hrefs = hrefsOf(screen.getAllByRole('link') as HTMLElement[]);
    // about-us.md still carries linkedin.com/in/username for six members. A
    // dead profile link is worse than no link at all.
    expect(hrefs.some((h) => h?.includes('/in/username'))).toBe(false);
    // Every LinkedIn link that does render must be absolute, or the browser
    // resolves it against this site instead of linkedin.com.
    for (const h of hrefs.filter((x) => x?.includes('linkedin.com'))) {
      expect(h?.startsWith('https://')).toBe(true);
    }
  });

  it('renders the team section before the partners section', () => {
    const { container } = renderAbout();

    const text = container.textContent || '';
    expect(text.indexOf('Meet the team')).toBeGreaterThan(-1);
    expect(text.indexOf('Meet the team')).toBeLessThan(text.indexOf('Partners and supporters'));
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
