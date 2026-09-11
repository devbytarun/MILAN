-- ============================================================
-- MILAN — Demo Seed Data
-- B23: Demo Scenario 1 — Veer Kumar (Named Person)
-- B24: Demo Scenario 2 — Unnamed Child (Cannot Communicate)
-- B25: Demo Accounts for all roles
-- Reference: implementation_plan.md Section 34
-- ============================================================

-- Clean existing data (in dependency order)
DELETE FROM verification_actions;
DELETE FROM match_candidates;
DELETE FROM status_history;
DELETE FROM media;
DELETE FROM person_attributes;
DELETE FROM reports;
DELETE FROM cases;
DELETE FROM profiles WHERE auth_user_id LIKE '00000000-%';

-- ============================================================
-- DEMO PROFILES
-- ============================================================

-- 1. Family (Veer's sister)
INSERT INTO profiles (id, auth_user_id, full_name, role, organization_name, organization_type, verification_status, phone)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  '00000000-0000-0000-0000-000000000001',
  'Priya Kumar',
  'FAMILY',
  NULL,
  NULL,
  'APPROVED',
  '+91 98765 43210'
);

-- 2. Family 2 (Ananya's father)
INSERT INTO profiles (id, auth_user_id, full_name, role, organization_name, organization_type, verification_status, phone)
VALUES (
  '11111111-1111-1111-1111-111111111102',
  '00000000-0000-0000-0000-000000000002',
  'Ravi Sharma',
  'FAMILY',
  NULL,
  NULL,
  'APPROVED',
  '+91 98765 43211'
);

-- 3. NGO (Red Cross Volunteer)
INSERT INTO profiles (id, auth_user_id, full_name, role, organization_name, organization_type, verification_status, phone)
VALUES (
  '11111111-1111-1111-1111-111111111103',
  '00000000-0000-0000-0000-000000000003',
  'Sunil Rawat',
  'NGO',
  'Red Cross Relief Camp Bhimtal',
  'NGO',
  'APPROVED',
  '+91 98765 43212'
);

-- 4. Army / Rescue
INSERT INTO profiles (id, auth_user_id, full_name, role, organization_name, organization_type, verification_status, phone)
VALUES (
  '11111111-1111-1111-1111-111111111104',
  '00000000-0000-0000-0000-000000000004',
  'Lt. Col. Vikram Joshi',
  'ARMY_RESCUE',
  'Indian Army 4th Battalion Rescue',
  'MILITARY',
  'APPROVED',
  '+91 98765 43213'
);

-- 5. Hospital
INSERT INTO profiles (id, auth_user_id, full_name, role, organization_name, organization_type, verification_status, phone)
VALUES (
  '11111111-1111-1111-1111-111111111105',
  '00000000-0000-0000-0000-000000000005',
  'Dr. Anjali Mehta',
  'HOSPITAL',
  'District Hospital Bhimtal',
  'HOSPITAL',
  'APPROVED',
  '+91 98765 43214'
);

-- 6. Reviewer
INSERT INTO profiles (id, auth_user_id, full_name, role, organization_name, organization_type, verification_status, phone)
VALUES (
  '11111111-1111-1111-1111-111111111106',
  '00000000-0000-0000-0000-000000000006',
  'Rajesh Thapa',
  'REVIEWER',
  'Disaster Management Authority',
  'GOVERNMENT',
  'APPROVED',
  '+91 98765 43215'
);

-- 7. Admin
INSERT INTO profiles (id, auth_user_id, full_name, role, organization_name, organization_type, verification_status, phone)
VALUES (
  '11111111-1111-1111-1111-111111111107',
  '00000000-0000-0000-0000-000000000007',
  'Milan Administrator',
  'ADMIN',
  'Milan Coordination System',
  'ADMIN',
  'APPROVED',
  '+91 98765 43216'
);


-- ============================================================
-- DEMO SCENARIO 1: VEER KUMAR
-- ============================================================

-- Case 1: MISSING — Veer Kumar (filed by Priya Kumar)
INSERT INTO cases (id, case_uid, case_type, status, created_by, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  'MILAN-0001',
  'MISSING',
  'POSSIBLE_MATCH',
  '11111111-1111-1111-1111-111111111101',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
);

-- Report 1: Family Missing Report for Veer
INSERT INTO reports (id, case_id, reporter_id, source_type, comm_status, report_notes, found_location, found_at, referral_info, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333301',
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  'FAMILY',
  'CAN_COMMUNICATE',
  'Veer went on a trek towards Mukteshwar before flash floods struck the Nainital region.',
  'Nainital, Uttarakhand',
  NOW() - INTERVAL '3 days',
  NULL,
  NOW() - INTERVAL '2 days'
);

-- Person Attributes for Veer (Family Report)
INSERT INTO person_attributes (
  report_id, full_name, alternative_names, age, approximate_age,
  gender, date_of_birth, blood_group, height_cm, weight_kg,
  build, hair_description, hair_colour, eye_colour, skin_description,
  birthmarks, scars, tattoos, anatomical_features,
  clothing, footwear, accessories, belongings,
  identifying_clue, condition_status
) VALUES (
  '33333333-3333-3333-3333-333333333301',
  'Veer Kumar',
  'Vir, Bir Kumar',
  28,
  NULL,
  'Male',
  NULL,
  'B+',
  175,
  72,
  'Medium',
  'Short black hair',
  'Black',
  'Brown',
  'Wheatish',
  'Small birthmark on left forearm',
  'Scar above right eyebrow from childhood',
  NULL,
  NULL,
  'Blue denim jacket, grey hiking pants, brown boots',
  'Brown trekking boots',
  'Silver ring on right hand',
  'Black backpack, red water bottle',
  'Distinctive scar above right eyebrow, always wears a silver ring on right hand',
  NULL
);

-- Case 2: FOUND — Bir Kumar (filed by NGO)
INSERT INTO cases (id, case_uid, case_type, status, created_by, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  'MILAN-0002',
  'FOUND',
  'UNDER_REVIEW',
  '11111111-1111-1111-1111-111111111103',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '12 hours'
);

-- Report 2: NGO Found Report for Bir Kumar
INSERT INTO reports (id, case_id, reporter_id, source_type, comm_status, report_notes, found_location, found_at, referral_info, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333302',
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111103',
  'NGO',
  'CAN_COMMUNICATE',
  'Rescued from flooded trail near Bhimtal. Mild disorientation, self-reported name as Bir Kumar.',
  'Bhimtal relief camp, Uttarakhand',
  NOW() - INTERVAL '2 days',
  'Referred to District Hospital Bhimtal for medical checkup',
  NOW() - INTERVAL '1 day'
);

-- Person Attributes for Bir Kumar (NGO Report)
INSERT INTO person_attributes (
  report_id, full_name, alternative_names, age, approximate_age,
  gender, date_of_birth, blood_group, height_cm, weight_kg,
  build, hair_description, hair_colour, eye_colour, skin_description,
  birthmarks, scars, tattoos, anatomical_features,
  clothing, footwear, accessories, belongings,
  identifying_clue, condition_status
) VALUES (
  '33333333-3333-3333-3333-333333333302',
  'Bir Kumar',
  NULL,
  27,
  NULL,
  'Male',
  NULL,
  NULL,
  174,
  NULL,
  'Medium',
  'Short dark hair',
  'Dark',
  'Brown',
  NULL,
  NULL,
  'Visible scar near right eyebrow',
  NULL,
  NULL,
  'Blue jacket, grey pants, muddy boots',
  'Muddy boots',
  NULL,
  NULL,
  NULL,
  'Dehydrated, stable'
);

-- Report 3: Hospital Intake Report linked to MILAN-0001
INSERT INTO reports (id, case_id, reporter_id, source_type, comm_status, report_notes, found_location, found_at, referral_info, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333303',
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111105',
  'HOSPITAL',
  'CAN_COMMUNICATE',
  'Patient admitted from Bhimtal relief camp. Reference BH-2024-1842. Minor dehydration, stable condition.',
  'District Hospital Bhimtal',
  NOW() - INTERVAL '18 hours',
  'Referred from Red Cross Relief Camp Bhimtal',
  NOW() - INTERVAL '16 hours'
);

-- Person Attributes for Hospital Report (medical data)
INSERT INTO person_attributes (
  report_id, full_name, alternative_names, age, approximate_age,
  gender, date_of_birth, blood_group, height_cm, weight_kg,
  build, hair_description, hair_colour, eye_colour, skin_description,
  birthmarks, scars, tattoos, anatomical_features,
  clothing, footwear, accessories, belongings,
  identifying_clue, condition_status
) VALUES (
  '33333333-3333-3333-3333-333333333303',
  'Bir Kumar',
  NULL,
  28,
  NULL,
  'Male',
  NULL,
  'B+',
  175,
  70,
  'Medium',
  'Short black hair',
  NULL,
  'Brown',
  NULL,
  NULL,
  'Scar above right eyebrow noted during physical examination',
  NULL,
  'Small laceration on forehead',
  'Hospital gown',
  NULL,
  NULL,
  NULL,
  NULL,
  'Stable'
);


-- ============================================================
-- DEMO SCENARIO 2: UNNAMED CHILD
-- ============================================================

-- Case 3: MISSING — Ananya Sharma (filed by Ravi Sharma)
INSERT INTO cases (id, case_uid, case_type, status, created_by, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222203',
  'MILAN-0003',
  'MISSING',
  'POSSIBLE_MATCH',
  '11111111-1111-1111-1111-111111111102',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '6 hours'
);

-- Report 4: Family Missing Report for Ananya
INSERT INTO reports (id, case_id, reporter_id, source_type, comm_status, report_notes, found_location, found_at, referral_info, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333304',
  '22222222-2222-2222-2222-222222222203',
  '11111111-1111-1111-1111-111111111102',
  'FAMILY',
  'CANNOT_COMMUNICATE',
  'Separated during sudden water surge in Haldwani market area.',
  'Haldwani market area, Uttarakhand',
  NOW() - INTERVAL '1 day',
  NULL,
  NOW() - INTERVAL '1 day'
);

-- Person Attributes for Ananya
INSERT INTO person_attributes (
  report_id, full_name, alternative_names, age, approximate_age,
  gender, date_of_birth, blood_group, height_cm, weight_kg,
  build, hair_description, hair_colour, eye_colour, skin_description,
  birthmarks, scars, tattoos, anatomical_features,
  clothing, footwear, accessories, belongings,
  identifying_clue, condition_status
) VALUES (
  '33333333-3333-3333-3333-333333333304',
  'Ananya Sharma',
  NULL,
  5,
  NULL,
  'Female',
  NULL,
  'O+',
  105,
  18,
  'Child',
  'Long black hair with two braids',
  'Black',
  'Dark brown',
  'Fair',
  'Heart-shaped birthmark on right shoulder',
  NULL,
  NULL,
  NULL,
  'Pink kurta with white flowers, blue jeans, white shoes',
  'White shoes',
  NULL,
  'Small teddy bear keychain on bag',
  'Heart-shaped birthmark on right shoulder, always carries a teddy bear keychain',
  NULL
);

-- Case 4: FOUND — Unnamed Child (filed by Army)
INSERT INTO cases (id, case_uid, case_type, status, created_by, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222204',
  'MILAN-0004',
  'FOUND',
  'UNDER_REVIEW',
  '11111111-1111-1111-1111-111111111104',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '4 hours'
);

-- Report 5: Army Found Report for Unnamed Child
INSERT INTO reports (id, case_id, reporter_id, source_type, comm_status, report_notes, found_location, found_at, referral_info, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333305',
  '22222222-2222-2222-2222-222222222204',
  '11111111-1111-1111-1111-111111111104',
  'ARMY_RESCUE',
  'CANNOT_COMMUNICATE',
  'Found alone near flooded bypass road. Child is disoriented, unable to speak due to shock/trauma. No identification documents.',
  'Army rescue camp, Haldwani bypass',
  NOW() - INTERVAL '14 hours',
  'Safe at army temporary shelter',
  NOW() - INTERVAL '12 hours'
);

-- Person Attributes for Unnamed Child (No Name, CANNOT_COMMUNICATE)
INSERT INTO person_attributes (
  report_id, full_name, alternative_names, age, approximate_age,
  gender, date_of_birth, blood_group, height_cm, weight_kg,
  build, hair_description, hair_colour, eye_colour, skin_description,
  birthmarks, scars, tattoos, anatomical_features,
  clothing, footwear, accessories, belongings,
  identifying_clue, condition_status
) VALUES (
  '33333333-3333-3333-3333-333333333305',
  NULL, -- UNKNOWN NAME
  NULL,
  NULL,
  4, -- Approximate age
  'Female',
  NULL,
  NULL,
  NULL,
  NULL,
  'Child',
  'Long dark hair, braided',
  'Dark',
  'Brown',
  'Fair',
  'Heart-shaped mark on right shoulder area',
  NULL,
  NULL,
  NULL,
  'Pink top with flower pattern, blue jeans, no shoes',
  'No shoes',
  NULL,
  'Small stuffed animal charm',
  'Distinctive heart mark on right shoulder',
  'Healthy, non-communicative due to shock'
);


-- ============================================================
-- PRE-COMPUTED MATCH CANDIDATES
-- ============================================================

-- Match 1: Veer Kumar (MILAN-0001) <-> Bir Kumar (MILAN-0002)
INSERT INTO match_candidates (
  id, source_case_id, candidate_case_id, score, confidence_tier,
  matched_fields, missing_fields, conflicting_fields,
  explanation, status, created_at
) VALUES (
  '44444444-4444-4444-4444-444444444401',
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  84,
  'HIGH',
  '[
    {"field": "name", "score": 1.0, "status": "match", "weight": 15, "sourceValue": "Bir Kumar", "candidateValue": "Bir Kumar"},
    {"field": "gender", "score": 1.0, "status": "match", "weight": 20, "sourceValue": "Male", "candidateValue": "Male"},
    {"field": "age", "score": 1.0, "status": "match", "weight": 15, "sourceValue": "28", "candidateValue": "27"},
    {"field": "height", "score": 1.0, "status": "match", "weight": 5, "sourceValue": "175", "candidateValue": "174"},
    {"field": "physical_marks", "score": 0.53, "status": "partial", "weight": 15, "sourceValue": "Scar above right eyebrow", "candidateValue": "Visible scar near right eyebrow"},
    {"field": "clothing", "score": 0.70, "status": "partial", "weight": 10, "sourceValue": "Blue denim jacket, grey pants", "candidateValue": "Blue jacket, grey pants"},
    {"field": "location", "score": 0.55, "status": "partial", "weight": 10, "sourceValue": "Nainital", "candidateValue": "Bhimtal"}
  ]'::JSONB,
  '["blood_group", "weight"]'::JSONB,
  '[]'::JSONB,
  'HIGH similarity based on 7 matching attributes out of 9 compared. Data completeness: 86%.',
  'PENDING',
  NOW() - INTERVAL '12 hours'
);

