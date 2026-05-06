import { Link } from 'react-router-dom'
import { CalendarDays, Sparkles, Star } from 'lucide-react'

function formatBadge(value) {
  if (value == null || String(value).trim() === '') return null
  const t = String(value).trim()
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

function ratingTier(rating) {
  if (rating == null || rating === '') return 0
  const n = Number(rating)
  if (!Number.isFinite(n)) return 0
  return Math.min(5, Math.max(0, Math.round(n)))
}

function SessionCard({ session }) {
  const sessionId = session._id ?? session.id
  if (!sessionId) return null
  const tier = ratingTier(session.rating)
  const tierClass = `session-card--r${tier}`

  const typeLabel = formatBadge(session.productType)
  const strainLabel = formatBadge(session.strainType)
  const strainKey = String(session.strainType || '').toLowerCase()
  const strainTone = strainKey.includes('sativa')
    ? 'sativa'
    : strainKey.includes('indica')
      ? 'indica'
      : 'hybrid'

  const dateLabel = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <Link
      to={`/sessions/${sessionId}`}
      className={`session-card ${tierClass} session-card--strain-${strainTone}`}
    >
      <div className="session-card-top">
        <h3 className="session-card-title">{session.productName}</h3>
        <span className="session-card-arrow" aria-hidden="true">
          →
        </span>
      </div>

      {(typeLabel || strainLabel) && (
        <div className="session-card-badges">
          {typeLabel ? (
            <span className="session-card-badge session-card-badge--type">
              {typeLabel}
            </span>
          ) : null}
          {strainLabel ? (
            <span className="session-card-badge session-card-badge--strain">
              {strainLabel}
            </span>
          ) : null}
        </div>
      )}

      <div className="session-card-rating-row">
        <span className="session-card-rating-label">
          <Star size={14} />
          Rating
        </span>
        <div
          className="session-card-dots"
          aria-label={
            session.rating != null ? `${session.rating} out of 5` : 'No rating'
          }
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`session-card-dot ${i <= tier && tier > 0 ? 'session-card-dot--on' : ''}`}
            />
          ))}
        </div>
      </div>

      <p className="session-card-date">
        <span className="session-card-date-label">
          <CalendarDays size={13} />
          Logged
        </span>
        {dateLabel}
      </p>
      <p className="session-card-meta">
        <Sparkles size={13} />
        Tap to open details
      </p>
    </Link>
  )
}

export default SessionCard
