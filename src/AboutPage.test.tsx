// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import Footer from '../components/Footer';
import { TELEGRAM_COMMUNITY_URL } from '../constants';

const renderAbout = () =>
  render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>
  );

const hrefsOf = (nodes: HTMLElement[]) => nodes.map((n) => n.getAttribute('href'));

/** The ten members listed in about-us.md. */
const TEAM_NAMES = [
  'Van sopha',
  'Phorn sreytey',
  'Tie Porching',
  'Khorn Aliza',
  'Hong hana',
  'Soeun Chanliza',
  'Cheat Mouyyean',
  'Eng leakhena',
  'Soeun somera',
  'Chiv chan seyha',
];

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

  it('shows every team member with their own committed portrait', () => {
    renderAbout();

    expect(screen.getByText(/Meet the team/)).toBeDefined();
    for (const name of TEAM_NAMES) {
      expect(screen.getByText(name)).toBeDefined();
    }

    // Every member has a committed portrait, so nobody should fall back to
    // initials. This deliberately does not pin a name to a specific file:
    // three pairings are still unconfirmed and the team corrects them by hand,
    // which must not break the build.
    const photoSrcs = TEAM_NAMES.map((name) => {
      const img = screen.getByAltText(name);
      const src = img.getAttribute('src') || '';
      expect(src.startsWith('/team/')).toBe(true);
      return src;
    });

    // Two members sharing one file means an edit went wrong: somebody is now
    // wearing someone else's face and somebody else has no portrait at all.
    expect(new Set(photoSrcs).size).toBe(TEAM_NAMES.length);

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

  it('gives visitors a way to contact the team', () => {
    renderAbout();

    expect(screen.getByText(/Contact and support/)).toBeDefined();

    const hrefs = hrefsOf(screen.getAllByRole('link') as HTMLElement[]);
    // Telegram is the channel students actually use, and the only one that
    // does not require a GitHub account.
    expect(hrefs).toContain(TELEGRAM_COMMUNITY_URL);
    expect(hrefs).toContain('https://github.com/camboversecenter/Rean/issues/new/choose');
    // Security reports must have a private route, never a public issue.
    expect(hrefs).toContain('https://github.com/camboversecenter/Rean/security/advisories/new');
  });

  it('keeps the support link reachable from the footer on every page', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const hrefs = hrefsOf(screen.getAllByRole('link') as HTMLElement[]);
    // Before this existed the invite lived only on the sign-in screen, so a
    // logged-in student had no way to find help.
    expect(hrefs).toContain(TELEGRAM_COMMUNITY_URL);
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
