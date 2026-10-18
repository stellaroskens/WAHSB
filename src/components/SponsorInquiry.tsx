import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { BowlerSelector } from "./BowlerSelector"
import { bowlerResultLabel, fictionalSampleBowlers } from "../content/sampleBowlers"
import { club } from "../content/site"

type SupportTarget = "team" | "bowler"
type Recognition = "private" | "public"
type SponsorType = "" | "Business" | "Individual" | "Family"

type Inquiry = {
  support: SupportTarget
  bowlerId: string
  recognition: Recognition
  sponsorType: SponsorType
  sponsorName: string
  contactName: string
  email: string
  phone: string
  website: string
  amount: string
  logoUrl: string
  message: string
  publishConsent: boolean
  shirtConsent: boolean
}

const emptyInquiry: Inquiry = {
  support: "team",
  bowlerId: "",
  recognition: "private",
  sponsorType: "",
  sponsorName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  amount: "",
  logoUrl: "",
  message: "",
  publishConsent: false,
  shirtConsent: false,
}

const moneyPattern = /^\d+(\.\d{1,2})?$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === "https:" && url.hostname.includes(".")
  } catch {
    return false
  }
}

function amountGuidance(amount: string, recognition: Recognition) {
  if (!moneyPattern.test(amount.trim())) return ""
  const value = Number(amount)
  if (recognition === "private") {
    return "Private sponsors are not added to public lists or printed on shirts."
  }
  if (value > 200) {
    return "More than $200 may be considered for next season’s shirt and for homepage recognition after the contribution is received, permissions are verified, and the club approves. This form does not publish anything."
  }
  if (value === 200) {
    return "An exact $200 contribution does not meet the more-than-$200 homepage threshold. More than $150 may still be considered for next season’s shirt after verification and club approval."
  }
  if (value > 150) {
    return "More than $150 may be considered for next season’s shirt after the contribution is verified and the club approves. This amount does not meet the homepage threshold."
  }
  return "This amount is not above the $150 shirt-recognition threshold."
}

