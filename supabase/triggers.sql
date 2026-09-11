-- ============================================================
-- MILAN — Database Triggers
-- B4: Profile creation on auth signup
-- B5: Case UID generation (MILAN-XXXX)
-- B6: Status history tracking on case status change
-- ============================================================

-- ============================================================
-- B4: on_auth_user_created
-- Creates a profile row when a new user signs up via Supabase Auth.
-- Role and name come from user_metadata set during signUp().
-- FAMILY accounts are auto-approved; all others start as PENDING.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role user_role;
  _verification verification_status;
BEGIN
  -- Extract role from user metadata, default to FAMILY
  _role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::user_role,
    'FAMILY'
  );

  -- FAMILY accounts are auto-approved; others need admin approval
  IF _role = 'FAMILY' THEN
    _verification := 'APPROVED';
  ELSE
    _verification := 'PENDING';
  END IF;

  INSERT INTO public.profiles (
    auth_user_id,
    full_name,
    role,
    organization_name,
    organization_type,
    phone,
    verification_status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    _role,
    NEW.raw_user_meta_data ->> 'organization_name',
    NEW.raw_user_meta_data ->> 'organization_type',
    NEW.raw_user_meta_data ->> 'phone',
    _verification
  );

  RETURN NEW;
END;
$$;

-- Trigger on auth.users INSERT
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- B5: generate_case_uid
-- Generates sequential MILAN-XXXX UIDs for new cases.
-- Uses a sequence for thread-safe incrementing.
-- ============================================================

-- Create sequence for case UIDs
CREATE SEQUENCE IF NOT EXISTS case_uid_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_case_uid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.case_uid := 'MILAN-' || LPAD(nextval('case_uid_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Trigger on cases INSERT (BEFORE so we can set case_uid)
CREATE OR REPLACE TRIGGER on_case_created
  BEFORE INSERT ON cases
  FOR EACH ROW
  WHEN (NEW.case_uid IS NULL)
  EXECUTE FUNCTION public.generate_case_uid();


-- ============================================================
-- B6: on_case_status_change
-- Records every status change in the status_history table.
-- Only fires when status column actually changes.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_case_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only record if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.status_history (
      case_id,
      old_status,
      new_status,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      OLD.status::TEXT,
      NEW.status::TEXT,
      NEW.created_by,
      NULL
    );
  END IF;

  -- Also update the updated_at timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$;

-- Trigger on cases UPDATE
CREATE OR REPLACE TRIGGER on_case_status_change
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_case_status_change();
