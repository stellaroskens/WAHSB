import { StaffHelp } from "./StaffHelp"

/**
 * Shows only states this page can actually verify.
 * A GitHub commit is not marked as a finished Netlify deploy.
 */
export function PublishStatus({
  dirty,
  draftStatus,
  commitSha,
}: {
  dirty: boolean
  draftStatus: string | null
  commitSha: string | null
}) {
  const steps = [
    { label: "Unsaved", on: dirty, detail: "These edits are only in this browser." },
    {
      label: "Draft saved",
      on: draftStatus === "draft" || draftStatus === "pending_approval",
      detail: "A draft commit exists in GitHub. The public site is unchanged.",
    },
    {
      label: "Awaiting approval",
      on: draftStatus === "pending_approval",
      detail: "A reviewer still has to approve this draft.",
    },
    {
      label: "Commit created",
      on: Boolean(commitSha),
      detail: commitSha ? `GitHub commit ${commitSha.slice(0, 7)} was created.` : "No commit has been confirmed in this session.",
    },
    {
      label: "Deployment pending",
      on: false,
      detail: "This page cannot see whether Netlify is deploying. Open the Netlify deploys list to check.",
    },
    {
      label: "Published and confirmed live",
      on: false,
      detail: "This page does not mark a change live from a GitHub commit alone.",
    },
  ]

  return (
    <ol className="publish-status">
      {steps.map((step) => (
        <li key={step.label} className={step.on ? "is-on" : undefined}>
          <span>{step.label}</span>
          <StaffHelp label={step.label} text={step.detail} />
        </li>
      ))}
    </ol>
  )
}
