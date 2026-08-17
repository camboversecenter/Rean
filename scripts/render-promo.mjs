/**
 * Renders the promo artwork in scripts/ to PNGs in public/promo/.
 *
 *   npx -p playwright node scripts/render-promo.mjs           # everything
 *   npx -p playwright node scripts/render-promo.mjs poster    # just one
 *
 * Playwright is not a dependency of this project - it is only needed when
 * regenerating the artwork, so it is borrowed for the run rather than
 * installed for everyone. If you already have it (globally, or in the repo),
 * plain `node scripts/render-promo.mjs` works.
 *
 * Everything is captured at 2x so it stays sharp on the high-density phone
 * screens most people will see it on.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const SCALE = 2;

const ARTWORK = {
  // 1200x630 is the ratio Facebook uses for a shared link and a landscape
  // feed image.
  'open-source': {
    source: 'scripts/promo-open-source.html',
    output: 'public/promo/rean-open-source-km.png',
    width: 1200,
    height: 630,
  },
  // 2:3 portrait, the usual poster shape. Facebook crops portrait previews to
  // 4:5 in the feed; it opens in full when tapped.
  poster: {
    source: 'scripts/promo-pitch-poster.html',
    output: 'public/promo/rean-pitch-poster-km-en.png',
    width: 1080,
    height: 1620,
  },
};

const requested = process.argv.slice(2);
const unknown = requested.filter((name) => !ARTWORK[name]);
if (unknown.length) {
  console.error(`Unknown artwork: ${unknown.join(', ')}. Known: ${Object.keys(ARTWORK).join(', ')}`);
  process.exit(1);
}

const jobs = (requested.length ? requested : Object.keys(ARTWORK)).map((name) => ARTWORK[name]);

const require = createRequire(import.meta.url);

/** Local install, global install, or the copy npx put on NODE_PATH. */
const loadPlaywright = () => {
  for (const id of ['playwright', 'playwright-core']) {
    try {
      return require(id);
    } catch {
      /* try the next one */
    }
  }
  console.error(
    'Playwright is not available. Run:\n\n  npx -p playwright node scripts/render-promo.mjs\n'
  );
  process.exit(1);
};

const { chromium } = loadPlaywright();

mkdirSync(resolve('public/promo'), { recursive: true });

const browser = await chromium.launch({
  // Honour a preinstalled browser when there is one, so the run does not
  // depend on Playwright having downloaded its own.
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--no-sandbox'],
});

try {
  for (const { source, output, width, height } of jobs) {
    const page = await browser.newPage({
      // Deliberately taller than the artwork. Headless Chromium drops the
      // bottom of the page from the raster when the document is exactly as
      // tall as the viewport - the footer measures correctly in the DOM but
      // comes out blank in the PNG. Rendering with slack and clipping avoids
      // that entirely.
      viewport: { width, height: height + 300 },
      deviceScaleFactor: SCALE,
    });

    await page.goto(pathToFileURL(resolve(source)).href, { waitUntil: 'load' });

    // Khmer without Kantumruy Pro falls back to a font with no Khmer shaping,
    // so every cluster breaks apart. Wait for the real thing before capturing.
    await page.evaluate(() => document.fonts.ready);

    await page.screenshot({
      path: resolve(output),
      clip: { x: 0, y: 0, width, height },
    });

    await page.close();
    console.log(`Wrote ${output} at ${width * SCALE}x${height * SCALE}`);
  }
} finally {
  await browser.close();
}
