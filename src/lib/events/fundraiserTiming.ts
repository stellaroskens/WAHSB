const ZONE = "America/Los_Angeles"

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
}

export type FundraiserTiming = "upcoming" | "active" | "past" | "unscheduled"

type WallDate = { year: number; month: number; day: number }
type Clock = { hour: number; minute: number }

export function parseFundraiserDate(when: string): WallDate | null {
  const match = when.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/)
  if (!match) return null
  const month = MONTHS[match[1].toLowerCase()]
  const day = Number(match[2])
  const year = Number(match[3])
  if (!month || day < 1 || day > 31 || year < 2000) return null
  return { year, month, day }
}

function parseClock(value: string): Clock | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3].toUpperCase()
  if (hour < 1 || hour > 12 || minute > 59) return null
  if (meridiem === "AM") hour = hour === 12 ? 0 : hour
  else hour = hour === 12 ? 12 : hour + 12
  return { hour, minute }
}

export function parseFundraiserTime(time: string): { start: Clock; end: Clock } | null {
  const parts = time.split(/\s*[–—-]\s*/)
  if (parts.length !== 2) return null
  const start = parseClock(parts[0])
  const end = parseClock(parts[1])
  if (!start || !end) return null
  return { start, end }
}

/** Converts a Pacific wall-clock time to an absolute instant. */
export function pacificInstant(date: WallDate, hour: number, minute: number): Date {
  const utcGuess = new Date(Date.UTC(date.year, date.month - 1, date.day, hour, minute, 0))
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const parts = Object.fromEntries(formatter.formatToParts(utcGuess).map((part) => [part.type, part.value]))
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return new Date(utcGuess.getTime() - (asUtc - utcGuess.getTime()))
}

export function fundraiserTiming(when: string, time: string, now: Date): FundraiserTiming {
  const date = parseFundraiserDate(when)
  if (!date) return "unscheduled"
  const range = parseFundraiserTime(time)
  const start = pacificInstant(date, range?.start.hour ?? 0, range?.start.minute ?? 0)
  const end = range
    ? pacificInstant(date, range.end.hour, range.end.minute)
    : pacificInstant(date, 23, 59)
  if (now.getTime() < start.getTime()) return "upcoming"
  if (now.getTime() > end.getTime()) return "past"
  return "active"
}

export function fundraiserStatusLabel(timing: FundraiserTiming): string {
  if (timing === "upcoming") return "Upcoming"
  if (timing === "active") return "Happening now"
  if (timing === "past") return "This date has passed"
  return "Date not confirmed"
}

export function matchesActiveFundraiser(id: string, activeEvent: string): boolean {
  if (activeEvent === "burgerville") return id === "burgerville"
  if (activeEvent === "panda") return id === "panda" || id === "panda-express"
  return false
}

/** Keeps an "Upcoming" heading from describing an event that is already over. */
export function homeFundraiserTitle(storedHeading: string, timing: FundraiserTiming): string {
  if (timing === "past") return "Recent fundraiser"
  if (timing === "active") return "Fundraiser today"
  if (timing === "unscheduled") return "Fundraiser"
  return storedHeading
}

export function fundraiserSupportNote(timing: FundraiserTiming): string {
  if (timing === "past") {
    return "This fundraiser date has passed. The donation page is still available, and checkout is not live."
  }
  if (timing === "active") {
    return "If you are not at the restaurant, the donation page explains the other way to help. Checkout is not live."
  }
  if (timing === "unscheduled") {
    return "The fundraiser date is not confirmed. The donation page explains what is available, and checkout is not live."
  }
  return "If you cannot attend this fundraiser, the donation page explains what is available. Checkout is not live."
}
