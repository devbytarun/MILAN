// ============================================================
// MILAN — TypeScript Type Definitions
// Auto-generated equivalent for Supabase schema
// B10: Database types for frontend/backend TypeScript code
// ============================================================

export * from './database.types';

// ======================== ENUMS ========================

export type UserRole = 'FAMILY' | 'NGO' | 'ARMY_RESCUE' | 'HOSPITAL' | 'VOLUNTEER' | 'REVIEWER' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type CaseType = 'MISSING' | 'FOUND';

export type CaseStatus =
  | 'SUBMITTED'
  | 'SEARCHING'
  | 'NO_CANDIDATE'
  | 'POSSIBLE_MATCH'
  | 'UNDER_REVIEW'
  | 'VERIFIED_MATCH'
  | 'MATCH_REJECTED'
  | 'MORE_INFO_NEEDED'
  | 'CLOSED'
  | 'ARCHIVED';

export type SourceType = 'FAMILY' | 'NGO' | 'ARMY_RESCUE' | 'HOSPITAL' | 'VOLUNTEER' | 'ADMIN';

export type CommunicationStatus = 'CAN_COMMUNICATE' | 'CANNOT_COMMUNICATE' | 'UNKNOWN';

export type MatchStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED';

// ======================== TABLE ROW TYPES ========================

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  role: UserRole;
  organization_name: string | null;
  organization_type: string | null;
  verification_status: VerificationStatus;
  phone: string | null;
  created_at: string;
}

export interface Case {
  id: string;
  case_uid: string | null;
  case_type: CaseType;
  status: CaseStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  case_id: string | null;
  reporter_id: string | null;
  source_type: SourceType | null;
  comm_status: CommunicationStatus | null;
  report_notes: string | null;
  found_location: string | null;
  found_at: string | null;
  referral_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonAttributes {
  id: string;
  report_id: string | null;
  full_name: string | null;
  alternative_names: string | null;
  age: number | null;
  approximate_age: number | null;
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  build: string | null;
  hair_description: string | null;
  hair_colour: string | null;
  eye_colour: string | null;
  skin_description: string | null;
  birthmarks: string | null;
  scars: string | null;
  tattoos: string | null;
  anatomical_features: string | null;
  clothing: string | null;
  footwear: string | null;
  accessories: string | null;
  belongings: string | null;
  identifying_clue: string | null;
  condition_status: string | null;
}

export interface Media {
  id: string;
  report_id: string | null;
  storage_path: string;
  media_type: string;
  visibility: string;
  created_at: string;
}

export interface MatchCandidate {
  id: string;
  source_case_id: string | null;
  candidate_case_id: string | null;
  score: number | null;
  confidence_tier: string | null;
  matched_fields: Record<string, unknown> | null;
  missing_fields: Record<string, unknown> | null;
  conflicting_fields: Record<string, unknown> | null;
  explanation: string | null;
  status: MatchStatus;
  created_at: string;
}

export interface VerificationAction {
  id: string;
  match_candidate_id: string | null;
  reviewer_id: string | null;
  action: string;
  reason: string | null;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  case_id: string | null;
  old_status: string | null;
  new_status: string | null;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

// ======================== MATCHING TYPES ========================
// Used by the TypeScript matching engine (B14-B15)

export interface FieldComparison {
  field: string;
  sourceValue: string | null;
  candidateValue: string | null;
  score: number;       // 0.0 - 1.0
  weight: number;      // Original weight for this field
  status: 'match' | 'partial' | 'mismatch' | 'unknown';
}

export interface MatchResult {
  candidateCaseId: string;
  candidateReportId: string;
  score: number;                    // 0-100
  confidenceTier: 'HIGH' | 'MEDIUM' | 'LOW';
  dataCompleteness: number;         // 0-100
  matchedFields: FieldComparison[];
  missingFields: string[];
  conflictingFields: FieldComparison[];
  explanation: string;
}

// ======================== RPC INPUT/OUTPUT TYPES ========================

export interface CreateCaseWithReportInput {
  p_case_type: CaseType;
  p_source_type: SourceType;
  p_comm_status?: CommunicationStatus;
  p_report_notes?: string;
  p_found_location?: string;
  p_found_at?: string;
  p_referral_info?: string;
  // person_attributes as JSON
  p_full_name?: string;
  p_alternative_names?: string;
  p_age?: number;
  p_approximate_age?: number;
  p_gender?: string;
  p_date_of_birth?: string;
  p_blood_group?: string;
  p_height_cm?: number;
  p_weight_kg?: number;
  p_build?: string;
  p_hair_description?: string;
  p_hair_colour?: string;
  p_eye_colour?: string;
  p_skin_description?: string;
  p_birthmarks?: string;
  p_scars?: string;
  p_tattoos?: string;
  p_anatomical_features?: string;
  p_clothing?: string;
  p_footwear?: string;
  p_accessories?: string;
  p_belongings?: string;
  p_identifying_clue?: string;
  p_condition_status?: string;
}

export interface LinkReportToCaseInput {
  p_case_uid: string;
  p_source_type: SourceType;
  p_comm_status?: CommunicationStatus;
  p_report_notes?: string;
  p_found_location?: string;
  p_found_at?: string;
  p_referral_info?: string;
  // person attributes
  p_full_name?: string;
  p_alternative_names?: string;
  p_age?: number;
  p_approximate_age?: number;
  p_gender?: string;
  p_blood_group?: string;
  p_height_cm?: number;
  p_weight_kg?: number;
  p_build?: string;
  p_hair_description?: string;
  p_hair_colour?: string;
  p_eye_colour?: string;
  p_skin_description?: string;
  p_birthmarks?: string;
  p_scars?: string;
  p_tattoos?: string;
  p_anatomical_features?: string;
  p_clothing?: string;
  p_footwear?: string;
  p_accessories?: string;
  p_belongings?: string;
  p_identifying_clue?: string;
  p_condition_status?: string;
}

export interface VerifyMatchInput {
  p_match_id: string;
  p_action: 'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED';
  p_reason?: string;
}

// Candidate returned by get_match_candidates RPC (coarse filter)
export interface CandidateRow {
  report_id: string;
  case_id: string;
  case_uid: string | null;
  case_type: CaseType;
  found_location: string | null;
  full_name: string | null;
  alternative_names: string | null;
  age: number | null;
  approximate_age: number | null;
  gender: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  build: string | null;
  hair_description: string | null;
  hair_colour: string | null;
  eye_colour: string | null;
  skin_description: string | null;
  birthmarks: string | null;
  scars: string | null;
  tattoos: string | null;
  anatomical_features: string | null;
  clothing: string | null;
  footwear: string | null;
  accessories: string | null;
  belongings: string | null;
  identifying_clue: string | null;
  condition_status: string | null;
}
