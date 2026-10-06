-- ============================================================
-- MILAN — DNA Reports & Family Contact SQL Migration
-- Features:
--   1. family_contact_phone field on cases table
--   2. dna_reports table for official hospital documents
--   3. Private Supabase Storage bucket 'dna-reports'
--   4. Strict RLS policies and Storage policies
-- Safe incremental migration: does not overwrite existing production data.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Family Contact Phone
-- ------------------------------------------------------------
ALTER TABLE cases ADD COLUMN IF NOT EXISTS family_contact_phone TEXT;

-- Index for phone queries
CREATE INDEX IF NOT EXISTS idx_cases_family_contact 
  ON cases(family_contact_phone) 
  WHERE family_contact_phone IS NOT NULL;

-- ------------------------------------------------------------
-- 2. DNA Reports Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dna_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES profiles(id),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    report_type TEXT DEFAULT 'OFFICIAL_HOSPITAL_LAB',
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_dna_reports_case_id ON dna_reports(case_id);
CREATE INDEX IF NOT EXISTS idx_dna_reports_status ON dna_reports(status);
CREATE INDEX IF NOT EXISTS idx_dna_reports_uploaded_at ON dna_reports(uploaded_at DESC);

-- ------------------------------------------------------------
-- 3. Row-Level Security (RLS) for dna_reports
-- ------------------------------------------------------------
-- Requirements:
--   - FAMILY cannot browse all DNA reports.
--   - FAMILY cannot download arbitrary DNA reports.
--   - Unauthorized users cannot access DNA reports.
--   - HOSPITAL can upload reports according to its permissions.
--   - Authorized reviewers/admins can view reports according to existing MILAN permissions.
--   - Users cannot modify/delete reports belonging to cases they are not authorized to access.
-- ------------------------------------------------------------

ALTER TABLE dna_reports ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Authorized responders only (HOSPITAL, REVIEWER, ADMIN, NGO, ARMY_RESCUE)
-- FAMILY and VOLUNTEER cannot select from this table.
CREATE POLICY "dna_reports_select_authorized"
  ON dna_reports FOR SELECT
  TO authenticated
  USING (
    (SELECT get_my_role()) IN ('HOSPITAL', 'REVIEWER', 'ADMIN', 'NGO', 'ARMY_RESCUE')
  );

-- INSERT policy: Only HOSPITAL and ADMIN can upload official DNA reports
CREATE POLICY "dna_reports_insert_hospital_admin"
  ON dna_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT get_my_role()) IN ('HOSPITAL', 'ADMIN')
  );

-- UPDATE policy: Only REVIEWER and ADMIN can update verification status
CREATE POLICY "dna_reports_update_reviewer_admin"
  ON dna_reports FOR UPDATE
  TO authenticated
  USING (
    (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
  );

-- DELETE policy: Only ADMIN can delete DNA report records
CREATE POLICY "dna_reports_delete_admin"
  ON dna_reports FOR DELETE
  TO authenticated
  USING (
    (SELECT get_my_role()) IN ('ADMIN')
  );

-- ------------------------------------------------------------
-- 4. Supabase Storage: Private Bucket 'dna-reports'
-- ------------------------------------------------------------

-- Create the private storage bucket (non-public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('dna-reports', 'dna-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Insert Policy: Only HOSPITAL and ADMIN can upload to dna-reports bucket
CREATE POLICY "storage_upload_dna_reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dna-reports'
    AND (SELECT get_my_role()) IN ('HOSPITAL', 'ADMIN')
  );

-- Storage Read Policy: Authorized responders can access reports via signed URLs
CREATE POLICY "storage_read_dna_reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dna-reports'
    AND (SELECT get_my_role()) IN ('HOSPITAL', 'REVIEWER', 'ADMIN', 'NGO', 'ARMY_RESCUE')
  );

-- Storage Delete Policy: Only ADMIN can delete files from dna-reports bucket
CREATE POLICY "storage_delete_dna_reports"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dna-reports'
    AND (SELECT get_my_role()) IN ('ADMIN')
  );
