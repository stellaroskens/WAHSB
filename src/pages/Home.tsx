import { PageMeta } from "../components/PageMeta"
import { pages } from "../content/site"

/** Rollback only. The live homepage is HomeReview, routed from App. */
export function Home() {
  return (
    <>
      <PageMeta title={pages.home.title} description={pages.home.description} />
      <img
        className="home-canva-mockup"
        src="/images/home3.png"
        width={2176}
        height={3264}
        alt="Albany High School Bowling homepage mockup"
      />
    </>
  )
}
