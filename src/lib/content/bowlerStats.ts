import type { SchoolId } from "./schoolLogos.ts"

/**
 * Statistic rules used by the player pages.
 *
 * Strike % = strikes / (strikes + spares + opens), when all three counts are entered and the sum is greater than zero.
 * Fill % = (strikes + spares) / (strikes + spares + opens), on that same count.
 * Those counts are first-ball strikes, converted spares, and opens. They are not inferred from pinfall.
 * Average = total pins / games played, when both numbers are entered.
 * Participation % is not calculated. The schedule does not store how many games a bowler could have bowled.
 * High game and high series are entered results, not guessed from the other columns.
 * A blank cell means the number was not entered. It is not a verified zero.
 */

export type BowlerResultStatus = "draft" | "published"

export type BowlerResult = {
  id: string
  profileId: string
  tournamentId: string | null
  tournamentName: string
  date: string | null
  school: SchoolId | null
  bowlingCenter: string | null
  gamesPlayed: number | null
  strikes: number | null
  spares: number | null
  opens: number | null
  total: number | null
  highGame: number | null
  highSeries: number | null
  notes: string | null
  status: BowlerResultStatus
}

export type BowlerHonor = {
  id: string
  profileId: string
  title: string
  date: string | null
  detail: string | null
  status: BowlerResultStatus
}

export type CountPercents = { strikePct: number; fillPct: number }

export function countPercents(result: Pick<BowlerResult, "strikes" | "spares" | "opens">): CountPercents | null {
  const { strikes, spares, opens } = result
  if (strikes == null || spares == null || opens == null) return null
  const frames = strikes + spares + opens
  if (frames <= 0) return null
  return { strikePct: (strikes / frames) * 100, fillPct: ((strikes + spares) / frames) * 100 }
}

export function bowlingAverage(result: Pick<BowlerResult, "total" | "gamesPlayed">): number | null {
  if (result.total == null || result.gamesPlayed == null || result.gamesPlayed <= 0) return null
  return result.total / result.gamesPlayed
}

export function formatStat(value: number | null, digits = 0): string {
  if (value == null || Number.isNaN(value)) return "Not entered"
  return digits > 0 ? value.toFixed(digits) : String(value)
}

export function formatPercent(value: number | null): string {
  if (value == null) return "Not entered"
  return `${value.toFixed(1)}%`
}

type EventDate = { id: string; year: number | null; month: number; day: number }

export function eventIsUpcoming(event: EventDate, today: Date): boolean {
  if (event.year == null) return true
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const when = new Date(event.year, event.month - 1, event.day)
  return when >= start
}

function intIn(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
}

function optionalInt(value: unknown, min: number, max: number): boolean {
  return value === null || intIn(value, min, max)
}

export function validateBowlerRecords(
  results: unknown,
  honors: unknown,
  profileIds: ReadonlySet<string>,
  events: readonly EventDate[],
  issues: { path: string; message: string }[],
  today = new Date(),
) {
  if (!Array.isArray(results)) {
    issues.push({ path: "bowlerResults", message: "bowlerResults must be an array." })
  } else {
    results.forEach((record, index) => {
      const path = `bowlerResults.${index}`
      if (typeof record !== "object" || record === null) {
        issues.push({ path, message: "Invalid tournament result." })
        return
      }
      const row = record as Record<string, unknown>
      if (typeof row.profileId !== "string" || !profileIds.has(row.profileId)) {
        issues.push({ path: `${path}.profileId`, message: "Choose a bowler that already exists." })
      }
      if (typeof row.tournamentName !== "string" || !row.tournamentName.trim()) {
        issues.push({ path: `${path}.tournamentName`, message: "Enter the tournament name." })
      }
      if (row.tournamentId !== null) {
        const event = events.find((item) => item.id === row.tournamentId)
        if (!event) issues.push({ path: `${path}.tournamentId`, message: "That tournament is not on the club schedule." })
        else if (eventIsUpcoming(event, today)) {
          issues.push({ path: `${path}.tournamentId`, message: "Do not mark an upcoming tournament as attended." })
        }
      }
      if (!optionalInt(row.gamesPlayed, 0, 24)) issues.push({ path: `${path}.gamesPlayed`, message: "Games must be a whole number from 0 to 24, or empty." })
      for (const key of ["strikes", "spares", "opens"] as const) {
        if (!optionalInt(row[key], 0, 400)) issues.push({ path: `${path}.${key}`, message: "Use a whole number, or leave it empty." })
      }
      if (!optionalInt(row.total, 0, 7200)) issues.push({ path: `${path}.total`, message: "Total pins must be a whole number, or empty." })
      if (!optionalInt(row.highGame, 0, 300)) issues.push({ path: `${path}.highGame`, message: "High game must be from 0 to 300, or empty." })
      if (!optionalInt(row.highSeries, 0, 1200)) issues.push({ path: `${path}.highSeries`, message: "High series must be from 0 to 1200, or empty." })
      if (row.status !== "draft" && row.status !== "published") {
        issues.push({ path: `${path}.status`, message: "A result is either a draft or published." })
      }
    })
  }
  if (!Array.isArray(honors)) {
    issues.push({ path: "bowlerHonors", message: "bowlerHonors must be an array." })
  } else {
    honors.forEach((record, index) => {
      const path = `bowlerHonors.${index}`
      if (typeof record !== "object" || record === null) {
        issues.push({ path, message: "Invalid honor." })
        return
      }
      const row = record as Record<string, unknown>
      if (typeof row.profileId !== "string" || !profileIds.has(row.profileId)) {
        issues.push({ path: `${path}.profileId`, message: "Choose a bowler that already exists." })
      }
      if (typeof row.title !== "string" || !row.title.trim()) {
        issues.push({ path: `${path}.title`, message: "Enter the honor." })
      }
      if (row.status !== "draft" && row.status !== "published") {
        issues.push({ path: `${path}.status`, message: "An honor is either a draft or published." })
      }
    })
  }
}

export function publishedResultsFor(results: readonly BowlerResult[], profileId: string): BowlerResult[] {
  return results.filter((result) => result.profileId === profileId && result.status === "published")
}

export function summaryFromResults(results: readonly BowlerResult[]) {
  const games = results.reduce((sum, result) => sum + (result.gamesPlayed ?? 0), 0)
  const gamesKnown = results.some((result) => result.gamesPlayed != null)
  const pins = results.reduce((sum, result) => sum + (result.total ?? 0), 0)
  const pinsKnown = results.some((result) => result.total != null)
  const highGame = results.reduce<number | null>((best, result) => {
    if (result.highGame == null) return best
    return best == null ? result.highGame : Math.max(best, result.highGame)
  }, null)
  const highSeries = results.reduce<number | null>((best, result) => {
    if (result.highSeries == null) return best
    return best == null ? result.highSeries : Math.max(best, result.highSeries)
  }, null)
  const average = gamesKnown && pinsKnown && games > 0 ? pins / games : null
  return {
    tournaments: results.length,
    games: gamesKnown ? games : null,
    average,
    highGame,
    highSeries,
  }
}
