import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { parseSiteContent } from "../src/lib/content/siteContent.ts"
import { filterLinks, managedLinks, validateLinkDestination } from "../src/lib/content/linkInventory.ts"

const published = parseSiteContent(JSON.parse(readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8")))

function contrast(foreground: string, background: string): number {
  const channel = (hex: string) => {
    const value = Number.parseInt(hex, 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const lum = (hex: string) => {
    const color = hex.replace("#", "")
    const r = channel(color.slice(0, 2))
    const g = channel(color.slice(2, 4))
    const b = channel(color.slice(4, 6))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const lighter = Math.max(lum(foreground), lum(background))
  const darker = Math.min(lum(foreground), lum(background))
  return (lighter + 0.05) / (darker + 0.05)
}

describe("staff interface contrast", () => {
  it("keeps workspace text, links, and ghost buttons readable on light panels", () => {
    const css = readFileSync(new URL("../src/styles/admin.css", import.meta.url), "utf8")
    assert.match(css, /\.admin-btn--ghost \{[\s\S]*color: #102c8d/)
    assert.match(css, /\.admin-btn:disabled[\s\S]*opacity: 1/)
    assert.doesNotMatch(css, /\.admin-panel-form a,\s*\.admin-section-list__item a \{\s*color: #ffd2d0/)
    assert.ok(contrast("#102c8d", "#ffffff") >= 4.5)
    assert.ok(contrast("#172033", "#f4f7fb") >= 4.5)
    assert.ok(contrast("#3d4c66", "#e4e8f0") >= 4.5)
    assert.ok(contrast("#ffffff", "#102c8d") >= 4.5)
    assert.ok(contrast("#ffffff", "#8f1c1a") >= 4.5)
  })
})

describe("website link manager", () => {
  it("lists public navigation and rejects staff or script destinations", () => {
    const links = managedLinks(published)
    assert.ok(links.some((link) => link.destination === "/meet-the-bowlers" && link.label === "Meet the Bowlers"))
    assert.equal(filterLinks(links, "fundraisers").every((link) => link.label.toLowerCase().includes("fund") || link.destination.includes("fund") || link.location.toLowerCase().includes("fund")), true)
    assert.equal(validateLinkDestination("javascript:alert(1)", "internal").ok, false)
    assert.equal(validateLinkDestination("/admin/connections", "internal").ok, false)
    assert.equal(validateLinkDestination("/practices", "internal").ok, true)
    assert.equal(validateLinkDestination("http://example.com", "external").ok, false)
    assert.equal(validateLinkDestination("https://www.bsnsports.com/", "external").ok, true)
    const help = readFileSync(new URL("../src/components/staff/StaffHelp.tsx", import.meta.url), "utf8")
    assert.match(help, /aria-expanded/)
    assert.match(help, /aria-controls/)
    const shell = readFileSync(new URL("../src/components/staff/StaffShell.tsx", import.meta.url), "utf8")
    assert.match(shell, /area === "coach"/)
    assert.doesNotMatch(shell, /\/admin\/connections/)
  })
})
