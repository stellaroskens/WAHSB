import type { CalendarFile } from "../lib/calendar"

type AddToCalendarProps = {
  file: CalendarFile
}

export function AddToCalendar({ file }: AddToCalendarProps) {
  function downloadIcs() {
    const blob = new Blob([file.ics], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = file.filename
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <details className="calendar-menu">
      <summary className="button button-secondary">Add to Calendar</summary>
      <div className="calendar-panel" role="group" aria-label="Calendar options">
        <a href={file.googleUrl} target="_blank" rel="noopener noreferrer">
          Google Calendar
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        <button type="button" onClick={downloadIcs}>
          Apple Calendar
        </button>
        {file.outlookUrl ? (
          <a href={file.outlookUrl} target="_blank" rel="noopener noreferrer">
            Outlook
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </details>
  )
}
