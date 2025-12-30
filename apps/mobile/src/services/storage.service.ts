/**
 * Storage Service
 *
 * Handles photo uploads to Supabase Storage:
 * - Upload habit photos to 'habit-photos' bucket
 * - Photo storage structure: {user_id}/{habit_log_id}.jpg
 */

import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

export interface UploadPhotoResult {
  success: boolean;
  photoUrl?: string;
  error?: string;
}

/**
 * Upload a habit photo to Supabase Storage
 *
 * @param userId - User ID (for folder structure)
 * @param habitLogId - Habit log ID (for filename)
 * @param photoUri - Local file URI from camera/picker
 * @returns Upload result with photo URL
 */
export const uploadHabitPhoto = async (
  userId: string,
  habitLogId: string,
  photoUri: string
): Promise<UploadPhotoResult> => {
  try {
    console.log('📸 Uploading photo:', photoUri);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to Uint8Array
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // Create blob from array buffer
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

    // Upload to Supabase Storage
    // Path structure: {userId}/{habitLogId}.jpg
    const filePath = `${userId}/${habitLogId}.jpg`;

    const { data, error } = await supabase.storage
      .from('habit-photos')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true, // Allow retry/replacement
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('habit-photos')
      .getPublicUrl(filePath);

    console.log('✅ Photo uploaded:', urlData.publicUrl);

    return {
      success: true,
      photoUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('❌ Upload exception:', error);
    return { success: false, error: String(error) };
  }
};
