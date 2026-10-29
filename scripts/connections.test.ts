import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import {
  anyPaymentsLive,
  livePaymentDestinations,
  looksLikeSecret,
  parseSiteConnections,
  validateSiteConnections,
} from "../src/lib/content/siteConnectionsModel.ts"
import { hasPermission } from "../src/lib/auth/permissions.ts"

const published = JSON.parse(
  readFileSync(new URL("../src/content/published/siteConnections.json", import.meta.url), "utf8"),
) as unknown

describe("site connections", () => {
  it("ships all payment options disabled and unverified", () => {
    assert.deepEqual(validateSiteConnections(published), [])
    const config = parseSiteConnections(published)
    assert.equal(config.payments.length, 4)
    assert.ok(config.payments.every((item) => item.liveEnabled === false))
    assert.ok(config.payments.every((item) => item.status === "disabled"))
    assert.equal(anyPaymentsLive(config), false)
    assert.deepEqual(livePaymentDestinations(config), [])
  })

  it("rejects secrets and live payments that are not verified", () => {
    assert.equal(looksLikeSecret("sk_live_example"), true)
    assert.equal(looksLikeSecret("https://paypal.me/example"), false)

    const badSecret = structuredClone(published) as {
      payments: { publicDestination: string | null }[]
    }
    badSecret.payments[0].publicDestination = "sk_live_not_allowed"
    assert.ok(validateSiteConnections(badSecret).some((issue) => issue.message.includes("secret") || issue.message.includes("Secrets")))

    const badLive = structuredClone(published) as {
      payments: { status: string; liveEnabled: boolean; publicDestination: string | null }[]
    }
    badLive.payments[0].status = "prepared"
    badLive.payments[0].liveEnabled = true
    badLive.payments[0].publicDestination = "https://example.com/pay"
    assert.ok(
      validateSiteConnections(badLive).some((issue) => issue.path.includes("liveEnabled")),
    )
  })

  it("only super_admin may manage live payment activation permission", () => {
    assert.equal(hasPermission(["super_admin"], "manage_payments"), true)
    assert.equal(hasPermission(["coach"], "manage_payments"), false)
    assert.equal(hasPermission(["team_administrator"], "manage_payments"), false)
    assert.equal(hasPermission(["team_administrator"], "prepare_connections"), true)
    assert.equal(hasPermission(["coach"], "prepare_connections"), false)
  })
})
