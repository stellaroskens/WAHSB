/**
 * Staff password policy for invite accept + recovery forms.
 *
 * Netlify Identity (managed GoTrue) does not expose or enforce special-character
 * rules in site settings — UI validation is the app's responsibility. This site
 * keeps a 12-character minimum (stronger than Identity's weak defaults) and does
 * not require symbols so coaches can use memorable letter/number passwords.
 * Symbols and spaces are still allowed; they are simply optional.
 */

export const STAFF_PASSWORD_MIN_LENGTH = 12

export const STAFF_PASSWORD_HELP =
  `Use at least ${STAFF_PASSWORD_MIN_LENGTH} characters. Letters and numbers are enough — special symbols are optional.`

export const STAFF_PASSWORD_TOO_SHORT =
  `Use a password with at least ${STAFF_PASSWORD_MIN_LENGTH} characters. Letters and numbers are enough; symbols are optional.`

export type StaffPasswordValidation =
  | { ok: true }
  | { ok: false; error: string }

export function validateStaffPassword(password: string): StaffPasswordValidation {
  if (password.length < STAFF_PASSWORD_MIN_LENGTH) {
    return { ok: false, error: STAFF_PASSWORD_TOO_SHORT }
  }
  return { ok: true }
}
