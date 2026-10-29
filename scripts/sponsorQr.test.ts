import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { sponsorshipQrImageUrl, sponsorshipQrTarget } from "../src/lib/sponsorQr.ts"

const published = JSON.parse(
  readFileSync(new URL("../src/content/published/siteConnections.json", import.meta.url), "utf8"),
) as { sharing: { publicSponsorshipUrl: string | null } }

describe("sponsorship QR prep", () => {
  it("does not invent a sponsorship destination when none is approved", () => {
    assert.equal(published.sharing.publicSponsorshipUrl, null)
    assert.equal(sponsorshipQrTarget(published.sharing.publicSponsorshipUrl), null)
    assert.equal(sponsorshipQrTarget("http://insecure.example/pay"), null)
    assert.equal(sponsorshipQrTarget("https://localhost/sponsors"), null)
  })

  it("builds a QR image URL only for an explicit public target", () => {
    const approved = sponsorshipQrTarget("https://albany-hs-bowling.netlify.app/sponsors")
    assert.equal(approved, "https://albany-hs-bowling.netlify.app/sponsors")
    const url = sponsorshipQrImageUrl(approved!)
    assert.match(url, /^https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?/)
    assert.match(url, /albany-hs-bowling\.netlify\.app/)
  })
})
