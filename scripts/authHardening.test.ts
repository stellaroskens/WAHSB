import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { deniedHook, deniedResponse } from "../netlify/functions/_shared/requireAuth.ts"

describe("shared sign-in responses", () => {
  it("returns the fields the editor already reads and does not trust a request body", async () => {
    const response = deniedResponse(401, "Sign in required.", "unauthorized")
    const body = (await response.json()) as { error: string; message: string; code: string; commitSha: null }
    assert.equal(response.status, 401)
    assert.equal(body.error, "unauthorized")
    assert.equal(body.message, "Sign in required.")
    assert.equal(body.code, "unauthorized")
    assert.equal(body.commitSha, null)

    const forbidden = deniedResponse(403, "Staff role required.", "forbidden")
    const denied = (await forbidden.json()) as { error: string; code: string; commitSha: null }
    assert.equal(forbidden.status, 403)
    assert.equal(denied.error, "forbidden")
    assert.equal(denied.code, "forbidden")
    assert.equal(denied.commitSha, null)

    const source = readFileSync(new URL("../netlify/functions/_shared/requireAuth.ts", import.meta.url), "utf8")
    const household = readFileSync(new URL("../netlify/functions/private-household.ts", import.meta.url), "utf8")
    assert.match(source, /getUser\(\)/)
    assert.doesNotMatch(source, /clientContext/)
    assert.doesNotMatch(source, /req\.json|req\.headers/)
    assert.match(household, /requireIdentityUser\(context\)/)
    assert.doesNotMatch(household, /getUser\(/)
  })

  it("rejects a malformed identity hook without assigning a role", async () => {
    const { handler } = await import("../netlify/functions/identity-signup.ts")
    const result = (await handler({ body: "{" } as never, {} as never, () => {})) as { statusCode: number; body: string }
    assert.equal(result.statusCode, 400)
    const body = JSON.parse(result.body) as { error: string; code: string; commitSha: null; app_metadata?: unknown }
    assert.equal(body.error, "bad_request")
    assert.equal(body.code, "invalid_identity_event")
    assert.equal(body.commitSha, null)
    assert.equal(body.app_metadata, undefined)
    assert.equal(deniedHook(400, "The identity event was not valid. No role was assigned.", "invalid_identity_event").statusCode, 400)
  })
})
