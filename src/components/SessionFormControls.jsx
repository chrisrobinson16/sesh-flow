import { EFFECT_OPTIONS } from '../lib/sessionForm'

export function ChipGroup({ label, fieldId, options, value, onChange, ariaLabel }) {
  const labelId = `${fieldId}-label`
  return (
    <div className="form-field">
      <span className="form-field-label" id={labelId}>
        {label}
      </span>
      <div
        className="chip-row"
        role="group"
        aria-labelledby={labelId}
        aria-label={ariaLabel || label}
      >
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`chip ${value === opt ? 'chip-selected' : ''}`}
            aria-pressed={value === opt}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export function RatingChips({ value, onChange }) {
  return (
    <div className="form-field">
      <span className="form-field-label" id="rating-label">
        Rating
      </span>
      <div className="chip-row" role="group" aria-labelledby="rating-label">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`chip chip-rating ${value === n ? 'chip-selected' : ''}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
          >
            {n}/5
          </button>
        ))}
      </div>
    </div>
  )
}

export function MoodStepper({ label, fieldId, value, onChange }) {
  const labelId = `${fieldId}-label`
  return (
    <div className="form-field">
      <span className="form-field-label" id={labelId}>
        {label} <span className="form-field-hint">(1–10)</span>
      </span>
      <div className="mood-stepper" role="group" aria-labelledby={labelId}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            className={`mood-step ${value === n ? 'mood-step-selected' : ''}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export function EffectPills({ selected, onToggle, optionList }) {
  const options = optionList || EFFECT_OPTIONS
  return (
    <fieldset className="effects-fieldset">
      <legend className="form-field-label">Effects</legend>
      <p className="form-field-hint block">Tap all that apply — no dropdown needed.</p>
      <div className="pill-row">
        {options.map((effect) => {
          const isOn = selected.has(effect)
          return (
            <button
              key={effect}
              type="button"
              className={`pill ${isOn ? 'pill-selected' : ''}`}
              aria-pressed={isOn}
              onClick={() => onToggle(effect)}
            >
              {effect}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
