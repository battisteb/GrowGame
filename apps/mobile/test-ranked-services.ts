/**
 * Test File for Ranked Mode Services
 *
 * Tests photo verification and upload services before UI implementation
 */

import { verifyHabitPhoto } from './src/services/photoVerification.service';
import { uploadHabitPhoto } from './src/services/storage.service';
import * as FileSystem from 'expo-file-system/legacy';

// =============================================================================
// TEST 1: Photo Verification Service
// =============================================================================

/**
 * Test photo verification with a base64 image
 *
 * Usage: Call this from a button in your app with a real photo URI
 */
export const testPhotoVerification = async (photoUri: string) => {
  console.log('🧪 TEST 1: Photo Verification Service');
  console.log('=====================================');

  try {
    // Convert photo to base64
    console.log('📸 Reading photo from:', photoUri);
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('✅ Photo converted to base64 (length:', base64.length, 'chars)');

    // Call verification service
    console.log('🔍 Calling Google Cloud Vision API...');
    const result = await verifyHabitPhoto(base64);

    console.log('\n📊 VERIFICATION RESULT:');
    console.log('- Success:', result.success);
    console.log('- Is Valid:', result.isValid);
    console.log('- Confidence:', result.confidence);
    console.log('- Labels detected:', result.labels?.join(', '));
    console.log('- Error:', result.error);

    if (result.success && result.isValid) {
      console.log('\n✅ TEST PASSED: Photo verification works!');
    } else if (result.success && !result.isValid) {
      console.log('\n⚠️ TEST RESULT: Photo rejected (this is expected if photo doesn\'t match valid keywords)');
    } else {
      console.log('\n❌ TEST FAILED:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ TEST EXCEPTION:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// TEST 2: Storage Upload Service
// =============================================================================

/**
 * Test photo upload to Supabase Storage
 *
 * IMPORTANT: Supabase Storage bucket 'habit-photos' must be created first
 */
export const testPhotoUpload = async (
  photoUri: string,
  userId: string = 'test-user-id',
  habitLogId: string = 'test-habit-log-id'
) => {
  console.log('\n🧪 TEST 2: Storage Upload Service');
  console.log('=====================================');

  try {
    console.log('📤 Uploading photo...');
    console.log('- Photo URI:', photoUri);
    console.log('- User ID:', userId);
    console.log('- Habit Log ID:', habitLogId);

    const result = await uploadHabitPhoto(userId, habitLogId, photoUri);

    console.log('\n📊 UPLOAD RESULT:');
    console.log('- Success:', result.success);
    console.log('- Photo URL:', result.photoUrl);
    console.log('- Error:', result.error);

    if (result.success && result.photoUrl) {
      console.log('\n✅ TEST PASSED: Photo upload works!');
      console.log('Photo accessible at:', result.photoUrl);
    } else {
      console.log('\n❌ TEST FAILED:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ TEST EXCEPTION:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// TEST 3: Complete Flow (Verification + Upload)
// =============================================================================

/**
 * Test the complete ranked mode flow:
 * 1. Verify photo with Google Cloud Vision
 * 2. If valid, upload to Supabase Storage
 */
export const testCompleteRankedFlow = async (
  photoUri: string,
  userId: string = 'test-user-id',
  habitLogId: string = 'test-habit-log-id'
) => {
  console.log('\n🧪 TEST 3: Complete Ranked Flow');
  console.log('=====================================');

  try {
    // Step 1: Verify photo
    console.log('🔍 Step 1: Verifying photo...');
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const verifyResult = await verifyHabitPhoto(base64);

    if (!verifyResult.success) {
      console.log('❌ Verification service failed:', verifyResult.error);
      return { success: false, step: 'verification', error: verifyResult.error };
    }

    if (!verifyResult.isValid) {
      console.log('⚠️ Photo rejected by AI verification');
      console.log('Labels detected:', verifyResult.labels?.join(', '));
      return {
        success: false,
        step: 'validation',
        error: 'Photo invalide. Prends une photo plus claire montrant ton activité.',
        labels: verifyResult.labels,
      };
    }

    console.log('✅ Photo verified! Confidence:', verifyResult.confidence);

    // Step 2: Upload photo
    console.log('\n📤 Step 2: Uploading photo...');
    const uploadResult = await uploadHabitPhoto(userId, habitLogId, photoUri);

    if (!uploadResult.success) {
      console.log('❌ Upload failed:', uploadResult.error);
      return { success: false, step: 'upload', error: uploadResult.error };
    }

    console.log('✅ Photo uploaded!');

    // Success!
    console.log('\n🎉 TEST PASSED: Complete ranked flow works!');
    console.log('- Photo verified with confidence:', verifyResult.confidence);
    console.log('- Photo uploaded to:', uploadResult.photoUrl);

    return {
      success: true,
      photoUrl: uploadResult.photoUrl,
      confidence: verifyResult.confidence,
      labels: verifyResult.labels,
    };
  } catch (error) {
    console.error('❌ TEST EXCEPTION:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// HOW TO USE THIS TEST FILE
// =============================================================================

/**
 * OPTION 1: Add temporary test button to your app
 *
 * In apps/mobile/app/(tabs)/index.tsx (home screen), add:
 *
 * ```typescript
 * import * as ImagePicker from 'expo-image-picker';
 * import { testCompleteRankedFlow } from '../../test-ranked-services';
 *
 * // Add this button somewhere in your JSX
 * <TouchableOpacity
 *   style={{ padding: 20, backgroundColor: 'blue', margin: 20 }}
 *   onPress={async () => {
 *     const result = await ImagePicker.launchImageLibraryAsync({
 *       mediaTypes: ImagePicker.MediaTypeOptions.Images,
 *       quality: 0.8,
 *     });
 *
 *     if (!result.canceled) {
 *       await testCompleteRankedFlow(result.assets[0].uri);
 *     }
 *   }}
 * >
 *   <Text style={{ color: 'white' }}>🧪 Test Ranked Services</Text>
 * </TouchableOpacity>
 * ```
 *
 * Then:
 * 1. Run the app: npx expo start
 * 2. Tap the test button
 * 3. Choose a photo (person doing activity for best results)
 * 4. Check terminal logs for test results
 *
 *
 * OPTION 2: Call from React DevTools console
 *
 * 1. Run app with: npx expo start
 * 2. Open React DevTools
 * 3. Import and call test functions with a photo URI
 *
 *
 * RECOMMENDED TEST PHOTOS:
 * - ✅ Person reading a book (should pass)
 * - ✅ Person exercising (should pass)
 * - ✅ Person at desk studying (should pass)
 * - ❌ Blank screen or unrelated object (should fail)
 */
