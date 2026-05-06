import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FilterX, Search } from 'lucide-react'
import SessionCard from '../components/SessionCard'
import { apiFetch } from '../lib/apiFetch'

const EMPTY_COPY = 'No sessions yet. Log your first one.'

function SessionHistory() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [productTypeFilter, setProductTypeFilter] = useState('all')
  const [strainTypeFilter, setStrainTypeFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true)
      setError(null)

      try {
        const { response, data, unauthorized } = await apiFetch(
          'http://localhost:5001/api/sessions',
          {},
          navigate,
        )
        if (unauthorized) return

        if (!response.ok) {
          setError(data.message || 'Failed to load sessions')
          setSessions([])
          return
        }

        setSessions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching sessions:', err)
        setError('Failed to load sessions')
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [navigate])

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    const filtered = sessions.filter((session) => {
      if (productTypeFilter !== 'all') {
        const value = String(session.productType || '').trim().toLowerCase()
        if (productTypeFilter === 'other') {
          const known = ['flower', 'vape', 'edible', 'concentrate']
          if (!value || known.includes(value)) return false
        } else if (value !== productTypeFilter) {
          return false
        }
      }

      if (strainTypeFilter !== 'all') {
        const value = String(session.strainType || '').trim().toLowerCase()
        if (strainTypeFilter === 'other') {
          const known = ['indica', 'sativa', 'hybrid', 'cbd blend']
          if (!value || known.includes(value)) return false
        } else if (value !== strainTypeFilter) {
          return false
        }
      }

      const rating = Number(session.rating)
      if (ratingFilter === '5' && rating !== 5) return false
      if (ratingFilter === '4plus' && !(Number.isFinite(rating) && rating >= 4)) return false
      if (ratingFilter === '3plus' && !(Number.isFinite(rating) && rating >= 3)) return false
      if (ratingFilter === 'below3' && !(Number.isFinite(rating) && rating < 3)) return false

      if (!q) return true

      const effects = Array.isArray(session.effects) ? session.effects.join(' ') : ''
      const rawNotes = String(session.notes || '')
      const sn = session.sessionNotes
      const structuredNotes =
        sn && typeof sn === 'object'
          ? [sn.setting, sn.experience, sn.reminder, sn.additional]
              .filter(Boolean)
              .join(' ')
          : ''

      const haystack = [
        session.productName,
        session.productType,
        session.strainType,
        effects,
        rawNotes,
        structuredNotes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })

    const sorted = [...filtered]
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'highest') {
      sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    } else if (sortBy === 'lowest') {
      sorted.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0))
    }

    return sorted
  }, [sessions, searchQuery, productTypeFilter, strainTypeFilter, ratingFilter, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setProductTypeFilter('all')
    setStrainTypeFilter('all')
    setRatingFilter('all')
    setSortBy('newest')
  }

  if (loading) {
    return (
      <section className="container section">
        <h1>Session History</h1>
        <p className="page-subtitle">Review every logged session in one place.</p>
        <p className="empty-state">Loading sessions...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container section">
        <h1>Session History</h1>
        <p className="page-subtitle">Review every logged session in one place.</p>
        <p className="empty-state">{error}</p>
      </section>
    )
  }

  return (
    <section className="container section">
      <div className="section-header">
        <div>
          <h1>Session History</h1>
          <p className="page-subtitle">Review every logged session in one place.</p>
        </div>
      </div>
      <div className="detail-card session-filter-card" aria-label="Session search and filters">
        <div className="session-filter-row">
          <label htmlFor="session-search" className="session-filter-label">
            Search sessions
          </label>
          <div className="session-search-wrap">
            <Search size={16} aria-hidden="true" />
            <input
              id="session-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, type, strain, effects, or notes"
            />
          </div>
        </div>

        <div className="session-filter-grid">
          <div className="session-filter-row">
            <label htmlFor="product-filter" className="session-filter-label">Product type</label>
            <select
              id="product-filter"
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="flower">Flower</option>
              <option value="vape">Vape</option>
              <option value="edible">Edible</option>
              <option value="concentrate">Concentrate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="session-filter-row">
            <label htmlFor="strain-filter" className="session-filter-label">Strain type</label>
            <select
              id="strain-filter"
              value={strainTypeFilter}
              onChange={(e) => setStrainTypeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="indica">Indica</option>
              <option value="sativa">Sativa</option>
              <option value="hybrid">Hybrid</option>
              <option value="cbd blend">CBD Blend</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="session-filter-row">
            <label htmlFor="rating-filter" className="session-filter-label">Rating</label>
            <select
              id="rating-filter"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All ratings</option>
              <option value="5">5</option>
              <option value="4plus">4+</option>
              <option value="3plus">3+</option>
              <option value="below3">Below 3</option>
            </select>
          </div>

          <div className="session-filter-row">
            <label htmlFor="sort-filter" className="session-filter-label">Sort</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>
        </div>

        <div className="session-filter-footer">
          <p className="session-filter-count">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </p>
          <button type="button" className="btn btn-secondary" onClick={clearFilters}>
            <FilterX size={15} />
            Clear Filters
          </button>
        </div>
      </div>
      {location.state?.saveMessage ? (
        <p className="status-message">{location.state.saveMessage}</p>
      ) : null}
      {filteredSessions.length > 0 ? (
        <div className="card-list">
          {filteredSessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          {sessions.length === 0 ? EMPTY_COPY : 'No sessions match your search.'}
        </p>
      )}
    </section>
  )
}

export default SessionHistory
