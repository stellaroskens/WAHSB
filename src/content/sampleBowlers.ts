/**
 * FICTIONAL PREVIEW DATA
 * These people are not students. Do not replace this list with a real roster
 * in frontend code or in a public file.
 *
 * Before production, look up bowlers on a server with an approved student
 * list, consent, input validation, and rate limiting. Matching a first name
 * is search behavior, not authentication.
 */

export type SampleBowler = {
  id: string
  firstName: string
  lastName: string
}

export const fictionalSampleBowlers: SampleBowler[] = [
  { id: "sample-avery-lang", firstName: "Avery", lastName: "Lang" },
  { id: "sample-avery-quinn", firstName: "Avery", lastName: "Quinn" },
  { id: "sample-casey-morgan", firstName: "Casey", lastName: "Morgan" },
  { id: "sample-jordan-hale", firstName: "Jordan", lastName: "Hale" },
  { id: "sample-jordan-santos", firstName: "Jordan", lastName: "Santos" },
  { id: "sample-jordan-smith", firstName: "Jordan", lastName: "Smith" },
  { id: "sample-morgan-smith", firstName: "Morgan", lastName: "Smith" },
  { id: "sample-riley-brooks", firstName: "Riley", lastName: "Brooks" },
  { id: "sample-riley-chen", firstName: "Riley", lastName: "Chen" },
  { id: "sample-sam-ortiz", firstName: "Sam", lastName: "Ortiz" },
]

export function normalizeFirstName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

export function fullName(bowler: SampleBowler) {
  return `${bowler.firstName} ${bowler.lastName}`
}

function sortBowlers(bowlers: SampleBowler[]) {
  return bowlers.slice().sort(
    (a, b) =>
      a.lastName.localeCompare(b.lastName) ||
      a.firstName.localeCompare(b.firstName) ||
      a.id.localeCompare(b.id),
  )
}

/** Exact full first name only, after trimming and ignoring case. */
export function findByExactFirstName(bowlers: SampleBowler[], raw: string) {
  const query = normalizeFirstName(raw)
  if (!query) return []

  return sortBowlers(
    bowlers.filter((bowler) => normalizeFirstName(bowler.firstName) === query),
  )
}

/**
 * Preview search only.
 * Matches a full first name, a full first name plus last initial ("Jordan S"),
 * or a full last name ("Smith"). Partial names are not suggested.
 */
export function searchSampleBowlers(bowlers: SampleBowler[], raw: string) {
  const query = raw.trim().replace(/\s+/g, " ")
  if (!query) return []

  const initial = query.match(/^([A-Za-z][A-Za-z'-]*)\s+([A-Za-z])\.?$/)
  if (initial) {
    const first = initial[1].toLowerCase()
    const letter = initial[2].toLowerCase()
    return sortBowlers(
      bowlers.filter(
        (bowler) =>
          bowler.firstName.toLowerCase() === first &&
          bowler.lastName.toLowerCase().startsWith(letter),
      ),
    )
  }

  if (/\s/.test(query)) return []

  const token = query.toLowerCase()
  const seen = new Set<string>()
  const matches = bowlers.filter((bowler) => {
    const hit =
      bowler.firstName.toLowerCase() === token || bowler.lastName.toLowerCase() === token
    if (!hit || seen.has(bowler.id)) return false
    seen.add(bowler.id)
    return true
  })
  return sortBowlers(matches)
}

/** Last name, first name. Identical preview names get a numbered label. */
export function bowlerResultLabel(bowler: SampleBowler, matches: readonly SampleBowler[]) {
  const base = `${bowler.lastName}, ${bowler.firstName}`
  const twins = matches.filter(
    (item) => item.firstName === bowler.firstName && item.lastName === bowler.lastName,
  )
  if (twins.length < 2) return base
  const index = twins.findIndex((item) => item.id === bowler.id) + 1
  return `${base} (preview ${index})`
}
