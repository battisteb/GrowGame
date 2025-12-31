/**
 * Photo Verification Service
 *
 * Uses Google Cloud Vision API to verify habit photos:
 * - Label Detection to identify photo content
 * - Safe Search Detection for content filtering
 * - Validates presence of activity-related keywords
 */

import { PHOTO_VERIFICATION_MIN_CONFIDENCE } from '../constants/game';

export interface VerificationResult {
  success: boolean;
  isValid?: boolean;
  confidence?: number;
  labels?: string[];
  error?: string;
}

// Activity-related keywords that indicate valid habit photos
// These are checked against labels returned by Google Cloud Vision
const VALID_KEYWORDS = [
  // People
  'person', 'people', 'human', 'man', 'woman',
  // Exercise & Sport
  'exercise', 'fitness', 'sport', 'workout', 'gym',
  'running', 'jogging', 'cycling', 'swimming', 'yoga',
  'training', 'athlete', 'activity', 'physical',
  // Reading & Study
  'book', 'reading', 'library', 'text', 'writing',
  'study', 'learning', 'desk', 'computer', 'laptop',
  'notebook', 'paper', 'document', 'education',
  // Meditation & Wellness
  'meditation', 'yoga', 'stretching', 'relaxation',
  'mindfulness', 'wellness', 'breathing',
  // Work & Productivity
  'office', 'workspace', 'work', 'studying',
];

/**
 * Verify a habit photo using Google Cloud Vision API
 *
 * @param photoBase64 - Photo as base64 string
 * @returns Verification result with isValid flag
 */
export const verifyHabitPhoto = async (
  photoBase64: string
): Promise<VerificationResult> => {
  try {
    console.log('🔍 Verifying photo with Google Cloud Vision...');

    // Get API key from environment (EXPO_PUBLIC_ variables are available via process.env)
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;

    if (!apiKey) {
      console.error('❌ Google Cloud Vision API key not configured');
      return {
        success: false,
        error: 'API key not configured. Please add EXPO_PUBLIC_GOOGLE_VISION_API_KEY to your .env file.',
      };
    }

    // Call Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: photoBase64 },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 15 },
                { type: 'SAFE_SEARCH_DETECTION' },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('❌ Vision API error:', response.status);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const result = data.responses[0];

    // Check for API-level errors
    if (result.error) {
      console.error('❌ Vision API returned error:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    // Extract labels with scores
    const labels = result.labelAnnotations?.map(
      (label: any) => ({
        description: label.description.toLowerCase(),
        score: label.score,
      })
    ) || [];

    console.log('📊 Detected labels:', labels);

    // Check safe search (reject inappropriate content)
    const safeSearch = result.safeSearchAnnotation;
    if (safeSearch) {
      const isUnsafe =
        safeSearch.adult === 'VERY_LIKELY' ||
        safeSearch.violence === 'VERY_LIKELY' ||
        safeSearch.racy === 'VERY_LIKELY';

      if (isUnsafe) {
        console.log('❌ Photo rejected: inappropriate content');
        return {
          success: true,
          isValid: false,
          confidence: 0,
          labels: labels.map((l: any) => l.description),
        };
      }
    }

    // Find valid labels matching our keywords
    const validLabels = labels.filter((label: any) =>
      VALID_KEYWORDS.some(keyword =>
        label.description.includes(keyword) &&
        label.score >= PHOTO_VERIFICATION_MIN_CONFIDENCE
      )
    );

    // Photo is valid if at least 1 valid label is found
    const isValid = validLabels.length > 0;
    const confidence = validLabels.length > 0
      ? Math.max(...validLabels.map((l: any) => l.score))
      : 0;

    console.log(isValid ? '✅ Photo verified' : '❌ Photo invalid');
    if (validLabels.length > 0) {
      console.log('✅ Valid labels found:', validLabels.map((l: any) => l.description));
    }

    return {
      success: true,
      isValid,
      confidence,
      labels: labels.map((l: any) => l.description),
    };
  } catch (error) {
    console.error('❌ Verification exception:', error);
    return { success: false, error: String(error) };
  }
};
