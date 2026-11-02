import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Private roster schema. This file does not open a database connection.
 * Do not insert real students. A guardian is attached by Netlify Identity user id,
 * not by a second email address.
 */

export const schools = pgTable("schools", {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const seasons = pgTable(
  "seasons",
  {
    id: uuid().primaryKey().defaultRandom(),
    label: text().notNull().unique(),
    startsOn: date("starts_on"),
    endsOn: date("ends_on"),
  },
  (table) => [check("seasons_dates_check", sql`${table.endsOn} IS NULL OR ${table.startsOn} IS NULL OR ${table.endsOn} >= ${table.startsOn}`)],
)

export const players = pgTable(
  "players",
  {
    id: uuid().primaryKey().defaultRandom(),
    schoolId: uuid("school_id").references(() => schools.id),
    publicDisplayName: text("public_display_name"),
    status: text().notNull().default("draft"),
    publicVisibility: text("public_visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("players_status_check", sql`${table.status} IN ('draft', 'active', 'inactive', 'archived')`),
    check("players_visibility_check", sql`${table.publicVisibility} IN ('private', 'pending', 'public')`),
  ],
)

export const playerPrivate = pgTable("player_private", {
  playerId: uuid("player_id")
    .primaryKey()
    .references(() => players.id, { onDelete: "cascade" }),
  legalName: text("legal_name"),
  gradeLabel: text("grade_label"),
  staffNotes: text("staff_notes"),
})

export const playerAliases = pgTable(
  "player_aliases",
  {
    id: uuid().primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    aliasNormalized: text("alias_normalized").notNull(),
  },
  (table) => [unique("player_aliases_player_alias_unique").on(table.playerId, table.aliasNormalized)],
)

export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid().primaryKey().defaultRandom(),
    seasonId: uuid("season_id").references(() => seasons.id),
    name: text().notNull(),
    playedOn: date("played_on"),
    bowlingCenter: text("bowling_center"),
    externalKey: text("external_key"),
  },
  (table) => [unique("tournaments_season_key_unique").on(table.seasonId, table.externalKey)],
)

export const tournamentResults = pgTable(
  "tournament_results",
  {
    id: uuid().primaryKey().defaultRandom(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id),
    gamesPlayed: integer("games_played"),
    totalPins: integer("total_pins"),
    highGame: integer("high_game"),
    strikes: integer(),
    spares: integer(),
    opens: integer(),
    notes: text(),
  },
  (table) => [
    unique("tournament_results_tournament_player_unique").on(table.tournamentId, table.playerId),
    check("tournament_results_games_check", sql`${table.gamesPlayed} IS NULL OR ${table.gamesPlayed} >= 0`),
    check("tournament_results_pins_check", sql`${table.totalPins} IS NULL OR ${table.totalPins} >= 0`),
    check("tournament_results_high_game_check", sql`${table.highGame} IS NULL OR (${table.highGame} >= 0 AND ${table.highGame} <= 300)`),
    check("tournament_results_strikes_check", sql`${table.strikes} IS NULL OR ${table.strikes} >= 0`),
    check("tournament_results_spares_check", sql`${table.spares} IS NULL OR ${table.spares} >= 0`),
    check("tournament_results_opens_check", sql`${table.opens} IS NULL OR ${table.opens} >= 0`),
    index("tournament_results_player_id_idx").on(table.playerId),
  ],
)

export const statImports = pgTable(
  "stat_imports",
  {
    id: uuid().primaryKey().defaultRandom(),
    seasonId: uuid("season_id").references(() => seasons.id),
    tournamentId: uuid("tournament_id").references(() => tournaments.id),
    sourceName: text("source_name").notNull(),
    staffSubject: text("staff_subject").notNull(),
    status: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("stat_imports_status_check", sql`${table.status} IN ('preview', 'applied', 'rejected', 'reversed')`)],
)

export const statImportRows = pgTable(
  "stat_import_rows",
  {
    id: uuid().primaryKey().defaultRandom(),
    importId: uuid("import_id")
      .notNull()
      .references(() => statImports.id, { onDelete: "cascade" }),
    sourceRow: integer("source_row").notNull(),
    playerId: uuid("player_id").references(() => players.id),
    matchStatus: text("match_status").notNull(),
    proposed: jsonb().notNull(),
  },
  (table) => [
    unique("stat_import_rows_import_row_unique").on(table.importId, table.sourceRow),
    check("stat_import_rows_source_row_check", sql`${table.sourceRow} > 0`),
    check("stat_import_rows_match_status_check", sql`${table.matchStatus} IN ('exact', 'ambiguous', 'unmatched', 'confirmed')`),
    check("stat_import_rows_confirmed_check", sql`${table.matchStatus} <> 'confirmed' OR ${table.playerId} IS NOT NULL`),
    check("stat_import_rows_ambiguous_check", sql`${table.matchStatus} <> 'ambiguous' OR ${table.playerId} IS NULL`),
  ],
)

export const households = pgTable("households", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const guardians = pgTable("guardians", {
  id: uuid().primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id),
  /** Netlify Identity user id for the existing account. Not an email address. */
  identityUserId: text("identity_user_id").unique(),
  displayName: text("display_name").notNull(),
  preferredContact: text("preferred_contact"),
})

export const guardianPlayers = pgTable(
  "guardian_players",
  {
    guardianId: uuid("guardian_id")
      .notNull()
      .references(() => guardians.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    relationship: text().notNull(),
    linkStatus: text("link_status").notNull().default("pending"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.guardianId, table.playerId] }),
    index("guardian_players_player_id_idx").on(table.playerId),
    check("guardian_players_link_status_check", sql`${table.linkStatus} IN ('pending', 'verified', 'revoked')`),
    check("guardian_players_verified_at_check", sql`${table.linkStatus} <> 'verified' OR ${table.verifiedAt} IS NOT NULL`),
  ],
)

export const consentRecords = pgTable(
  "consent_records",
  {
    id: uuid().primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id),
    guardianId: uuid("guardian_id").references(() => guardians.id),
    purpose: text().notNull(),
    status: text().notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true }),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    expiresOn: date("expires_on"),
  },
  (table) => [
    index("consent_records_player_id_idx").on(table.playerId),
    check("consent_records_purpose_check", sql`${table.purpose} IN ('profile_publication', 'photo_public', 'photo_family', 'photo_sharing')`),
    check("consent_records_status_check", sql`${table.status} IN ('granted', 'withdrawn', 'expired')`),
  ],
)

export const photoAssets = pgTable(
  "photo_assets",
  {
    id: uuid().primaryKey().defaultRandom(),
    storageKey: text("storage_key").notNull().unique(),
    status: text().notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "photo_assets_status_check",
      sql`${table.status} IN ('staged', 'approved_family', 'approved_public', 'rejected', 'removed')`,
    ),
  ],
)

export const photoTags = pgTable(
  "photo_tags",
  {
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photoAssets.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id),
    approved: boolean().notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.photoId, table.playerId] }),
    index("photo_tags_player_id_idx").on(table.playerId),
  ],
)

export const staffAuditLog = pgTable("staff_audit_log", {
  id: uuid().primaryKey().defaultRandom(),
  staffSubject: text("staff_subject").notNull(),
  action: text().notNull(),
  recordTable: text("record_table").notNull(),
  recordId: uuid("record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
