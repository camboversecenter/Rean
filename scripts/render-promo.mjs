/**
 * Renders scripts/promo-open-source.html to public/promo/rean-open-source-km.png.
 *
 *   npx -p playwright node scripts/render-promo.mjs
 *
 * Playwright is not a dependency of this project - it is only needed when
 * regenerating the promo card, so it is borrowed for the run rather than
 * installed for everyone. If you already have it (globally, or in the repo),
 * plain `node scripts/render-promo.mjs` works.
 *
 * The card is designed at 1200x630, the ratio Facebook uses for a shared link
 * and a landscape feed image, and captured at 2x so it stays sharp on the
 * high-density phone screens most people will see it on.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const WIDTH = 1200;
const HEIGHT = 630;
const SCALE = 2;

const SOURCE = resolve('scripts/promo-open-source.html');
const OUTPUT = resolve('public/promo/rean-open-source-km.png');

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
  const page = await browser.newPage({
    // Deliberately taller than the card. Headless Chromium drops the bottom of
    // the page from the raster when the document is exactly as tall as the
    // viewport - the footer measures correctly in the DOM but comes out blank
    // in the PNG. Rendering with slack and clipping avoids that entirely.
    viewport: { width: WIDTH, height: HEIGHT + 300 },
    deviceScaleFactor: SCALE,
  });

  await page.goto(pathToFileURL(SOURCE).href, { waitUntil: 'load' });

  // Khmer without Kantumruy Pro falls back to a font with no Khmer shaping, so
  // every cluster breaks apart. Wait for the real thing before capturing.
  await page.evaluate(() => document.fonts.ready);

  await page.screenshot({
    path: OUTPUT,
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
  });

  console.log(`Wrote ${OUTPUT} at ${WIDTH * SCALE}x${HEIGHT * SCALE}`);
} finally {
  await browser.close();
}
