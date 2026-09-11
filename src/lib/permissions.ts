import type { UserRole, Profile } from '../types/index.ts';
import type { FullCaseData } from '../services/caseService.ts';

export type Permission =
  // Case discovery & reading
  | 'VIEW_PUBLIC_CASE'
  | 'VIEW_OWN_CASE'
  | 'VIEW_ASSIGNED_CASE'
  | 'VIEW_OPERATIONAL_CASE'
  | 'VIEW_CASE_DIRECTORY'

  // Forensic & Evidence details (strictly internal reviewer/admin)
  | 'VIEW_FORENSIC_DOSSIER'
  | 'VIEW_MATCH_SCORE'
  | 'VIEW_EVIDENCE_MATRIX'
  | 'VIEW_CONFLICTS'
  | 'VIEW_INTERNAL_ALERTS'

  // Field-level data visibility
  | 'VIEW_MEDICAL_DETAILS'
  | 'VIEW_CONTACT_DETAILS'
  | 'VIEW_LOCATION_DETAILS'
  | 'VIEW_IDENTITY_DETAILS'

  // Reporting intake actions
  | 'CREATE_MISSING_REPORT'
  | 'CREATE_FOUND_REPORT'
  | 'CREATE_HOSPITAL_REPORT'
  | 'USE_VOICE_AI'

  // Modification
  | 'EDIT_OWN_REPORT'
  | 'EDIT_ASSIGNED_CASE'

  // Verification & Decision-making
  | 'REVIEW_MATCH'
  | 'APPROVE_MATCH'
  | 'REJECT_MATCH'
  | 'OVERRIDE_MATCH'

  // Administration & Oversight
  | 'MANAGE_USERS'
  | 'MANAGE_CASES'
  | 'VIEW_AUDIT_LOGS'
  | 'VIEW_SYSTEM_ANALYTICS'

  // Dashboard views
  | 'VIEW_OPERATIONAL_DASHBOARD'
  | 'VIEW_FAMILY_DASHBOARD'
  | 'VIEW_VOLUNTEER_DASHBOARD';

