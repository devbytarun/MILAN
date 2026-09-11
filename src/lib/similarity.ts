// ============================================================
// MILAN — Similarity Helper Functions
// B15: Zero-dependency similarity scoring utilities
// ============================================================
// Reference: implementation_plan.md Section 25 (Helper Functions)
// ============================================================

/**
 * Dice's Coefficient (bigram similarity) — zero external dependencies.
 * Used for: name, physical marks, clothing, location comparisons.
 * Returns 0.0–1.0 where 1.0 is exact match.
 */
export function diceSimilarity(str1?: string | null, str2?: string | null): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string): Map<string, number> => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.substring(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;
  for (const [bg, count] of b1) {
    if (b2.has(bg)) intersection += Math.min(count, b2.get(bg)!);
  }
  return (2.0 * intersection) / (s1.length - 1 + s2.length - 1);
}

/**
 * Numerical tolerance scoring.
 * Returns 1.0 if within exactTol, 0.0 if >= maxTol, linear interpolation between.
 * Used for: age (±1/±5), height (±2/±10), weight (±2/±10).
 */
export function scoreNumerical(
  v1: number | null | undefined,
  v2: number | null | undefined,
  exactTol: number,
  maxTol: number
): number {
  if (v1 == null || v2 == null) return 0;
  const diff = Math.abs(v1 - v2);
  if (diff <= exactTol) return 1.0;
  if (diff >= maxTol) return 0.0;
  return 1.0 - (diff - exactTol) / (maxTol - exactTol);
}

/**
 * Exact categorical match.
 * Case-insensitive. Returns 1.0 or 0.0.
 * Used for: gender, blood group.
 */
export function exactMatch(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0;
  return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1.0 : 0.0;
}
