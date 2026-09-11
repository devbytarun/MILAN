// ============================================================
// MILAN — Explainable Evidence & Discrepancy Dossier Engine
// HackX 4.0 Innovation 2: Human-in-the-Loop Audit & Dossier
// Generates deep forensic audit trails, flags biological conflicts,
// and produces official relief camp handover dossiers.
// ============================================================

import type { MatchResult, FieldComparison } from '../types/index.ts';

export type AlertSeverity = 'CRITICAL_CONFLICT' | 'BENIGN_VARIATION' | 'DATA_GAP';

export interface DiscrepancyAlert {
  field: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  sourceValue: string | null;
  candidateValue: string | null;
}

export interface VerificationDossier {
  sourceCaseId: string;
  candidateCaseId: string;
  score: number;
  confidenceTier: 'HIGH' | 'MEDIUM' | 'LOW';
  dataCompleteness: number;
  recommendation: 'APPROVE_RECOMMENDED' | 'MANUAL_REVIEW_REQUIRED' | 'REJECT_RECOMMENDED';
  summaryRationale: string;
  evidenceBreakdown: {
    matched: FieldComparison[];
    missing: string[];
    conflicting: FieldComparison[];
  };
  discrepancyAlerts: DiscrepancyAlert[];
  generatedAt: string;
  officialDossierText: string;
}

/**
 * Evaluates a match result and produces an explainable forensic verification dossier.
 */
export function generateVerificationDossier(
  match: MatchResult,
  sourceCaseUid: string,
  candidateCaseUid: string
): VerificationDossier {
  const alerts: DiscrepancyAlert[] = [];

  // 1. Analyze Conflicting Fields
  for (const conflict of match.conflictingFields) {
    if (conflict.field === 'gender') {
      alerts.push({
        field: 'gender',
        severity: 'CRITICAL_CONFLICT',
        title: 'Biological Gender Mismatch',
        description: `Source case reports '${conflict.sourceValue}' but found report records '${conflict.candidateValue}'. Extreme caution required.`,
        sourceValue: conflict.sourceValue,
        candidateValue: conflict.candidateValue,
      });
    } else if (conflict.field === 'blood_group') {
      alerts.push({
        field: 'blood_group',
        severity: 'CRITICAL_CONFLICT',
        title: 'Blood Group Incompatibility',
        description: `Biological blood group conflict (${conflict.sourceValue} vs ${conflict.candidateValue}). Verify with clinical lab before medical interventions.`,
        sourceValue: conflict.sourceValue,
        candidateValue: conflict.candidateValue,
      });
    } else if (conflict.field === 'age') {
      alerts.push({
        field: 'age',
        severity: 'BENIGN_VARIATION',
        title: 'Age Discrepancy Beyond Tolerance',
        description: `Age reported as ${conflict.sourceValue} vs ${conflict.candidateValue}. In disaster conditions, shock and lack of documentation frequently cause 2-5 year estimation errors.`,
        sourceValue: conflict.sourceValue,
        candidateValue: conflict.candidateValue,
      });
    } else {
      alerts.push({
        field: conflict.field,
        severity: 'BENIGN_VARIATION',
        title: `Discrepancy in ${conflict.field}`,
        description: `Different values recorded: '${conflict.sourceValue}' vs '${conflict.candidateValue}'. Clothing or appearance may have changed during rescue.`,
        sourceValue: conflict.sourceValue,
        candidateValue: conflict.candidateValue,
      });
    }
  }

  // 2. Analyze Missing Fields (Data Gaps)
  for (const missingField of match.missingFields) {
    let desc = `Field '${missingField}' is unrecorded in one or both reports.`;
    if (missingField === 'blood_group') {
      desc = 'Blood group missing from field report. Weight was redistributed; candidate is not penalized.';
    } else if (missingField === 'name') {
      desc = 'Candidate is non-verbal or unidentified. Match relies on physical biometrics, clothing, and location.';
    }

    alerts.push({
      field: missingField,
      severity: 'DATA_GAP',
      title: `Unrecorded Attribute: ${missingField}`,
      description: desc,
      sourceValue: null,
      candidateValue: null,
    });
  }

  // 3. Determine Reviewer Recommendation
  const hasCritical = alerts.some(a => a.severity === 'CRITICAL_CONFLICT');
  let recommendation: VerificationDossier['recommendation'];

  if (hasCritical) {
    recommendation = 'REJECT_RECOMMENDED';
  } else if (match.score >= 75 && match.dataCompleteness >= 50) {
    recommendation = 'APPROVE_RECOMMENDED';
  } else {
    recommendation = 'MANUAL_REVIEW_REQUIRED';
  }

  // 4. Generate Official Dossier Text (printable / exportable)
  const timestamp = new Date().toISOString();
  const dossierText = `
================================================================================
                    MILAN DISASTER REUNIFICATION DOSSIER
                  OFFICIAL REVIEWER VERIFICATION CERTIFICATE
================================================================================
CASE RELATIONSHIP:
  Missing Case UID   : ${sourceCaseUid}
  Found Candidate UID: ${candidateCaseUid}
  Generated Timestamp: ${timestamp}
  Overall Match Score: ${match.score} / 100 (${match.confidenceTier} CONFIDENCE)
  Data Completeness  : ${match.dataCompleteness}%
  Adjudication Status: ${recommendation.replace(/_/g, ' ')}

SUMMARY RATIONALE:
  ${match.explanation}

POSITIVE EVIDENCE (${match.matchedFields.length} MATCHING ATTRIBUTES):
${match.matchedFields.map(f => `  [+] ${f.field.toUpperCase()}: "${f.sourceValue}" <==> "${f.candidateValue}" (Score: ${(f.score * 100).toFixed(0)}%, Status: ${f.status.toUpperCase()})`).join('\n')}

INVESTIGATION ALERTS (${alerts.length} ITEMS):
${alerts.map(a => `  [${a.severity}] ${a.title}: ${a.description}`).join('\n')}

HUMAN REVIEW SIGN-OFF:
  Reviewer ID / Signature: ___________________________
  Camp Authority Sign-off: ___________________________
  Handover Authorized   : [  ] YES    [  ] NO    [  ] MORE INFO NEEDED
================================================================================
`.trim();

  return {
    sourceCaseId: match.candidateCaseId,
    candidateCaseId: match.candidateReportId,
    score: match.score,
    confidenceTier: match.confidenceTier,
    dataCompleteness: match.dataCompleteness,
    recommendation,
    summaryRationale: match.explanation,
    evidenceBreakdown: {
      matched: match.matchedFields,
      missing: match.missingFields,
      conflicting: match.conflictingFields,
    },
    discrepancyAlerts: alerts,
    generatedAt: timestamp,
    officialDossierText: dossierText,
  };
}
