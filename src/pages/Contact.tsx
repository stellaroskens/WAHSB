import { useId, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { coachPortraits } from "../content/media"
import { club, coaches, pages, seasonRegistrationClosed } from "../content/site"

type FormState = {
  name: string
  email: string
  topic: string
  message: string
}

const emptyForm: FormState = {
  name: "",
  email: "",
  topic: "Volunteering",
  message: "",
}

export function Contact() {
  const formId = useId()
  const statusId = `${formId}-status`
  const [form, setForm] = useState<FormState>(emptyForm)
  const [missing, setMissing] = useState<string[]>([])
  const [notice, setNotice] = useState("")

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setMissing((current) => current.filter((item) => item !== field))
    setNotice("")
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const gaps: string[] = []
    if (!form.name.trim()) gaps.push("name")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) gaps.push("email")
    if (!form.message.trim()) gaps.push("message")
    setMissing(gaps)
    if (gaps.length > 0) {
      setNotice("Check the highlighted fields. Nothing was sent.")
      document.getElementById(`${formId}-${gaps[0]}`)?.focus()
      return
    }
    setNotice("This preview form is not connected. Nothing was sent.")
  }

  return (
    <div className="sw-page sw-contact">
      <PageMeta title={pages.contact.title} description={pages.contact.description} />
      <AthleticHero
        scene="contact"
        title="Contact Us"
        subtitle={club.name}
        actions={
          <a className="sw-btn sw-btn--plain sw-contact__hero-email" href={`mailto:${club.email}`}>
            {club.email}
          </a>
        }
      >
        <p>
          Questions about volunteering, practices, or supporting a bowler are welcome.
          Email the club, or use the form to see the layout. The form does not
          send or save a message.
        </p>
        <p>
          <strong>{seasonRegistrationClosed.heading}</strong> {seasonRegistrationClosed.description}
        </p>
        <p>
          {seasonRegistrationClosed.volunteerSecondary}{" "}
          <Link to={seasonRegistrationClosed.volunteerCtaTo}>
            {seasonRegistrationClosed.volunteerCtaLabel}
          </Link>
          .
        </p>
      </AthleticHero>

      <section className="section contact-page">
        <div className="wrap contact-grid contact-page__layout">
          <form className="card form contact-page__form" onSubmit={onSubmit} noValidate>
            <h2 className="contact-page__heading">Write to the club</h2>
            <p className="note contact-page__status" id={statusId} role="status">
              {notice || "This form is a preview. It is not connected to email."}
            </p>

            <div className="field">
              <label htmlFor={`${formId}-name`}>Your name</label>
              <input
                id={`${formId}-name`}
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                aria-invalid={missing.includes("name")}
                aria-describedby={statusId}
                onChange={(event) => update("name", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor={`${formId}-email`}>Email</label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                aria-invalid={missing.includes("email")}
                aria-describedby={statusId}
                onChange={(event) => update("email", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor={`${formId}-topic`}>What is this about?</label>
              <select
                id={`${formId}-topic`}
                name="topic"
                value={form.topic}
                onChange={(event) => update("topic", event.target.value)}
              >
                <option>Volunteering</option>
                <option>Practices</option>
                <option>Supporting the club</option>
                <option>Student participation</option>
                <option>Something else</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor={`${formId}-message`}>Message</label>
              <textarea
                id={`${formId}-message`}
                name="message"
                rows={6}
                value={form.message}
                aria-invalid={missing.includes("message")}
                aria-describedby={statusId}
                onChange={(event) => update("message", event.target.value)}
              />
            </div>

            <button className="button button-primary contact-page__action" type="submit">
              Submit preview
            </button>
          </form>

          <div className="stack contact-page__details">
            <article className="card contact-page__panel sw-contact__email-card">
              <span className="sw-icon-disc" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M3 5.5h18c.8 0 1.5.7 1.5 1.5v10c0 .8-.7 1.5-1.5 1.5H3c-.8 0-1.5-.7-1.5-1.5V7c0-.8.7-1.5 1.5-1.5zm.6 2.1v.3l8.4 5.5 8.4-5.5v-.3H3.6zm16.8 2.7-8 5.2a.8.8 0 0 1-.8 0l-8-5.2v6.1h16.8v-6.1z" />
                </svg>
              </span>
              <div>
                <h2 className="contact-page__heading">Club email</h2>
                <p className="contact-page__email">
                  <a href={`mailto:${club.email}`}>{club.email}</a>
                </p>
                <ul className="sw-contact__social">
                  {club.social.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} rel="noreferrer">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="card contact-page__panel">
              <h2 className="contact-page__heading">Coaches</h2>
              <ul className="coach-list sw-contact__coaches">
                {coaches.map((coach) => (
                  <li key={coach.id}>
                    <img
                      src={coachPortraits[coach.id].src}
                      width={640}
                      height={640}
                      alt=""
                      loading="lazy"
                    />
                    <strong>{coach.name}</strong>
                    <span>{coach.role}</span>
                  </li>
                ))}
              </ul>
              <p>
                Reach both coaches through the club email.{" "}
                <Link to="/our-club">Read their biographies</Link>.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
