import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, CalendarClock, Leaf, Sparkles, Star, TrendingUp } from 'lucide-react'
import SessionCard from '../components/SessionCard'
import { apiFetch } from '../lib/apiFetch'
import StatCard from '../components/StatCard'

const EMPTY_COPY = 'No sessions yet. Log your first one.'

function Dashboard() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const totalSessions = sessions.length
  const sessionsThisWeek = sessions.filter(
    (session) => session.createdAt && new Date(session.createdAt) >= oneWeekAgo,
  ).length

  const ratings = sessions
    .map((s) => s.rating)
    .filter((r) => r != null && !Number.isNaN(Number(r)))
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + Number(r), 0) / ratings.length).toFixed(1)
      : '—'

  const recentSessions = [...sessions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  const byCount = (arr) => {
    const counts = {}
    for (const value of arr) {
      if (!value) continue
      const key = String(value).trim()
      if (!key) continue
      counts[key] = (counts[key] || 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  }

  const favoriteStrain = byCount(sessions.map((s) => s.strainType))
  const commonEffect = byCount(sessions.flatMap((s) => (Array.isArray(s.effects) ? s.effects : [])))
  const highestRated = [...sessions]
    .filter((s) => Number.isFinite(Number(s.rating)))
    .sort((a, b) => Number(b.rating) - Number(a.rating))[0]
  const moodImprovementRate = (() => {
    let improved = 0
    let valid = 0
    for (const s of sessions) {
      const before = Number(s.moodBefore)
      const after = Number(s.moodAfter)
      if (!Number.isFinite(before) || !Number.isFinite(after)) continue
      valid += 1
      if (after > before) improved += 1
    }
    return valid ? `${Math.round((improved / valid) * 100)}%` : '—'
  })()

  return (
    <section className="container section">
      <div className="section-header">
        <div>
          <h1>Welcome back</h1>
          <p className="page-subtitle">
            Your private session overview, progress trends, and what is working best this week.
          </p>
        </div>
        <Link to="/sessions/prep" className="btn btn-primary">
          Log New Session
        </Link>
      </div>

      {loading ? (
        <p className="empty-state">Loading sessions...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Total Sessions"
              value={totalSessions}
              icon={Leaf}
              tone="mint"
            />
            <StatCard
              label="Sessions This Week"
              value={sessionsThisWeek}
              icon={CalendarClock}
              tone="sky"
            />
            <StatCard
              label="Average Rating"
              value={averageRating === '—' ? '—' : `${averageRating}/5`}
              icon={Star}
              tone="warm"
            />
          </div>

          <section className="detail-card dashboard-insights">
            <h2 className="insight-section-title">Quick Insights</h2>
            <div className="dashboard-insight-grid">
              <article className="dashboard-insight-item">
                <Leaf size={16} />
                <div>
                  <p className="dashboard-insight-label">Favorite strain type</p>
                  <p className="dashboard-insight-value">{favoriteStrain}</p>
                </div>
              </article>
              <article className="dashboard-insight-item">
                <Sparkles size={16} />
                <div>
                  <p className="dashboard-insight-label">Most common effect</p>
                  <p className="dashboard-insight-value">{commonEffect}</p>
                </div>
              </article>
              <article className="dashboard-insight-item">
                <Activity size={16} />
                <div>
                  <p className="dashboard-insight-label">Highest rated session</p>
                  <p className="dashboard-insight-value">
                    {highestRated ? `${highestRated.productName} (${highestRated.rating}/5)` : '—'}
                  </p>
                </div>
              </article>
              <article className="dashboard-insight-item">
                <TrendingUp size={16} />
                <div>
                  <p className="dashboard-insight-label">Mood improvement trend</p>
                  <p className="dashboard-insight-value">{moodImprovementRate}</p>
                </div>
              </article>
            </div>
          </section>

          <section className="list-section">
            <h2>Recent Sessions</h2>
            {recentSessions.length > 0 ? (
              <div className="card-list">
                {recentSessions.slice(0, 5).map((session) => (
                  <SessionCard key={session._id} session={session} />
                ))}
              </div>
            ) : (
              <p className="empty-state">{EMPTY_COPY}</p>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default Dashboard
