import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - Optional path within the bucket
 * @returns Promise with upload result
 */
export const uploadImage = async (
  file: File,
  bucket: 'menu-images' | 'canteen-logos',
  path?: string
): Promise<UploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: '', path: '', error: 'File must be an image' };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { url: '', path: '', error: 'File size must be less than 5MB' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return {
      url: '',
      path: '',
      error: error.message || 'Failed to upload image',
    };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path to delete
 */
export const deleteImage = async (
  bucket: 'menu-images' | 'canteen-logos',
  path: string
): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
    return {};
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return { error: error.message || 'Failed to delete image' };
  }
};

/**
 * Get optimized image URL with transformations
 * @param url - The original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!url) return '';

  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());

  return `${url}?${params.toString()}`;
};

/**
 * List all files in a bucket path
 * @param bucket - The storage bucket name
 * @param path - The path to list files from
 */
export const listFiles = async (
  bucket: 'menu-images' | 'canteen-logos',
  path?: string
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error listing files:', error);
    return { data: null, error: error.message };
  }
};