/**
 * Explicit role-to-permissions mapping matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  FAMILY: new Set<Permission>([
    'VIEW_PUBLIC_CASE',
    'VIEW_OWN_CASE',
    'CREATE_MISSING_REPORT',
    'EDIT_OWN_REPORT',
    'VIEW_FAMILY_DASHBOARD',
    'VIEW_IDENTITY_DETAILS',
    'VIEW_LOCATION_DETAILS',
  ]),

  NGO: new Set<Permission>([
    'VIEW_PUBLIC_CASE',
    'VIEW_OWN_CASE',
    'VIEW_ASSIGNED_CASE',
    'VIEW_OPERATIONAL_CASE',
    'VIEW_CASE_DIRECTORY',
    'CREATE_FOUND_REPORT',
    'EDIT_ASSIGNED_CASE',
    'VIEW_OPERATIONAL_DASHBOARD',
    'VIEW_IDENTITY_DETAILS',
    'VIEW_LOCATION_DETAILS',
    'VIEW_CONTACT_DETAILS',
    'USE_VOICE_AI',
  ]),

  ARMY_RESCUE: new Set<Permission>([
    'VIEW_PUBLIC_CASE',
    'VIEW_OWN_CASE',
    'VIEW_ASSIGNED_CASE',
    'VIEW_OPERATIONAL_CASE',
    'VIEW_CASE_DIRECTORY',
    'CREATE_FOUND_REPORT',
    'EDIT_ASSIGNED_CASE',
    'VIEW_OPERATIONAL_DASHBOARD',
    'VIEW_IDENTITY_DETAILS',
    'VIEW_LOCATION_DETAILS',
    'USE_VOICE_AI',
  ]),

  HOSPITAL: new Set<Permission>([
    'VIEW_PUBLIC_CASE',
    'VIEW_OWN_CASE',
    'VIEW_ASSIGNED_CASE',
    'VIEW_OPERATIONAL_CASE',
    'VIEW_CASE_DIRECTORY',
    'CREATE_HOSPITAL_REPORT',
    'VIEW_MEDICAL_DETAILS',
    'VIEW_IDENTITY_DETAILS',
    'VIEW_OPERATIONAL_DASHBOARD',
    'USE_VOICE_AI',
  ]),

  REVIEWER: new Set<Permission>([
    'VIEW_PUBLIC_CASE',
    'VIEW_OWN_CASE',
    'VIEW_ASSIGNED_CASE',
    'VIEW_OPERATIONAL_CASE',
    'VIEW_CASE_DIRECTORY',
    'VIEW_FORENSIC_DOSSIER',
    'VIEW_MATCH_SCORE',
    'VIEW_EVIDENCE_MATRIX',
    'VIEW_CONFLICTS',
    'VIEW_INTERNAL_ALERTS',
    'REVIEW_MATCH',
    'APPROVE_MATCH',
    'REJECT_MATCH',
    'VIEW_OPERATIONAL_DASHBOARD',
    'VIEW_IDENTITY_DETAILS',
    'VIEW_LOCATION_DETAILS',
    'VIEW_MEDICAL_DETAILS',
    'VIEW_CONTACT_DETAILS',
    'USE_VOICE_AI',
  ]),

  ADMIN: new Set<Permission>([
    'VIEW_PUBLIC_CASE',
    'VIEW_OWN_CASE',
    'VIEW_ASSIGNED_CASE',
    'VIEW_OPERATIONAL_CASE',
    'VIEW_CASE_DIRECTORY',
    'VIEW_FORENSIC_DOSSIER',
    'VIEW_MATCH_SCORE',
    'VIEW_EVIDENCE_MATRIX',
    'VIEW_CONFLICTS',
    'VIEW_INTERNAL_ALERTS',
    'VIEW_MEDICAL_DETAILS',
    'VIEW_CONTACT_DETAILS',
    'VIEW_LOCATION_DETAILS',
    'VIEW_IDENTITY_DETAILS',
    'CREATE_MISSING_REPORT',
    'CREATE_FOUND_REPORT',
    'CREATE_HOSPITAL_REPORT',
    'USE_VOICE_AI',
    'EDIT_OWN_REPORT',
    'EDIT_ASSIGNED_CASE',
    'REVIEW_MATCH',
    'APPROVE_MATCH',
    'REJECT_MATCH',
    'OVERRIDE_MATCH',
    'MANAGE_USERS',
    'MANAGE_CASES',
    'VIEW_AUDIT_LOGS',
    'VIEW_SYSTEM_ANALYTICS',
    'VIEW_OPERATIONAL_DASHBOARD',
    'VIEW_FAMILY_DASHBOARD',
    'VIEW_VOLUNTEER_DASHBOARD',
  ]),

  VOLUNTEER: new Set<Permission>([
    'VIEW_PUBLIC_CASE',
    'VIEW_OWN_CASE',
    'VIEW_VOLUNTEER_DASHBOARD',
    'VIEW_IDENTITY_DETAILS',
    'VIEW_LOCATION_DETAILS',
  ]),
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Route protection rules mapping URL prefixes to required permissions
 */
export const ROUTE_PERMISSION_MAP: Record<string, Permission> = {
  '/dossier': 'VIEW_FORENSIC_DOSSIER',
  '/review': 'REVIEW_MATCH',
  '/report/missing': 'CREATE_MISSING_REPORT',
  '/report/found': 'CREATE_FOUND_REPORT',
  '/report/hospital': 'CREATE_HOSPITAL_REPORT',
  '/report/voice': 'USE_VOICE_AI',
  '/cases': 'VIEW_PUBLIC_CASE',
  '/dashboard': 'VIEW_PUBLIC_CASE',
};

/**
 * Check if a role has authorization to access a given route
 */
export function canAccessRoute(role: UserRole | undefined | null, path: string): boolean {
  if (!role) return false;

  for (const [routePrefix, requiredPerm] of Object.entries(ROUTE_PERMISSION_MAP)) {
    if (path === routePrefix || path.startsWith(routePrefix + '/')) {
      return hasPermission(role, requiredPerm);
    }
  }

  // Routes not explicitly in map default to open if authenticated
  return true;
}

/**
 * Authorizes access to a specific case based on role and ownership
 */
