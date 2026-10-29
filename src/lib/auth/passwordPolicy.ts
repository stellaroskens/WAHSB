/**
 * Staff password policy for invite accept + recovery forms.
 *
 * Netlify Identity (managed GoTrue) does not enforce a minimum password length
 * or special-character rules in site settings — `validatePassword` only rejects
 * oversized passwords. UI validation is the app's responsibility. This site
 * requires at least 5 characters and does not require symbols, uppercase, or
 * mixed character classes so coaches can use memorable letter/number passwords.
 * Symbols and spaces are still allowed; they are simply optional.
 */

export const STAFF_PASSWORD_MIN_LENGTH = 5

export const STAFF_PASSWORD_HELP =
  `Use at least ${STAFF_PASSWORD_MIN_LENGTH} characters. Letters and numbers are enough — special symbols are optional. Uppercase letters are not required.`

export const STAFF_PASSWORD_TOO_SHORT =
  `Use a password with at least ${STAFF_PASSWORD_MIN_LENGTH} characters. Letters and numbers are enough; symbols and uppercase are optional.`

export const STAFF_PASSWORD_MISMATCH = "Passwords do not match."

export type StaffPasswordValidation =
  | { ok: true }
  | { ok: false; error: string }

export function validateStaffPassword(password: string): StaffPasswordValidation {
  if (password.length < STAFF_PASSWORD_MIN_LENGTH) {
    return { ok: false, error: STAFF_PASSWORD_TOO_SHORT }
  }
  return { ok: true }
}

export function validateStaffPasswordPair(password: string, confirmPassword: string): StaffPasswordValidation {
  if (password !== confirmPassword) {
    return { ok: false, error: STAFF_PASSWORD_MISMATCH }
  }
  return validateStaffPassword(password)
}
