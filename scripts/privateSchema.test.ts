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
  assert.match(schema, /REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC/)
})

test("the database package stays uninstalled until the owner links Netlify", () => {
  assert.match(readme, /not connected to a database/)
  assert.match(readme, /@netlify\/database` is not installed/)
  assert.doesNotMatch(packageJson, /@netlify\/database/)
  assert.match(packageJson, /drizzle-orm/)
  assert.match(read("db/schema.ts"), /identity_user_id/)
})
