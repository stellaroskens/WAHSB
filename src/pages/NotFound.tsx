import { Link } from "react-router-dom"
import { PageMeta } from "../components/PageMeta"
import { pages } from "../content/site"

export function NotFound() {
  return (
    <>
      <PageMeta title={pages.notFound.title} description={pages.notFound.description} />
      <header className="page-hero">
        <div className="wrap narrow">
          <h1>Page not found</h1>
          <p>That address is not on this site.</p>
          <Link className="button button-primary" to="/">
            Back to home
          </Link>
        </div>
      </header>
    </>
  )
}
