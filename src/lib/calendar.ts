import type { Venue } from "../content/site"

export type CalendarEventInput = {
  id: string
  name: string
  month: number
  day: number
  year: number | null
  startTime: string | null
  endTime: string | null
  arrivalNote: string | null
}

export type CalendarFile = {
  mode: "all-day" | "timed"
  title: string
  description: string
  location: string
  googleUrl: string
  /** Present only when both a start and an end time are known. */
  outlookUrl: string | null
  ics: string
  filename: string
}

const TIME_ZONE = "America/Los_Angeles"

export function directionsUrl(name: string, address: string) {
  const destination = `${name}, ${address}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.length === 10 ? `tel:+1${digits}` : `tel:${digits}`
}

export function formatMonthDay(month: number, day: number) {
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`
}

export function calendarFile(event: CalendarEventInput, venue: Venue): CalendarFile | null {
  if (event.year === null) return null

  const title = `${event.name} at ${venue.name}`
  const location = `${venue.name}, ${venue.address}`
  const description = describeEvent(event, venue)
  const startTime = event.startTime
  const endTime = event.endTime
  const timed = startTime !== null && endTime !== null
  const dates = timed
    ? timedRange(event.year, event.month, event.day, startTime, endTime)
    : allDayRange(event.year, event.month, event.day)

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    details: description,
    location,
  })
  if (timed) params.set("ctz", TIME_ZONE)

  return {
    mode: timed ? "timed" : "all-day",
    title,
    description,
    location,
    googleUrl: `https://calendar.google.com/calendar/render?${params.toString()}`,
    outlookUrl: timed
      ? outlookComposeUrl({
          title,
          description,
          location,
          year: event.year,
          month: event.month,
          day: event.day,
          startTime,
          endTime,
        })
      : null,
    ics: buildIcs({
      id: event.id,
      title,
      description,
      location,
      year: event.year,
      month: event.month,
      day: event.day,
      startTime: timed ? event.startTime : null,
      endTime: timed ? event.endTime : null,
    }),
    filename: `${event.id}.ics`,
  }
}

function outlookComposeUrl(input: {
  title: string
  description: string
  location: string
  year: number
  month: number
  day: number
  startTime: string
  endTime: string
}) {
  const day = `${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`
  const startOffset = pacificOffset(input.year, input.month, input.day, input.startTime)
  const endOffset = pacificOffset(input.year, input.month, input.day, input.endTime)
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: input.title,
    body: input.description,
    location: input.location,
    startdt: `${day}T${input.startTime}:00${startOffset}`,
    enddt: `${day}T${input.endTime}:00${endOffset}`,
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/** Offset for a Pacific wall-clock time, so Outlook does not read it as UTC. */
function pacificOffset(year: number, month: number, day: number, time: string) {
  const [hour, minute] = time.split(":").map(Number)
  const utc = Date.UTC(year, month - 1, day, hour, minute)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(utc))
      .map((part) => [part.type, part.value]),
  )
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  const offsetMinutes = Math.round((asUtc - utc) / 60000)
  const sign = offsetMinutes <= 0 ? "-" : "+"
  const absolute = Math.abs(offsetMinutes)
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`
}

function describeEvent(event: CalendarEventInput, venue: Venue) {
  const lines = [
    `${event.name} at ${venue.name}.`,
    venue.address,
    `Website: ${venue.website}`,
    `Directions: ${directionsUrl(venue.name, venue.address)}`,
  ]
  if (event.startTime === null || event.endTime === null) {
    lines.push("Time to be confirmed.")
  }
  if (event.arrivalNote) lines.push(`Arrival: ${event.arrivalNote}`)
  return lines.join("\n")
}

function compactDate(year: number, month: number, day: number) {
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`
}

function nextDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + 1)
  return compactDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

function compactTime(value: string) {
  const [hour, minute] = value.split(":")
  return `${hour.padStart(2, "0")}${minute.padStart(2, "0")}00`
}

function allDayRange(year: number, month: number, day: number) {
  return `${compactDate(year, month, day)}/${nextDate(year, month, day)}`
}

function timedRange(
  year: number,
  month: number,
  day: number,
  startTime: string,
  endTime: string,
) {
  const dayStamp = compactDate(year, month, day)
  return `${dayStamp}T${compactTime(startTime)}/${dayStamp}T${compactTime(endTime)}`
}

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
}

function fold(line: string) {
  if (line.length <= 75) return line
  const parts = [line.slice(0, 75)]
  for (let index = 75; index < line.length; index += 74) {
    parts.push(` ${line.slice(index, index + 74)}`)
  }
  return parts.join("\r\n")
}

function stampNow() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function buildIcs(input: {
  id: string
  title: string
  description: string
  location: string
  year: number
  month: number
  day: number
  startTime: string | null
  endTime: string | null
}) {
  const startTime = input.startTime
  const endTime = input.endTime
  const timed = startTime !== null && endTime !== null
  const when = timed
    ? [
        `DTSTART;TZID=${TIME_ZONE}:${compactDate(input.year, input.month, input.day)}T${compactTime(startTime)}`,
        `DTEND;TZID=${TIME_ZONE}:${compactDate(input.year, input.month, input.day)}T${compactTime(endTime)}`,
      ]
    : [
        `DTSTART;VALUE=DATE:${compactDate(input.year, input.month, input.day)}`,
        `DTEND;VALUE=DATE:${nextDate(input.year, input.month, input.day)}`,
      ]

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Albany High School Bowling//Tournament Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...(timed ? pacificTimeZone() : []),
    "BEGIN:VEVENT",
    `UID:${input.id}@albany-high-school-bowling`,
    `DTSTAMP:${stampNow()}`,
    ...when,
    `SUMMARY:${icsEscape(input.title)}`,
    `LOCATION:${icsEscape(input.location)}`,
    `DESCRIPTION:${icsEscape(input.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]

  return `${lines.map(fold).join("\r\n")}\r\n`
}

function pacificTimeZone() {
  return [
    "BEGIN:VTIMEZONE",
    "TZID:America/Los_Angeles",
    "X-LIC-LOCATION:America/Los_Angeles",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0800",
    "TZOFFSETTO:-0700",
    "TZNAME:PDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0700",
    "TZOFFSETTO:-0800",
    "TZNAME:PST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ]
}
