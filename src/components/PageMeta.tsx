import { useEffect } from "react"

type PageMetaProps = {
  title: string
  description: string
}

function setContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content)
}

/**
 * Updates the tab title and the description/Open Graph tags after navigation.
 * Link-preview crawlers do not run JavaScript, so they read the generic tags in index.html.
 */
export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = title
    setContent('meta[name="description"]', description)
    setContent('meta[property="og:title"]', title)
    setContent('meta[property="og:description"]', description)
    setContent('meta[property="og:url"]', `${window.location.origin}${window.location.pathname}`)
  }, [title, description])

  return null
}
