import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { parseSiteContent, validateSiteContent } from "../src/lib/content/siteContent.ts"

const published = JSON.parse(
  readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8"),
) as unknown

describe("published site content", () => {
  it("validates the checked-in published content", () => {
    assert.deepEqual(validateSiteContent(published), [])
    const content = parseSiteContent(published)
    assert.equal(content.teamGearShop.name, "BSN SPORTS")
    assert.equal(content.sterlingVolunteerInvitationUrl, null)
  })

  it("rejects missing venue references", () => {
    const broken = structuredClone(published) as {
      practiceTournaments: { venueId: string }[]
    }
    broken.practiceTournaments[0].venueId = "missing-venue"
    const issues = validateSiteContent(broken)
    assert.ok(issues.some((issue) => issue.path.includes("venueId") && issue.message.includes("missing-venue")))
  })

  it("rejects tournaments with only one of start/end time", () => {
    const broken = structuredClone(published) as {
      practiceTournaments: { startTime: string | null; endTime: string | null }[]
    }
    broken.practiceTournaments[0].startTime = "09:00"
    broken.practiceTournaments[0].endTime = null
    const issues = validateSiteContent(broken)
    assert.ok(issues.some((issue) => issue.path.includes("endTime")))
  })
})
