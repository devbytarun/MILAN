// ============================================================
// MILAN — TypeScript Weighted Matching Engine
// B14: Core matching logic with null-safe scoring
// ============================================================
// Reference: implementation_plan.md Sections 11, 12, 13, 25
//
// Weights (sum = 105, normalized):
//   Name: 15, Gender: 20, Age: 15, Blood Group: 10,
//   Height: 5, Weight: 5, Physical Marks: 15,
//   Clothing: 10, Location: 10
//
// Null handling: dynamic weight redistribution
// Confidence: HIGH (≥75 + ≥50% completeness),
//             MEDIUM (≥50 + ≥30%), LOW (else)
// ============================================================

import { diceSimilarity, scoreNumerical, exactMatch } from './similarity.ts';
import type { FieldComparison, MatchResult, CandidateRow, PersonAttributes } from '../types/index.ts';

// Weight configuration per implementation_plan.md Section 12
const WEIGHTS: Record<string, number> = {
  name: 15,
  gender: 20,
  age: 15,
  blood_group: 10,
  height: 5,
  weight: 5,
  physical_marks: 15,
  clothing: 10,
  location: 10,
};

const TOTAL_POSSIBLE_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0); // 105

/**
 * Compare a single text field using the provided comparison function.
 * Returns null if both values are null/undefined (field is "unknown").
 */
function compareField(
  field: string,
  sourceVal: string | null | undefined,
  candidateVal: string | null | undefined,
  weight: number,
  compareFn: (a: string, b: string) => number
): FieldComparison | null {
  const sv = sourceVal?.trim() || null;
  const cv = candidateVal?.trim() || null;

  // Both null → field is unknown, skip it
  if (!sv && !cv) return null;

  // One null → field is unknown (not a mismatch)
  if (!sv || !cv) {
    return {
      field,
      sourceValue: sv,
      candidateValue: cv,
      score: 0,
      weight,
      status: 'unknown',
    };
  }

  const score = compareFn(sv, cv);
  let status: FieldComparison['status'];
  if (score >= 0.8) status = 'match';
  else if (score >= 0.4) status = 'partial';
  else status = 'mismatch';

  return { field, sourceValue: sv, candidateValue: cv, score, weight, status };
}

/**
 * Compare a numerical field with tolerance.
 * Returns null if both values are null.
 */
function compareNumeric(
  field: string,
  sourceVal: number | null | undefined,
  candidateVal: number | null | undefined,
  weight: number,
  exactTol: number,
  maxTol: number
): FieldComparison | null {
  if (sourceVal == null && candidateVal == null) return null;

  if (sourceVal == null || candidateVal == null) {
    return {
      field,
      sourceValue: sourceVal?.toString() ?? null,
      candidateValue: candidateVal?.toString() ?? null,
      score: 0,
      weight,
      status: 'unknown',
    };
  }

  const score = scoreNumerical(sourceVal, candidateVal, exactTol, maxTol);
  let status: FieldComparison['status'];
  if (score >= 0.8) status = 'match';
  else if (score >= 0.4) status = 'partial';
  else status = 'mismatch';

  return {
    field,
    sourceValue: sourceVal.toString(),
    candidateValue: candidateVal.toString(),
    score,
    weight,
    status,
  };
}

/**
 * Score a single candidate against source attributes.
 * Implements dynamic weight redistribution for null fields.
 */
