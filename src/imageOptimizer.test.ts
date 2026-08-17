// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  optimizeImage,
  fitWithin,
  isOptimizableType,
  extensionForType,
  SKIP_UNDER_BYTES,
} from '../services/imageOptimizer';

/** A blob of an exact byte size, so size comparisons in the tests are real. */
const blobOf = (bytes: number, type: string) => new Blob([new Uint8Array(bytes)], { type });

const fileOf = (bytes: number, type: string, name: string) =>
  new File([new Uint8Array(bytes)], name, { type });

const BIG = SKIP_UNDER_BYTES * 10;

// Canvas encoding results, keyed by requested type. jsdom has no real canvas,
// so the tests drive the encoder instead of pixels.
let encodeResults: Record<string, Blob | null>;
let lastCanvas: { width: number; height: number } | null;
let drawnSize: { width: number; height: number } | null;

class FakeOffscreenCanvas {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    lastCanvas = { width, height };
  }

  getContext() {
    return {
      drawImage: (_source: unknown, _x: number, _y: number, width: number, height: number) => {
        drawnSize = { width, height };
      },
    };
  }

  async convertToBlob({ type }: { type: string; quality?: number }) {
    const result = encodeResults[type];
    if (!result) throw new Error(`cannot encode ${type}`);
    return result;
  }
}

const stubDecode = (width: number, height: number) =>
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width, height, close: vi.fn() }))
  );

beforeEach(() => {
  encodeResults = {};
  lastCanvas = null;
  drawnSize = null;
  vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
  stubDecode(4000, 3000);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fitWithin', () => {
  it('scales the longest edge down and keeps the aspect ratio', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('never upscales a small image', () => {
    // Enlarging adds bytes without adding detail.
    expect(fitWithin(320, 240, 1600)).toEqual({ width: 320, height: 240 });
  });

  it('keeps at least one pixel on extreme aspect ratios', () => {
    expect(fitWithin(10000, 3, 1600)).toEqual({ width: 1600, height: 1 });
  });
});

describe('type helpers', () => {
  it('skips formats a canvas would damage', () => {
    // A canvas keeps only the first frame of a GIF, and rasterising an SVG
    // makes it bigger, not smaller.
    expect(isOptimizableType('image/gif')).toBe(false);
    expect(isOptimizableType('image/svg+xml')).toBe(false);
    expect(isOptimizableType('application/pdf')).toBe(false);
    expect(isOptimizableType(undefined)).toBe(false);

    expect(isOptimizableType('image/jpeg')).toBe(true);
    expect(isOptimizableType('image/png')).toBe(true);
    expect(isOptimizableType('image/heic')).toBe(true);
  });

  it('maps mime types to the extension storage should serve', () => {
    expect(extensionForType('image/webp')).toBe('webp');
    expect(extensionForType('image/jpeg')).toBe('jpg');
    expect(extensionForType('video/mp4')).toBeNull();
  });
});

describe('optimizeImage', () => {
  it('resizes to the limit and re-encodes as webp', async () => {
    encodeResults['image/webp'] = blobOf(40_000, 'image/webp');

    const original = blobOf(BIG, 'image/jpeg');
    const result = await optimizeImage(original, { maxDimension: 1600 });

    expect(result.type).toBe('image/webp');
    expect(result.size).toBe(40_000);
    expect(lastCanvas).toEqual({ width: 1600, height: 1200 });
    expect(drawnSize).toEqual({ width: 1600, height: 1200 });
  });

  it('honours a smaller limit for things like avatars', async () => {
    encodeResults['image/webp'] = blobOf(9_000, 'image/webp');

    await optimizeImage(blobOf(BIG, 'image/png'), { maxDimension: 512 });

    expect(lastCanvas).toEqual({ width: 512, height: 384 });
  });

  it('falls back to jpeg when the browser cannot encode webp', async () => {
    // Some browsers ignore the requested type and hand back their default.
    encodeResults['image/webp'] = blobOf(50_000, 'image/png');
    encodeResults['image/jpeg'] = blobOf(60_000, 'image/jpeg');

    const result = await optimizeImage(blobOf(BIG, 'image/jpeg'));

    expect(result.type).toBe('image/jpeg');
  });

  it('keeps png rather than jpeg on the fallback path, so transparency survives', async () => {
    encodeResults['image/webp'] = blobOf(50_000, 'image/png');
    encodeResults['image/png'] = blobOf(60_000, 'image/png');

    const result = await optimizeImage(blobOf(BIG, 'image/png'));

    expect(result.type).toBe('image/png');
    expect(result.size).toBe(60_000);
  });

  it('uploads the original when re-encoding would not be smaller', async () => {
    const original = blobOf(BIG, 'image/jpeg');
    encodeResults['image/webp'] = blobOf(BIG + 1, 'image/webp');

    // Optimisation can only ever help; it never makes an upload heavier.
    expect(await optimizeImage(original)).toBe(original);
  });

  it('leaves animations and vectors alone', async () => {
    const gif = blobOf(BIG, 'image/gif');
    const svg = blobOf(BIG, 'image/svg+xml');

    expect(await optimizeImage(gif)).toBe(gif);
    expect(await optimizeImage(svg)).toBe(svg);
  });

  it('does not spend cpu on files that are already small', async () => {
    const small = blobOf(SKIP_UNDER_BYTES, 'image/jpeg');

    expect(await optimizeImage(small)).toBe(small);
    expect(lastCanvas).toBeNull();
  });

  it('uploads the original when the image cannot be decoded', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => {
        throw new Error('unsupported format');
      })
    );
    const original = blobOf(BIG, 'image/heic');

    // A failed shrink must never become a failed upload.
    expect(await optimizeImage(original)).toBe(original);
  });

  it('uploads the original when the encoder throws', async () => {
    const original = blobOf(BIG, 'image/jpeg');

    // No encodeResults registered, so every convertToBlob call rejects.
    expect(await optimizeImage(original)).toBe(original);
  });

  it('renames the file to match its new format', async () => {
    encodeResults['image/webp'] = blobOf(40_000, 'image/webp');

    const result = await optimizeImage(fileOf(BIG, 'image/jpeg', 'homework photo.JPG'));

    expect(result).toBeInstanceOf(File);
    expect((result as File).name).toBe('homework photo.webp');
  });
});
