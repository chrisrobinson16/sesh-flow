import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'
import { API_BASE, getStructuredNoteSectionsForDisplay } from '../lib/sessionForm.js'

function formatSessionDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${month}/${day}/${year}`
}

function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true)
      setError(null)
      setSession(null)

      try {
        const { response, data, unauthorized } = await apiFetch(
          `${API_BASE}/${id}`,
          {},
          navigate,
        )
        if (unauthorized) return

        if (response.status === 404) {
          setError('notfound')
          return
        }

        if (!response.ok) {
          setError(data.message || 'Failed to load session')
          return
        }

        setSession(data)
      } catch (err) {
        console.error('Error fetching session:', err)
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSession()
    }
  }, [id, navigate])

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Delete this session permanently? This cannot be undone.',
      )
    ) {
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      const { response, data, unauthorized } = await apiFetch(
        `${API_BASE}/${id}`,
        { method: 'DELETE' },
        navigate,
      )
      if (unauthorized) return
      if (!response.ok) {
        setDeleteError(data.message || 'Could not delete session.')
        setDeleting(false)
        return
      }
      navigate('/sessions', {
        state: { saveMessage: 'Session deleted.' },
      })
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete session.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className="container section">
        <p className="empty-state">Loading session...</p>
      </section>
    )
  }

  if (error === 'notfound') {
    return (
      <section className="container section">
        <h1>Session Not Found</h1>
        <Link to="/sessions" className="text-link">
          Back to history
        </Link>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container section">
        <p className="empty-state">{error}</p>
        <Link to="/sessions" className="text-link">
          Back to history
        </Link>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="container section">
        <h1>Session Not Found</h1>
        <Link to="/sessions" className="text-link">
          Back to history
        </Link>
      </section>
    )
  }

  const effectsText = Array.isArray(session.effects) && session.effects.length > 0
    ? session.effects.join(', ')
    : '—'

  const noteSections = getStructuredNoteSectionsForDisplay(session)

  return (
    <section className="container section">
      <div className="detail-card">
        {location.state?.saveMessage ? (
          <p className="status-message">{location.state.saveMessage}</p>
        ) : null}

        <h1>{session.productName}</h1>
        <p>
          <strong>Date:</strong> {formatSessionDate(session.createdAt)}
        </p>
        <p>
          <strong>Product Type:</strong> {session.productType ?? '—'}
        </p>
        <p>
          <strong>Strain Type:</strong> {session.strainType ?? '—'}
        </p>
        {session.amount ? (
          <p>
            <strong>Amount:</strong> {session.amount}
          </p>
        ) : null}
        <p>
          <strong>Mood Before:</strong> {session.moodBefore ?? '—'}
        </p>
        <p>
          <strong>Mood After:</strong> {session.moodAfter ?? '—'}
        </p>
        <p>
          <strong>Rating:</strong>{' '}
          {session.rating != null ? `${session.rating}/5` : '—'}
        </p>
        <p>
          <strong>Effects:</strong> {effectsText}
        </p>
        {noteSections.map((row) => (
          <p key={row.label}>
            <strong>{row.label}:</strong> {row.body}
          </p>
        ))}

        <div className="session-detail-actions">
          <Link to={`/sessions/${id}/edit`} className="btn btn-primary">
            Edit session
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete session'}
          </button>
          <Link to="/sessions" className="btn btn-secondary">
            Back to history
          </Link>
        </div>
        {deleteError ? <p className="empty-state">{deleteError}</p> : null}
      </div>
    </section>
  )
}

export default SessionDetail
