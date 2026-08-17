/**
 * Shrinks images in the browser before they are uploaded.
 *
 * Everything users put into REAN arrives at full size: a phone camera photo of
 * handwritten homework is 3-6 MB, and an AI generated cover is a full size PNG.
 * Uploading those wastes the student's mobile data, fills the storage bucket,
 * and makes every screen that shows the image slow to load over a Cambodian
 * mobile connection.
 *
 * Resizing to a sane maximum and re-encoding to WebP typically cuts that by
 * 85-95% with no visible difference at the sizes the app actually displays.
 *
 * Every step degrades gracefully: if the browser cannot decode or encode the
 * image, the original is uploaded unchanged. Shrinking is an optimisation, so
 * it must never be the reason an upload fails.
 */

export interface ImageOptimizeOptions {
  /** Longest edge, in pixels. Larger images are scaled down proportionally. */
  maxDimension?: number;
  /** Encoder quality, 0-1. Only applies to lossy formats. */
  quality?: number;
}

export const DEFAULT_OPTIMIZE_OPTIONS: Required<ImageOptimizeOptions> = {
  maxDimension: 1600,
  quality: 0.82,
};

/**
 * Below this, re-encoding is not worth the CPU: the file is already cheap to
 * upload and to fetch. Bytes are what we are optimising for, so bytes are the
 * right thing to threshold on.
 */
export const SKIP_UNDER_BYTES = 50 * 1024;

/**
 * Formats worth re-encoding.
 *
 * GIF is excluded because a canvas only captures the first frame, which would
 * silently destroy an animation. SVG is excluded because it is vector (already
 * tiny, and rasterising it makes it larger). Anything the browser cannot decode
 * falls back to the original anyway.
 */
const OPTIMIZABLE_TYPES = /^image\/(jpeg|jpg|png|webp|bmp|tiff?|avif|heic|heif)$/i;

const EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
};

/** File extension matching a MIME type, so the stored object is named honestly. */
export const extensionForType = (type: string): string | null =>
  EXTENSIONS[type?.toLowerCase()] ?? null;

export const isOptimizableType = (type: string | undefined): boolean =>
  Boolean(type && OPTIMIZABLE_TYPES.test(type));

/**
 * Scales (width, height) to fit inside a square of maxDimension, preserving
 * aspect ratio. Images already smaller are returned untouched - upscaling would
 * add bytes without adding detail.
 */
export const fitWithin = (
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } => {
  const longest = Math.max(width, height);
  if (longest <= maxDimension || longest === 0) return { width, height };

  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

const decode = async (blob: Blob): Promise<Decoded> => {
  if (typeof createImageBitmap === 'function') {
    try {
      // from-image applies the EXIF rotation phone cameras rely on. Without it
      // a portrait photo is drawn on its side.
      const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close?.(),
      };
    } catch {
      // Older Safari rejects the options argument; retry without it.
      const bitmap = await createImageBitmap(blob);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close?.(),
      };
    }
  }

  // Fallback path: <img> applies EXIF orientation on its own when drawn.
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image could not be decoded'));
      el.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
};

const encode = async (
  canvas: OffscreenCanvas | HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> => {
  if ('convertToBlob' in canvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
};

const createCanvas = (width: number, height: number): OffscreenCanvas | HTMLCanvasElement => {
  if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(width, height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Returns a smaller version of the image, or the original when shrinking is
 * impossible, unnecessary, or would not actually save anything.
 *
 * Accepts anything upload paths produce: a picked File, or a Blob built from
 * the base64 an AI image generator returns.
 */
export const optimizeImage = async (
  input: File | Blob,
  options: ImageOptimizeOptions = {}
): Promise<File | Blob> => {
  const { maxDimension, quality } = { ...DEFAULT_OPTIMIZE_OPTIONS, ...options };

  if (!isOptimizableType(input.type)) return input;
  if (input.size <= SKIP_UNDER_BYTES) return input;

  let decoded: Decoded | null = null;
  try {
    decoded = await decode(input);
    const { width, height } = fitWithin(decoded.width, decoded.height, maxDimension);

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d') as
      CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!context) return input;

    context.drawImage(decoded.source, 0, 0, width, height);

    // WebP is 25-35% smaller than JPEG at the same quality and, unlike JPEG,
    // keeps transparency - so logos and QR codes survive it.
    let output = await encode(canvas, 'image/webp', quality);

    if (!output || output.type !== 'image/webp') {
      // Browser cannot encode WebP. PNG sources may have transparency worth
      // keeping; everything else is cheaper as JPEG.
      const fallbackType = input.type === 'image/png' ? 'image/png' : 'image/jpeg';
      output = await encode(canvas, fallbackType, quality);
    }

    // Re-encoding small or already-compressed images can make them bigger.
    // Keeping whichever is smaller means this can only ever help.
    if (!output || output.size >= input.size) return input;

    return toNamedFile(input, output);
  } catch (error) {
    console.warn('Image optimisation skipped, uploading the original:', error);
    return input;
  } finally {
    decoded?.release();
  }
};

/** Keeps the original filename (minus its extension) so uploads stay traceable. */
const toNamedFile = (input: File | Blob, output: Blob): File | Blob => {
  if (typeof File !== 'function' || !(input instanceof File)) return output;

  const extension = extensionForType(output.type) ?? 'webp';
  const base = input.name.replace(/\.[^./\\]+$/, '') || 'image';
  return new File([output], `${base}.${extension}`, {
    type: output.type,
    lastModified: input.lastModified,
  });
};
