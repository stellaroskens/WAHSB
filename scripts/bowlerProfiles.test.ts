import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { mayEditBowlerProfiles, mayPublishBowlerProfiles } from "../src/lib/auth/permissions.ts"
import { COACH_ROLE, SUPER_ADMIN_ROLE, TEAM_ADMINISTRATOR_ROLE } from "../src/lib/auth/roles.ts"
import {
  JEREMIAH_PROFILE_ID,
  isPublicBowler,
  profilePublishDecision,
  publicBowlerArtwork,
  updateBowlerProfile,
  visibleBowlerProfiles,
} from "../src/lib/content/bowlerProfiles.ts"
import { bowlingAverage, countPercents, eventIsUpcoming, formatStat, validateBowlerRecords } from "../src/lib/content/bowlerStats.ts"
import { SCHOOLS } from "../src/lib/content/schoolLogos.ts"
import { parseSiteContent, validateSiteContent } from "../src/lib/content/siteContent.ts"
import { FAMILY_ACCESS_OPEN, familyPathIsDenied, familySessionMayAccess } from "../src/lib/family/familyAccess.ts"

const published = JSON.parse(readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8")) as unknown

describe("Meet the Bowlers directory", () => {
  it("publishes eight placeholders and keeps Jeremiah off the public page", () => {
    assert.equal(validateSiteContent(published).length, 0)
    const content = parseSiteContent(published)
    const visible = visibleBowlerProfiles(content.bowlerProfiles)
    assert.deepEqual(
      visible.map((profile) => profile.displayName),
      ["Bowler 1", "Bowler 2", "Bowler 3", "Bowler 4", "Bowler 5", "Bowler 6", "Bowler 7", "Bowler 8"],
    )
    assert.equal(visible.every((profile) => profile.school === null && profile.age === null && profile.yearsBowling === null), true)
    const jeremiah = content.bowlerProfiles.find((profile) => profile.id === JEREMIAH_PROFILE_ID)
    assert.ok(jeremiah)
    assert.equal(jeremiah.displayName, "Jeremiah Roskens")
    assert.equal(jeremiah.school, "lebanon")
    assert.equal(jeremiah.age, 14)
    assert.equal(jeremiah.yearsBowling, 2)
    assert.equal(jeremiah.grade, null)
    assert.equal(jeremiah.guardianApproved, false)
    assert.equal(jeremiah.publicationStatus, "draft")
    assert.equal(isPublicBowler(jeremiah), false)
    assert.equal(profilePublishDecision(jeremiah).ok, false)
    assert.equal(publicBowlerArtwork(jeremiah).src, SCHOOLS.lebanon.full)
    assert.equal(publicBowlerArtwork(visible[0]).src, "/images/schools/ahsb-main-logo.png")
    const hidden = updateBowlerProfile([jeremiah], jeremiah.id, { photoVisibility: "hidden", logoStyle: "mark" })
    assert.equal(publicBowlerArtwork(hidden[0]).src, SCHOOLS.lebanon.mark)
    assert.notEqual(publicBowlerArtwork(hidden[0]).src, SCHOOLS.lebanon.full)
    assert.match(readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8"), /meet-the-bowlers\/:playerId/)
  })

  it("calculates only entered statistics and rejects an upcoming event as attended", () => {
    const percents = countPercents({ strikes: 10, spares: 5, opens: 5 })
    assert.equal(percents?.strikePct, 50)
    assert.equal(percents?.fillPct, 75)
    assert.equal(countPercents({ strikes: 1, spares: null, opens: 1 }), null)
    assert.equal(bowlingAverage({ total: 450, gamesPlayed: 3 }), 150)
    assert.equal(bowlingAverage({ total: null, gamesPlayed: 3 }), null)
    assert.equal(formatStat(null), "Not entered")
    const content = parseSiteContent(published)
    const issues: { path: string; message: string }[] = []
    validateBowlerRecords(
      [
        {
          id: "result-1",
          profileId: "bowler-1",
          tournamentId: "not-a-venue",
          tournamentName: "Unknown",
          date: null,
          school: null,
          bowlingCenter: null,
          gamesPlayed: null,
          strikes: null,
          spares: null,
          opens: null,
          total: null,
          highGame: 301,
          highSeries: null,
          notes: null,
          status: "draft",
        },
      ],
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
      [
        {
          id: "result-2",
          profileId: "bowler-1",
          tournamentId: content.practiceTournaments[0].id,
          tournamentName: content.practiceTournaments[0].name,
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
          status: "draft",
        },
      ],
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

  it("limits editing to staff roles and keeps family access closed", () => {
    assert.equal(mayEditBowlerProfiles([SUPER_ADMIN_ROLE]), true)
    assert.equal(mayEditBowlerProfiles([COACH_ROLE]), true)
    assert.equal(mayEditBowlerProfiles([TEAM_ADMINISTRATOR_ROLE]), true)
    assert.equal(mayEditBowlerProfiles([]), false)
    assert.equal(mayEditBowlerProfiles(["family"]), false)
    assert.equal(mayPublishBowlerProfiles([SUPER_ADMIN_ROLE]), true)
    assert.equal(mayPublishBowlerProfiles([COACH_ROLE]), false)
    assert.equal(mayPublishBowlerProfiles([TEAM_ADMINISTRATOR_ROLE]), false)
    assert.equal(FAMILY_ACCESS_OPEN, false)
    assert.equal(familySessionMayAccess("/admin"), false)
    assert.equal(familySessionMayAccess("/coach/bowlers"), false)
    assert.equal(familyPathIsDenied("/admin/connections"), true)
    const drafts = readFileSync(new URL("../netlify/functions/content-drafts.ts", import.meta.url), "utf8")
    const publish = readFileSync(new URL("../netlify/functions/content-publish.ts", import.meta.url), "utf8")
    assert.match(drafts, /edit_coaching_info/)
    assert.match(drafts, /edit_scheduling_ops/)
    assert.match(publish, /requireSuperAdmin/)
    assert.match(publish, /approve_publishing/)
  })
})
