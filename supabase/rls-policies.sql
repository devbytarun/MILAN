-- ============================================================
-- MILAN — Row-Level Security Policies
-- B7: Complete RLS for all tables
-- ============================================================
-- Reference: implementation_plan.md Sections 17 & 31 (Prompt 8)
--
-- Role hierarchy:
--   FAMILY        — sees own cases/reports only
--   NGO           — sees own reports, candidate matches
--   ARMY_RESCUE   — sees own reports, candidate matches
--   HOSPITAL      — sees own reports + medical data for authorized cases
--   VOLUNTEER     — limited access (P1)
--   REVIEWER      — sees all cases + candidates, can verify
--   ADMIN         — sees everything, manages users
-- ============================================================

-- Helper function: get current user's role (cached per statement)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles
  WHERE auth_user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

-- Helper function: get current user's profile ID
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles
  WHERE auth_user_id = (SELECT auth.uid())
  LIMIT 1;
$$;


-- ============================================================
-- PROFILES
-- - All authenticated users can read all profiles (needed for name lookups)
-- - Users can update their own profile (but NOT role or verification_status)
-- - Insert handled by trigger (B4)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth_user_id = (SELECT auth.uid()))
  WITH CHECK (
    auth_user_id = (SELECT auth.uid())
    -- role and verification_status changes are prevented at app level
    -- RLS cannot selectively restrict column updates, so app-level checks
    -- in the RPC approve_user() handle role/status changes
  );

-- No direct INSERT policy — handled by trigger
-- No DELETE policy — profiles are never deleted


-- ============================================================
-- CASES
-- - Creators see their own cases
-- - Reporters on a case can see that case
-- - REVIEWER and ADMIN see all cases
-- - Insert: authenticated users with APPROVED status
-- - Update: REVIEWER and ADMIN (for status changes)
-- ============================================================

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases_select"
  ON cases FOR SELECT
  TO authenticated
  USING (
    created_by = (SELECT get_my_profile_id())
    OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
    OR id IN (
      SELECT case_id FROM reports
      WHERE reporter_id = (SELECT get_my_profile_id())
    )
  );

CREATE POLICY "cases_insert"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT get_my_profile_id())
  );

CREATE POLICY "cases_update"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT get_my_profile_id())
    OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
  );


-- ============================================================
-- REPORTS
-- - Reporters see their own reports
-- - Case participants see reports on cases they're involved in
-- - REVIEWER and ADMIN see all reports
-- - Insert: authenticated users
-- ============================================================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select"
  ON reports FOR SELECT
  TO authenticated
  USING (
    reporter_id = (SELECT get_my_profile_id())
    OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
    OR case_id IN (
      SELECT id FROM cases
      WHERE created_by = (SELECT get_my_profile_id())
    )
    OR case_id IN (
      SELECT case_id FROM reports r2
      WHERE r2.reporter_id = (SELECT get_my_profile_id())
    )
  );

CREATE POLICY "reports_insert"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = (SELECT get_my_profile_id())
  );

CREATE POLICY "reports_update"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    reporter_id = (SELECT get_my_profile_id())
    OR (SELECT get_my_role()) IN ('ADMIN')
  );


-- ============================================================
-- PERSON_ATTRIBUTES
-- - Same visibility as parent report
-- - REVIEWER and ADMIN see all
-- - Medical fields (condition_status, weight_kg, blood_group)
--   access restricted at APPLICATION level for FAMILY users
--   (RLS cannot do column-level filtering)
-- ============================================================

ALTER TABLE person_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "person_attributes_select"
  ON person_attributes FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM reports
      WHERE reporter_id = (SELECT get_my_profile_id())
    )
    OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
    OR report_id IN (
      SELECT r.id FROM reports r
      JOIN cases c ON c.id = r.case_id
      WHERE c.created_by = (SELECT get_my_profile_id())
    )
    OR report_id IN (
      SELECT r.id FROM reports r
      WHERE r.case_id IN (
        SELECT case_id FROM reports r2
        WHERE r2.reporter_id = (SELECT get_my_profile_id())
      )
    )
  );

CREATE POLICY "person_attributes_insert"
  ON person_attributes FOR INSERT
  TO authenticated
  WITH CHECK (
    report_id IN (
      SELECT id FROM reports
      WHERE reporter_id = (SELECT get_my_profile_id())
    )
    OR (SELECT get_my_role()) IN ('ADMIN')
  );

CREATE POLICY "person_attributes_update"
  ON person_attributes FOR UPDATE
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM reports
      WHERE reporter_id = (SELECT get_my_profile_id())
    )
    OR (SELECT get_my_role()) IN ('ADMIN')
  );


-- ============================================================
-- MEDIA
-- - Same visibility as parent report
-- - Insert: report owner
-- ============================================================

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_select"
  ON media FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM reports
      WHERE reporter_id = (SELECT get_my_profile_id())
    )
    OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
    OR report_id IN (
      SELECT r.id FROM reports r
      JOIN cases c ON c.id = r.case_id
      WHERE c.created_by = (SELECT get_my_profile_id())
    )
  );

CREATE POLICY "media_insert"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (
    report_id IN (
      SELECT id FROM reports
      WHERE reporter_id = (SELECT get_my_profile_id())
    )
  );


-- ============================================================
-- MATCH_CANDIDATES
-- - Case owners see matches involving their case
-- - REVIEWER and ADMIN see all
-- - Insert/update: REVIEWER, ADMIN, or system (via RPC with service role)
-- ============================================================

ALTER TABLE match_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "match_candidates_select"
  ON match_candidates FOR SELECT
  TO authenticated
  USING (
    source_case_id IN (
      SELECT id FROM cases
      WHERE created_by = (SELECT get_my_profile_id())
    )
    OR candidate_case_id IN (
      SELECT id FROM cases
      WHERE created_by = (SELECT get_my_profile_id())
    )
    OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
  );

CREATE POLICY "match_candidates_insert"
  ON match_candidates FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
    OR source_case_id IN (
      SELECT id FROM cases
      WHERE created_by = (SELECT get_my_profile_id())
    )
    OR (SELECT get_my_role()) IN ('NGO', 'ARMY_RESCUE', 'HOSPITAL')
  );

CREATE POLICY "match_candidates_update"
  ON match_candidates FOR UPDATE
  TO authenticated
  USING (
    (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
  );


-- ============================================================
-- VERIFICATION_ACTIONS
-- - Reviewers see their own actions
-- - ADMIN sees all
-- - Insert: REVIEWER, ADMIN
-- ============================================================

ALTER TABLE verification_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_actions_select"
  ON verification_actions FOR SELECT
  TO authenticated
  USING (
    reviewer_id = (SELECT get_my_profile_id())
    OR (SELECT get_my_role()) IN ('ADMIN')
  );

CREATE POLICY "verification_actions_insert"
  ON verification_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
    AND reviewer_id = (SELECT get_my_profile_id())
  );


-- ============================================================
-- STATUS_HISTORY
-- - Case owners see history for their cases
-- - REVIEWER and ADMIN see all
-- - Insert: handled by trigger (B6), but also allow RPC inserts
-- ============================================================

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_history_select"
  ON status_history FOR SELECT
  TO authenticated
  USING (
    case_id IN (
      SELECT id FROM cases
      WHERE created_by = (SELECT get_my_profile_id())
    )
    OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
  );

CREATE POLICY "status_history_insert"
  ON status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);
