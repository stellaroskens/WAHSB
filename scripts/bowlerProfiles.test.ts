import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import {
  consentAllowsPublication,
  readConsentRecord,
  type BowlerConsentRecord,
} from "../src/lib/content/bowlerConsent.ts"
import {
  SAMPLE_BOWLER_ID,
  blankBowlerProfile,
  moveBowlerProfile,
  profilePublishDecision,
  removeBowlerProfile,
  updateBowlerProfile,
  visibleBowlerProfiles,
} from "../src/lib/content/bowlerProfiles.ts"
import { parseSiteContent, validateSiteContent } from "../src/lib/content/siteContent.ts"
import { FAMILY_ACCESS_OPEN, FAMILY_TEST_PROCEDURE, FAMILY_TEST_READY, familyPathIsDenied, familySessionMayAccess } from "../src/lib/family/familyAccess.ts"

const published = JSON.parse(
  readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8"),
) as unknown

const consent = (patch: Partial<BowlerConsentRecord>): BowlerConsentRecord => ({
  profileId: "bowler-1",
  guardianPermission: "documented",
  clubSchoolApproval: "documented",
  approvedFields: ["displayName", "introduction", "favoriteThing", "photograph"],
  photographPermission: "approved",
  consentDate: "2026-10-01",
  withdrawalStatus: "none",
  ...patch,
})

describe("Meet the Bowlers", () => {
  it("keeps the fictional sample off the public page", () => {
    assert.equal(validateSiteContent(published).length, 0)
    const content = parseSiteContent(published)
    const sample = content.bowlerProfiles.find((profile) => profile.id === SAMPLE_BOWLER_ID)
    assert.ok(sample)
    assert.equal(sample.displayName, "Sample Bowler")
    assert.equal(sample.roleLabel, "Team member")
    assert.equal(sample.introduction, "This is a sample profile showing how approved bowler information will appear.")
    assert.equal(sample.publicationStatus, "draft")
    assert.equal(sample.hidden, true)
    assert.equal(sample.sampleApproved, false)
    assert.equal(visibleBowlerProfiles(content.bowlerProfiles).length, 0)
    assert.equal(content.pageBodies.bowlers.title, "Meet the Bowlers")
    assert.match(readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8"), /meet-the-bowlers/)
    assert.match(readFileSync(new URL("../src/content/searchIndex.ts", import.meta.url), "utf8"), /\/meet-the-bowlers/)
    assert.match(readFileSync(new URL("../src/pages/MeetTheBowlers.tsx", import.meta.url), "utf8"), /visibleBowlerProfiles/)
  })

  it("saves an allowed biography edit and drops a removed or hidden profile", () => {
    const content = parseSiteContent(published)
    const edited = updateBowlerProfile(content.bowlerProfiles, SAMPLE_BOWLER_ID, {
      introduction: "This is a sample profile showing how approved bowler information will appear.",
    })
    const next = { ...content, bowlerProfiles: edited }
    assert.equal(validateSiteContent(next).length, 0)
    assert.equal(next.bowlerProfiles[0].introduction, content.bowlerProfiles[0].introduction)
    const hidden = updateBowlerProfile(edited, SAMPLE_BOWLER_ID, { hidden: true, publicationStatus: "hidden", sampleApproved: true })
    assert.equal(visibleBowlerProfiles(hidden).length, 0)
    assert.equal(removeBowlerProfile(edited, SAMPLE_BOWLER_ID).some((profile) => profile.id === SAMPLE_BOWLER_ID), false)
    const added = [...edited, blankBowlerProfile(edited)]
    const reordered = moveBowlerProfile(added, added[1].id, -1)
    assert.equal(reordered[0].id, added[1].id)
  })

  it("blocks publishing without explicit sample approval or private consent", () => {
    const content = parseSiteContent(published)
    const forced = {
      ...content,
      bowlerProfiles: updateBowlerProfile(content.bowlerProfiles, SAMPLE_BOWLER_ID, {
        publicationStatus: "published" as const,
        hidden: false,
        sampleApproved: false,
      }),
    }
    assert.ok(validateSiteContent(forced).some((issue) => issue.message.includes("cannot be published")))
    const decision = profilePublishDecision(content.bowlerProfiles[0])
    assert.equal(decision.ok, false)
    const student = blankBowlerProfile([])
    assert.equal(profilePublishDecision({ ...student, sample: false, sampleApproved: false }).ok, false)
    assert.equal(readConsentRecord({ ...consent({}), guardianEmail: "a@example.com" }).ok, false)
    assert.equal(consentAllowsPublication(consent({ guardianPermission: "not_recorded" })).ok, false)
    assert.equal(consentAllowsPublication(consent({ withdrawalStatus: "withdrawn" })).ok, false)
    assert.equal(consentAllowsPublication(consent({ guardianPermission: "expired" })).ok, false)
    assert.equal(consentAllowsPublication(consent({ consentDate: "2020-01-01" }), new Date("2026-10-30")).ok, false)
    const consentFn = readFileSync(new URL("../netlify/functions/bowler-consent.ts", import.meta.url), "utf8")
    assert.match(consentFn, /requireSuperAdmin/)
    assert.doesNotMatch(consentFn, /putFileContent|siteContent\.json/)
    assert.match(consentFn, /saved: false/)
  })

  it("keeps a family session out of staff and financial pages", () => {
    assert.equal(FAMILY_ACCESS_OPEN, false)
    assert.equal(FAMILY_TEST_READY, false)
    assert.equal(FAMILY_TEST_PROCEDURE.some((step) => /@/.test(step)), false)
    assert.equal(familySessionMayAccess("/admin"), false)
    assert.equal(familySessionMayAccess("/coach"), false)
    assert.equal(familySessionMayAccess("/team-administrator"), false)
    assert.equal(familySessionMayAccess("/admin/connections"), false)
    assert.equal(familyPathIsDenied("/admin/connections"), true)
    assert.equal(familyPathIsDenied("/family/household/other"), true)
    assert.equal(familySessionMayAccess("/family/household/other"), false)
  })
})
