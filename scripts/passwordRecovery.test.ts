import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import {
  RECOVERY_RATE_LIMITED,
  RECOVERY_RATE_LIMIT_COOLDOWN_SECONDS,
  RECOVERY_REQUESTED,
  RECOVERY_UNREACHABLE,
  isRateLimitError,
  recoveryHelpText,
  recoveryOutcomeFromError,
} from "../src/lib/auth/recovery.ts"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const form = read("src/components/auth/PasswordRecoveryForm.tsx")
const staffLogin = read("src/pages/staff/StaffLogin.tsx")

class FakeAuthError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

describe("password recovery outcomes", () => {
  it("recognises Netlify rate limits by status or message", () => {
    assert.equal(isRateLimitError(new FakeAuthError("Rate limit exceeded, try again later", 429)), true)
    assert.equal(isRateLimitError(new FakeAuthError("Rate limit exceeded")), true)
    assert.equal(isRateLimitError(new FakeAuthError("Too Many Requests", 400)), true)
    assert.equal(isRateLimitError(new FakeAuthError("User not found", 404)), false)
    assert.equal(isRateLimitError(null), false)
    assert.equal(isRateLimitError("Rate limit exceeded"), false)
  })

  it("explains rate limits in plain language instead of the raw provider text", () => {
    const outcome = recoveryOutcomeFromError(new FakeAuthError("Rate limit exceeded, try again later", 429))
    assert.deepEqual(outcome, { kind: "rate_limited", message: RECOVERY_RATE_LIMITED })
    assert.doesNotMatch(RECOVERY_RATE_LIMITED, /Rate limit exceeded/)
    assert.match(RECOVERY_RATE_LIMITED, /wait at least 15 minutes/)
  })

  it("does not reveal whether an email has an account", () => {
    assert.deepEqual(recoveryOutcomeFromError(new FakeAuthError("User not found", 404)), {
      kind: "requested",
      message: RECOVERY_REQUESTED,
    })
    assert.deepEqual(recoveryOutcomeFromError(new FakeAuthError("Unprocessable", 422)), {
      kind: "requested",
      message: RECOVERY_REQUESTED,
    })
    assert.match(RECOVERY_REQUESTED, /^Recovery email requested\./)
    assert.match(RECOVERY_REQUESTED, /If an approved staff account uses that email/)
  })

  it("reports network failures separately so staff know to retry", () => {
    assert.deepEqual(recoveryOutcomeFromError(new TypeError("Failed to fetch")), {
      kind: "unreachable",
      message: RECOVERY_UNREACHABLE,
    })
  })

  it("tells staff how to reach the site administrator without sharing passwords", () => {
    const help = recoveryHelpText("team@example.org")
    assert.match(help, /team@example\.org/)
    assert.match(help, /site administrator/)
    assert.match(help, /never send your password/)
  })
})

describe("password recovery form", () => {
  it("locks the button while sending, after success, and during the rate-limit cooldown", () => {
    assert.match(form, /const locked = busy \|\| alreadyRequested \|\| secondsLeft > 0/)
    assert.match(form, /disabled=\{locked\}/)
    assert.match(form, /if \(inFlight\.current \|\| locked\) return/)
    assert.match(form, /"Recovery email requested"/)
    assert.ok(RECOVERY_RATE_LIMIT_COOLDOWN_SECONDS >= 30)
  })

  it("still uses Netlify Identity through the shared auth provider", () => {
    assert.match(form, /const \{ requestRecovery \} = useAuth\(\)/)
    assert.doesNotMatch(form, /fetch\(|\/\.netlify\/identity|\/api\//)
    assert.doesNotMatch(form, /localStorage|sessionStorage/)
  })

  it("is the recovery form on /staff/login", () => {
    assert.match(staffLogin, /<PasswordRecoveryForm variant="admin"/)
    assert.doesNotMatch(staffLogin, /onRequestRecovery|requestRecovery\(/)
  })
})
