import { useEffect } from "react"

const PUBLIC_ORIGIN = "https://albany-hs-bowling.netlify.app"

type PageMetaProps = {
  title: string
  description: string
  index?: boolean
}

function setContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content)
}

function setNamedMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement("meta")
    meta.setAttribute("name", name)
    document.head.appendChild(meta)
  }
  meta.setAttribute("content", content)
}

function setCanonical(pathname: string) {
  const href = `${PUBLIC_ORIGIN}${pathname === "/" ? "/" : pathname}`
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement("link")
    link.setAttribute("rel", "canonical")
    document.head.appendChild(link)
  }
  link.setAttribute("href", href)
}

/**
 * Updates the tab title and the description/Open Graph tags after navigation.
 * Link-preview crawlers do not run JavaScript, so they read the generic tags in index.html.
 * Canonical URLs point at the public site so a preview deploy is not treated as a second website.
 */
export function PageMeta({ title, description, index = true }: PageMetaProps) {
  useEffect(() => {
    const pathname = window.location.pathname
    document.title = title
    setContent('meta[name="description"]', description)
    setContent('meta[property="og:title"]', title)
    setContent('meta[property="og:description"]', description)
    setContent('meta[property="og:url"]', `${PUBLIC_ORIGIN}${pathname === "/" ? "/" : pathname}`)
    setNamedMeta("robots", index ? "index, follow" : "noindex, nofollow")
    setCanonical(pathname)
  }, [title, description, index])

  return null
}
