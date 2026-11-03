import { useId, useState, type FormEvent } from "react"
import { AthleticHero, SectionHeading } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { FundraiserShare } from "../components/FundraiserShare"
import { PaymentOptions } from "../components/PaymentOptions"
import { WaysToContribute } from "../components/WaysToContribute"
import { homeHeroImage } from "../content/publicImages"
import { bowlathonEvent, club, library, pages } from "../content/site"

type PledgeType = "flat" | "per-pin"

type FormState = {
  bowler: string
  sponsor: string
  email: string
  phone: string
  pledgeType: PledgeType
  amount: string
  maximum: string
}

const emptyForm: FormState = {
  bowler: "",
  sponsor: "",
  email: "",
  phone: "",
  pledgeType: "flat",
  amount: "",
  maximum: "",
}

const moneyPattern = /^\d+(\.\d{1,2})?$/

export function Bowlathon() {
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

  function chooseType(pledgeType: PledgeType) {
    setForm((current) => ({
      ...current,
      pledgeType,
      amount: "",
      maximum: "",
    }))
    setMissing([])
    setNotice("")
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const gaps: string[] = []
    if (!form.bowler.trim()) gaps.push("bowler")
    if (!form.sponsor.trim()) gaps.push("sponsor")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) gaps.push("email")
    if (!moneyPattern.test(form.amount.trim())) gaps.push("amount")
    if (
      form.pledgeType === "per-pin" &&
      form.maximum.trim() &&
      !moneyPattern.test(form.maximum.trim())
    ) {
      gaps.push("maximum")
    }
    setMissing(gaps)
    if (gaps.length > 0) {
      setNotice("Check the highlighted fields. Nothing was sent or saved.")
      document.getElementById(`${formId}-${gaps[0]}`)?.focus()
      return
    }
    setNotice("This preview form is not connected. Nothing was sent or saved.")
  }

  const amountLabel = form.pledgeType === "flat" ? library.bowlathon.labels.flatAmount : library.bowlathon.labels.perPinAmount

  return (
    <div className="sw-page sw-bowlathon">
      <PageMeta title={pages.bowlathon.title} description={pages.bowlathon.description} />
      <AthleticHero
        scene="bowlathon"
        title="Bowl-a-thon"
        subtitle={club.name}
        art={
          <div className="sw-bowlathon__banner">
            <img
              src={homeHeroImage().src}
              srcSet={homeHeroImage().srcSet}
              sizes="(max-width: 899px) 90vw, 560px"
              width={2176}
              height={1025}
              alt=""
              fetchPriority="high"
            />
          </div>
        }
      >
        <p>{library.bowlathon.hero}</p>
      </AthleticHero>

      <section className="section">
        <div className="wrap contact-grid sw-bowlathon__grid">
          <div className="stack">
            <article className="card sw-bowlathon__how">
              <h2>How a pledge works</h2>
              {library.bowlathon.how.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="pledge-example">{library.bowlathon.example}</p>
            </article>
            <article className="card sw-bowlathon__date">
              <h2>Event date</h2>
              <p>{bowlathonEvent.date ?? "Not confirmed yet."}</p>
              <p className="note">{library.bowlathon.dateNote}</p>
            </article>
          </div>

          <div className="stack">
            <form className="card form pledge-calculator" onSubmit={onSubmit} noValidate>
              <h2 className="pledge-calculator__heading">{library.bowlathon.formHeading}</h2>
              <p className="note pledge-calculator__status" id={statusId} role="status">
                {notice || library.bowlathon.formNotice}
              </p>

              <div className="field">
                <label htmlFor={`${formId}-bowler`}>{library.bowlathon.labels.bowler}</label>
                <input
                  id={`${formId}-bowler`}
                  name="bowler"
                  type="text"
                  autoComplete="off"
                  value={form.bowler}
                  aria-invalid={missing.includes("bowler")}
                  aria-describedby={statusId}
                  onChange={(event) => update("bowler", event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor={`${formId}-sponsor`}>{library.bowlathon.labels.sponsor}</label>
                <input
                  id={`${formId}-sponsor`}
                  name="sponsor"
                  type="text"
                  autoComplete="organization"
                  value={form.sponsor}
                  aria-invalid={missing.includes("sponsor")}
                  aria-describedby={statusId}
                  onChange={(event) => update("sponsor", event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor={`${formId}-email`}>{library.bowlathon.labels.email}</label>
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
                <label htmlFor={`${formId}-phone`}>{library.bowlathon.labels.phone}</label>
                <input
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </div>

              <fieldset className="choice-set pledge-calculator__types">
                <legend>Pledge type</legend>
                <label className="choice">
                  <input
                    type="radio"
                    name="pledge-type"
                    checked={form.pledgeType === "flat"}
                    onChange={() => chooseType("flat")}
                  />
                  {library.bowlathon.labels.flat}
                </label>
                <label className="choice">
                  <input
                    type="radio"
                    name="pledge-type"
                    checked={form.pledgeType === "per-pin"}
                    onChange={() => chooseType("per-pin")}
                  />
                  {library.bowlathon.labels.perPin}
                </label>
              </fieldset>

              <div className="field">
                <label htmlFor={`${formId}-amount`}>{amountLabel}</label>
                <input
                  id={`${formId}-amount`}
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.amount}
                  aria-invalid={missing.includes("amount")}
                  aria-describedby={statusId}
                  onChange={(event) => update("amount", event.target.value)}
                />
              </div>

              {form.pledgeType === "per-pin" ? (
                <div className="field">
                  <label htmlFor={`${formId}-maximum`}>
                    {library.bowlathon.labels.maximum}
                  </label>
                  <input
                    id={`${formId}-maximum`}
                    name="maximum"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.maximum}
                    aria-invalid={missing.includes("maximum")}
                    aria-describedby={statusId}
                    onChange={(event) => update("maximum", event.target.value)}
                  />
                </div>
              ) : null}

              <button className="button button-primary pledge-calculator__action" type="submit">
                {library.bowlathon.labels.submit}
              </button>
            </form>

            <div className="sw-panel sw-bowlathon__ways">
              <WaysToContribute preview="pledge" />
            </div>
          </div>
        </div>
      </section>

      <section className="section connect-block" aria-labelledby="support-payment-heading">
        <div className="wrap">
          <div className="sw-panel">
            <h2 id="support-payment-heading">{library.bowlathon.paymentHeading}</h2>
            <p>{library.bowlathon.paymentNote}</p>
            <PaymentOptions />
            <FundraiserShare />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="pledge-faq">
        <div className="wrap">
          <SectionHeading id="pledge-faq" title={library.bowlathon.faqHeading} />
          <ol className="sw-bowlathon__faq">
            {library.bowlathon.faqs.map((item) => (
              <li className="card" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
