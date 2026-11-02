-- Row security and consent triggers. Not applied to any database yet.
-- The table owner remains able to bypass these policies when the connection
-- role is a superuser. Application code must still set app.actor_id from the
-- verified Identity user and app.actor_role only after the server role check.

CREATE OR REPLACE FUNCTION guardian_link_requires_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.link_status = 'verified' AND NOT EXISTS (
    SELECT 1
    FROM guardians
    WHERE id = NEW.guardian_id
      AND identity_user_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'verified guardian link requires an identity user id';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guardian_players_require_identity
  BEFORE INSERT OR UPDATE ON guardian_players
  FOR EACH ROW
  EXECUTE FUNCTION guardian_link_requires_identity();

CREATE UNIQUE INDEX consent_one_open_grant
  ON consent_records (player_id, purpose)
  WHERE status = 'granted';

CREATE OR REPLACE FUNCTION players_public_requires_consent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.public_visibility = 'public' AND NOT EXISTS (
    SELECT 1
    FROM consent_records
    WHERE player_id = NEW.id
      AND purpose = 'profile_publication'
      AND status = 'granted'
      AND withdrawn_at IS NULL
      AND (expires_on IS NULL OR expires_on >= CURRENT_DATE)
  ) THEN
    RAISE EXCEPTION 'public profile requires unexpired granted consent';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER players_require_publication_consent
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION players_public_requires_consent();

CREATE OR REPLACE FUNCTION photos_public_requires_consent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  required_purpose text;
BEGIN
  IF NEW.status = 'approved_public' THEN
    required_purpose := 'photo_public';
  ELSIF NEW.status = 'approved_family' THEN
    required_purpose := 'photo_family';
  ELSE
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM photo_tags
    JOIN consent_records ON consent_records.player_id = photo_tags.player_id
    WHERE photo_tags.photo_id = NEW.id
      AND photo_tags.approved = true
      AND consent_records.purpose = required_purpose
      AND consent_records.status = 'granted'
      AND consent_records.withdrawn_at IS NULL
      AND (consent_records.expires_on IS NULL OR consent_records.expires_on >= CURRENT_DATE)
  ) THEN
    RAISE EXCEPTION 'approved photo requires an approved tag and granted consent';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER photo_assets_require_consent
  BEFORE INSERT OR UPDATE ON photo_assets
  FOR EACH ROW
  EXECUTE FUNCTION photos_public_requires_consent();

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE players FORCE ROW LEVEL SECURITY;
ALTER TABLE player_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_private FORCE ROW LEVEL SECURITY;
ALTER TABLE player_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_aliases FORCE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE households FORCE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians FORCE ROW LEVEL SECURITY;
ALTER TABLE guardian_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_players FORCE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records FORCE ROW LEVEL SECURITY;
ALTER TABLE photo_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags FORCE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results FORCE ROW LEVEL SECURITY;
ALTER TABLE stat_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_imports FORCE ROW LEVEL SECURITY;
ALTER TABLE stat_import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_import_rows FORCE ROW LEVEL SECURITY;
ALTER TABLE staff_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_audit_log FORCE ROW LEVEL SECURITY;

CREATE POLICY staff_all ON players
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON players
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM guardian_players
      JOIN guardians ON guardians.id = guardian_players.guardian_id
      WHERE guardian_players.player_id = players.id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON player_private
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON player_private
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM guardian_players
      JOIN guardians ON guardians.id = guardian_players.guardian_id
      WHERE guardian_players.player_id = player_private.player_id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON player_aliases
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON player_aliases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM guardian_players
      JOIN guardians ON guardians.id = guardian_players.guardian_id
      WHERE guardian_players.player_id = player_aliases.player_id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON households
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON households
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM guardians
      JOIN guardian_players ON guardian_players.guardian_id = guardians.id
      WHERE guardians.household_id = households.id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON guardians
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON guardians
  FOR SELECT
  USING (identity_user_id = current_setting('app.actor_id', true));

CREATE POLICY staff_all ON guardian_players
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON guardian_players
  FOR SELECT
  USING (
    link_status = 'verified'
    AND EXISTS (
      SELECT 1
      FROM guardians
      WHERE guardians.id = guardian_players.guardian_id
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON consent_records
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON consent_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM guardian_players
      JOIN guardians ON guardians.id = guardian_players.guardian_id
      WHERE guardian_players.player_id = consent_records.player_id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON photo_assets
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON photo_assets
  FOR SELECT
  USING (
    status IN ('approved_family', 'approved_public')
    AND EXISTS (
      SELECT 1
      FROM photo_tags
      JOIN guardian_players ON guardian_players.player_id = photo_tags.player_id
      JOIN guardians ON guardians.id = guardian_players.guardian_id
      WHERE photo_tags.photo_id = photo_assets.id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON photo_tags
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON photo_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM guardian_players
      JOIN guardians ON guardians.id = guardian_players.guardian_id
      WHERE guardian_players.player_id = photo_tags.player_id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON tournament_results
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY guardian_read ON tournament_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM guardian_players
      JOIN guardians ON guardians.id = guardian_players.guardian_id
      WHERE guardian_players.player_id = tournament_results.player_id
        AND guardian_players.link_status = 'verified'
        AND guardians.identity_user_id = current_setting('app.actor_id', true)
    )
  );

CREATE POLICY staff_all ON stat_imports
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY staff_all ON stat_import_rows
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');

CREATE POLICY staff_all ON staff_audit_log
  FOR ALL
  USING (current_setting('app.actor_role', true) = 'super_admin')
  WITH CHECK (current_setting('app.actor_role', true) = 'super_admin');
