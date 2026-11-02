import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { describe, it } from "node:test"
import { join } from "node:path"
import {
  currentPublicFundraisers,
  fundraiserTiming,
  pacificInstant,
} from "../src/lib/events/fundraiserTiming.ts"

const root = new URL("..", import.meta.url)

function read(path: string): string {
  return readFileSync(new URL(path, root), "utf8")
}

function walk(directory: string): string[] {
  const entries = readdirSync(directory)
  return entries.flatMap((entry) => {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) return walk(path)
    return [path]
  })
}

describe("public fundraiser publication", () => {
  it("removes the expired Panda Express campaign from public source", () => {
    const files = [
      ...walk(new URL("src", root).pathname),
      ...walk(new URL("public", root).pathname),
    ].filter((file) => !file.endsWith(`${join("public", "_redirects")}`))
    const obsolete = /panda express|pandaexpress|panda-express|3868031/i
    const hits = files.filter((file) => obsolete.test(readFileSync(file, "utf8")))
    assert.deepEqual(hits, [])
    assert.equal(existsSync(new URL("public/flyers/panda-express.pdf", root)), false)
    assert.equal(existsSync(new URL("public/flyers/panda-express-960.webp", root)), false)
    assert.equal(existsSync(new URL("public/flyers/burgerville.pdf", root)), true)
    assert.match(read("public/_redirects"), /\/flyers\/panda-express\.pdf\s+\/fundraisers\s+404/)
    assert.match(read("netlify.toml"), /from = "\/flyers\/panda-express\.pdf"/)
  })

  it("keeps Burgerville as the only published fundraiser record", () => {
    const content = JSON.parse(read("src/content/published/siteContent.json")) as {
      fundraisers: { id: string; when: string; time: string; place: string }[]
      pages: { fundraisers: { description: string } }
    }
    assert.deepEqual(
      content.fundraisers.map((event) => event.id),
      ["burgerville"],
    )
    assert.equal(content.fundraisers[0].when, "Sunday, November 8, 2026")
    assert.equal(content.fundraisers[0].time, "4:00 PM – 8:00 PM")
    assert.match(content.fundraisers[0].place, /Albany/)
    assert.match(content.pages.fundraisers.description, /Burgerville/)
    assert.match(read("src/pages/Fundraisers.tsx"), /BVGIVES/)
    assert.match(read("src/pages/Fundraisers.tsx"), /2310 Santiam Highway SE, Albany/)
  })

  it("shows a fundraiser only while it is upcoming or active in Pacific time", () => {
    const before = pacificInstant({ year: 2026, month: 11, day: 2 }, 12, 0)
    const during = pacificInstant({ year: 2026, month: 11, day: 8 }, 17, 0)
    const after = pacificInstant({ year: 2026, month: 11, day: 8 }, 20, 1)
    const expired = {
      id: "expired-example",
      when: "Friday, October 30, 2026",
      time: "9:30 AM – 10:00 PM",
    }
    const current = {
      id: "burgerville",
      when: "Sunday, November 8, 2026",
      time: "4:00 PM – 8:00 PM",
    }

    assert.equal(fundraiserTiming(expired.when, expired.time, before), "past")
    assert.equal(fundraiserTiming(current.when, current.time, before), "upcoming")
    assert.equal(fundraiserTiming(current.when, current.time, during), "active")
    assert.equal(fundraiserTiming(current.when, current.time, after), "past")
    assert.deepEqual(
      currentPublicFundraisers([expired, current], before).map((event) => event.id),
      ["burgerville"],
    )
    assert.deepEqual(currentPublicFundraisers([expired, current], after), [])
  })
})
