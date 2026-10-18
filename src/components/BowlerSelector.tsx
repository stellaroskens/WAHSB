import { useId, useState, type KeyboardEvent } from "react"
import {
  bowlerResultLabel,
  fictionalSampleBowlers,
  searchSampleBowlers,
} from "../content/sampleBowlers"

type BowlerSelectorProps = {
  selectedId: string
  onSelectedId: (id: string) => void
}

export function BowlerSelector({ selectedId, onSelectedId }: BowlerSelectorProps) {
  const baseId = useId()
  const inputId = `${baseId}-search`
  const hintId = `${baseId}-hint`
  const resultId = `${baseId}-result`
  const [query, setQuery] = useState("")

  const matches = searchSampleBowlers(fictionalSampleBowlers, query)
  const selected = matches.find((bowler) => bowler.id === selectedId) ?? null
  const searched = query.trim().length > 0

  function changeQuery(value: string) {
    setQuery(value)
    onSelectedId("")
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    const firstResult = document.getElementById(resultId)?.querySelector("button")
    firstResult?.focus()
  }

  return (
    <div className="bowler-lookup sponsor-bowler" id="bowler-lookup">
      <h3 className="sponsor-bowler__heading">Find a bowler to support</h3>
      <p className="sponsor-bowler__intro" id={hintId}>
        Know a bowler you&apos;d like to support? Search by their first name, last name,
        or first name and last initial. Examples: Jordan S, Smith. This preview uses
        fictional names only. It is not a student roster, and choosing a name does not
        send a sponsorship. For a real bowler, contact the coaches.
      </p>

      <div className="field sponsor-bowler__field">
        <label htmlFor={inputId}>Bowler search</label>
        <input
          id={inputId}
          type="text"
          value={query}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="none"
          aria-describedby={`${hintId} ${resultId}`}
          onChange={(event) => changeQuery(event.target.value)}
          onKeyDown={onSearchKeyDown}
        />
      </div>

      <div id={resultId} className="bowler-result sponsor-bowler__results" aria-live="polite">
        {!searched ? (
          <p className="sponsor-bowler__status">
            The sample list stays hidden until a full first name, a first name plus
            last initial, or a full last name matches.
          </p>
        ) : matches.length === 0 ? (
          <p className="sponsor-bowler__status">
            No fictional sample bowler matches that search. This is not the club
            roster.
          </p>
        ) : (
          <div className="sponsor-bowler__list" role="group" aria-label="Matching sample bowlers">
            {matches.map((bowler) => {
              const isSelected = selected?.id === bowler.id
              return (
                <button
                  key={bowler.id}
                  type="button"
                  className={isSelected ? "sponsor-bowler__result is-selected" : "sponsor-bowler__result"}
                  aria-pressed={isSelected}
                  onClick={() => onSelectedId(isSelected ? "" : bowler.id)}
                >
                  <span className="sponsor-bowler__name">{bowlerResultLabel(bowler, matches)}</span>
                  <span className="sponsor-bowler__choose">{isSelected ? "Selected" : "Select"}</span>
                </button>
              )
            })}
          </div>
        )}

        {selected ? (
          <p className="selection-note sponsor-bowler__selected">
            Previewing {bowlerResultLabel(selected, matches)}. This is a fictional
            sample, nothing has been sent, and no payment was collected.
          </p>
        ) : null}
      </div>
    </div>
  )
}
