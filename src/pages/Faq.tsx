import { useId, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { AthleticHero, SectionHeading } from "../components/AthleticHero"
import { FaqAnswerBody } from "../components/FaqEmbed"
import { PageMeta } from "../components/PageMeta"
import {
  bowlerGuidelines,
  faqCategories,
  learningResources,
  questionTopics,
  spectatorGuidelines,
  type FaqItem,
} from "../content/faq"
import { club, pages } from "../content/site"

const askTopics = ["", ...questionTopics] as const

type AskState = {
  name: string
  email: string
  topic: string
  question: string
}

const emptyAsk: AskState = {
  name: "",
  email: "",
  topic: "",
  question: "",
}

function FaqAnswer({ item }: { item: FaqItem }) {
  return (
    <details className="faq-item">
      <summary className="faq-question">
        <span className="faq-question-text">{item.question}</span>
      </summary>
      <div className="faq-answer">
        <FaqAnswerBody item={item} />
      </div>
    </details>
  )
}

export function Faq() {
  const formId = useId()
  const statusId = `${formId}-status`
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const topicRef = useRef<HTMLSelectElement>(null)
  const questionRef = useRef<HTMLTextAreaElement>(null)
  const [form, setForm] = useState<AskState>(emptyAsk)
  const [missing, setMissing] = useState<string[]>([])
  const [notice, setNotice] = useState("")

  function update(field: keyof AskState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setMissing((current) => current.filter((item) => item !== field))
    setNotice("")
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const gaps: string[] = []
    if (!form.name.trim()) gaps.push("name")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) gaps.push("email")
    if (!form.topic) gaps.push("topic")
    if (!form.question.trim()) gaps.push("question")
    setMissing(gaps)
    if (gaps.length > 0) {
      setNotice("Check the highlighted fields. Nothing was sent.")
      const focus: Record<string, { current: HTMLElement | null }> = {
        name: nameRef,
        email: emailRef,
        topic: topicRef,
        question: questionRef,
      }
      focus[gaps[0]]?.current?.focus()
      return
    }
    if (!club.email) {
      setNotice("The club email is not configured, so this form cannot prepare a message. Nothing was sent.")
      return
    }
    const subject = `Question for the coaches: ${form.topic}`
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Topic: ${form.topic}`,
      "",
      form.question.trim(),
      "",
      "Please send this email from your email application. The website does not deliver it.",
    ].join("\n")
    window.location.href = `mailto:${club.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setNotice(
      "Your email application should open with this question filled in. You still need to send it from that application. This website did not deliver the message.",
    )
  }

  return (
    <div className="sw-page sw-faq">
      <PageMeta title={pages.faq.title} description={pages.faq.description} />
      <AthleticHero
        scene="faq"
        title="Frequently Asked Questions"
        subtitle={club.name}
        art={
          <nav className="faq-nav sw-topic-board" aria-label="FAQ categories">
            {faqCategories.map((category) => (
              <Link key={category.id} to={`#${category.id}`}>
                {category.title}
              </Link>
            ))}
            <Link to="#faq-ask">Still Have Questions?</Link>
          </nav>
        }
      >
        <p>
          Everything you need to know about bowling with us, getting started, tournaments,
          equipment, and supporting our bowlers.
        </p>
      </AthleticHero>

      {faqCategories.map((category, index) => (
        <section className="section faq-section" id={category.id} key={category.id} aria-labelledby={`${category.id}-heading`}>
          <div className="wrap">
            <div className="sw-panel sw-faq__category">
              <div className="sw-faq__aside">
                <SectionHeading id={`${category.id}-heading`} title={category.title}>
                  {category.intro ? <p>{category.intro}</p> : null}
                </SectionHeading>
                <span className="sw-faq__count" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="sw-faq__main">
                <div className="faq-list">
                  {category.items.map((item) => (
                    <FaqAnswer key={item.question} item={item} />
                  ))}
                </div>
                {category.id === "faq-bowl-a-thon" ? (
                  <p className="faq-section-action">
                    <Link className="button button-primary" to="/bowl-a-thon">
                      Learn about the Bowl-A-Thon
                    </Link>
                  </p>
                ) : null}
                {category.id === "faq-basics" ? (
                  <aside className="faq-sources">
                    <h3>Learning resources</h3>
                    <p>
                      These USBC guides explain general scoring and Baker format. They are not club policy.
                    </p>
                    <ul>
                      {learningResources.map((resource) => (
                        <li key={resource.href}>
                          <a href={resource.href} target="_blank" rel="noopener noreferrer">
                            {resource.label}
                            <span className="visually-hidden"> (opens in a new tab)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </aside>
                ) : null}
                {category.id === "faq-etiquette" ? (
                  <div className="faq-conduct">
                    <article className="faq-callout">
                      <h3>Parents &amp; spectators — please allow our coaches to coach</h3>
                      <p>
                        During practices and tournaments, please allow our coaches to provide instruction
                        and guidance to the bowlers. Parents and spectators are asked to remain as quiet
                        as possible while students are preparing for and delivering their shots. Bowling
                        requires concentration, focus, and consistency, and conversations or sideline
                        coaching can be distracting.
                      </p>
                      <p>
                        We welcome positive encouragement and appropriate cheering between shots. Please
                        avoid calling instructions to bowlers, criticizing shots, or interrupting coaches.
                        Our goal is to give every student a supportive environment where they can learn,
                        focus, and enjoy the sport.
                      </p>
                    </article>
                    <div className="card-grid card-grid-2">
                      <article className="card">
                        <h3>For bowlers</h3>
                        <ul className="plain-list">
                          {bowlerGuidelines.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </article>
                      <article className="card">
                        <h3>For parents and spectators</h3>
                        <ul className="plain-list">
                          {spectatorGuidelines.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </article>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section faq-section" id="faq-ask" aria-labelledby="faq-ask-heading">
        <div className="wrap">
          <div className="sw-faq__ask">
            <div className="sw-faq__ask-intro">
              <h2 id="faq-ask-heading">Still Have Questions?</h2>
              <p>
                Can&apos;t find the answer you&apos;re looking for? Send your question to our coaching
                team. We&apos;re happy to help families and students learn more about bowling with us.
              </p>
            </div>
            <form className="card form" onSubmit={onSubmit} noValidate>
              <p className="note" id={statusId} role="status">
                {notice ||
                  "Prepare email to the coaches opens your email application with this question filled in. You must send it yourself. This website does not deliver messages."}
              </p>
              <div className="field">
                <label htmlFor={`${formId}-name`}>Name</label>
                <input
                  ref={nameRef}
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
                <label htmlFor={`${formId}-email`}>Email address</label>
                <input
                  ref={emailRef}
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  aria-invalid={missing.includes("email")}
                  onChange={(event) => update("email", event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor={`${formId}-topic`}>Question topic</label>
                <select
                  ref={topicRef}
                  id={`${formId}-topic`}
                  name="topic"
                  value={form.topic}
                  aria-invalid={missing.includes("topic")}
                  onChange={(event) => update("topic", event.target.value)}
                >
                  {askTopics.map((topic) => (
                    <option key={topic || "choose"} value={topic}>
                      {topic || "Choose a topic"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`${formId}-question`}>Your question</label>
                <textarea
                  ref={questionRef}
                  id={`${formId}-question`}
                  name="question"
                  rows={5}
                  value={form.question}
                  aria-invalid={missing.includes("question")}
                  onChange={(event) => update("question", event.target.value)}
                />
              </div>
              <button className="button button-primary" type="submit">
                Prepare email to the coaches
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
