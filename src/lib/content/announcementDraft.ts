export type AnnouncementDraft = {
  title: string
  subject: string
  message: string
  audienceDescription: string
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g

export function validateAnnouncementDraft(
  input: unknown,
): { ok: true; draft: AnnouncementDraft } | { ok: false; message: string } {
  if (typeof input !== "object" || input === null) return { ok: false, message: "Announcement must be filled in." }
  const value = input as Record<string, unknown>
  const title = typeof value.title === "string" ? value.title.trim() : ""
  const subject = typeof value.subject === "string" ? value.subject.trim() : ""
  const message = typeof value.message === "string" ? value.message.trim() : ""
  const audienceDescription = typeof value.audienceDescription === "string" ? value.audienceDescription.trim() : ""
  if (!title || !subject || !message || !audienceDescription) {
    return { ok: false, message: "Title, subject, message, and audience description are required." }
  }
  if ([title, subject, message, audienceDescription].some((item) => item.length > 4000 || /[<>]|javascript:/i.test(item))) {
    return { ok: false, message: "HTML and scripts are not allowed, and each field must stay under 4000 characters." }
  }
  if (audienceDescription.includes("@")) {
    return { ok: false, message: "Describe the audience in words. Do not enter email addresses or a contact list." }
  }
  const found = message.match(EMAIL) ?? []
  if (found.length > 1) {
    return { ok: false, message: "Do not put a contact list in the message. Private parent and student emails are not stored here." }
  }
  return { ok: true, draft: { title, subject, message, audienceDescription } }
}

export function announcementRecordStatus(submitForApproval: boolean): "draft" | "pending_approval" {
  return submitForApproval ? "pending_approval" : "draft"
}
