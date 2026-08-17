// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const uploadMock = vi.fn(async (..._args: any[]): Promise<any> => ({ error: null }));
const getPublicUrlMock = vi.fn((path: string) => ({
  data: { publicUrl: `https://cdn.test/storage/v1/object/public/Rean/${path}` },
}));

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    storage: {
      from: () => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }),
    },
  },
  SUPABASE_URL: 'http://localhost',
  STORAGE_BUCKET: 'Rean',
}));

const optimizeImageMock = vi.fn(async (..._args: any[]): Promise<any> => _args[0]);
vi.mock('../services/imageOptimizer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/imageOptimizer')>();
  return { ...actual, optimizeImage: (...args: any[]) => optimizeImageMock(...args) };
});

import { uploadFile } from '../services/storageService';

const fileOf = (type: string, name: string) => new File([new Uint8Array(1024)], name, { type });

beforeEach(() => {
  uploadMock.mockClear();
  getPublicUrlMock.mockClear();
  optimizeImageMock.mockReset();
  optimizeImageMock.mockImplementation(async (input: any) => input);
});

describe('uploadFile', () => {
  it('shrinks the image before it goes over the wire', async () => {
    const original = fileOf('image/jpeg', 'photo.jpg');
    const optimized = new File([new Uint8Array(64)], 'photo.webp', { type: 'image/webp' });
    optimizeImageMock.mockResolvedValue(optimized);

    await uploadFile(original, 'missions');

    expect(optimizeImageMock).toHaveBeenCalledWith(original, expect.anything());
    // The smaller version is what is stored, not the original.
    expect(uploadMock.mock.calls[0][1]).toBe(optimized);
  });

  it('names the object after the format it ended up in', async () => {
    optimizeImageMock.mockResolvedValue(
      new File([new Uint8Array(64)], 'photo.webp', { type: 'image/webp' })
    );

    const url = await uploadFile(fileOf('image/png', 'photo.png'), 'missions');

    // A .png name on WebP bytes makes storage serve the wrong content type.
    const [path, , options] = uploadMock.mock.calls[0];
    expect(path).toMatch(/^missions\/[a-z0-9]+\.webp$/);
    expect(options).toEqual({ contentType: 'image/webp' });
    expect(url).toContain('.webp');
  });

  it('applies the folder preset, so avatars are not stored at poster size', async () => {
    await uploadFile(fileOf('image/jpeg', 'me.jpg'), 'avatars');

    expect(optimizeImageMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ maxDimension: 512 })
    );
  });

  it('keeps more detail for images that have to stay readable', async () => {
    await uploadFile(fileOf('image/png', 'khqr.png'), 'mission-qrs');

    // A QR that will not scan is worse than a QR that is a few KB larger.
    expect(optimizeImageMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quality: 0.92 })
    );
  });

  it('lets a caller override or skip optimisation', async () => {
    await uploadFile(fileOf('image/jpeg', 'a.jpg'), 'missions', {
      optimize: { maxDimension: 320 },
    });
    expect(optimizeImageMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ maxDimension: 320 })
    );

    const untouched = fileOf('image/jpeg', 'b.jpg');
    optimizeImageMock.mockClear();
    await uploadFile(untouched, 'missions', { optimize: false });

    expect(optimizeImageMock).not.toHaveBeenCalled();
    expect(uploadMock.mock.calls[1][1]).toBe(untouched);
  });

  it('uploads blobs from AI generated images too', async () => {
    // AI art arrives as base64 converted to a bare Blob, with no filename.
    const blob = new Blob([new Uint8Array(2048)], { type: 'image/png' });
    optimizeImageMock.mockResolvedValue(new Blob([new Uint8Array(128)], { type: 'image/webp' }));

    await uploadFile(blob, 'course-covers');

    expect(optimizeImageMock).toHaveBeenCalled();
    expect(uploadMock.mock.calls[0][0]).toMatch(/^course-covers\/[a-z0-9]+\.webp$/);
  });

  it('returns null instead of throwing when storage rejects the upload', async () => {
    uploadMock.mockResolvedValueOnce({ error: new Error('bucket full') });

    expect(await uploadFile(fileOf('image/jpeg', 'a.jpg'), 'missions')).toBeNull();
  });
});
