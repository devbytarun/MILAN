// ============================================================
// MILAN — Face Similarity Utility
// Cosine similarity between face descriptors.
// Returns 0.0–1.0 similarity score (NOT identity confirmation).
// ============================================================

/**
 * Compute cosine similarity between two face descriptor vectors.
 * Returns a value in [0, 1] where 1 = identical embeddings.
 *
 * IMPORTANT: This is a candidate-ranking SIGNAL only.
 * It is NOT proof of identity. Display as "Face Similarity: X%"
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  // Clamp to [0, 1] (cosine can be slightly negative for very different faces)
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Convert similarity score to a human-readable label.
 * These labels are for UI display only, NOT identity confirmation.
 */
export function getSimilarityLabel(score: number): {
  label: string;
  tier: 'STRONG' | 'POSSIBLE' | 'LOW';
  color: string;
} {
  if (score >= 0.80) {
    return { label: 'Strong Candidate', tier: 'STRONG', color: 'emerald' };
  } else if (score >= 0.70) {
    return { label: 'Possible Candidate', tier: 'POSSIBLE', color: 'orange' };
  } else {
    return { label: 'Low Similarity', tier: 'LOW', color: 'slate' };
  }
}

/**
 * Face embedding stored per case in local storage and Supabase.
 */
export interface FaceEmbeddingRecord {
  caseId: string;
  caseUid: string | null;
  embedding: number[];
  personName: string | null;
  createdAt: string;
}

// ---- Local Storage key for face embeddings ----
const FACE_EMBEDDINGS_KEY = 'milan_face_embeddings';

export function saveFaceEmbeddingLocally(record: FaceEmbeddingRecord): void {
  const existing = getLocalFaceEmbeddings();
  // Replace if same caseId exists
  const filtered = existing.filter((r) => r.caseId !== record.caseId);
  filtered.push(record);
  localStorage.setItem(FACE_EMBEDDINGS_KEY, JSON.stringify(filtered));
}

export function getLocalFaceEmbeddings(): FaceEmbeddingRecord[] {
  try {
    const data = localStorage.getItem(FACE_EMBEDDINGS_KEY);
    if (!data) return [];
    return JSON.parse(data) as FaceEmbeddingRecord[];
  } catch {
    return [];
  }
}

export function removeFaceEmbedding(caseId: string): void {
  const existing = getLocalFaceEmbeddings();
  const filtered = existing.filter((r) => r.caseId !== caseId);
  localStorage.setItem(FACE_EMBEDDINGS_KEY, JSON.stringify(filtered));
}

/**
 * Result of comparing one found-person photo against all stored missing person embeddings
 */
export interface FaceMatchCandidate {
  caseId: string;
  caseUid: string | null;
  personName: string | null;
  similarity: number;        // 0.0–1.0
  similarityPercent: number; // 0–100
  tier: 'STRONG' | 'POSSIBLE' | 'LOW';
}

/**
 * Compare a found person's embedding against all stored MISSING person embeddings.
 * Returns top results sorted by similarity descending, filtered by minimum threshold.
 */
export function findFaceMatches(
  foundEmbedding: number[],
  missingEmbeddings: FaceEmbeddingRecord[],
  minThreshold = 0.70,
  topN = 3
): FaceMatchCandidate[] {
  const results: FaceMatchCandidate[] = missingEmbeddings
    .map((record) => {
      const similarity = cosineSimilarity(foundEmbedding, record.embedding);
      const { tier } = getSimilarityLabel(similarity);
      return {
        caseId: record.caseId,
        caseUid: record.caseUid,
        personName: record.personName,
        similarity,
        similarityPercent: Math.round(similarity * 100),
        tier,
      };
    })
    .filter((r) => r.similarity >= minThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);

  return results;
}
