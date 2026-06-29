import { supabase, STORAGE_BUCKET } from './supabaseClient';

/**
 * Uploads a file (Image or Audio) to the 'Rean' bucket.
 * @param file The file object (or Blob) to upload.
 * @param folder The folder path (e.g., 'posts', 'avatars').
 */
export const uploadFile = async (file: File | Blob, folder: string = 'uploads') => {
  try {
    // Generate a filename. If it's a File, use its extension, otherwise default to png for blobs
    let fileExt = 'png';
    if (file instanceof File) {
        fileExt = file.name.split('.').pop() || 'png';
    }
    
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

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

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([path]);

        if (error) {
            console.error('Error deleting file:', error);
        }
    } catch (error) {
        console.error('Error parsing url for delete:', error);
    }
}

/**
 * Lists files in a specific folder in the 'Rean' bucket.
 */
export const listFiles = async (folder: string) => {
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folder, {
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