import { useState } from "react"
import { DRAFT_PREVIEW_LABEL } from "../../lib/content/pageEditor"
import {
  CONSENT_NOT_SAVED,
  consentAllowsPublication,
  readConsentRecord,
  type BowlerConsentRecord,
} from "../../lib/content/bowlerConsent"
import {
  blankBowlerProfile,
  bowlerStatusLabel,
  moveBowlerProfile,
  profilePublishDecision,
  removeBowlerProfile,
  updateBowlerProfile,
  BOWLER_SILHOUETTE,
  type BowlerProfile,
} from "../../lib/content/bowlerProfiles"
import type { SiteContent } from "../../lib/content/siteContent"

type Props = {
  content: SiteContent
  onChange: (content: SiteContent) => void
}

const emptyConsent = (profileId: string): BowlerConsentRecord => ({
  profileId,
  guardianPermission: "not_recorded",
  clubSchoolApproval: "not_recorded",
  approvedFields: [],
  photographPermission: "not_recorded",
  consentDate: null,
  withdrawalStatus: "none",
})

export function BowlerProfileEditor({ content, onChange }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [consentNote, setConsentNote] = useState<string | null>(null)
  const [consentBusy, setConsentBusy] = useState(false)
  const profiles = content.bowlerProfiles
  const preview = profiles.find((profile) => profile.id === previewId) ?? null

  const replace = (next: BowlerProfile[]) => onChange({ ...content, bowlerProfiles: next })

  const patch = (id: string, change: Partial<BowlerProfile>) => replace(updateBowlerProfile(profiles, id, change))

  const onConsent = async (profileId: string) => {
    setConsentBusy(true)
    setConsentNote(null)
    const record = emptyConsent(profileId)
    const local = readConsentRecord(record)
    const decision = local.ok ? consentAllowsPublication(local.record) : local
    try {
      const response = await fetch("/api/admin/bowler-consent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
      const body = (await response.json().catch(() => ({ error: CONSENT_NOT_SAVED }))) as { error?: string; reason?: string }
      setConsentNote(body.reason || body.error || CONSENT_NOT_SAVED)
    } catch {
      setConsentNote(decision.ok ? CONSENT_NOT_SAVED : decision.reason)
    } finally {
      setConsentBusy(false)
    }
  }

  return (
    <div className="bowler-editor">
      <p className="admin-help">
        The public page shows a profile only after it is published, not hidden, and explicitly approved. The sample stays
        a draft. Real student photographs and consent records are not stored in this file.
      </p>
      <button className="admin-btn" type="button" onClick={() => replace([...profiles, blankBowlerProfile(profiles)])}>
        Add bowler
      </button>
      {profiles.map((profile, index) => (
        <fieldset className="bowler-editor__card" key={profile.id}>
          <legend>
            {profile.displayName} · {bowlerStatusLabel(profile)}
          </legend>
          <label>
            Approved display name
            <input value={profile.displayName} onChange={(event) => patch(profile.id, { displayName: event.target.value })} />
          </label>
          <label>
            Role
            <input value={profile.roleLabel} onChange={(event) => patch(profile.id, { roleLabel: event.target.value })} />
          </label>
          <label>
            Short introduction
            <textarea
              rows={4}
              value={profile.introduction}
              onChange={(event) => patch(profile.id, { introduction: event.target.value })}
            />
          </label>
          <label>
            Favorite thing about bowling
            <textarea
              rows={3}
              value={profile.favoriteThing}
              onChange={(event) => patch(profile.id, { favoriteThing: event.target.value })}
            />
          </label>
          <label>
            Bowling interests
            <input
              value={profile.interests ?? ""}
              onChange={(event) => patch(profile.id, { interests: event.target.value.trim() ? event.target.value : null })}
            />
            <span className="admin-help">Optional. Leave blank to hide this line.</span>
          </label>
          <label>
            Quote
            <input
              value={profile.quote ?? ""}
              onChange={(event) => patch(profile.id, { quote: event.target.value.trim() ? event.target.value : null })}
            />
            <span className="admin-help">Optional. Leave blank to hide this line.</span>
          </label>
          <label>
            Approved image
            <select value={BOWLER_SILHOUETTE} onChange={() => patch(profile.id, { imagePath: BOWLER_SILHOUETTE })}>
              <option value={BOWLER_SILHOUETTE}>Generic silhouette</option>
            </select>
            <span className="admin-help">Student photographs cannot be selected until private photograph permission is stored.</span>
          </label>
          <label>
            Image description
            <input value={profile.imageAlt} onChange={(event) => patch(profile.id, { imageAlt: event.target.value })} />
          </label>
          {profile.sample ? (
            <label className="bowler-editor__check">
              <input
                type="checkbox"
                checked={profile.sampleApproved}
                onChange={(event) => patch(profile.id, { sampleApproved: event.target.checked })}
              />
              Approve this fictional sample for the public page
            </label>
          ) : (
            <p className="admin-help">
              This is not the fictional sample. It cannot be published until guardian permission, club or school approval,
              and photograph permission are stored outside this repository. A checkbox does not establish guardian authority.
            </p>
          )}
          <div className="admin-form__actions">
            <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setPreviewId(profile.id)}>
              Preview profile
            </button>
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={() => patch(profile.id, { publicationStatus: "draft", hidden: true })}
            >
              Save as draft
            </button>
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={() => patch(profile.id, { publicationStatus: "pending_approval", hidden: true })}
            >
              Submit for approval
            </button>
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={() => {
                const decision = profilePublishDecision(profile)
                if (!decision.ok) {
                  setConsentNote(decision.reason)
                  return
                }
                replace(updateBowlerProfile(profiles, profile.id, decision.profile))
                setConsentNote("Marked approved in this draft. The live site changes only after you publish the content file.")
              }}
            >
              Publish approved profile
            </button>
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={() => patch(profile.id, { hidden: true, publicationStatus: "hidden" })}
            >
              Hide profile
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" disabled={index === 0} onClick={() => replace(moveBowlerProfile(profiles, profile.id, -1))}>
              Move up
            </button>
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              disabled={index === profiles.length - 1}
              onClick={() => replace(moveBowlerProfile(profiles, profile.id, 1))}
            >
              Move down
            </button>
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={() => {
                if (!window.confirm(`Remove ${profile.displayName} from this draft? The live site does not change until you publish.`)) return
                replace(removeBowlerProfile(profiles, profile.id))
                if (previewId === profile.id) setPreviewId(null)
              }}
            >
              Remove profile
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" disabled={consentBusy} onClick={() => void onConsent(profile.id)}>
              Check consent store
            </button>
          </div>
        </fieldset>
      ))}
      {consentNote ? (
        <p className="admin-alert" role="status">
          {consentNote}
        </p>
      ) : null}
      {preview ? (
        <section className="admin-preview" aria-label={DRAFT_PREVIEW_LABEL}>
          <p className="admin-preview__banner">{DRAFT_PREVIEW_LABEL}</p>
          <p>{bowlerStatusLabel(preview)}. This preview is not the public page.</p>
          <h3>{preview.displayName}</h3>
          <p>{preview.roleLabel}</p>
          <p>{preview.introduction}</p>
          <p>{preview.favoriteThing}</p>
          <img src={preview.imagePath} width={96} height={96} alt={preview.imageAlt} />
        </section>
      ) : null}
    </div>
  )
}
