-- ============================================================
-- MILAN — PostgreSQL RPC Functions
-- B11: create_case_with_report()
-- B12: link_report_to_case()
-- B13: get_match_candidates()
-- B16: save_match_results()
-- B17: verify_match()
-- B18: get_case_status()
-- B19: get_pending_reviews()
-- B20: approve_user()
-- ============================================================
-- Reference: implementation_plan.md Section 24
-- ============================================================


-- ============================================================
-- B11: create_case_with_report()
-- Creates a case + report + person_attributes in one transaction.
-- Called by all reporter roles after form submission.
-- Returns the created case row (including generated case_uid).
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_case_with_report(
  p_case_type case_type,
  p_source_type source_type,
  p_comm_status communication_status DEFAULT 'CAN_COMMUNICATE',
  p_report_notes TEXT DEFAULT NULL,
  p_found_location TEXT DEFAULT NULL,
  p_found_at TIMESTAMPTZ DEFAULT NULL,
  p_referral_info TEXT DEFAULT NULL,
  -- person attributes
  p_full_name TEXT DEFAULT NULL,
  p_alternative_names TEXT DEFAULT NULL,
  p_age INTEGER DEFAULT NULL,
  p_approximate_age INTEGER DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_blood_group TEXT DEFAULT NULL,
  p_height_cm NUMERIC DEFAULT NULL,
  p_weight_kg NUMERIC DEFAULT NULL,
  p_build TEXT DEFAULT NULL,
  p_hair_description TEXT DEFAULT NULL,
  p_hair_colour TEXT DEFAULT NULL,
  p_eye_colour TEXT DEFAULT NULL,
  p_skin_description TEXT DEFAULT NULL,
  p_birthmarks TEXT DEFAULT NULL,
  p_scars TEXT DEFAULT NULL,
  p_tattoos TEXT DEFAULT NULL,
  p_anatomical_features TEXT DEFAULT NULL,
  p_clothing TEXT DEFAULT NULL,
  p_footwear TEXT DEFAULT NULL,
  p_accessories TEXT DEFAULT NULL,
  p_belongings TEXT DEFAULT NULL,
  p_identifying_clue TEXT DEFAULT NULL,
  p_condition_status TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
  _case_id UUID;
  _report_id UUID;
  _case_uid TEXT;
BEGIN
  -- Get caller's profile ID
  SELECT id INTO _profile_id
  FROM profiles
  WHERE auth_user_id = (SELECT auth.uid());

  IF _profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Create the case
  INSERT INTO cases (case_type, created_by)
  VALUES (p_case_type, _profile_id)
  RETURNING id, case_uid INTO _case_id, _case_uid;

  -- Create the report
  INSERT INTO reports (case_id, reporter_id, source_type, comm_status, report_notes, found_location, found_at, referral_info)
  VALUES (_case_id, _profile_id, p_source_type, p_comm_status, p_report_notes, p_found_location, p_found_at, p_referral_info)
  RETURNING id INTO _report_id;

  -- Create person attributes
  INSERT INTO person_attributes (
    report_id, full_name, alternative_names, age, approximate_age,
    gender, date_of_birth, blood_group, height_cm, weight_kg,
    build, hair_description, hair_colour, eye_colour, skin_description,
    birthmarks, scars, tattoos, anatomical_features,
    clothing, footwear, accessories, belongings,
    identifying_clue, condition_status
  ) VALUES (
    _report_id, p_full_name, p_alternative_names, p_age, p_approximate_age,
    p_gender, p_date_of_birth, p_blood_group, p_height_cm, p_weight_kg,
    p_build, p_hair_description, p_hair_colour, p_eye_colour, p_skin_description,
    p_birthmarks, p_scars, p_tattoos, p_anatomical_features,
    p_clothing, p_footwear, p_accessories, p_belongings,
    p_identifying_clue, p_condition_status
  );

  -- Return the created case info
  RETURN jsonb_build_object(
    'case_id', _case_id,
    'case_uid', _case_uid,
    'report_id', _report_id,
    'case_type', p_case_type,
    'status', 'SUBMITTED'
  );
END;
$$;


-- ============================================================
-- B12: link_report_to_case()
-- Links a new report to an existing case by Milan UID.
-- Used by hospitals when a patient arrives with a MILAN-XXXX ID.
-- Creates a new report under the existing case.
-- ============================================================

CREATE OR REPLACE FUNCTION public.link_report_to_case(
  p_case_uid TEXT,
  p_source_type source_type,
  p_comm_status communication_status DEFAULT 'UNKNOWN',
  p_report_notes TEXT DEFAULT NULL,
  p_found_location TEXT DEFAULT NULL,
  p_found_at TIMESTAMPTZ DEFAULT NULL,
  p_referral_info TEXT DEFAULT NULL,
  -- person attributes
  p_full_name TEXT DEFAULT NULL,
  p_alternative_names TEXT DEFAULT NULL,
  p_age INTEGER DEFAULT NULL,
  p_approximate_age INTEGER DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_blood_group TEXT DEFAULT NULL,
  p_height_cm NUMERIC DEFAULT NULL,
  p_weight_kg NUMERIC DEFAULT NULL,
  p_build TEXT DEFAULT NULL,
  p_hair_description TEXT DEFAULT NULL,
  p_hair_colour TEXT DEFAULT NULL,
  p_eye_colour TEXT DEFAULT NULL,
  p_skin_description TEXT DEFAULT NULL,
  p_birthmarks TEXT DEFAULT NULL,
  p_scars TEXT DEFAULT NULL,
  p_tattoos TEXT DEFAULT NULL,
  p_anatomical_features TEXT DEFAULT NULL,
  p_clothing TEXT DEFAULT NULL,
  p_footwear TEXT DEFAULT NULL,
  p_accessories TEXT DEFAULT NULL,
  p_belongings TEXT DEFAULT NULL,
  p_identifying_clue TEXT DEFAULT NULL,
  p_condition_status TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
  _case_id UUID;
  _report_id UUID;
BEGIN
  -- Get caller's profile ID
  SELECT id INTO _profile_id
  FROM profiles
  WHERE auth_user_id = (SELECT auth.uid());

  IF _profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Find the existing case by UID
  SELECT id INTO _case_id
  FROM cases
  WHERE case_uid = p_case_uid;

  IF _case_id IS NULL THEN
    RAISE EXCEPTION 'Case not found with UID: %', p_case_uid;
  END IF;

  -- Create the new report linked to the existing case
  INSERT INTO reports (case_id, reporter_id, source_type, comm_status, report_notes, found_location, found_at, referral_info)
  VALUES (_case_id, _profile_id, p_source_type, p_comm_status, p_report_notes, p_found_location, p_found_at, p_referral_info)
  RETURNING id INTO _report_id;

  -- Create person attributes
  INSERT INTO person_attributes (
    report_id, full_name, alternative_names, age, approximate_age,
    gender, blood_group, height_cm, weight_kg,
    build, hair_description, hair_colour, eye_colour, skin_description,
    birthmarks, scars, tattoos, anatomical_features,
    clothing, footwear, accessories, belongings,
    identifying_clue, condition_status
  ) VALUES (
    _report_id, p_full_name, p_alternative_names, p_age, p_approximate_age,
    p_gender, p_blood_group, p_height_cm, p_weight_kg,
    p_build, p_hair_description, p_hair_colour, p_eye_colour, p_skin_description,
    p_birthmarks, p_scars, p_tattoos, p_anatomical_features,
    p_clothing, p_footwear, p_accessories, p_belongings,
    p_identifying_clue, p_condition_status
  );

  -- Update the case's updated_at
  UPDATE cases SET updated_at = NOW() WHERE id = _case_id;

  -- Record in status history
  INSERT INTO status_history (case_id, old_status, new_status, changed_by, reason)
  SELECT id, status::TEXT, status::TEXT, _profile_id, 'New report linked to case'
  FROM cases WHERE id = _case_id;

  RETURN jsonb_build_object(
    'case_id', _case_id,
    'case_uid', p_case_uid,
    'report_id', _report_id,
    'linked', true
  );
END;
$$;


-- ============================================================
-- B13: get_match_candidates()
-- Returns coarse candidate pool for TypeScript scoring.
-- Filters by opposite case type, gender, and age tolerance.
-- Returns person_attributes joined with report and case info.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_match_candidates(
  p_source_case_id UUID,
  p_target_type case_type,
  p_gender_filter TEXT DEFAULT NULL,
  p_age_estimate INTEGER DEFAULT NULL,
  p_limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  report_id UUID,
  case_id UUID,
  case_uid TEXT,
  case_type case_type,
  found_location TEXT,
  full_name TEXT,
  alternative_names TEXT,
  age INTEGER,
  approximate_age INTEGER,
  gender TEXT,
  blood_group TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  build TEXT,
  hair_description TEXT,
  hair_colour TEXT,
  eye_colour TEXT,
  skin_description TEXT,
  birthmarks TEXT,
  scars TEXT,
  tattoos TEXT,
  anatomical_features TEXT,
  clothing TEXT,
  footwear TEXT,
  accessories TEXT,
  belongings TEXT,
  identifying_clue TEXT,
  condition_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS report_id,
    c.id AS case_id,
    c.case_uid,
    c.case_type,
    r.found_location,
    pa.full_name,
    pa.alternative_names,
    pa.age,
    pa.approximate_age,
    pa.gender,
    pa.blood_group,
    pa.height_cm,
    pa.weight_kg,
    pa.build,
    pa.hair_description,
    pa.hair_colour,
    pa.eye_colour,
    pa.skin_description,
    pa.birthmarks,
    pa.scars,
    pa.tattoos,
    pa.anatomical_features,
    pa.clothing,
    pa.footwear,
    pa.accessories,
    pa.belongings,
    pa.identifying_clue,
    pa.condition_status
  FROM reports r
  JOIN person_attributes pa ON pa.report_id = r.id
  JOIN cases c ON c.id = r.case_id
  WHERE c.case_type = p_target_type
    AND c.status NOT IN ('CLOSED', 'ARCHIVED')
    AND c.id != p_source_case_id
    -- Gender coarse filter (skip if either is null)
    AND (
      pa.gender IS NULL
      OR p_gender_filter IS NULL
      OR LOWER(pa.gender) = LOWER(p_gender_filter)
    )
    -- Age coarse filter (±10 years tolerance for coarse stage)
    AND (
      pa.age IS NULL AND pa.approximate_age IS NULL
      OR p_age_estimate IS NULL
      OR ABS(COALESCE(pa.age, pa.approximate_age, 0) - p_age_estimate) <= 10
    )
  ORDER BY r.created_at DESC
  LIMIT p_limit_count;
END;
$$;


-- ============================================================
-- B16: save_match_results()
-- Stores scored match candidates from the TypeScript engine.
-- Accepts a JSONB array of results.
-- Upserts to avoid duplicate entries for the same case pair.
-- ============================================================

CREATE OR REPLACE FUNCTION public.save_match_results(
  p_source_case_id UUID,
  p_results JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result JSONB;
BEGIN
  FOR _result IN SELECT * FROM jsonb_array_elements(p_results)
  LOOP
    INSERT INTO match_candidates (
      source_case_id,
      candidate_case_id,
      score,
      confidence_tier,
      matched_fields,
      missing_fields,
      conflicting_fields,
      explanation,
      status
    ) VALUES (
      p_source_case_id,
      (_result ->> 'candidateCaseId')::UUID,
      (_result ->> 'score')::INTEGER,
      _result ->> 'confidenceTier',
      _result -> 'matchedFields',
      _result -> 'missingFields',
      _result -> 'conflictingFields',
      _result ->> 'explanation',
      'PENDING'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Update case status if matches were found
  IF jsonb_array_length(p_results) > 0 THEN
    UPDATE cases
    SET status = 'POSSIBLE_MATCH'
    WHERE id = p_source_case_id
      AND status IN ('SUBMITTED', 'SEARCHING', 'NO_CANDIDATE', 'MATCH_REJECTED');
  END IF;
END;
$$;


-- ============================================================
-- B17: verify_match()
-- Records reviewer verification action and updates case status.
-- Actions: VERIFIED, REJECTED, MORE_INFO_NEEDED
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_match(
  p_match_id UUID,
  p_action TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
  _role user_role;
  _source_case_id UUID;
  _new_case_status case_status;
  _match_status match_status;
BEGIN
  -- Get caller info
  SELECT id, role INTO _profile_id, _role
  FROM profiles
  WHERE auth_user_id = (SELECT auth.uid());

  -- Only REVIEWER and ADMIN can verify
  IF _role NOT IN ('REVIEWER', 'ADMIN') THEN
    RAISE EXCEPTION 'Unauthorized: only reviewers and admins can verify matches';
  END IF;

  -- Get the source case from this match candidate
  SELECT source_case_id INTO _source_case_id
  FROM match_candidates
  WHERE id = p_match_id;

  IF _source_case_id IS NULL THEN
    RAISE EXCEPTION 'Match candidate not found';
  END IF;

  -- Map action to statuses
  CASE p_action
    WHEN 'VERIFIED' THEN
      _match_status := 'VERIFIED';
      _new_case_status := 'VERIFIED_MATCH';
    WHEN 'REJECTED' THEN
      _match_status := 'REJECTED';
      _new_case_status := 'SEARCHING';
    WHEN 'MORE_INFO_NEEDED' THEN
      _match_status := 'MORE_INFO_NEEDED';
      _new_case_status := 'MORE_INFO_NEEDED';
    ELSE
      RAISE EXCEPTION 'Invalid action: %. Must be VERIFIED, REJECTED, or MORE_INFO_NEEDED', p_action;
  END CASE;

  -- Update the match candidate status
  UPDATE match_candidates
  SET status = _match_status
  WHERE id = p_match_id;

  -- Record the verification action
  INSERT INTO verification_actions (match_candidate_id, reviewer_id, action, reason)
  VALUES (p_match_id, _profile_id, p_action, p_reason);

  -- Update the case status
  UPDATE cases
  SET status = _new_case_status
  WHERE id = _source_case_id;

  RETURN jsonb_build_object(
    'match_id', p_match_id,
    'action', p_action,
    'match_status', _match_status,
    'case_status', _new_case_status,
    'reviewer_id', _profile_id
  );
END;
$$;


-- ============================================================
-- B18: get_case_status()
-- Returns case info with timeline and match summaries.
-- Filters sensitive data based on caller's role.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_case_status(
  p_case_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
  _role user_role;
  _case JSONB;
  _timeline JSONB;
  _matches JSONB;
  _reports JSONB;
BEGIN
  -- Get caller info
  SELECT id, role INTO _profile_id, _role
  FROM profiles
  WHERE auth_user_id = (SELECT auth.uid());

  -- Get case info
  SELECT jsonb_build_object(
    'id', c.id,
    'case_uid', c.case_uid,
    'case_type', c.case_type,
    'status', c.status,
    'created_at', c.created_at,
    'updated_at', c.updated_at
  ) INTO _case
  FROM cases c
  WHERE c.id = p_case_id;

  IF _case IS NULL THEN
    RAISE EXCEPTION 'Case not found';
  END IF;

  -- Get timeline (status history)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'old_status', sh.old_status,
      'new_status', sh.new_status,
      'reason', sh.reason,
      'created_at', sh.created_at
    ) ORDER BY sh.created_at ASC
  ), '[]'::JSONB) INTO _timeline
  FROM status_history sh
  WHERE sh.case_id = p_case_id;

  -- Get match summaries (limited info for FAMILY)
  IF _role IN ('REVIEWER', 'ADMIN') THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', mc.id,
        'candidate_case_id', mc.candidate_case_id,
        'score', mc.score,
        'confidence_tier', mc.confidence_tier,
        'matched_fields', mc.matched_fields,
        'missing_fields', mc.missing_fields,
        'conflicting_fields', mc.conflicting_fields,
        'explanation', mc.explanation,
        'status', mc.status,
        'created_at', mc.created_at
      ) ORDER BY mc.score DESC
    ), '[]'::JSONB) INTO _matches
    FROM match_candidates mc
    WHERE mc.source_case_id = p_case_id;
  ELSE
    -- FAMILY and other roles: limited match info (no raw scores for family)
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', mc.id,
        'confidence_tier', mc.confidence_tier,
        'status', mc.status,
        'created_at', mc.created_at
      ) ORDER BY mc.score DESC
    ), '[]'::JSONB) INTO _matches
    FROM match_candidates mc
    WHERE mc.source_case_id = p_case_id;
  END IF;

  -- Get report count
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'source_type', r.source_type,
      'created_at', r.created_at
    )
  ), '[]'::JSONB) INTO _reports
  FROM reports r
  WHERE r.case_id = p_case_id;

  RETURN jsonb_build_object(
    'case', _case,
    'timeline', _timeline,
    'matches', _matches,
    'reports', _reports
  );
