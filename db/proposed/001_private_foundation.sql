-- Superseded by netlify/database/migrations. Do not apply this file.
-- Missing numbers stay NULL. A column must not default a score to 0.

CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  starts_on date,
  ends_on date,
  CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)
);

CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools (id),
  public_display_name text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
  public_visibility text NOT NULL DEFAULT 'private' CHECK (public_visibility IN ('private', 'pending', 'public')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE player_private (
  player_id uuid PRIMARY KEY REFERENCES players (id) ON DELETE CASCADE,
  legal_name text,
  grade_label text,
  staff_notes text
);

CREATE TABLE player_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players (id) ON DELETE CASCADE,
  alias_normalized text NOT NULL,
  UNIQUE (player_id, alias_normalized)
);

CREATE TABLE tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES seasons (id),
  name text NOT NULL,
  played_on date,
  bowling_center text,
  external_key text,
  UNIQUE (season_id, external_key)
);

CREATE TABLE tournament_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments (id),
  player_id uuid NOT NULL REFERENCES players (id),
  games_played integer CHECK (games_played IS NULL OR games_played >= 0),
  total_pins integer CHECK (total_pins IS NULL OR total_pins >= 0),
  high_game integer CHECK (high_game IS NULL OR (high_game >= 0 AND high_game <= 300)),
  strikes integer CHECK (strikes IS NULL OR strikes >= 0),
  spares integer CHECK (spares IS NULL OR spares >= 0),
  opens integer CHECK (opens IS NULL OR opens >= 0),
  notes text,
  UNIQUE (tournament_id, player_id)
);

CREATE TABLE stat_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES seasons (id),
  tournament_id uuid REFERENCES tournaments (id),
  source_name text NOT NULL,
  staff_subject text NOT NULL,
  status text NOT NULL CHECK (status IN ('preview', 'applied', 'rejected', 'reversed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE stat_import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id uuid NOT NULL REFERENCES stat_imports (id) ON DELETE CASCADE,
  source_row integer NOT NULL CHECK (source_row > 0),
  player_id uuid REFERENCES players (id),
  match_status text NOT NULL CHECK (match_status IN ('exact', 'ambiguous', 'unmatched', 'confirmed')),
  proposed jsonb NOT NULL,
  UNIQUE (import_id, source_row),
  CHECK (match_status <> 'confirmed' OR player_id IS NOT NULL),
  CHECK (match_status <> 'ambiguous' OR player_id IS NULL)
);

CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households (id),
  display_name text NOT NULL,
  email text,
  phone text,
  preferred_contact text
);

CREATE TABLE guardian_players (
  guardian_id uuid NOT NULL REFERENCES guardians (id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players (id) ON DELETE CASCADE,
  relationship text NOT NULL,
  verified_at timestamptz,
  PRIMARY KEY (guardian_id, player_id)
);

CREATE TABLE consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players (id),
  guardian_id uuid REFERENCES guardians (id),
  purpose text NOT NULL CHECK (purpose IN ('profile_publication', 'photo_public', 'photo_family', 'photo_sharing')),
  status text NOT NULL CHECK (status IN ('granted', 'withdrawn', 'expired')),
  granted_at timestamptz,
  withdrawn_at timestamptz,
  expires_on date
);

CREATE TABLE photo_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('staged', 'approved_family', 'approved_public', 'rejected', 'removed')),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE photo_tags (
  photo_id uuid NOT NULL REFERENCES photo_assets (id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players (id),
  approved boolean NOT NULL DEFAULT false,
  PRIMARY KEY (photo_id, player_id)
);

CREATE TABLE staff_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_subject text NOT NULL,
  action text NOT NULL,
  record_table text NOT NULL,
  record_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tournament_results_player_id_idx ON tournament_results (player_id);
CREATE INDEX guardian_players_player_id_idx ON guardian_players (player_id);
CREATE INDEX consent_records_player_id_idx ON consent_records (player_id);
CREATE INDEX photo_tags_player_id_idx ON photo_tags (player_id);

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
