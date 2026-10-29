/**
 * Family (parent and guardian) access is closed until an approved roster, a protected database,
 * per-record authorization, and a privacy review exist. Nothing here holds or loads roster data.
 */
export const FAMILY_ACCESS_OPEN = false

export const FAMILY_ACCESS_PENDING_MESSAGE =
  "Family accounts are being prepared. Invitations will be sent to approved roster email addresses when family access opens."

/** The invitation-only workflow family accounts must follow before any account opens. */
export const FAMILY_INVITE_WORKFLOW = [
  "An authorized administrator securely imports the approved team roster.",
  "Guardian email addresses are validated and normalized before use.",
  "The roster is never stored in public files, public JSON, or website code.",
  "An administrator approves each guardian-to-student connection.",
  "Invitations are sent only through the site's sign-in provider.",
  "Guardians confirm they own their email address before getting access.",
  "A guardian's relationship or authority is verified before any student information is linked.",
  "Each family sees only the records assigned to their own household.",
  "Requests for another student's information are refused.",
  "Incorrect connections can be corrected or removed at any time.",
] as const

/** Planned family dashboard sections. Each stays non-sensitive until guardian verification exists. */
export const FAMILY_DASHBOARD_PLANNED = [
  { title: "Family announcements", detail: "Team news for families." },
  { title: "Practice and tournament reminders", detail: "Upcoming dates from the public schedule." },
  { title: "Calendar links", detail: "Add team dates to your own calendar." },
  { title: "Approved team resources", detail: "Forms and guides the coaches have approved." },
  { title: "Household information", detail: "Only for verified guardians, only for their own household." },
  { title: "Photo consent", detail: "Specific permission from a verified guardian, which can be withdrawn at any time." },
  { title: "Contact preferences", detail: "How the team reaches your family." },
] as const

/** Must all exist before real family accounts or student records are enabled. */
export const FAMILY_ACCESS_PREREQUISITES = [
  "Approved team roster supplied by the coaches",
  "Protected database for household records (not public files or browser storage)",
  "Server-side, per-record authorization for every family request",
  "Administrator approval and correction tools for guardian connections",
  "Privacy review of what families can see",
] as const