END;
$$;


-- ============================================================
-- B19: get_pending_reviews()
-- Returns all match_candidates with status PENDING.
-- Only accessible by REVIEWER and ADMIN.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_pending_reviews()
RETURNS TABLE (
  match_id UUID,
  source_case_id UUID,
  source_case_uid TEXT,
  candidate_case_id UUID,
  candidate_case_uid TEXT,
  score INTEGER,
  confidence_tier TEXT,
  explanation TEXT,
  status match_status,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role user_role;
BEGIN
  SELECT role INTO _role
  FROM profiles
  WHERE auth_user_id = (SELECT auth.uid());

  IF _role NOT IN ('REVIEWER', 'ADMIN') THEN
    RAISE EXCEPTION 'Unauthorized: only reviewers and admins can view pending reviews';
  END IF;

  RETURN QUERY
  SELECT
    mc.id AS match_id,
    mc.source_case_id,
    sc.case_uid AS source_case_uid,
    mc.candidate_case_id,
    cc.case_uid AS candidate_case_uid,
    mc.score,
    mc.confidence_tier,
    mc.explanation,
    mc.status,
    mc.created_at
  FROM match_candidates mc
  JOIN cases sc ON sc.id = mc.source_case_id
  JOIN cases cc ON cc.id = mc.candidate_case_id
  WHERE mc.status IN ('PENDING', 'UNDER_REVIEW')
  ORDER BY mc.score DESC;
END;
$$;


-- ============================================================
-- B20: approve_user()
-- Sets a user's verification_status to APPROVED.
-- Only callable by ADMIN role.
-- ============================================================

CREATE OR REPLACE FUNCTION public.approve_user(
  p_user_id UUID,
  p_action verification_status DEFAULT 'APPROVED'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role user_role;
  _target_name TEXT;
BEGIN
  -- Verify caller is admin
  SELECT role INTO _role
  FROM profiles
  WHERE auth_user_id = (SELECT auth.uid());

  IF _role != 'ADMIN' THEN
    RAISE EXCEPTION 'Unauthorized: only admins can approve users';
  END IF;

  -- Update the target user's verification status
  UPDATE profiles
  SET verification_status = p_action
  WHERE id = p_user_id
  RETURNING full_name INTO _target_name;

  IF _target_name IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'full_name', _target_name,
    'verification_status', p_action
  );
END;
$$;