export function canViewCase(profile: Profile | null, fullCase: FullCaseData): boolean {
  if (!profile) return false;

  // ADMIN can view all cases
  if (profile.role === 'ADMIN') return true;

  // REVIEWER can view cases in the reconciliation pipeline
  if (profile.role === 'REVIEWER') return true;

  const caseObj = fullCase.case;
  const reportObj = fullCase.report;

  // Direct ownership match
  const isOwner =
    (caseObj.created_by && (caseObj.created_by === profile.id || caseObj.created_by === profile.auth_user_id)) ||
    (reportObj.reporter_id && (reportObj.reporter_id === profile.id || reportObj.reporter_id === profile.auth_user_id)) ||
    // Support demo ownership mappings
    (profile.role === 'FAMILY' && (caseObj.created_by === 'family-demo' || reportObj.reporter_id === 'family-demo' || (profile.id === 'demo-family-id' && caseObj.id === 'case-demo-1'))) ||
    (profile.role === 'HOSPITAL' && (caseObj.created_by === 'hospital-demo' || reportObj.reporter_id === 'hospital-demo' || profile.id === 'demo-hospital-id')) ||
    (profile.role === 'ARMY_RESCUE' && (caseObj.created_by === 'army-demo' || reportObj.reporter_id === 'army-demo' || profile.id === 'demo-army_rescue-id')) ||
    (profile.role === 'NGO' && (caseObj.created_by === 'ngo-demo' || reportObj.reporter_id === 'ngo-demo' || profile.id === 'demo-ngo-id'));

  if (isOwner) return true;

  // Operational roles can view operational field cases
  if (
    (profile.role === 'NGO' || profile.role === 'ARMY_RESCUE') &&
    (caseObj.case_type === 'FOUND' || caseObj.status === 'POSSIBLE_MATCH' || caseObj.status === 'VERIFIED_MATCH')
  ) {
    return true;
  }

  // Hospital can view unidentified intakes and hospital referrals
  if (profile.role === 'HOSPITAL' && reportObj.source_type === 'HOSPITAL') {
    return true;
  }

  // Public/verified reunions are viewable across roles for public notification
  if (caseObj.status === 'VERIFIED_MATCH') {
    return true;
  }

  // Public cases are viewable for users with VIEW_PUBLIC_CASE permission
  if (hasPermission(profile.role, 'VIEW_PUBLIC_CASE')) {
    return true;
  }

  return false;
}

/**
 * Field-level authorization checks
 */
export function canViewField(
  role: UserRole | undefined | null,
  fieldName: 'medical' | 'contact' | 'score' | 'internal_notes',
  isOwner = false
): boolean {
  if (!role) return false;
  if (role === 'ADMIN' || role === 'REVIEWER') return true;

  switch (fieldName) {
    case 'medical':
      return role === 'HOSPITAL' || hasPermission(role, 'VIEW_MEDICAL_DETAILS');
    case 'contact':
      return isOwner || role === 'NGO' || hasPermission(role, 'VIEW_CONTACT_DETAILS');
    case 'score':
      return hasPermission(role, 'VIEW_MATCH_SCORE');
    case 'internal_notes':
      return role !== 'FAMILY' && role !== 'VOLUNTEER';
    default:
      return false;
  }
}

/**
 * Sanitizes a FullCaseData instance, stripping or redacting sensitive fields
 * for roles that do not possess required visibility permissions.
 */
export function sanitizeCaseForUser(fullCase: FullCaseData, profile: Profile | null): FullCaseData {
  if (!profile) return fullCase;

  // Admin & Reviewer receive unsanitized operational record
  if (profile.role === 'ADMIN' || profile.role === 'REVIEWER') {
    return fullCase;
  }

  const role = profile.role;
  const isOwner =
    (fullCase.case.created_by && (fullCase.case.created_by === profile.id || fullCase.case.created_by === profile.auth_user_id)) ||
    (fullCase.report.reporter_id && (fullCase.report.reporter_id === profile.id || fullCase.report.reporter_id === profile.auth_user_id)) ||
    (role === 'FAMILY' && (fullCase.case.created_by === 'family-demo' || fullCase.report.reporter_id === 'family-demo' || (profile.id === 'demo-family-id' && fullCase.case.id === 'case-demo-1')));

  const sanitized: FullCaseData = {
    ...fullCase,
    report: { ...fullCase.report },
    attributes: { ...fullCase.attributes },
  };

  // Mask clinical trauma notes if not Hospital or Admin
  if (role !== 'HOSPITAL') {
    if (sanitized.attributes.condition_status && !isOwner) {
      sanitized.attributes.condition_status = '[Protected Medical Data — Available to Treating Physician]';
    }
    if (sanitized.report.referral_info && !isOwner && role === 'FAMILY') {
      sanitized.report.referral_info = null;
    }
  }

  // Family members should not see raw tactical/operational dispatch notes
  if (role === 'FAMILY' && !isOwner) {
    if (sanitized.report.report_notes) {
      sanitized.report.report_notes = '[Operational dispatch notes held by relief coordinator]';
    }
  }

  return sanitized;
}
