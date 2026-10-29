import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { calendarFile } from "../src/lib/calendar.ts"
import type { Venue } from "../src/content/site.ts"

const published = JSON.parse(
  readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8"),
) as {
  venues: Venue[]
  practiceTournaments: {
    id: string
    name: string
    month: number
    day: number
    year: number | null
    startTime: string | null
    endTime: string | null
    venueId: string
    arrivalNote: string | null
  }[]
}

describe("venue records", () => {
  it("keeps exactly five published venues with required fields", () => {
    assert.equal(published.venues.length, 5)
    assert.deepEqual(
      published.venues.map((venue) => venue.id),
      ["starlite-lanes", "northgate-bowl", "cottage-bowl", "silver-creek-lanes", "firs-bowl-lanes"],
    )
    for (const venue of published.venues) {
      assert.ok(venue.name)
      assert.ok(venue.address)
      assert.ok(venue.phone)
      assert.ok(venue.website.startsWith("http"))
    }
  })

  it("maps every practice tournament to an existing venue", () => {
    const ids = new Set(published.venues.map((venue) => venue.id))
    assert.equal(published.practiceTournaments.length, 5)
    for (const event of published.practiceTournaments) {
      assert.ok(ids.has(event.venueId), `${event.id} missing venue ${event.venueId}`)
    }
  })
})

describe("Google Calendar and ICS", () => {
  it("builds Google and ICS files for each venue when both times exist", () => {
    for (const venue of published.venues) {
      const file = calendarFile(
        {
          id: `check-${venue.id}`,
          name: "Practice tournament",
          month: 11,
          day: 15,
          year: 2026,
          startTime: "09:00",
          endTime: "12:00",
          arrivalNote: null,
        },
        venue,
      )
      assert.ok(file, `calendar missing for ${venue.id}`)
      assert.match(file.googleUrl, /calendar\.google\.com\/calendar\/render/)
      assert.match(file.googleUrl, /20261115T090000/)
      assert.match(file.googleUrl, /20261115T120000/)
      assert.match(file.ics, /BEGIN:VCALENDAR/)
      assert.match(file.ics, /BEGIN:VEVENT/)
      assert.match(file.ics, /DTSTART;TZID=America\/Los_Angeles:20261115T090000/)
      assert.match(file.ics, /DTEND;TZID=America\/Los_Angeles:20261115T120000/)
      assert.match(file.ics, new RegExp(venue.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      assert.ok(file.outlookUrl)
    }
  })

  it("does not invent times for untimed published tournaments", () => {
    for (const event of published.practiceTournaments) {
      const venue = published.venues.find((item) => item.id === event.venueId)
      assert.ok(venue)
      const file = calendarFile(event, venue)
      assert.ok(file)
      if (!event.startTime || !event.endTime) {
        assert.equal(file.mode, "all-day")
        assert.equal(file.outlookUrl, null)
        assert.equal(file.googleUrl.includes("T090000"), false)
        assert.match(file.ics, /VALUE=DATE/)
      }
    }
  })
})
