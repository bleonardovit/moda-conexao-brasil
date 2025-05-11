
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a string is a base64 image
 */
export const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image');
};

/**
 * Upload a base64 image to Supabase Storage and return the public URL
 */
export const uploadBase64ImageToStorage = async (base64Image: string): Promise<string | null> => {
  try {
    // Convert base64 to file
    const res = await fetch(base64Image);
    const blob = await res.blob();
    
    // Generate unique filename
    const fileName = `migrated-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.jpg`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('supplier-images')
      .upload(fileName, blob, {
        cacheControl: '3600',
        contentType: blob.type,
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading base64 image to storage:', error);
      return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('supplier-images')
      .getPublicUrl(data?.path || '');
    
    return publicUrl;
  } catch (error) {
    console.error('Error converting base64 to file and uploading:', error);
    return null;
  }
};

/**
 * Migrate an array of image sources (can be base64 or URLs) to Supabase Storage
 * Returns an array of public URLs
 */
export const migrateImagesToStorage = async (imageSources: string[]): Promise<string[]> => {
  if (!imageSources || imageSources.length === 0) return [];
  
  const migratedImages: string[] = [];
  
  for (const source of imageSources) {
    // Skip if it's already a URL
    if (isValidUrl(source)) {
      migratedImages.push(source);
      continue;
    }
    
    // Upload base64 images to storage
    if (isBase64Image(source)) {
      const publicUrl = await uploadBase64ImageToStorage(source);
      if (publicUrl) {
        migratedImages.push(publicUrl);
      }
    }
  }
  
  return migratedImages;
};

/**
 * Helper function to migrate supplier images during create/update
 */
export const migrateSupplierImages = async (images: string[]): Promise<string[]> => {
  const needsMigration = images.some(img => isBase64Image(img));
  
  if (needsMigration) {
    return await migrateImagesToStorage(images);
  }
  
  return images;
};
