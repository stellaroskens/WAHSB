import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { describe, it } from "node:test"
import { readFileSync } from "node:fs"
import { parseSiteConnections } from "../src/lib/content/siteConnectionsModel.ts"
import {
  decideDonationCheckout,
  destinationCouldGoLive,
  dollarsToCents,
  parseDonationAmountCents,
} from "../src/lib/payments/donations.ts"
import { verifyStripeSignature } from "../src/lib/payments/stripeSignature.ts"

const connections = parseSiteConnections(JSON.parse(readFileSync(new URL("../src/content/published/siteConnections.json", import.meta.url), "utf8")))

describe("donation amounts", () => {
  it("accepts whole cents inside the published limit", () => {
    assert.equal(parseDonationAmountCents(2500), 2500)
    assert.equal(dollarsToCents("10"), 1000)
    assert.equal(dollarsToCents("10.50"), 1050)
    assert.equal(dollarsToCents("0.50"), null)
    assert.equal(dollarsToCents("1000.01"), null)
    assert.equal(dollarsToCents("10.555"), null)
    assert.equal(parseDonationAmountCents(10.5), null)
    assert.equal(parseDonationAmountCents(-100), null)
  })
})

describe("donation checkout gate", () => {
  it("refuses every method while live payments and records are off", () => {
    for (const method of ["card", "paypal", "venmo", "cash_app"]) {
      const decision = decideDonationCheckout({
        amountCents: 2500,
        method,
        paymentsLive: false,
        recordsConfigured: false,
        stripeConfigured: false,
        connections,
      })
      assert.equal(decision.ok, false)
      if (!decision.ok) {
        assert.equal(decision.code, "payments_not_live")
        assert.equal(decision.paid, false)
        assert.equal(decision.saved, false)
      }
    }
  })

  it("does not trust a browser price or a personal payment profile", () => {
    const decision = decideDonationCheckout({
      amountCents: 1,
      method: "card",
      paymentsLive: true,
      recordsConfigured: true,
      stripeConfigured: true,
      connections,
    })
    assert.equal(decision.ok, false)
    if (!decision.ok) assert.equal(decision.code, "invalid_amount")
    assert.equal(destinationCouldGoLive("venmo", "https://venmo.com/u/albanybowling"), false)
    assert.equal(destinationCouldGoLive("paypal", "https://paypal.me/example"), false)
    assert.equal(destinationCouldGoLive("stripe", "https://buy.stripe.com/test_example"), true)
  })

  it("keeps checkout off when the provider flag is on but records are missing", () => {
    const prepared = structuredClone(connections)
    const stripe = prepared.payments.find((item) => item.id === "stripe")
    assert.ok(stripe)
    stripe.status = "verified"
    stripe.liveEnabled = true
    stripe.publicDestination = "https://buy.stripe.com/test_example"
    const decision = decideDonationCheckout({
      amountCents: 2500,
      method: "card",
      paymentsLive: true,
      recordsConfigured: false,
      stripeConfigured: true,
      connections: prepared,
    })
    assert.equal(decision.ok, false)
    if (!decision.ok) assert.equal(decision.code, "donation_records_unavailable")
  })
})

describe("stripe webhook signatures", () => {
  it("rejects a missing or altered signature and accepts the matching payload once", async () => {
    const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" })
    const secret = "whsec_test_secret"
    const now = 1_700_000_000
    assert.equal(await verifyStripeSignature(payload, null, secret, now), "missing")
    assert.equal(await verifyStripeSignature(payload, `t=${now},v1=abcd`, secret, now), "invalid")
    const signature = createHmac("sha256", secret).update(`${now}.${payload}`, "utf8").digest("hex")
    assert.equal(await verifyStripeSignature(payload, `t=${now},v1=${signature}`, secret, now), "valid")
    assert.equal(await verifyStripeSignature(payload, `t=${now},v1=${signature}`, secret, now + 301), "invalid")
    assert.equal(await verifyStripeSignature(payload + " ", `t=${now},v1=${signature}`, secret, now), "invalid")
  })
})
