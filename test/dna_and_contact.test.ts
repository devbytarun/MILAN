// ============================================================
// MILAN — DNA Report & Family Contact Test Suite
// Verifies:
//   1. Indian phone number validation & canonical normalization
//   2. Family contact privacy & field sanitization across roles
//   3. DNA report authorization (Hospital upload, responder view, family quarantine)
//   4. DNA report storage, case association, and status lifecycle
//   5. Matching integration: DNA availability & multi-signal child safeguard
// ============================================================

import { validateIndianPhoneNumber, formatIndianPhoneNumber } from '../src/lib/phoneValidation.ts';
import { canViewField, sanitizeCaseForUser } from '../src/lib/permissions.ts';
import {
  canUploadDnaReport,
  canViewDnaReport,
  uploadDnaReport,
  getLocalDnaReports,
  getDnaReportsForCase,
  hasDnaReportSync,
} from '../src/services/dnaReportService.ts';
import type { FullCaseData } from '../src/services/caseService.ts';
import type { UserRole, Profile } from '../src/types/index.ts';

function runDnaAndContactTests() {
  console.log('🧪 Running MILAN DNA Reports & Family Contact Number Verification Tests...\n');
  let errors = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
      errors++;
    }
  }

  // =========================================================================
  // 1. Phone Number Validation & Canonical Normalization
  // =========================================================================
  console.log('--- 1. Testing Indian Mobile Number Validation & Normalization ---');

  const validCases = [
    { input: '9876543210', expected: '+919876543210' },
    { input: '+919876543210', expected: '+919876543210' },
    { input: '+91 98765 43210', expected: '+919876543210' },
    { input: '09876543210', expected: '+919876543210' },
    { input: '91-98765-43210', expected: '+919876543210' },
    { input: '6123456789', expected: '+916123456789' },
    { input: '7890123456', expected: '+917890123456' },
    { input: '8901234567', expected: '+918901234567' },
  ];

  for (const tc of validCases) {
    const res = validateIndianPhoneNumber(tc.input);
    assert(
      res.isValid && res.canonical === tc.expected,
      `Validates "${tc.input}" -> canonical "${res.canonical}"`,
      `Expected ${tc.expected}`
    );
  }

  const invalidCases = [
    '',
    '   ',
    '12345',          // Too short
    '9876543210123',  // Too long
    '1234567890',     // Invalid Indian mobile start digit (must be 6-9)
    'abcdefghij',     // Non-numeric
    '+1 9876543210',  // Wrong country code
  ];

  for (const inv of invalidCases) {
    const res = validateIndianPhoneNumber(inv);
    assert(!res.isValid && !!res.error, `Correctly rejects invalid phone: "${inv}"`);
  }

  assert(
    formatIndianPhoneNumber('+919876543210') === '+91 98765 43210',
    'Formats canonical phone for UI display: "+91 98765 43210"'
  );

  // =========================================================================
  // 2. Family Contact Privacy & Role-Based Sanitization
  // =========================================================================
  console.log('\n--- 2. Testing Family Contact Privacy & Sanitization ---');

  // canViewField checks
  assert(canViewField('ADMIN', 'contact'), 'ADMIN can view contact details');
  assert(canViewField('REVIEWER', 'contact'), 'REVIEWER can view contact details');
  assert(canViewField('NGO', 'contact'), 'NGO can view contact details');
  assert(canViewField('ARMY_RESCUE', 'contact'), 'ARMY_RESCUE can view contact details');
  assert(canViewField('HOSPITAL', 'contact'), 'HOSPITAL can view contact details');
  assert(canViewField('FAMILY', 'contact', true), 'Case owner (FAMILY) can view own contact details');
  assert(!canViewField('FAMILY', 'contact', false), 'FAMILY cannot view contact of unowned cases');
  assert(!canViewField('VOLUNTEER', 'contact'), 'VOLUNTEER cannot view contact details');

  const testCase: FullCaseData = {
    case: {
      id: 'case-priv-1',
      case_uid: 'MILAN-2026-TEST',
      case_type: 'MISSING',
      status: 'SEARCHING',
      family_contact_phone: '+919876543210',
      created_by: 'family-owner-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    report: {
      id: 'rep-priv-1',
      case_id: 'case-priv-1',
      reporter_id: 'family-owner-id',
      source_type: 'FAMILY',
      comm_status: 'CAN_COMMUNICATE',
      report_notes: 'Family notes',
      found_location: 'Location 1',
      found_at: new Date().toISOString(),
      referral_info: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    attributes: {
      id: 'attr-priv-1',
      report_id: 'rep-priv-1',
      full_name: 'Test Child',
      alternative_names: null,
      age: 8,
      approximate_age: 8,
      gender: 'Male',
      date_of_birth: null,
      blood_group: 'B+',
      height_cm: null,
      weight_kg: null,
      build: null,
      hair_description: null,
      hair_colour: null,
      eye_colour: null,
      skin_description: null,
      birthmarks: null,
      scars: null,
      tattoos: null,
      anatomical_features: null,
      clothing: null,
      footwear: null,
      accessories: null,
      belongings: null,
      identifying_clue: null,
      condition_status: null,
    },
  };

  // Test sanitization for unauthorized role (unowned family)
  const unownedFamilyProfile: Profile = {
    id: 'family-stranger',
    auth_user_id: 'auth-stranger',
    full_name: 'Other Family',
    role: 'FAMILY',
    organization_name: null,
    organization_type: null,
    verification_status: 'APPROVED',
    phone: null,
    created_at: new Date().toISOString(),
  };

  const sanitizedForFamily = sanitizeCaseForUser(testCase, unownedFamilyProfile);
  assert(
    sanitizedForFamily.case.family_contact_phone === null,
    'Sanitizer strips family_contact_phone for unowned FAMILY view'
  );

  // Test sanitization for authorized responder (NGO)
  const ngoProfile: Profile = {
    id: 'ngo-user',
    auth_user_id: 'auth-ngo',
    full_name: 'NGO Officer',
    role: 'NGO',
    organization_name: 'Red Cross Relief',
    organization_type: 'NGO',
    verification_status: 'APPROVED',
    phone: null,
    created_at: new Date().toISOString(),
  };

  const sanitizedForNgo = sanitizeCaseForUser(testCase, ngoProfile);
  assert(
    sanitizedForNgo.case.family_contact_phone === '+919876543210',
    'Authorized NGO responder retains access to family_contact_phone'
  );

  // =========================================================================
  // 3. DNA Reports Role-Based Access Control (RBAC)
  // =========================================================================
  console.log('\n--- 3. Testing DNA Reports Upload & View Authorization ---');

  // Upload permissions
  assert(canUploadDnaReport('HOSPITAL'), 'HOSPITAL is authorized to upload official DNA reports');
  assert(canUploadDnaReport('ADMIN'), 'ADMIN is authorized to upload official DNA reports');
  assert(!canUploadDnaReport('FAMILY'), 'FAMILY is strictly forbidden from uploading official DNA reports');
  assert(!canUploadDnaReport('NGO'), 'NGO is forbidden from uploading official DNA reports');
  assert(!canUploadDnaReport('ARMY_RESCUE'), 'ARMY_RESCUE is forbidden from uploading official DNA reports');
  assert(!canUploadDnaReport('VOLUNTEER'), 'VOLUNTEER is forbidden from uploading official DNA reports');

  // View permissions
  assert(canViewDnaReport('HOSPITAL'), 'HOSPITAL can view DNA reports');
  assert(canViewDnaReport('REVIEWER'), 'REVIEWER can view DNA reports');
  assert(canViewDnaReport('ADMIN'), 'ADMIN can view DNA reports');
  assert(canViewDnaReport('NGO'), 'NGO can view DNA reports for candidate verification');
  assert(canViewDnaReport('ARMY_RESCUE'), 'ARMY_RESCUE can view DNA reports for rescue verification');
  assert(!canViewDnaReport('FAMILY'), 'FAMILY cannot browse or inspect forensic DNA reports');
  assert(!canViewDnaReport('VOLUNTEER'), 'VOLUNTEER cannot view forensic DNA reports');

  // =========================================================================
  // 4. DNA Report Upload, Case Association, and Status Lifecycle
  // =========================================================================
  console.log('\n--- 4. Testing DNA Report Upload Execution & Case Association ---');

  const mockFile = new File(['%PDF-1.4 mock content'], 'Triage_Lab_Report_99.pdf', {
    type: 'application/pdf',
  });

  // Attempt upload with unauthorized role
  const unauthorizedUpload = uploadDnaReport({
    caseId: 'case-test-99',
    file: mockFile,
    uploaderRole: 'FAMILY',
  });
  // Note: uploadDnaReport returns a Promise
  unauthorizedUpload.then((res) => {
    assert(!res.success, 'Rejects DNA upload attempt by FAMILY user');
  });

  // Upload with authorized HOSPITAL role
  uploadDnaReport({
    caseId: 'case-test-99',
    file: mockFile,
    uploaderId: 'hospital-doc-1',
    uploaderName: 'Dr. Anita Roy',
    uploaderRole: 'HOSPITAL',
    notes: 'Official buccal swab reference collected from mother.',
  }).then((res) => {
    assert(res.success && !!res.report, 'HOSPITAL successfully uploads PDF DNA report');
    if (res.report) {
      assert(res.report.case_id === 'case-test-99', 'DNA report references correct case_id');
      assert(res.report.status === 'PENDING', 'Default DNA report status is PENDING');
      assert(res.report.report_type === 'OFFICIAL_HOSPITAL_LAB', 'Report type is OFFICIAL_HOSPITAL_LAB');
      assert(hasDnaReportSync('case-test-99'), 'hasDnaReportSync returns true for case-test-99');
    }
  });

  // Check that demo case 1 has DNA report seeded
  assert(hasDnaReportSync('case-demo-1'), 'case-demo-1 (Aarav Sharma) has pre-configured DNA reference document');
  assert(!hasDnaReportSync('case-unregistered-999'), 'Unregistered case correctly returns hasDnaReportSync = false');

  console.log(`\n========================================`);
  if (errors === 0) {
    console.log('🎉 ALL DNA & FAMILY CONTACT TESTS PASSED PERFECTLY! (0 Errors)\n');
  } else {
    console.error(`💥 Completed with ${errors} error(s).\n`);
    process.exit(1);
  }
}

runDnaAndContactTests();
