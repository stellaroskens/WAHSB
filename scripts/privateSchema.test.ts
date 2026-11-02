import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const root = new URL("..", import.meta.url)

function read(path: string): string {
  return readFileSync(new URL(path, root), "utf8")
}

function migrationSql(): string {
  const directory = new URL("netlify/database/migrations", root).pathname
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry)
      if (statSync(path).isDirectory()) return [join(path, "migration.sql")]
      return path.endsWith(".sql") ? [path] : []
    })
    .sort()
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
}

const schema = migrationSql()
const readme = read("db/README.md")
const packageJson = read("package.json")

const tables = [
  "schools",
  "seasons",
  "players",
  "player_private",
  "player_aliases",
  "tournaments",
  "tournament_results",
  "stat_imports",
  "stat_import_rows",
  "households",
  "guardians",
  "guardian_players",
  "consent_records",
  "photo_assets",
  "photo_tags",
  "staff_audit_log",
]

test("the migration names every private record and uses stable ids", () => {
  for (const table of tables) {
    assert.match(schema, new RegExp(`CREATE TABLE "${table}"`))
  }
  assert.match(schema, /uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/)
  assert.match(schema, /"public_display_name" text/)
  assert.match(schema, /"legal_name" text/)
  assert.match(schema, /"identity_user_id" text UNIQUE/)
  assert.match(schema, /PRIMARY KEY\("guardian_id","player_id"\)/)
  assert.doesNotMatch(schema, /date_of_birth|birth_date/)
  assert.doesNotMatch(schema, /INSERT INTO/i)
  assert.doesNotMatch(schema, /@/)
  assert.match(schema, /"match_status" <> 'ambiguous' OR "player_id" IS NULL/)
  assert.match(schema, /"match_status" <> 'exact' OR "player_id" IS NOT NULL/)
  assert.match(schema, /"match_status" <> 'unmatched' OR "player_id" IS NULL/)
  assert.match(schema, /"status" <> 'granted' OR \("granted_at" IS NOT NULL AND "withdrawn_at" IS NULL\)/)
  assert.match(schema, /REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC/)
  assert.match(schema, /REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC/)
  assert.match(schema, /ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC/)
  assert.match(schema, /ENABLE ROW LEVEL SECURITY/)
  assert.match(schema, /FORCE ROW LEVEL SECURITY/)
  assert.doesNotMatch(schema, /GRANT .* TO PUBLIC/i)
})

test("the database package is installed only for the approved preview branch", () => {
  assert.match(readme, /Production stays on `main`/)
  assert.match(readme, /@netlify\/database` is installed on this review branch/)
  assert.match(readme, /Do not merge this branch to `main`/)
  assert.match(packageJson, /"@netlify\/database"/)
  assert.match(packageJson, /drizzle-orm/)
  assert.match(read("db/schema.ts"), /identity_user_id/)
})
