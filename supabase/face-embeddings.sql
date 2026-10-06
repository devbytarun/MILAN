-- ============================================================
-- MILAN — Face Embeddings Table
-- Stores 128-dimensional face descriptors for missing person cases.
-- Used for AI-assisted face similarity matching.
-- ============================================================
-- IMPORTANT: These embeddings are NEVER exposed to the UI directly.
-- Only similarity scores and candidate names are shown.
-- This table uses Supabase RLS to restrict access.
-- ============================================================

-- Create the face_embeddings table
CREATE TABLE IF NOT EXISTS face_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    embedding JSONB NOT NULL,          -- 128-dim float array stored as JSON
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on case_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_face_embeddings_case_id ON face_embeddings(case_id);

-- ============================================================
-- RLS POLICIES FOR face_embeddings
-- ============================================================
-- Security model:
--   - Only authorized roles (NGO, ARMY_RESCUE, HOSPITAL, REVIEWER, ADMIN) 
--     can READ embeddings (for matching).
--   - Only the case creator (FAMILY) or ADMIN can INSERT an embedding.
--   - FAMILY users CANNOT search all embeddings (they can only insert for their own case).
--   - No UPDATE or DELETE exposed to regular users.
-- ============================================================

ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;

-- SELECT: Only operational roles and above can read embeddings (for face search).
-- FAMILY users CANNOT query this table to browse all missing persons.
CREATE POLICY "face_embeddings_select_authorized"
  ON face_embeddings FOR SELECT
  TO authenticated
  USING (
    -- Operational field responders can search embeddings for face matching
    (SELECT get_my_role()) IN ('NGO', 'ARMY_RESCUE', 'HOSPITAL', 'REVIEWER', 'ADMIN')
    OR
    -- Case owner (FAMILY) can see embedding for their own case only
    case_id IN (
      SELECT id FROM cases
      WHERE created_by = (SELECT get_my_profile_id())
    )
  );

-- INSERT: Case owner (FAMILY) can insert embedding for their own case.
-- Operational roles and ADMIN can also insert (for hospital/NGO intake photos).
CREATE POLICY "face_embeddings_insert_authorized"
  ON face_embeddings FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case owner inserts embedding for their own missing person case
    case_id IN (
      SELECT id FROM cases
      WHERE created_by = (SELECT get_my_profile_id())
    )
    OR
    -- Operational roles can insert embeddings for found-person cases they created
    (SELECT get_my_role()) IN ('NGO', 'ARMY_RESCUE', 'HOSPITAL', 'ADMIN')
  );

-- UPDATE: Only ADMIN can update embeddings
CREATE POLICY "face_embeddings_update_admin"
  ON face_embeddings FOR UPDATE
  TO authenticated
  USING (
    (SELECT get_my_role()) IN ('ADMIN')
  );

-- DELETE: Only ADMIN can delete embeddings
CREATE POLICY "face_embeddings_delete_admin"
  ON face_embeddings FOR DELETE
  TO authenticated
  USING (
    (SELECT get_my_role()) IN ('ADMIN')
  );

-- ============================================================
-- Supabase RPC: get_missing_face_embeddings
-- Returns all MISSING case embeddings for authorized face search.
-- Does NOT return the raw embedding to FAMILY users.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_missing_face_embeddings()
RETURNS TABLE (
    embedding_id UUID,
    case_id UUID,
    case_uid TEXT,
    full_name TEXT,
    embedding JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    fe.id as embedding_id,
    fe.case_id,
    c.case_uid,
    pa.full_name,
    fe.embedding,
    fe.created_at
  FROM face_embeddings fe
  JOIN cases c ON c.id = fe.case_id
  JOIN reports r ON r.case_id = c.id
  JOIN person_attributes pa ON pa.report_id = r.id
  WHERE 
    c.case_type = 'MISSING'
    AND c.status NOT IN ('CLOSED', 'ARCHIVED', 'VERIFIED_MATCH')
    AND (SELECT get_my_role()) IN ('NGO', 'ARMY_RESCUE', 'HOSPITAL', 'REVIEWER', 'ADMIN')
  ORDER BY fe.created_at DESC;
$$;

-- ============================================================
-- Supabase RPC: store_face_embedding
-- Inserts a face embedding for a given case.
-- ============================================================

CREATE OR REPLACE FUNCTION public.store_face_embedding(
    p_case_id UUID,
    p_embedding JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_embedding_id UUID;
BEGIN
    -- Validate that the current user has permission to add embedding for this case
    IF NOT EXISTS (
        SELECT 1 FROM cases
        WHERE id = p_case_id
        AND (
            created_by = (SELECT get_my_profile_id())
            OR (SELECT get_my_role()) IN ('ADMIN')
        )
    ) THEN
        RAISE EXCEPTION 'Not authorized to add face embedding for this case';
    END IF;

    -- Upsert: replace existing embedding for same case
    DELETE FROM face_embeddings WHERE case_id = p_case_id;

    INSERT INTO face_embeddings (case_id, embedding)
    VALUES (p_case_id, p_embedding)
    RETURNING id INTO v_embedding_id;

    RETURN v_embedding_id;
END;
$$;
