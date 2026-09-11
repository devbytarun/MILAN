-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Enums
CREATE TYPE user_role AS ENUM ('FAMILY', 'NGO', 'ARMY_RESCUE', 'HOSPITAL', 'VOLUNTEER', 'REVIEWER', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE case_type AS ENUM ('MISSING', 'FOUND');
CREATE TYPE case_status AS ENUM ('SUBMITTED', 'SEARCHING', 'NO_CANDIDATE', 'POSSIBLE_MATCH', 'UNDER_REVIEW', 'VERIFIED_MATCH', 'MATCH_REJECTED', 'MORE_INFO_NEEDED', 'CLOSED', 'ARCHIVED');
CREATE TYPE source_type AS ENUM ('FAMILY', 'NGO', 'ARMY_RESCUE', 'HOSPITAL', 'VOLUNTEER', 'ADMIN');
CREATE TYPE communication_status AS ENUM ('CAN_COMMUNICATE', 'CANNOT_COMMUNICATE', 'UNKNOWN');
CREATE TYPE match_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'MORE_INFO_NEEDED');

-- Base Tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'FAMILY',
    organization_name TEXT,
    organization_type TEXT,
    verification_status verification_status DEFAULT 'PENDING',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_uid TEXT UNIQUE,
    case_type case_type NOT NULL,
    status case_status DEFAULT 'SUBMITTED',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    reporter_id UUID REFERENCES profiles(id),
    source_type source_type,
    comm_status communication_status,
    report_notes TEXT,
    found_location TEXT,
    found_at TIMESTAMPTZ,
    referral_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE person_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    full_name TEXT,
    alternative_names TEXT,
    age INTEGER,
    approximate_age INTEGER,
    gender TEXT,
    date_of_birth DATE,
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
);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    visibility TEXT DEFAULT 'private',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE match_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_case_id UUID REFERENCES cases(id),
    candidate_case_id UUID REFERENCES cases(id),
    score INTEGER,
    confidence_tier TEXT,
    matched_fields JSONB,
    missing_fields JSONB,
    conflicting_fields JSONB,
    explanation TEXT,
    status match_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verification_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_candidate_id UUID REFERENCES match_candidates(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    old_status TEXT,
    new_status TEXT,
    changed_by UUID REFERENCES profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance & Trigram Indexes
CREATE INDEX idx_cases_type ON cases(case_type);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_reports_case_id ON reports(case_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_person_attributes_report_id ON person_attributes(report_id);
CREATE INDEX idx_match_candidates_source ON match_candidates(source_case_id);
CREATE INDEX idx_match_candidates_candidate ON match_candidates(candidate_case_id);
CREATE INDEX idx_match_candidates_status ON match_candidates(status);
CREATE INDEX idx_status_history_case ON status_history(case_id);
CREATE INDEX idx_media_report_id ON media(report_id);
CREATE INDEX idx_verification_actions_match ON verification_actions(match_candidate_id);
CREATE INDEX idx_verification_actions_reviewer ON verification_actions(reviewer_id);
CREATE INDEX idx_pa_name_trgm ON person_attributes USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_pa_clothing_trgm ON person_attributes USING gin (clothing gin_trgm_ops);