export function scoreCandidate(
  sourceAttrs: PersonAttributes,
  candidateRow: CandidateRow,
  sourceFoundLocation?: string | null
): MatchResult {
  const fieldResults: FieldComparison[] = [];

  // --- Name (weight: 15) ---
  // Compare full_name and alternative_names individually, selecting the best match
  const sourceNames = [sourceAttrs.full_name, ...(sourceAttrs.alternative_names?.split(/[,;]/) || [])]
    .map(s => s?.trim())
    .filter((s): s is string => !!s);
  const candNames = [candidateRow.full_name, ...(candidateRow.alternative_names?.split(/[,;]/) || [])]
    .map(s => s?.trim())
    .filter((s): s is string => !!s);

  let bestNameScore = 0;
  let bestSourceName: string | null = sourceAttrs.full_name || null;
  let bestCandName: string | null = candidateRow.full_name || null;

  if (sourceNames.length > 0 && candNames.length > 0) {
    for (const sn of sourceNames) {
      for (const cn of candNames) {
        const sim = diceSimilarity(sn, cn);
        if (sim >= bestNameScore) {
          bestNameScore = sim;
          bestSourceName = sn;
          bestCandName = cn;
        }
      }
    }
    let status: FieldComparison['status'];
    if (bestNameScore >= 0.8) status = 'match';
    else if (bestNameScore >= 0.4) status = 'partial';
    else status = 'mismatch';

    fieldResults.push({
      field: 'name',
      sourceValue: bestSourceName,
      candidateValue: bestCandName,
      score: bestNameScore,
      weight: WEIGHTS.name,
      status,
    });
  } else if (sourceNames.length > 0 || candNames.length > 0) {
    fieldResults.push({
      field: 'name',
      sourceValue: sourceNames[0] || null,
      candidateValue: candNames[0] || null,
      score: 0,
      weight: WEIGHTS.name,
      status: 'unknown',
    });
  }

  // --- Gender (weight: 20) ---
  const genderResult = compareField('gender', sourceAttrs.gender, candidateRow.gender, WEIGHTS.gender, exactMatch);
  if (genderResult) fieldResults.push(genderResult);

  // --- Age (weight: 15, tolerance ±1 exact, ±5 max) ---
  const sourceAge = sourceAttrs.age ?? sourceAttrs.approximate_age;
  const candAge = candidateRow.age ?? candidateRow.approximate_age;
  const ageResult = compareNumeric('age', sourceAge, candAge, WEIGHTS.age, 1, 5);
  if (ageResult) fieldResults.push(ageResult);

  // --- Blood Group (weight: 10) ---
  const bloodResult = compareField('blood_group', sourceAttrs.blood_group, candidateRow.blood_group, WEIGHTS.blood_group, exactMatch);
  if (bloodResult) fieldResults.push(bloodResult);

  // --- Height (weight: 5, tolerance ±2cm exact, ±10cm max) ---
  const heightResult = compareNumeric('height', sourceAttrs.height_cm, candidateRow.height_cm, WEIGHTS.height, 2, 10);
  if (heightResult) fieldResults.push(heightResult);

  // --- Weight (weight: 5, tolerance ±2kg exact, ±10kg max) ---
  const weightResult = compareNumeric('weight', sourceAttrs.weight_kg, candidateRow.weight_kg, WEIGHTS.weight, 2, 10);
  if (weightResult) fieldResults.push(weightResult);

  // --- Physical Marks (weight: 15) — combine birthmarks + scars + tattoos + anatomical ---
  const sourceMarksList = [sourceAttrs.birthmarks, sourceAttrs.scars, sourceAttrs.tattoos, sourceAttrs.anatomical_features]
    .map(s => s?.trim())
    .filter((s): s is string => !!s);
  const candMarksList = [candidateRow.birthmarks, candidateRow.scars, candidateRow.tattoos, candidateRow.anatomical_features]
    .map(s => s?.trim())
    .filter((s): s is string => !!s);

  if (sourceMarksList.length > 0 && candMarksList.length > 0) {
    // Check combined text similarity
    let bestMarksScore = diceSimilarity(sourceMarksList.join(' '), candMarksList.join(' '));
    // Also check cross-attribute pairs (e.g. source scars vs candidate scars)
    for (const sm of sourceMarksList) {
      for (const cm of candMarksList) {
        const sim = diceSimilarity(sm, cm);
        if (sim > bestMarksScore) bestMarksScore = sim;
      }
    }
    let status: FieldComparison['status'];
    if (bestMarksScore >= 0.8) status = 'match';
    else if (bestMarksScore >= 0.4) status = 'partial';
    else status = 'mismatch';

    fieldResults.push({
      field: 'physical_marks',
      sourceValue: sourceMarksList.join('; '),
      candidateValue: candMarksList.join('; '),
      score: bestMarksScore,
      weight: WEIGHTS.physical_marks,
      status,
    });
  } else if (sourceMarksList.length > 0 || candMarksList.length > 0) {
    fieldResults.push({
      field: 'physical_marks',
      sourceValue: sourceMarksList.join('; ') || null,
      candidateValue: candMarksList.join('; ') || null,
      score: 0,
      weight: WEIGHTS.physical_marks,
      status: 'unknown',
    });
  }

  // --- Clothing (weight: 10) ---
  const sourceClothing = [sourceAttrs.clothing, sourceAttrs.footwear, sourceAttrs.accessories]
    .filter(Boolean).join(' ');
  const candClothing = [candidateRow.clothing, candidateRow.footwear, candidateRow.accessories]
    .filter(Boolean).join(' ');
  const clothingResult = compareField('clothing', sourceClothing || null, candClothing || null, WEIGHTS.clothing, diceSimilarity);
  if (clothingResult) fieldResults.push(clothingResult);

  // --- Location (weight: 10) ---
  const locationResult = compareField('location', sourceFoundLocation, candidateRow.found_location, WEIGHTS.location, diceSimilarity);
  if (locationResult) fieldResults.push(locationResult);

  // --- Calculate final score with dynamic weight redistribution ---
  const availableFields = fieldResults.filter(f => f.status !== 'unknown');
  const totalApplicableWeight = availableFields.reduce((sum, f) => sum + f.weight, 0);
  const weightedScoreSum = availableFields.reduce((sum, f) => sum + f.score * f.weight, 0);

  const score = totalApplicableWeight > 0
    ? Math.round((weightedScoreSum / totalApplicableWeight) * 100)
    : 0;

  const dataCompleteness = Math.round((totalApplicableWeight / TOTAL_POSSIBLE_WEIGHT) * 100);

  // Confidence tiers per implementation_plan.md Section 12
  const confidenceTier: MatchResult['confidenceTier'] =
    score >= 75 && dataCompleteness >= 50 ? 'HIGH'
    : score >= 50 && dataCompleteness >= 30 ? 'MEDIUM'
    : 'LOW';

  // Build explanation
  const matchedFields = fieldResults.filter(f => f.status === 'match' || f.status === 'partial');
  const missingFields = fieldResults.filter(f => f.status === 'unknown').map(f => f.field);
  const conflictingFields = fieldResults.filter(f => f.status === 'mismatch');

  const explanation = `${confidenceTier} similarity based on ${matchedFields.length} matching attribute${matchedFields.length !== 1 ? 's' : ''} out of ${fieldResults.length} compared. Data completeness: ${dataCompleteness}%.`;

  return {
    candidateCaseId: candidateRow.case_id,
    candidateReportId: candidateRow.report_id,
    score,
    confidenceTier,
    dataCompleteness,
    matchedFields,
    missingFields,
    conflictingFields,
    explanation,
  };
}

/**
 * Score all candidates from the coarse filter against source attributes.
 * Returns sorted results (highest score first).
 */
export function scoreAllCandidates(
  sourceAttrs: PersonAttributes,
  candidates: CandidateRow[],
  sourceFoundLocation?: string | null
): MatchResult[] {
  const results = candidates.map(candidate =>
    scoreCandidate(sourceAttrs, candidate, sourceFoundLocation)
  );

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
