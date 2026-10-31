import assert from "node:assert/strict"
import { existsSync, readFileSync, statSync } from "node:fs"
import { describe, it } from "node:test"
import { mayEditBowlerProfiles, mayPublishBowlerProfiles, roleMayAccessPath } from "../src/lib/auth/permissions.ts"
import { COACH_ROLE, SUPER_ADMIN_ROLE, TEAM_ADMINISTRATOR_ROLE } from "../src/lib/auth/roles.ts"
import {
  isPublicBowler,
  profilePublishDecision,
  publicBowlerArtwork,
  updateBowlerProfile,
  visibleBowlerProfiles,
  type BowlerProfile,
} from "../src/lib/content/bowlerProfiles.ts"
import {
  bowlingAverage,
  countPercents,
  eventIsUpcoming,
  formatStat,
  publishedResultsFor,
  summaryFromResults,
  validateBowlerRecords,
  type BowlerResult,
} from "../src/lib/content/bowlerStats.ts"
import { AHSB_LOGO, SCHOOLS, SCHOOL_IDS } from "../src/lib/content/schoolLogos.ts"
import { parseSiteContent, validateSiteContent } from "../src/lib/content/siteContent.ts"
import { FAMILY_ACCESS_OPEN, familyPathIsDenied, familySessionMayAccess } from "../src/lib/family/familyAccess.ts"
import { hasPermission as serverHasPermission } from "../netlify/functions/_shared/permissions.ts"

const publishedText = readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8")
const published = JSON.parse(publishedText) as unknown

function unpublishedStudent(): BowlerProfile {
  return {
    id: "draft-student",
    displayName: "Unpublished student",
    school: "lebanon",
    logoStyle: "full",
    yearsBowling: null,
    grade: null,
    age: null,
    introduction: null,
    photoVisibility: "hidden",
    publicationStatus: "draft",
    hidden: true,
    placeholder: false,
    sample: false,
    sampleApproved: false,
    guardianApproved: false,
  }
}

function result(partial: Partial<BowlerResult>): BowlerResult {
  return {
    id: "result",
    profileId: "bowler-1",
    tournamentId: null,
    tournamentName: "Recorded result",
    date: null,
    school: null,
    bowlingCenter: null,
    gamesPlayed: null,
    strikes: null,
    spares: null,
    opens: null,
    total: null,
    highGame: null,
    highSeries: null,
    notes: null,
    status: "published",
    ...partial,
  }
}

