import { useId, useState, type FormEvent } from "react"
import { AthleticHero, SectionHeading } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { FundraiserShare } from "../components/FundraiserShare"
import { PaymentOptions } from "../components/PaymentOptions"
import { WaysToContribute } from "../components/WaysToContribute"
import { homeHeroBanner } from "../content/media"
import { bowlathonEvent, club, pages } from "../content/site"

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

const pledgeFaq = [
  {
    question: "What is a per-pin pledge?",
    answer:
      "You choose an amount to donate for each pin your bowler knocks down during the Bowl-a-thon. After the event, we multiply your pledge by their confirmed pin total. For example, pledging 10 cents per pin with a total of 500 pins means a $50 donation. The example is illustrative, not a predicted score.",
  },
  {
    question: "When do I pay, and how will I know the total?",
    answer:
      "Per-pin pledges are calculated after the event. The club will confirm your bowler’s pin total and send you the amount due with payment instructions. You do not need to guess their score or calculate it yourself.",
  },
  {
    question: "Can I set a limit on my donation?",
    answer:
      "Yes. Enter an optional maximum donation with your per-pin pledge. If you pledge 10 cents per pin and set a $30 maximum, your donation will not exceed $30, even if the calculated total is higher.",
  },
  {
    question: "Can I give a fixed amount instead?",
    answer:
      "Absolutely. Choose “Flat Donation” to give a set amount regardless of how many pins your bowler knocks down. Both families and businesses can choose either pledge type.",
  },
] as const

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

  const amountLabel =
    form.pledgeType === "flat" ? "Donation amount (USD)" : "Amount per pin (USD)"

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
              src={homeHeroBanner.src}
              srcSet={homeHeroBanner.srcSet}
              sizes="(max-width: 899px) 90vw, 560px"
              width={homeHeroBanner.width}
              height={homeHeroBanner.height}
              alt=""
              fetchPriority="high"
            />
          </div>
        }
      >
        <p>
          This pledge form is a preview of the paper sheet. It does not send,
          save, or collect a pledge, and it cannot take a payment.
        </p>
      </AthleticHero>

      <section className="section">
        <div className="wrap contact-grid sw-bowlathon__grid">
          <div className="stack">
            <article className="card sw-bowlathon__how">
              <h2>How a pledge works</h2>
              <p>
                Flat donations can be paid immediately once payments are connected.
              </p>
              <p>
                Per-pin totals are calculated after the event from the bowler’s
                verified pin total, then the sponsor receives payment instructions.
              </p>
              <p>Sponsors do not enter the pin total.</p>
              <p className="pledge-example">Example: $0.10 per pin × 500 pins = $50.</p>
            </article>
            <article className="card sw-bowlathon__date">
              <h2>Event date</h2>
              <p>{bowlathonEvent.date ?? "Not confirmed yet."}</p>
              <p className="note">
                Printed QR cards are planned to open this page. Each card will use
                a private link for one bowler, without placing a student name in
                the address. Cards will be made after the club has a permanent
                website address.
              </p>
            </article>
          </div>

          <div className="stack">
            <form className="card form pledge-calculator" onSubmit={onSubmit} noValidate>
              <h2 className="pledge-calculator__heading">Pledge preview</h2>
              <p className="note pledge-calculator__status" id={statusId} role="status">
                {notice || "This form is a preview. It is not connected, and nothing is saved."}
              </p>

              <div className="field">
                <label htmlFor={`${formId}-bowler`}>Bowler name</label>
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
                <label htmlFor={`${formId}-sponsor`}>Sponsor name or business</label>
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
                <label htmlFor={`${formId}-phone`}>Phone (optional)</label>
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
                  Flat Donation
                </label>
                <label className="choice">
                  <input
                    type="radio"
                    name="pledge-type"
                    checked={form.pledgeType === "per-pin"}
                    onChange={() => chooseType("per-pin")}
                  />
                  Per-Pin Pledge
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
                    Optional maximum total (USD)
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
                Submit preview
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
            <h2 id="support-payment-heading">Choose how to support our bowlers</h2>
            <p>
              Payment options will become available after the club completes setup and
              approval.
            </p>
            <PaymentOptions />
            <FundraiserShare />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="pledge-faq">
        <div className="wrap">
          <SectionHeading id="pledge-faq" title="How pledging works" />
          <ol className="sw-bowlathon__faq">
            {pledgeFaq.map((item) => (
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
