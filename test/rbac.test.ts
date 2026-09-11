import {
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessRoute,
  canViewCase,
  canViewField,
  sanitizeCaseForUser,
  Permission,
} from '../src/lib/permissions.ts';
import type { UserRole, Profile } from '../src/types/index.ts';
import { INITIAL_DEMO_CASES, FullCaseData } from '../services/caseService.ts';

function runRBACTests() {
  console.log('🔒 Running MILAN Role-Based Access Control (RBAC) Verification Tests...\n');

  let totalErrors = 0;

  function assert(condition: boolean, testName: string, errorDetail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
    } else {
      console.error(`  ❌ FAIL: ${testName}${errorDetail ? ` — ${errorDetail}` : ''}`);
      totalErrors++;
    }
  }

  // =========================================================================
  // 1. Role Registry & Permissions Verification
  // =========================================================================
  console.log('--- 1. Testing Role Definitions & Critical Permission Boundaries ---');

  const allRoles: UserRole[] = [
    'FAMILY',
    'NGO',
    'ARMY_RESCUE',
    'HOSPITAL',
    'REVIEWER',
    'ADMIN',
    'VOLUNTEER',
  ];

  for (const role of allRoles) {
    assert(
      !!ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].size > 0,
      `Role "${role}" is registered with active permissions (${ROLE_PERMISSIONS[role]?.size} perms)`
    );
  }

  // =========================================================================
  // 2. Family Role Quarantine (Zero Forensic or Operational Leaks)
  // =========================================================================
  console.log('\n--- 2. Testing Strict Quarantine for FAMILY Role ---');

  const forbiddenForFamily: Permission[] = [
    'VIEW_FORENSIC_DOSSIER',
    'VIEW_MATCH_SCORE',
    'VIEW_EVIDENCE_MATRIX',
    'VIEW_CONFLICTS',
    'VIEW_INTERNAL_ALERTS',
    'REVIEW_MATCH',
    'APPROVE_MATCH',
    'REJECT_MATCH',
    'OVERRIDE_MATCH',
    'CREATE_FOUND_REPORT',
    'CREATE_HOSPITAL_REPORT',
    'USE_VOICE_AI',
    'MANAGE_USERS',
    'MANAGE_CASES',
    'VIEW_AUDIT_LOGS',
  ];

  for (const perm of forbiddenForFamily) {
    assert(
      !hasPermission('FAMILY', perm),
      `FAMILY does NOT possess permission: ${perm}`
    );
  }

  assert(hasPermission('FAMILY', 'CREATE_MISSING_REPORT'), 'FAMILY can CREATE_MISSING_REPORT');
  assert(hasPermission('FAMILY', 'VIEW_PUBLIC_CASE'), 'FAMILY can VIEW_PUBLIC_CASE');
  assert(hasPermission('FAMILY', 'VIEW_FAMILY_DASHBOARD'), 'FAMILY can VIEW_FAMILY_DASHBOARD');

  // =========================================================================
  // 3. Reviewer & Admin Authority Verification
  // =========================================================================
  console.log('\n--- 3. Testing REVIEWER and ADMIN Elevated Permissions ---');

  const reviewerRequired: Permission[] = [
    'VIEW_FORENSIC_DOSSIER',
    'VIEW_MATCH_SCORE',
    'VIEW_EVIDENCE_MATRIX',
    'VIEW_CONFLICTS',
    'VIEW_INTERNAL_ALERTS',
    'REVIEW_MATCH',
    'APPROVE_MATCH',
    'REJECT_MATCH',
  ];

  for (const perm of reviewerRequired) {
    assert(
      hasPermission('REVIEWER', perm),
      `REVIEWER possesses permission: ${perm}`
    );
    assert(
      hasPermission('ADMIN', perm),
      `ADMIN possesses permission: ${perm}`
    );
  }

  // =========================================================================
  // 4. Route Access Control (canAccessRoute)
  // =========================================================================
  console.log('\n--- 4. Testing Route Access Gate (canAccessRoute) ---');

  // FAMILY route tests
  assert(!canAccessRoute('FAMILY', '/dossier'), 'FAMILY route blocked: /dossier');
  assert(!canAccessRoute('FAMILY', '/dossier/case-demo-1/case-demo-2'), 'FAMILY route blocked: /dossier/:sourceId/:candidateId');
  assert(!canAccessRoute('FAMILY', '/review'), 'FAMILY route blocked: /review');
  assert(!canAccessRoute('FAMILY', '/report/found'), 'FAMILY route blocked: /report/found');
  assert(!canAccessRoute('FAMILY', '/report/hospital'), 'FAMILY route blocked: /report/hospital');
  assert(!canAccessRoute('FAMILY', '/report/voice'), 'FAMILY route blocked: /report/voice');
  assert(canAccessRoute('FAMILY', '/cases'), 'FAMILY route allowed: /cases');
  assert(canAccessRoute('FAMILY', '/dashboard'), 'FAMILY route allowed: /dashboard');
  assert(canAccessRoute('FAMILY', '/report/missing'), 'FAMILY route allowed: /report/missing');

  // REVIEWER route tests
  assert(canAccessRoute('REVIEWER', '/dossier'), 'REVIEWER route allowed: /dossier');
  assert(canAccessRoute('REVIEWER', '/review'), 'REVIEWER route allowed: /review');
  assert(!canAccessRoute('REVIEWER', '/report/found'), 'REVIEWER route blocked: /report/found');
  assert(!canAccessRoute('REVIEWER', '/report/hospital'), 'REVIEWER route blocked: /report/hospital');

  // HOSPITAL route tests
  assert(canAccessRoute('HOSPITAL', '/report/hospital'), 'HOSPITAL route allowed: /report/hospital');
  assert(!canAccessRoute('HOSPITAL', '/dossier'), 'HOSPITAL route blocked: /dossier');
  assert(!canAccessRoute('HOSPITAL', '/review'), 'HOSPITAL route blocked: /review');

  // ARMY_RESCUE & NGO route tests
  assert(canAccessRoute('ARMY_RESCUE', '/report/found'), 'ARMY_RESCUE route allowed: /report/found');
  assert(canAccessRoute('NGO', '/report/found'), 'NGO route allowed: /report/found');
  assert(!canAccessRoute('ARMY_RESCUE', '/dossier'), 'ARMY_RESCUE route blocked: /dossier');

  // ADMIN route tests
  assert(canAccessRoute('ADMIN', '/dossier'), 'ADMIN route allowed: /dossier');
  assert(canAccessRoute('ADMIN', '/review'), 'ADMIN route allowed: /review');
  assert(canAccessRoute('ADMIN', '/report/missing'), 'ADMIN route allowed: /report/missing');
  assert(canAccessRoute('ADMIN', '/report/found'), 'ADMIN route allowed: /report/found');
  assert(canAccessRoute('ADMIN', '/report/hospital'), 'ADMIN route allowed: /report/hospital');

  // =========================================================================
  // 5. Field-Level Permission Testing (canViewField)
  // =========================================================================
  console.log('\n--- 5. Testing Field-Level Visibility Controls ---');

  assert(!canViewField('FAMILY', 'score'), 'FAMILY cannot view match score');
  assert(canViewField('REVIEWER', 'score'), 'REVIEWER can view match score');
  assert(canViewField('ADMIN', 'score'), 'ADMIN can view match score');

  assert(!canViewField('FAMILY', 'medical', false), 'FAMILY cannot view medical details of unowned case');
  assert(canViewField('HOSPITAL', 'medical'), 'HOSPITAL can view medical details');

  assert(!canViewField('FAMILY', 'internal_notes'), 'FAMILY cannot view internal dispatcher notes');
  assert(canViewField('ARMY_RESCUE', 'internal_notes'), 'ARMY_RESCUE can view internal notes');

  // =========================================================================
  // 6. Case Sanitization & Protection (sanitizeCaseForUser)
  // =========================================================================
  console.log('\n--- 6. Testing Case Data Sanitization (Data Leak Prevention) ---');

  const mockCaseWithSensitiveData: FullCaseData = {
    case: {
      id: 'case-test-1',
      case_uid: 'MILAN-TEST-001',
      case_type: 'FOUND',
      status: 'SEARCHING',
      created_by: 'army-demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    report: {
      id: 'rep-test-1',
      case_id: 'case-test-1',
      reporter_id: 'army-demo',
      source_type: 'ARMY_RESCUE',
      comm_status: 'CANNOT_COMMUNICATE',
      report_notes: 'CONFIDENTIAL: Tactical field dispatch notes for NDRF team 4.',
      found_location: 'Sector 4',
      found_at: new Date().toISOString(),
      referral_info: 'Army Ambulance Dispatch #4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    attributes: {
      id: 'attr-test-1',
      report_id: 'rep-test-1',
      full_name: 'Unidentified Patient',
      alternative_names: null,
      age: null,
      approximate_age: 30,
      gender: 'Male',
      date_of_birth: null,
      blood_group: 'O+',
      height_cm: 175,
      weight_kg: 70,
      build: 'Athletic',
      hair_description: 'Black hair',
      hair_colour: 'Black',
      eye_colour: 'Brown',
      skin_description: 'Wheatish',
      birthmarks: null,
      scars: 'Surgical mark',
      tattoos: null,
      anatomical_features: null,
      clothing: 'Blue shirt',
      footwear: null,
      accessories: null,
      belongings: null,
      identifying_clue: 'Surgical mark',
      condition_status: 'CONFIDENTIAL MEDICAL: Severe intracranial hemorrhage and fracture',
    },
  };

  const familyProfile: Profile = {
    id: 'user-family-123',
    auth_user_id: 'auth-family-123',
    full_name: 'Anita Sharma',
    role: 'FAMILY',
    organization_name: null,
    organization_type: null,
    verification_status: 'APPROVED',
    phone: null,
    created_at: new Date().toISOString(),
  };

  const sanitizedForFamily = sanitizeCaseForUser(mockCaseWithSensitiveData, familyProfile);

  assert(
    sanitizedForFamily.report.report_notes !== mockCaseWithSensitiveData.report.report_notes,
    'Confidential report_notes is masked for unowned FAMILY view'
  );
  assert(
    sanitizedForFamily.attributes.condition_status !== mockCaseWithSensitiveData.attributes.condition_status,
    'Clinical trauma notes condition_status is protected for FAMILY view'
  );

  const reviewerProfile: Profile = {
    id: 'user-reviewer-123',
    auth_user_id: 'auth-reviewer-123',
    full_name: 'Kavita Nair',
    role: 'REVIEWER',
    organization_name: 'Disaster Cell',
    organization_type: null,
    verification_status: 'APPROVED',
    phone: null,
    created_at: new Date().toISOString(),
  };

  const unsanitizedForReviewer = sanitizeCaseForUser(mockCaseWithSensitiveData, reviewerProfile);
  assert(
    unsanitizedForReviewer.report.report_notes === mockCaseWithSensitiveData.report.report_notes,
    'Reviewer retains access to operational report_notes'
  );
  assert(
    unsanitizedForReviewer.attributes.condition_status === mockCaseWithSensitiveData.attributes.condition_status,
    'Reviewer retains access to full physical condition notes'
  );

  // =========================================================================
  // Final Result
  // =========================================================================
  console.log('\n=============================================================');
  if (totalErrors === 0) {
    console.log('🎉 ALL RBAC VERIFICATION TESTS PASSED SUCCESSFULLY! (0 Errors)');
    console.log('=============================================================\n');
    process.exit(0);
  } else {
    console.error(`💥 RBAC TESTS FAILED WITH ${totalErrors} ERROR(S)`);
    console.log('=============================================================\n');
    process.exit(1);
  }
}

runRBACTests();
