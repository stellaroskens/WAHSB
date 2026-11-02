import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const schema = readFileSync(new URL("../db/proposed/001_private_foundation.sql", import.meta.url), "utf8")
const readme = readFileSync(new URL("../db/README.md", import.meta.url), "utf8")
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8")

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

test("the proposed schema names every private record and uses stable ids", () => {
  for (const table of tables) {
    assert.match(schema, new RegExp(`CREATE TABLE ${table} \\(`))
  }
  assert.match(schema, /id uuid PRIMARY KEY/)
  assert.match(schema, /public_display_name text/)
  assert.match(schema, /legal_name text/)
  assert.doesNotMatch(schema, /date_of_birth|birth_date/)
  assert.doesNotMatch(schema, /INSERT INTO/i)
  assert.doesNotMatch(schema, /@/)
  assert.match(schema, /match_status <> 'ambiguous' OR player_id IS NULL/)
  assert.match(schema, /REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC/)
})

test("the schema is not wired to a database package or a public content file", () => {
  assert.match(readme, /not connected to a database/)
  assert.match(readme, /Do not add `@netlify\/database`/)
  assert.doesNotMatch(packageJson, /@netlify\/database/)
  assert.doesNotMatch(packageJson, /drizzle-orm/)
})
