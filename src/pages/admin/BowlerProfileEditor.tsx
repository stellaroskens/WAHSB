import { useState } from "react"
import { DRAFT_PREVIEW_LABEL } from "../../lib/content/pageEditor"
import { CONSENT_NOT_SAVED } from "../../lib/content/bowlerConsent"
import {
  blankBowlerProfile,
  bowlerStatusLabel,
  moveBowlerProfile,
  profilePublishDecision,
  publicBowlerArtwork,
  removeBowlerProfile,
  schoolLabel,
  updateBowlerProfile,
  type BowlerProfile,
} from "../../lib/content/bowlerProfiles"
import { SCHOOLS, SCHOOL_IDS, type LogoStyle, type SchoolId } from "../../lib/content/schoolLogos"
import type { BowlerHonor, BowlerResult } from "../../lib/content/bowlerStats"
import type { SiteContent } from "../../lib/content/siteContent"

type Props = {
  content: SiteContent
  onChange: (content: SiteContent) => void
}

function blankResult(profileId: string, existing: readonly BowlerResult[]): BowlerResult {
  return {
    id: `result-${existing.length + 1}`,
    profileId,
    tournamentId: null,
    tournamentName: "",
    date: null,
    school: null,
    bowlingCenter: null,
    gamesPlayed: null,
    strikes: null,
    spares: null,
    opens: null,
    total: null,
    highGame: null,
    highSeries: null,
    notes: null,
    status: "draft",
  }
}

