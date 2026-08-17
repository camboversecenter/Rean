import { supabase, STORAGE_BUCKET } from './supabaseClient';
import { optimizeImage, extensionForType, ImageOptimizeOptions } from './imageOptimizer';

/**
 * How large an image is allowed to stay, per folder.
 *
 * The limit is the size the app actually displays the image at, doubled for
 * high-density screens. Anything beyond that is bytes the user pays to upload
 * and every viewer pays to download, for pixels nobody ever sees.
 */
const FOLDER_PRESETS: Record<string, ImageOptimizeOptions> = {
  // Shown at 40-128px, so even 512 is generous.
  avatars: { maxDimension: 512 },
  // Card and hero art.
  missions: { maxDimension: 1600 },
  'course-covers': { maxDimension: 1600 },
  'school-logos': { maxDimension: 800 },
  'school-covers': { maxDimension: 1600 },
  rewards: { maxDimension: 1200 },
  // Both are read rather than glanced at: a QR has to stay scannable and a
  // receipt has to stay legible enough to verify an amount, so they keep more
  // detail than decorative art does.
  'mission-qrs': { maxDimension: 1024, quality: 0.92 },
  'payment-receipts': { maxDimension: 1600, quality: 0.88 },
};

export interface UploadOptions {
  /**
   * Pass `false` to upload the bytes untouched, or an object to override the
   * folder's preset. Defaults to the preset for the folder.
   */
  optimize?: false | ImageOptimizeOptions;
}

/**
 * Uploads a file (Image or Audio) to the 'Rean' bucket.
 *
 * Images are shrunk first (see services/imageOptimizer.ts). Non-images and
 * anything the browser cannot re-encode are uploaded unchanged.
 *
 * @param file The file object (or Blob) to upload.
 * @param folder The folder path (e.g., 'posts', 'avatars').
 * @param options Optimisation overrides.
 */
export const uploadFile = async (
  file: File | Blob,
  folder: string = 'uploads',
  options: UploadOptions = {}
) => {
  try {
    const payload =
      options.optimize === false
        ? file
        : await optimizeImage(file, { ...FOLDER_PRESETS[folder], ...options.optimize });

    // Name the object after what it actually contains. Optimisation may have
    // changed the format (a .png re-encoded to WebP), and a mismatched
    // extension makes storage serve the wrong content type.
    const fileExt =
      extensionForType(payload.type) ||
      (payload instanceof File ? payload.name.split('.').pop() : null) ||
      'png';

    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, payload, payload.type ? { contentType: payload.type } : undefined);

    if (error) {
      throw error;
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Deletes a file from storage using its public URL.
 * Used to clean up old images before updating.
 */
export const deleteFileFromUrl = async (publicUrl: string) => {
  try {
    // Extract the path from the URL
    // URL format: .../storage/v1/object/public/Rean/folder/filename.ext
    const path = publicUrl.split(`${STORAGE_BUCKET}/`).pop();

    if (!path) return;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
    }
  } catch (error) {
    console.error('Error parsing url for delete:', error);
  }
};

/**
 * Lists files in a specific folder in the 'Rean' bucket.
 */
export const listFiles = async (folder: string) => {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(folder, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    console.error('Error listing files:', error);
    return [];
  }
  return data;
};
