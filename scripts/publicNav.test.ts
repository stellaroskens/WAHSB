import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { groupPublicNav } from "../src/lib/nav/publicMenu.ts"

const content = JSON.parse(readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8")) as {
  nav: { to: string; label: string; end?: boolean; hidden?: boolean }[]
}
const header = readFileSync(new URL("../src/components/Header.tsx", import.meta.url), "utf8")
const menu = readFileSync(new URL("../src/components/PublicMenu.tsx", import.meta.url), "utf8")
const home = readFileSync(new URL("../src/pages/HomeReview.tsx", import.meta.url), "utf8")
const shell = readFileSync(new URL("../src/components/staff/StaffShell.tsx", import.meta.url), "utf8")

test("the public drawer keeps every published navigation destination", () => {
  const visible = content.nav.filter((item) => !item.hidden)
  const grouped = groupPublicNav(visible).flatMap((group) => group.links.map((link) => link.to))
  assert.deepEqual(grouped.sort(), visible.map((item) => item.to).sort())
  assert.equal(grouped.includes("/admin"), false)
})

test("public and staff navigation keep their separate controls", () => {
  assert.match(header, /item\.hidden/)
  assert.match(header, /aria-expanded/)
  assert.match(header, /aria-controls/)
  assert.match(menu, /Escape/)
  assert.match(menu, /aria-modal/)
  assert.match(home, /pageBodies\.home\.hero\.buttonTo/)
  assert.match(home, /PublicMenu/)
  assert.match(shell, /area === "coach"/)
  assert.match(shell, /aria-controls="staff-navigation"/)
  assert.doesNotMatch(shell, /\/admin\/connections/)
  const portal = readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8")
  assert.match(portal, /\.portal-content \.admin-panel-form input/)
  assert.match(portal, /\.portal-content \.admin-table th/)
  assert.match(portal, /\.portal-content \.admin-editor__pages/)
  assert.match(portal, /\.portal-content \.admin-page:not\(\.portal-dashboard\)/)
})
