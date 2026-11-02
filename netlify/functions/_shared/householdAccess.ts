const IDENTITY_USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Netlify Identity user ids are UUIDs. An email address is not an account key. */
export function isIdentityUserId(value: string): boolean {
  return IDENTITY_USER_ID.test(value)
}

export type IdentityClaim = { ok: true } | { ok: false; reason: "missing" | "duplicate" }

/**
 * One existing Identity account can be attached once. A second row for the same
 * user id is rejected, including when that account is already super_admin.
 */
export function claimGuardianIdentity(existingIdentityIds: readonly string[], identityUserId: string): IdentityClaim {
  if (!isIdentityUserId(identityUserId)) return { ok: false, reason: "missing" }
  if (existingIdentityIds.some((id) => id.toLowerCase() === identityUserId.toLowerCase())) {
    return { ok: false, reason: "duplicate" }
  }
  return { ok: true }
}

export type HouseholdReader = {
  actorUserId: string
  actorRoles: readonly string[]
  householdGuardianUserIds: readonly string[]
}

/**
 * A person reads a household only when their Identity user id is already on it.
 * super_admin may also read it for staff verification. Coach and Club Administrator
 * roles do not open another household. The same user id keeps super_admin and guardian access.
 */
export function mayReadHousehold(input: HouseholdReader): boolean {
  if (!isIdentityUserId(input.actorUserId)) return false
  const actor = input.actorUserId.toLowerCase()
  if (input.householdGuardianUserIds.some((id) => id.toLowerCase() === actor)) return true
  return input.actorRoles.includes("super_admin")
}
