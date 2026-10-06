// ============================================================
// MILAN — Face Recognition Utility
// Uses face-api.js with Tiny Face Detector, Landmark 68, Recognition Net
// Models loaded once and cached.
// ============================================================

import * as faceapi from 'face-api.js';

// ---- Configurable thresholds (one place to tune) ----
export const FACE_MATCH_THRESHOLDS = {
  STRONG: 0.80,  // >= 80% → Strong candidate
  POSSIBLE: 0.70, // 70–79% → Possible candidate
  // < 70% → not shown
} as const;

const MODEL_URL = '/models';

let modelsLoaded = false;
let modelsLoading = false;
let modelsLoadError: string | null = null;

/**
 * Load face-api.js models once. Subsequent calls return immediately.
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // Wait for existing load to complete
    await new Promise<void>((resolve, reject) => {
      const poll = setInterval(() => {
        if (modelsLoaded) { clearInterval(poll); resolve(); }
        if (modelsLoadError) { clearInterval(poll); reject(new Error(modelsLoadError)); }
      }, 100);
    });
    return;
  }

  modelsLoading = true;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  } catch (err) {
    modelsLoadError = `Face model loading failed: ${err instanceof Error ? err.message : String(err)}`;
    modelsLoading = false;
    throw new Error(modelsLoadError);
  }
  modelsLoading = false;
}

/**
 * Result type for face descriptor extraction
 */
export type FaceDescriptorResult =
  | { success: true; descriptor: number[] }
  | { success: false; error: string };

/**
 * Load models, detect a face in the provided image element/URL, and return a 128-dim descriptor.
 *
 * Rejects with a clear, human-readable error if:
 *  - No face detected
 *  - Multiple faces detected
 *  - Image cannot be processed
 */
export async function extractFaceDescriptor(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | string
): Promise<FaceDescriptorResult> {
  try {
    await loadFaceModels();
  } catch (_err) {
    return {
      success: false,
      error: 'Face recognition models could not be loaded. Please ensure you are online and try again.',
    };
  }

  let imgEl: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

  if (typeof imageSource === 'string') {
    // Create an image element from URL/data-URL
    imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image could not be loaded. Please upload a valid image file.'));
      img.src = imageSource;
    });
  } else {
    imgEl = imageSource;
  }

  let detections;
  try {
    detections = await faceapi
      .detectAllFaces(imgEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptors();
  } catch (err) {
    return {
      success: false,
      error: `Face analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}. Please upload a clear, well-lit photograph.`,
    };
  }

  if (!detections || detections.length === 0) {
    return {
      success: false,
      error: 'No face detected. Please upload a clear photograph containing one person with their face clearly visible.',
    };
  }

  if (detections.length > 1) {
    return {
      success: false,
      error: `Multiple faces detected (${detections.length} faces found). Please upload a photograph containing only the missing/found person.`,
    };
  }

  const descriptor = Array.from(detections[0].descriptor) as number[];
  return { success: true, descriptor };
}

/**
 * Create an HTMLImageElement from a File object and extract face descriptor.
 */
export async function extractFaceDescriptorFromFile(file: File): Promise<FaceDescriptorResult> {
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Invalid file type. Please upload a valid image (JPEG, PNG, WebP).' };
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('File could not be read.'));
    reader.readAsDataURL(file);
  });

  return extractFaceDescriptor(dataUrl);
}
