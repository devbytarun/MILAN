-- ============================================================
-- MILAN — Storage Bucket & Storage RLS Policies
-- B8: Private photo storage with role-based access
-- ============================================================
-- Reference: implementation_plan.md Section 22, step 5-6
--
-- Bucket: case-photos (PRIVATE)
-- Structure: case-photos/{user_id}/{filename}
-- ============================================================

-- Create the private storage bucket (run in Supabase Dashboard or SQL Editor)
-- NOTE: Bucket creation via SQL uses storage.buckets table
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-photos', 'case-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Upload policy: authenticated users can upload to their own folder
-- Path pattern: case-photos/{auth.uid()}/filename
-- ============================================================

CREATE POLICY "storage_upload_own_photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'case-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

-- ============================================================
-- Select/Read policy: role-based access
-- - Users can read their own uploaded photos
-- - REVIEWER and ADMIN can read all photos
-- - Case participants can read photos for their cases
-- ============================================================

CREATE POLICY "storage_read_photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'case-photos'
    AND (
      -- Own uploads
      (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
      -- Reviewers and admins
      OR (SELECT get_my_role()) IN ('REVIEWER', 'ADMIN')
    )
  );

-- ============================================================
-- Update policy: users can update their own uploads
-- ============================================================

CREATE POLICY "storage_update_own_photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'case-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

-- ============================================================
-- Delete policy: users can delete their own uploads, admins can delete any
-- ============================================================

CREATE POLICY "storage_delete_photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'case-photos'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
      OR (SELECT get_my_role()) IN ('ADMIN')
    )
  );
