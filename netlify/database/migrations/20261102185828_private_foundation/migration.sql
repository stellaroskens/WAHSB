CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"player_id" uuid NOT NULL,
	"guardian_id" uuid,
	"purpose" text NOT NULL,
	"status" text NOT NULL,
	"granted_at" timestamp with time zone,
	"withdrawn_at" timestamp with time zone,
	"expires_on" date,
	CONSTRAINT "consent_records_purpose_check" CHECK ("purpose" IN ('profile_publication', 'photo_public', 'photo_family', 'photo_sharing')),
	CONSTRAINT "consent_records_status_check" CHECK ("status" IN ('granted', 'withdrawn', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "guardian_players" (
	"guardian_id" uuid,
	"player_id" uuid,
	"relationship" text NOT NULL,
	"link_status" text DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp with time zone,
	CONSTRAINT "guardian_players_pkey" PRIMARY KEY("guardian_id","player_id"),
	CONSTRAINT "guardian_players_link_status_check" CHECK ("link_status" IN ('pending', 'verified', 'revoked')),
	CONSTRAINT "guardian_players_verified_at_check" CHECK ("link_status" <> 'verified' OR "verified_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"household_id" uuid NOT NULL,
	"identity_user_id" text UNIQUE,
	"display_name" text NOT NULL,
	"preferred_contact" text
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"storage_key" text NOT NULL UNIQUE,
	"status" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photo_assets_status_check" CHECK ("status" IN ('staged', 'approved_family', 'approved_public', 'rejected', 'removed'))
);
--> statement-breakpoint
CREATE TABLE "photo_tags" (
	"photo_id" uuid,
	"player_id" uuid,
	"approved" boolean DEFAULT false NOT NULL,
	CONSTRAINT "photo_tags_pkey" PRIMARY KEY("photo_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "player_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"player_id" uuid NOT NULL,
	"alias_normalized" text NOT NULL,
	CONSTRAINT "player_aliases_player_alias_unique" UNIQUE("player_id","alias_normalized")
);
--> statement-breakpoint
CREATE TABLE "player_private" (
	"player_id" uuid PRIMARY KEY,
	"legal_name" text,
	"grade_label" text,
	"staff_notes" text
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid,
	"public_display_name" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"public_visibility" text DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_status_check" CHECK ("status" IN ('draft', 'active', 'inactive', 'archived')),
	CONSTRAINT "players_visibility_check" CHECK ("public_visibility" IN ('private', 'pending', 'public'))
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"label" text NOT NULL UNIQUE,
	"starts_on" date,
	"ends_on" date,
	CONSTRAINT "seasons_dates_check" CHECK ("ends_on" IS NULL OR "starts_on" IS NULL OR "ends_on" >= "starts_on")
);
--> statement-breakpoint
CREATE TABLE "staff_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"staff_subject" text NOT NULL,
	"action" text NOT NULL,
	"record_table" text NOT NULL,
	"record_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stat_import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"import_id" uuid NOT NULL,
	"source_row" integer NOT NULL,
	"player_id" uuid,
	"match_status" text NOT NULL,
	"proposed" jsonb NOT NULL,
	CONSTRAINT "stat_import_rows_import_row_unique" UNIQUE("import_id","source_row"),
	CONSTRAINT "stat_import_rows_source_row_check" CHECK ("source_row" > 0),
	CONSTRAINT "stat_import_rows_match_status_check" CHECK ("match_status" IN ('exact', 'ambiguous', 'unmatched', 'confirmed')),
	CONSTRAINT "stat_import_rows_confirmed_check" CHECK ("match_status" <> 'confirmed' OR "player_id" IS NOT NULL),
	CONSTRAINT "stat_import_rows_ambiguous_check" CHECK ("match_status" <> 'ambiguous' OR "player_id" IS NULL)
);
--> statement-breakpoint
CREATE TABLE "stat_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"season_id" uuid,
	"tournament_id" uuid,
	"source_name" text NOT NULL,
	"staff_subject" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stat_imports_status_check" CHECK ("status" IN ('preview', 'applied', 'rejected', 'reversed'))
);
--> statement-breakpoint
CREATE TABLE "tournament_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tournament_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"games_played" integer,
	"total_pins" integer,
	"high_game" integer,
	"strikes" integer,
	"spares" integer,
	"opens" integer,
	"notes" text,
	CONSTRAINT "tournament_results_tournament_player_unique" UNIQUE("tournament_id","player_id"),
	CONSTRAINT "tournament_results_games_check" CHECK ("games_played" IS NULL OR "games_played" >= 0),
	CONSTRAINT "tournament_results_pins_check" CHECK ("total_pins" IS NULL OR "total_pins" >= 0),
	CONSTRAINT "tournament_results_high_game_check" CHECK ("high_game" IS NULL OR ("high_game" >= 0 AND "high_game" <= 300)),
	CONSTRAINT "tournament_results_strikes_check" CHECK ("strikes" IS NULL OR "strikes" >= 0),
	CONSTRAINT "tournament_results_spares_check" CHECK ("spares" IS NULL OR "spares" >= 0),
	CONSTRAINT "tournament_results_opens_check" CHECK ("opens" IS NULL OR "opens" >= 0)
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"season_id" uuid,
	"name" text NOT NULL,
	"played_on" date,
	"bowling_center" text,
	"external_key" text,
	CONSTRAINT "tournaments_season_key_unique" UNIQUE("season_id","external_key")
);
--> statement-breakpoint
CREATE INDEX "consent_records_player_id_idx" ON "consent_records" ("player_id");--> statement-breakpoint
CREATE INDEX "guardian_players_player_id_idx" ON "guardian_players" ("player_id");--> statement-breakpoint
CREATE INDEX "photo_tags_player_id_idx" ON "photo_tags" ("player_id");--> statement-breakpoint
CREATE INDEX "tournament_results_player_id_idx" ON "tournament_results" ("player_id");--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id");--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_guardian_id_guardians_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id");--> statement-breakpoint
ALTER TABLE "guardian_players" ADD CONSTRAINT "guardian_players_guardian_id_guardians_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_players" ADD CONSTRAINT "guardian_players_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_household_id_households_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id");--> statement-breakpoint
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_photo_id_photo_assets_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photo_assets"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id");--> statement-breakpoint
ALTER TABLE "player_aliases" ADD CONSTRAINT "player_aliases_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "player_private" ADD CONSTRAINT "player_private_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "stat_import_rows" ADD CONSTRAINT "stat_import_rows_import_id_stat_imports_id_fkey" FOREIGN KEY ("import_id") REFERENCES "stat_imports"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stat_import_rows" ADD CONSTRAINT "stat_import_rows_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id");--> statement-breakpoint
ALTER TABLE "stat_imports" ADD CONSTRAINT "stat_imports_season_id_seasons_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id");--> statement-breakpoint
ALTER TABLE "stat_imports" ADD CONSTRAINT "stat_imports_tournament_id_tournaments_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id");--> statement-breakpoint
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_tournament_id_tournaments_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id");--> statement-breakpoint
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_player_id_players_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id");--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_season_id_seasons_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id");