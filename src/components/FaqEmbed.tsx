import { useId, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { faqCategories, type FaqItem } from "../content/faq"

export function FaqAnswerBody({ item }: { item: FaqItem }) {
  return (
    <>
      {item.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {item.points ? (
        <ul>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
      {item.links?.map((link) =>
        link.href.startsWith("/") ? (
          <Link key={link.href} to={link.href}>
            {link.label}
          </Link>
        ) : (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ),
      )}
    </>
  )
}

function FaqCategory({ title, children }: { title: string; children: ReactNode }) {
  const panelId = useId()
  const [open, setOpen] = useState(false)

  return (
    <div className={open ? "faq-group is-open" : "faq-group"}>
      <button
        className="faq-group-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{title}</span>
      </button>
      <div className="faq-group-panel" id={panelId} role="region" aria-label={title}>
        <div className="faq-group-inner">
          <div className="faq-group-body" inert={open ? undefined : true}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

type FaqEmbedProps = {
  id: string
  heading: string
  subtitle: string
  categoryIds: readonly string[]
}

export function FaqEmbed({ id, heading, subtitle, categoryIds }: FaqEmbedProps) {
  const categories = categoryIds.flatMap((categoryId) => {
    const category = faqCategories.find((entry) => entry.id === categoryId)
    return category ? [category] : []
  })

  return (
    <section className="section page-faq" id={id} aria-labelledby={`${id}-heading`}>
      <div className="wrap">
        <div className="section-heading">
          <h2 id={`${id}-heading`}>{heading}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="faq-groups">
          {categories.map((category) => (
            <FaqCategory key={category.id} title={category.title}>
              {category.intro ? <p className="faq-group-intro">{category.intro}</p> : null}
              {category.items.map((item) => (
                <article className="faq-group-item" key={item.question}>
                  <h3>{item.question}</h3>
                  <div className="faq-answer">
                    <FaqAnswerBody item={item} />
                  </div>
                </article>
              ))}
            </FaqCategory>
          ))}
          <FaqCategory title="Still Have Questions?">
            <h3>Still have questions? Contact our coaches.</h3>
            <p>
              Can&apos;t find the answer you&apos;re looking for? Our coaching team can help with
              questions about getting started, equipment, practices, and tournaments.
            </p>
            <p className="faq-group-actions">
              <Link className="button button-primary" to="/contact">
                Contact Us
              </Link>
              <Link to="/faq#faq-ask">Ask a coach</Link>
            </p>
          </FaqCategory>
        </div>
        <p className="faq-view-all">
          <Link className="button button-secondary" to="/faq">
            View all frequently asked questions
          </Link>
        </p>
      </div>
    </section>
  )
}