-- Match 2: Ananya Sharma (MILAN-0003) <-> Unnamed Child (MILAN-0004)
INSERT INTO match_candidates (
  id, source_case_id, candidate_case_id, score, confidence_tier,
  matched_fields, missing_fields, conflicting_fields,
  explanation, status, created_at
) VALUES (
  '44444444-4444-4444-4444-444444444402',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  83,
  'HIGH',
  '[
    {"field": "gender", "score": 1.0, "status": "match", "weight": 20, "sourceValue": "Female", "candidateValue": "Female"},
    {"field": "age", "score": 1.0, "status": "match", "weight": 15, "sourceValue": "5", "candidateValue": "4"},
    {"field": "physical_marks", "score": 0.75, "status": "partial", "weight": 15, "sourceValue": "Heart-shaped birthmark on right shoulder", "candidateValue": "Heart-shaped mark on right shoulder area"},
    {"field": "clothing", "score": 0.60, "status": "partial", "weight": 10, "sourceValue": "Pink kurta with flowers, blue jeans", "candidateValue": "Pink top with flower pattern, blue jeans"},
    {"field": "location", "score": 0.62, "status": "partial", "weight": 10, "sourceValue": "Haldwani market", "candidateValue": "Haldwani bypass"}
  ]'::JSONB,
  '["name", "blood_group", "height", "weight"]'::JSONB,
  '[]'::JSONB,
  'HIGH similarity based on 4 matching attributes out of 9 compared. Data completeness: 67%.',
  'PENDING',
  NOW() - INTERVAL '4 hours'
);


-- ============================================================
-- STATUS HISTORY ENTRIES
-- ============================================================

INSERT INTO status_history (case_id, old_status, new_status, changed_by, reason, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'SUBMITTED', 'SEARCHING', '11111111-1111-1111-1111-111111111101', 'Report submitted and initial search started', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222201', 'SEARCHING', 'POSSIBLE_MATCH', '11111111-1111-1111-1111-111111111106', 'High-confidence candidate match found (Bir Kumar)', NOW() - INTERVAL '12 hours'),
  ('22222222-2222-2222-2222-222222222203', 'SUBMITTED', 'SEARCHING', '11111111-1111-1111-1111-111111111102', 'Report submitted', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222203', 'SEARCHING', 'POSSIBLE_MATCH', '11111111-1111-1111-1111-111111111106', 'High-confidence candidate match found (Unnamed Child)', NOW() - INTERVAL '4 hours');