describe("Meet the Bowlers directory", () => {
  it("publishes only the eight placeholder cards", () => {
    assert.equal(validateSiteContent(published).length, 0)
    const content = parseSiteContent(published)
    assert.equal(content.bowlerProfiles.length, 8)
    assert.deepEqual(
      content.bowlerProfiles.map((profile) => profile.id),
      ["bowler-1", "bowler-2", "bowler-3", "bowler-4", "bowler-5", "bowler-6", "bowler-7", "bowler-8"],
    )
    const visible = visibleBowlerProfiles(content.bowlerProfiles)
    assert.deepEqual(
      visible.map((profile) => profile.displayName),
      ["Bowler 1", "Bowler 2", "Bowler 3", "Bowler 4", "Bowler 5", "Bowler 6", "Bowler 7", "Bowler 8"],
    )
    assert.equal(visible.every((profile) => profile.school === null && profile.age === null && profile.yearsBowling === null), true)
    assert.equal(content.bowlerResults.length, 0)
    assert.equal(content.bowlerHonors.length, 0)
    const student = unpublishedStudent()
    assert.equal(isPublicBowler(student), false)
    assert.equal(profilePublishDecision(student).ok, false)
    const forced = { ...student, publicationStatus: "published" as const, hidden: false }
    assert.equal(isPublicBowler(forced), false)
    const next = structuredClone(content)
    next.bowlerProfiles = [...next.bowlerProfiles, forced]
    const issues = validateSiteContent(next)
    assert.equal(issues.some((issue) => issue.message.includes("cannot be published")), true)
    assert.match(readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8"), /meet-the-bowlers\/:playerId/)
  })

  it("shows one selected school logo and never a student photo", () => {
    const approved = [AHSB_LOGO, ...SCHOOL_IDS.flatMap((id) => [SCHOOLS[id].full, SCHOOLS[id].mark])]
    for (const src of approved) {
      const file = new URL(`../public${src}`, import.meta.url)
      assert.equal(existsSync(file), true, src)
      assert.equal(statSync(file).size > 1000, true, src)
    }
    for (const id of SCHOOL_IDS) {
      assert.notEqual(SCHOOLS[id].full, SCHOOLS[id].mark)
      const full = publicBowlerArtwork({ ...unpublishedStudent(), school: id, logoStyle: "full", photoVisibility: "hidden" })
      const mark = publicBowlerArtwork({ ...unpublishedStudent(), school: id, logoStyle: "mark", photoVisibility: "unavailable" })
      assert.deepEqual(full, { src: SCHOOLS[id].full, alt: SCHOOLS[id].fullAlt })
      assert.deepEqual(mark, { src: SCHOOLS[id].mark, alt: SCHOOLS[id].markAlt })
      assert.equal(full.src === mark.src, false)
    }
    const hidden = updateBowlerProfile([unpublishedStudent()], "draft-student", { photoVisibility: "hidden", logoStyle: "mark" })
    assert.equal(publicBowlerArtwork(hidden[0]).src, SCHOOLS.lebanon.mark)
    assert.equal(approved.includes(publicBowlerArtwork(hidden[0]).src), true)
    const content = parseSiteContent(published)
    assert.equal(publicBowlerArtwork(content.bowlerProfiles[0]).src, AHSB_LOGO)
    const withPhoto = structuredClone(content) as unknown as { bowlerProfiles: Record<string, unknown>[] }
    withPhoto.bowlerProfiles[0].photo = "/secret/student.png"
    const photoIssues = validateSiteContent(withPhoto)
    assert.equal(photoIssues.some((issue) => issue.path.endsWith(".photo")), true)
  })

  it("calculates only entered statistics and keeps a missing value distinct from zero", () => {
    const percents = countPercents({ strikes: 10, spares: 5, opens: 5 })
    assert.equal(percents?.strikePct, 50)
    assert.equal(percents?.fillPct, 75)
    assert.equal(countPercents({ strikes: 1, spares: null, opens: 1 }), null)
    assert.equal(bowlingAverage({ total: 450, gamesPlayed: 3 }), 150)
    assert.equal(bowlingAverage({ total: null, gamesPlayed: 3 }), null)
    assert.equal(formatStat(null), "Not entered")
    assert.equal(formatStat(0), "0")
    const mixed = summaryFromResults([
      result({ id: "complete", gamesPlayed: 3, total: 450, highGame: 180 }),
      result({ id: "missing-total", gamesPlayed: 3, total: null, highGame: null }),
    ])
    assert.equal(mixed.games, 6)
    assert.equal(mixed.average, 150)
    assert.equal(mixed.highGame, 180)
    const none = summaryFromResults([result({ gamesPlayed: null, total: null, highGame: null })])
    assert.equal(none.games, null)
    assert.equal(none.average, null)
    assert.equal(none.highGame, null)
    const verifiedZero = summaryFromResults([result({ gamesPlayed: 0, total: 0, highGame: 0 })])
    assert.equal(verifiedZero.games, 0)
    assert.equal(verifiedZero.average, null)
    assert.equal(verifiedZero.highGame, 0)
    assert.equal(publishedResultsFor([result({ status: "draft" })], "bowler-1").length, 0)
    const content = parseSiteContent(published)
    const issues: { path: string; message: string }[] = []
    validateBowlerRecords(
      [result({ tournamentId: "not-a-venue", tournamentName: "Unknown", highGame: 301, status: "draft" })],
      [],
      new Set(content.bowlerProfiles.map((profile) => profile.id)),
      content.practiceTournaments,
      issues,
      new Date(2026, 9, 30),
    )
    assert.equal(issues.some((issue) => issue.message.includes("not on the club schedule")), true)
    assert.equal(issues.some((issue) => issue.path.endsWith("highGame")), true)
    const upcoming: { path: string; message: string }[] = []
    validateBowlerRecords(
      [result({ tournamentId: content.practiceTournaments[0].id, tournamentName: content.practiceTournaments[0].name, status: "draft" })],
      [],
      new Set(["bowler-1"]),
      content.practiceTournaments,
      upcoming,
      new Date(2026, 9, 30),
    )
    assert.equal(upcoming.some((issue) => issue.message.includes("upcoming")), true)
    assert.equal(eventIsUpcoming(content.practiceTournaments[0], new Date(2026, 9, 30)), true)
    assert.equal(content.practiceTournaments.every((event) => event.startTime === null), true)
  })

  it("lets coach, club administrator, and super administrator edit, and only super administrator publish", () => {
    assert.equal(mayEditBowlerProfiles([SUPER_ADMIN_ROLE]), true)
    assert.equal(mayEditBowlerProfiles([COACH_ROLE]), true)
    assert.equal(mayEditBowlerProfiles([TEAM_ADMINISTRATOR_ROLE]), true)
    assert.equal(mayEditBowlerProfiles([]), false)
    assert.equal(mayEditBowlerProfiles(["family"]), false)
    assert.equal(mayPublishBowlerProfiles([SUPER_ADMIN_ROLE]), true)
    assert.equal(mayPublishBowlerProfiles([COACH_ROLE]), false)
    assert.equal(mayPublishBowlerProfiles([TEAM_ADMINISTRATOR_ROLE]), false)
    assert.equal(serverHasPermission([COACH_ROLE], "edit_coaching_info"), true)
    assert.equal(serverHasPermission([COACH_ROLE], "approve_publishing"), false)
    assert.equal(serverHasPermission([COACH_ROLE], "manage_payments"), false)
    assert.equal(serverHasPermission([TEAM_ADMINISTRATOR_ROLE], "edit_scheduling_ops"), true)
    assert.equal(serverHasPermission([TEAM_ADMINISTRATOR_ROLE], "approve_publishing"), false)
    assert.equal(serverHasPermission([SUPER_ADMIN_ROLE], "edit_public_content"), true)
    assert.equal(serverHasPermission([SUPER_ADMIN_ROLE], "approve_publishing"), true)
    assert.equal(serverHasPermission([], "edit_coaching_info"), false)
    assert.equal(roleMayAccessPath(COACH_ROLE, "/coach/bowlers"), true)
    assert.equal(roleMayAccessPath(COACH_ROLE, "/admin"), false)
    assert.equal(roleMayAccessPath(COACH_ROLE, "/team-administrator/bowlers"), false)
    assert.equal(roleMayAccessPath(TEAM_ADMINISTRATOR_ROLE, "/team-administrator/bowlers"), true)
    assert.equal(roleMayAccessPath(TEAM_ADMINISTRATOR_ROLE, "/coach/bowlers"), false)
    assert.equal(roleMayAccessPath(TEAM_ADMINISTRATOR_ROLE, "/admin"), false)
    assert.equal(roleMayAccessPath(SUPER_ADMIN_ROLE, "/admin"), true)
    assert.equal(roleMayAccessPath(SUPER_ADMIN_ROLE, "/coach/bowlers"), true)
    assert.equal(roleMayAccessPath(null, "/coach/bowlers"), false)
    assert.equal(FAMILY_ACCESS_OPEN, false)
    assert.equal(familySessionMayAccess("/coach/bowlers"), false)
    assert.equal(familyPathIsDenied("/admin/connections"), true)
    const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8")
    assert.match(app, /path="coach\/bowlers"[\s\S]*allow=\{\["coach", "super_admin"\]\}/)
    assert.match(app, /path="team-administrator\/bowlers"[\s\S]*allow=\{\["team_administrator", "super_admin"\]\}/)
    const toml = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8")
    assert.match(toml, /from = "\/coach\/\*"[\s\S]*Role = \["coach", "super_admin"\]/)
    assert.match(toml, /from = "\/team-administrator\/\*"[\s\S]*Role = \["team_administrator", "super_admin"\]/)
    assert.match(toml, /from = "\/admin\/\*"[\s\S]*Role = \["super_admin"\]/)
    const drafts = readFileSync(new URL("../netlify/functions/content-drafts.ts", import.meta.url), "utf8")
    const publish = readFileSync(new URL("../netlify/functions/content-publish.ts", import.meta.url), "utf8")
    assert.match(drafts, /requireEnabledStaffAuth/)
    assert.match(drafts, /edit_coaching_info/)
    assert.match(drafts, /edit_scheduling_ops/)
    assert.match(publish, /requireSuperAdmin/)
    assert.match(publish, /approve_publishing/)
    const editor = readFileSync(new URL("../src/pages/admin/BowlerProfileEditor.tsx", import.meta.url), "utf8")
    assert.match(editor, /Private image storage is not configured/)
    assert.doesNotMatch(editor, /<input[^>]*type="file"/)
  })
})