export function BowlerProfileEditor({ content, onChange }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const profiles = content.bowlerProfiles
  const preview = profiles.find((profile) => profile.id === previewId) ?? null

  const replaceProfiles = (next: BowlerProfile[]) => onChange({ ...content, bowlerProfiles: next })
  const patch = (id: string, change: Partial<BowlerProfile>) => replaceProfiles(updateBowlerProfile(profiles, id, change))

  const addResult = (profileId: string) => {
    onChange({ ...content, bowlerResults: [...content.bowlerResults, blankResult(profileId, content.bowlerResults)] })
    setNote("A draft tournament row was added in this editor. It is not on the public page until the profile can be published and you publish the content file.")
  }

  const patchResult = (id: string, change: Partial<BowlerResult>) => {
    onChange({
      ...content,
      bowlerResults: content.bowlerResults.map((result) => (result.id === id ? { ...result, ...change } : result)),
    })
  }

  const addHonor = (profileId: string) => {
    const honor: BowlerHonor = {
      id: `honor-${content.bowlerHonors.length + 1}`,
      profileId,
      title: "",
      date: null,
      detail: null,
      status: "draft",
    }
    onChange({ ...content, bowlerHonors: [...content.bowlerHonors, honor] })
  }

  return (
    <div className="bowler-editor">
      <p className="admin-help">
        Placeholder cards can be published because they are not student records. A real student profile stays unpublished.
        Student photographs are not uploaded here. Private image storage is not configured, so nothing is uploaded.
      </p>
      <button className="admin-btn" type="button" onClick={() => replaceProfiles([...profiles, blankBowlerProfile(profiles)])}>
        Add player
      </button>
      <p className="admin-help">Photo upload, crop, and replace are not available until private storage is connected.</p>
      {profiles.map((profile, index) => {
        const artwork = publicBowlerArtwork(profile)
        return (
          <fieldset className="bowler-editor__card" key={profile.id}>
            <legend>
              {profile.displayName} · {bowlerStatusLabel(profile)}
            </legend>
            <img src={artwork.src} alt={artwork.alt} width={96} height={96} />
            <label>
              Display name
              <input value={profile.displayName} onChange={(event) => patch(profile.id, { displayName: event.target.value })} />
            </label>
            <label>
              School
              <select
                value={profile.school ?? ""}
                onChange={(event) => {
                  const school = event.target.value ? (event.target.value as SchoolId) : null
                  patch(profile.id, { school, logoStyle: school ? profile.logoStyle ?? "full" : null })
                }}
              >
                <option value="">Not selected</option>
                {SCHOOL_IDS.map((id) => (
                  <option key={id} value={id}>
                    {SCHOOLS[id].label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              School logo
              <select
                value={profile.logoStyle ?? ""}
                disabled={!profile.school}
                onChange={(event) => patch(profile.id, { logoStyle: event.target.value ? (event.target.value as LogoStyle) : null })}
              >
                <option value="">None</option>
                <option value="full">Full school logo</option>
                <option value="mark">Simplified mascot or initials</option>
              </select>
              <span className="admin-help">The card shows only the choice selected here.</span>
            </label>
            <label>
              Years bowling
              <input
                value={profile.yearsBowling ?? ""}
                onChange={(event) => patch(profile.id, { yearsBowling: event.target.value.trim() ? Number(event.target.value) : null })}
              />
            </label>
            <label>
              Grade
              <input value={profile.grade ?? ""} onChange={(event) => patch(profile.id, { grade: event.target.value.trim() || null })} />
              <span className="admin-help">Leave blank until a grade is verified.</span>
            </label>
            <label>
              Age
              <input
                value={profile.age ?? ""}
                onChange={(event) => patch(profile.id, { age: event.target.value.trim() ? Number(event.target.value) : null })}
              />
              <span className="admin-help">Enter an age only when it is approved. Do not enter a birth date.</span>
            </label>
            <label>
              Biography
              <textarea rows={3} value={profile.introduction ?? ""} onChange={(event) => patch(profile.id, { introduction: event.target.value.trim() || null })} />
            </label>
            <label>
              Photograph
              <select
                value={profile.photoVisibility}
                onChange={(event) => patch(profile.id, { photoVisibility: event.target.value as BowlerProfile["photoVisibility"] })}
              >
                <option value="unavailable">No approved photograph</option>
                <option value="hidden">Hide photograph and use the school logo</option>
              </select>
            </label>
            <div className="admin-form__actions">
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setPreviewId(profile.id)}>
                Preview profile
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => patch(profile.id, { publicationStatus: "draft", hidden: true })}>
                Save as draft
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => patch(profile.id, { publicationStatus: "pending_approval", hidden: true })}>
                Submit for approval
              </button>
              <button
                className="admin-btn admin-btn--ghost"
                type="button"
                onClick={() => {
                  const decision = profilePublishDecision(profile)
                  if (!decision.ok) {
                    setNote(decision.reason)
                    return
                  }
                  replaceProfiles(updateBowlerProfile(profiles, profile.id, decision.profile))
                  setNote("Marked for the public directory in this editor. The live site changes only after a super administrator publishes the content file.")
                }}
              >
                Publish approved profile
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => patch(profile.id, { hidden: true, publicationStatus: "hidden" })}>
                Hide profile
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => patch(profile.id, { hidden: true, publicationStatus: "archived" })}>
                Archive player
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" disabled={index === 0} onClick={() => replaceProfiles(moveBowlerProfile(profiles, profile.id, -1))}>
                Move up
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" disabled={index === profiles.length - 1} onClick={() => replaceProfiles(moveBowlerProfile(profiles, profile.id, 1))}>
                Move down
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => addResult(profile.id)}>
                Add attended tournament
              </button>
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => addHonor(profile.id)}>
                Add honor
              </button>
              <button
                className="admin-btn admin-btn--ghost"
                type="button"
                onClick={() => {
                  if (!window.confirm(`Remove ${profile.displayName} from this editor copy? Archiving is safer. The live site does not change until publish.`)) return
                  replaceProfiles(removeBowlerProfile(profiles, profile.id))
                }}
              >
                Remove profile
              </button>
            </div>
            {content.bowlerResults
              .filter((result) => result.profileId === profile.id)
              .map((result) => (
                <fieldset key={result.id}>
                  <legend>Tournament result · {result.status}</legend>
                  <label>
                    Tournament
                    <input value={result.tournamentName} onChange={(event) => patchResult(result.id, { tournamentName: event.target.value })} />
                  </label>
                  <label>
                    Existing event id
                    <select
                      value={result.tournamentId ?? ""}
                      onChange={(event) => patchResult(result.id, { tournamentId: event.target.value || null })}
                    >
                      <option value="">None — historical result</option>
                      {content.practiceTournaments.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} {event.month}/{event.day}
                          {event.year ? `/${event.year}` : ""}
                        </option>
                      ))}
                    </select>
                    <span className="admin-help">Upcoming events cannot be saved as attended.</span>
                  </label>
                  <label>
                    Bowling center
                    <input value={result.bowlingCenter ?? ""} onChange={(event) => patchResult(result.id, { bowlingCenter: event.target.value || null })} />
                  </label>
                  <label>
                    Strikes
                    <input value={result.strikes ?? ""} onChange={(event) => patchResult(result.id, { strikes: event.target.value.trim() ? Number(event.target.value) : null })} />
                  </label>
                  <label>
                    Spares
                    <input value={result.spares ?? ""} onChange={(event) => patchResult(result.id, { spares: event.target.value.trim() ? Number(event.target.value) : null })} />
                  </label>
                  <label>
                    Opens
                    <input value={result.opens ?? ""} onChange={(event) => patchResult(result.id, { opens: event.target.value.trim() ? Number(event.target.value) : null })} />
                  </label>
                  <label>
                    Total pins
                    <input value={result.total ?? ""} onChange={(event) => patchResult(result.id, { total: event.target.value.trim() ? Number(event.target.value) : null })} />
                  </label>
                  <label>
                    Games
                    <input value={result.gamesPlayed ?? ""} onChange={(event) => patchResult(result.id, { gamesPlayed: event.target.value.trim() ? Number(event.target.value) : null })} />
                  </label>
                  <label>
                    High game
                    <input value={result.highGame ?? ""} onChange={(event) => patchResult(result.id, { highGame: event.target.value.trim() ? Number(event.target.value) : null })} />
                  </label>
                  <label>
                    High series
                    <input value={result.highSeries ?? ""} onChange={(event) => patchResult(result.id, { highSeries: event.target.value.trim() ? Number(event.target.value) : null })} />
                  </label>
                  <label>
                    Notes
                    <input value={result.notes ?? ""} onChange={(event) => patchResult(result.id, { notes: event.target.value || null })} />
                  </label>
                  <button className="admin-btn admin-btn--ghost" type="button" onClick={() => onChange({ ...content, bowlerResults: content.bowlerResults.filter((item) => item.id !== result.id) })}>
                    Remove result
                  </button>
                </fieldset>
              ))}
            <p className="admin-help">{schoolLabel(profile.school) ?? "No school selected."}</p>
          </fieldset>
        )
      })}
      {note ? (
        <p className="admin-alert" role="status">
          {note}
        </p>
      ) : null}
      <p className="admin-help">{CONSENT_NOT_SAVED}</p>
      {preview ? (
        <section className="admin-preview" aria-label={DRAFT_PREVIEW_LABEL}>
          <p className="admin-preview__banner">{DRAFT_PREVIEW_LABEL}</p>
          <h3>{preview.displayName}</h3>
          <p>{bowlerStatusLabel(preview)}</p>
          <img src={publicBowlerArtwork(preview).src} alt={publicBowlerArtwork(preview).alt} width={120} height={120} />
        </section>
      ) : null}
    </div>
  )
}
