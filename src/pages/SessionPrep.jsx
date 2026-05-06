import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const CHECKLIST = [
  { id: 'water', label: 'Grab water' },
  { id: 'prep', label: 'Prep your flower, vape, or edible' },
  { id: 'music', label: 'Pick your music or vibe' },
  { id: 'comfort', label: 'Get comfortable' },
  { id: 'intention', label: 'Set your intention' },
]

const INITIAL_SECONDS = 30

function SessionPrep() {
  const intervalRef = useRef(null)
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS)
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(CHECKLIST.map((item) => [item.id, false])),
  )

  const toggleItem = useCallback((id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) return 0
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const ready = secondsLeft === 0

  return (
    <section className="container section">
      <div className="detail-card session-prep-card">
        <h1>Session Prep</h1>
        <p className="page-subtitle">
          Take a moment to get set before you log your session.
        </p>

        <div className="prep-timer-block" aria-live="polite">
          <p className="prep-timer-label">Settle in</p>
          <p className="prep-timer-value">
            {ready ? '0:00' : `0:${String(secondsLeft).padStart(2, '0')}`}
          </p>
        </div>

        {ready ? (
          <p className="status-message prep-ready-message">
            You&apos;re ready. Start your session when you&apos;re set.
          </p>
        ) : null}

        <fieldset className="prep-checklist">
          <legend className="form-field-label">Quick checklist</legend>
          <p className="form-field-hint block">
            Tap each item when you&apos;ve done it — optional, but it helps you land in the
            moment.
          </p>
          <ul className="prep-checklist-list">
            {CHECKLIST.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`prep-check-item ${checked[item.id] ? 'prep-check-item--on' : ''}`}
                  onClick={() => toggleItem(item.id)}
                  aria-pressed={checked[item.id]}
                >
                  <span className="prep-check-box" aria-hidden="true">
                    {checked[item.id] ? '✓' : ''}
                  </span>
                  <span className="prep-check-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="session-detail-actions prep-actions">
          <Link to="/sessions/new" className="btn btn-secondary">
            Skip Prep
          </Link>
          {ready ? (
            <Link to="/sessions/new" className="btn btn-primary">
              Start Logging
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" disabled>
              Start Logging
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default SessionPrep