export function SponsorInquiry() {
  const formId = useId()
  const statusId = `${formId}-status`
  const [form, setForm] = useState<Inquiry>(emptyInquiry)
  const [missing, setMissing] = useState<string[]>([])
  const [notice, setNotice] = useState("")

  const selected = fictionalSampleBowlers.find((bowler) => bowler.id === form.bowlerId) ?? null
  const guidance = amountGuidance(form.amount, form.recognition)
  const pendingScroll = useRef<string | null>(null)
  const [scrollNonce, setScrollNonce] = useState(0)

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash
      if (hash === "#bowler-lookup") {
        pendingScroll.current = "bowler-lookup"
        setForm((current) =>
          current.support === "bowler" ? current : { ...current, support: "bowler", bowlerId: "" },
        )
        setNotice("")
        setScrollNonce((nonce) => nonce + 1)
      } else if (hash === "#sponsor-inquiry") {
        pendingScroll.current = "sponsor-inquiry"
        setForm((current) =>
          current.support === "team" ? current : { ...current, support: "team", bowlerId: "" },
        )
        setNotice("")
        setScrollNonce((nonce) => nonce + 1)
      }
    }

    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [])

  useEffect(() => {
    const id = pendingScroll.current
    if (!id) return
    const node = document.getElementById(id)
    if (!node) return
    node.scrollIntoView({ behavior: "smooth", block: "start" })
    pendingScroll.current = null
  }, [scrollNonce, form.support])

  function update<Key extends keyof Inquiry>(field: Key, value: Inquiry[Key]) {
    setForm((current) => ({ ...current, [field]: value }))
    setMissing((current) =>
      current.filter((item) => item !== field && !(field === "bowlerId" && item === "bowler")),
    )
    setNotice("")
  }

  function focusGap(gap: string) {
    if (gap === "sponsorType") {
      document.querySelector<HTMLInputElement>('input[name="sponsor-type"]')?.focus()
      return
    }
    if (gap === "bowler") {
      document.querySelector<HTMLInputElement>("#bowler-lookup input")?.focus()
      return
    }
    const fieldId: Record<string, string> = {
      sponsorName: `${formId}-sponsor-name`,
      contactName: `${formId}-contact-name`,
      email: `${formId}-email`,
      phone: `${formId}-phone`,
      website: `${formId}-website`,
      amount: `${formId}-amount`,
      logoUrl: `${formId}-logo`,
      message: `${formId}-message`,
      publishConsent: `${formId}-publish`,
    }
    const id = fieldId[gap]
    if (id) document.getElementById(id)?.focus()
  }

  function chooseSupport(support: SupportTarget) {
    setForm((current) => ({ ...current, support, bowlerId: "" }))
    setNotice("")
  }

  function chooseRecognition(recognition: Recognition) {
    setForm((current) => ({
      ...current,
      recognition,
      publishConsent: false,
      shirtConsent: false,
      logoUrl: recognition === "private" ? "" : current.logoUrl,
    }))
    setNotice("")
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const gaps: string[] = []
    if (!form.sponsorType) gaps.push("sponsorType")
    if (!form.sponsorName.trim()) gaps.push("sponsorName")
    if (!form.contactName.trim()) gaps.push("contactName")
    if (!emailPattern.test(form.email.trim())) gaps.push("email")
    if (form.phone.replace(/\D/g, "").length < 7) gaps.push("phone")
    if (form.website.trim() && !isHttpsUrl(form.website)) gaps.push("website")
    if (!moneyPattern.test(form.amount.trim())) gaps.push("amount")
    if (form.support === "bowler" && !selected) gaps.push("bowler")
    if (form.recognition === "public" && !form.publishConsent) gaps.push("publishConsent")
    if (form.logoUrl.trim() && !isHttpsUrl(form.logoUrl)) gaps.push("logoUrl")
    if (form.message.length > 250) gaps.push("message")
    setMissing(gaps)
    if (gaps.length > 0) {
      setNotice("Check the highlighted fields. Nothing was sent, saved, or published.")
      focusGap(gaps[0])
      return
    }
    if (!club.email) {
      setNotice("The club email is not configured, so this form cannot prepare a message. Nothing was sent.")
      return
    }

    const bowlerLine = selected
      ? `Specific bowler, fictional preview match only: ${bowlerResultLabel(selected, [selected])}. This is not a confirmed student record.`
      : "The whole team"
    const body = [
      "Sponsorship inquiry from the website preview.",
      "This email was prepared in the visitor's email application. The website did not save it or collect a payment.",
      "",
      `Sponsor type: ${form.sponsorType}`,
      `Sponsor or business name: ${form.sponsorName.trim()}`,
      `Contact person: ${form.contactName.trim()}`,
      `Email: ${form.email.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Website: ${form.website.trim() || "None"}`,
      `Who to support: ${bowlerLine}`,
      `Proposed amount (USD): ${form.amount.trim()}`,
      `Recognition: ${form.recognition === "private" ? "Private. Do not publish this name or print it on a shirt." : "Public. Consider only after the contribution and permissions are verified."}`,
      `Consent to consider publishing the name or logo: ${form.publishConsent ? "Yes" : "No"}`,
      `Separate consent to consider next season's shirt: ${form.shirtConsent ? "Yes" : "No"}`,
      `Logo URL for review only, do not publish the image automatically: ${form.logoUrl.trim() || "None"}`,
      "",
      "Message to bowlers:",
      form.message.trim() || "None",
    ].join("\n")

    window.location.href = `mailto:${club.email}?subject=${encodeURIComponent("Sponsorship inquiry")}&body=${encodeURIComponent(body)}`
    setNotice(
      "Your email application should open with this inquiry filled in. You still need to send it. This website did not save the form, publish a name, or collect a donation.",
    )
  }

  return (
    <form className="card form sponsor-form" id="sponsor-inquiry" onSubmit={onSubmit} noValidate>
      <p className="note" id={statusId} role="status">
        {notice ||
          "This is a preview. Prepare email to the coaches opens your email application. You must send it yourself. Nothing is published or collected here."}
      </p>

      <fieldset className="choice-set">
        <legend>Who would you like to support?</legend>
        <label className="choice">
          <input
            type="radio"
            name="support-target"
            checked={form.support === "team"}
            onChange={() => chooseSupport("team")}
          />
          The Whole Team
        </label>
        <label className="choice">
          <input
            type="radio"
            name="support-target"
            checked={form.support === "bowler"}
            onChange={() => chooseSupport("bowler")}
          />
          A Specific Bowler
        </label>
      </fieldset>

      {form.support === "team" ? (
        <p>
          Your contribution supports the overall Albany High School Bowling program
          and helps provide opportunities for our participating students.
        </p>
      ) : (
        <BowlerSelector
          selectedId={form.bowlerId}
          onSelectedId={(bowlerId) => update("bowlerId", bowlerId)}
        />
      )}
      {missing.includes("bowler") ? (
        <p className="field-error">Choose a fictional sample bowler, or contact the coaches about a real student.</p>
      ) : null}

      <fieldset className="choice-set">
        <legend>How would you like to be recognized?</legend>
        <label className="choice">
          <input
            type="radio"
            name="recognition"
            checked={form.recognition === "private"}
            onChange={() => chooseRecognition("private")}
          />
          Private Sponsor
        </label>
        <label className="choice">
          <input
            type="radio"
            name="recognition"
            checked={form.recognition === "public"}
            onChange={() => chooseRecognition("public")}
          />
          Public Sponsor
        </label>
      </fieldset>
      <p className="note">
        {form.recognition === "private"
          ? "Private sponsors are not added to public sponsor lists, the homepage, or shirt printing."
          : "Public sponsors may be considered for recognition after the contribution and permissions are verified. Submitting this form does not display your name or logo."}
      </p>

      <fieldset className="choice-set">
        <legend>Sponsor type</legend>
        {(["Business", "Individual", "Family"] as const).map((type) => (
          <label className="choice" key={type}>
            <input
              type="radio"
              name="sponsor-type"
              checked={form.sponsorType === type}
              aria-invalid={missing.includes("sponsorType")}
              onChange={() => update("sponsorType", type)}
            />
            {type}
          </label>
        ))}
      </fieldset>

      <div className="field">
        <label htmlFor={`${formId}-sponsor-name`}>Sponsor or business name</label>
        <input
          id={`${formId}-sponsor-name`}
          name="sponsor-name"
          type="text"
          autoComplete="organization"
          value={form.sponsorName}
          aria-invalid={missing.includes("sponsorName")}
          aria-describedby={statusId}
          onChange={(event) => update("sponsorName", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${formId}-contact-name`}>Contact person&apos;s name</label>
        <input
          id={`${formId}-contact-name`}
          name="contact-name"
          type="text"
          autoComplete="name"
          value={form.contactName}
          aria-invalid={missing.includes("contactName")}
          onChange={(event) => update("contactName", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${formId}-email`}>Email address</label>
        <input
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
        <label htmlFor={`${formId}-phone`}>Phone number</label>
        <input
          id={`${formId}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          aria-invalid={missing.includes("phone")}
          onChange={(event) => update("phone", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${formId}-website`}>Business website URL (optional)</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="url"
          inputMode="url"
          placeholder="https://"
          autoComplete="url"
          value={form.website}
          aria-invalid={missing.includes("website")}
          aria-describedby={missing.includes("website") ? `${formId}-website-error` : undefined}
          onChange={(event) => update("website", event.target.value)}
        />
        {missing.includes("website") ? (
          <p className="field-error" id={`${formId}-website-error`}>
            Use a full HTTPS address, such as https://example.com.
          </p>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor={`${formId}-amount`}>Proposed donation amount (USD)</label>
        <input
          id={`${formId}-amount`}
          name="amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={form.amount}
          aria-invalid={missing.includes("amount")}
          aria-describedby={`${formId}-amount-note`}
          onChange={(event) => update("amount", event.target.value)}
        />
        <p className="note" id={`${formId}-amount-note`}>
          {guidance || "Enter an amount such as 150 or 200.50. This does not charge a card."}
        </p>
      </div>

      {form.sponsorType === "Business" && form.recognition === "public" ? (
        <div className="field">
          <label htmlFor={`${formId}-logo`}>Business logo URL (optional)</label>
          <input
            id={`${formId}-logo`}
            name="logo-url"
            type="url"
            inputMode="url"
            placeholder="https://"
            autoComplete="off"
            value={form.logoUrl}
            aria-invalid={missing.includes("logoUrl")}
            aria-describedby={
              missing.includes("logoUrl") ? `${formId}-logo-error` : `${formId}-logo-note`
            }
            onChange={(event) => update("logoUrl", event.target.value)}
          />
          {missing.includes("logoUrl") ? (
            <p className="field-error" id={`${formId}-logo-error`}>
              Use an HTTPS link. The image stays unlisted until the club reviews it.
            </p>
          ) : (
            <p className="note" id={`${formId}-logo-note`}>
              Use an HTTPS link. The coaches review it. This page does not load or
              publish the image.
            </p>
          )}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor={`${formId}-message`}>Encouraging message to our bowlers</label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          maxLength={250}
          value={form.message}
          aria-describedby={`${formId}-count`}
          onChange={(event) => update("message", event.target.value)}
        />
        <p className="char-count" id={`${formId}-count`}>
          {form.message.length}/250
        </p>
      </div>

      {form.recognition === "public" ? (
        <fieldset className="choice-set">
          <legend>Permission</legend>
          <label className="choice">
            <input
              id={`${formId}-publish`}
              type="checkbox"
              checked={form.publishConsent}
              aria-invalid={missing.includes("publishConsent")}
              aria-describedby={
                missing.includes("publishConsent") ? `${formId}-publish-error` : undefined
              }
              onChange={(event) => update("publishConsent", event.target.checked)}
            />
            I give permission for the club to consider publishing my name or logo
            after the contribution is verified.
          </label>
          {missing.includes("publishConsent") ? (
            <p className="field-error" id={`${formId}-publish-error`}>
              Public recognition needs this permission. It does not publish the name by itself.
            </p>
          ) : null}
          <label className="choice">
            <input
              type="checkbox"
              checked={form.shirtConsent}
              onChange={(event) => update("shirtConsent", event.target.checked)}
            />
            I separately consent to my approved name being considered for next
            season&apos;s team shirt.
          </label>
        </fieldset>
      ) : null}

      <p className="form-actions">
        <button className="button button-primary" type="submit">
          Prepare email to the coaches
        </button>
        <Link to="/contact">Contact Us</Link>
      </p>
    </form>
  )
}
