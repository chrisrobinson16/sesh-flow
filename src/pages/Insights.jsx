import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Brain, Leaf, Medal, Sparkles, Star, TrendingUp } from 'lucide-react'
import StatCard from '../components/StatCard'
import { apiFetch } from '../lib/apiFetch'

const API = 'http://localhost:5001/api/sessions'
const EMPTY_COPY = 'No insights yet. Log a few sessions to see patterns.'

function safeNumberRating(session) {
  const raw = session?.rating
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** Lowercase trimmed key for grouping; null if missing or empty. */
function normalizeCategoryKey(raw) {
  if (raw == null) return null
  const t = String(raw).trim()
  if (t === '') return null
  return t.toLowerCase()
}

/** Canonical bucket for product/strain counts (missing → unknown). */
function toCountKey(raw) {
  const n = normalizeCategoryKey(raw)
  return n ?? 'unknown'
}

/** Display label: capitalize first letter; unknown bucket → "Unknown". */
function formatDisplayLabel(normalizedKey) {
  if (normalizedKey == null || normalizedKey === 'unknown') return 'Unknown'
  return normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1)
}

function countByField(sessions, field) {
  const counts = {}
  for (const s of sessions) {
    const raw = s?.[field]
    const key = toCountKey(raw)
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

function countEffects(sessions) {
  const counts = {}
  for (const s of sessions) {
    const list = Array.isArray(s?.effects) ? s.effects : []
    for (const raw of list) {
      const key = normalizeCategoryKey(raw)
      if (key == null) continue
      counts[key] = (counts[key] || 0) + 1
    }
  }
  return counts
}

function maxCountEntry(counts) {
  const entries = Object.entries(counts)
  if (!entries.length) return null
  return entries.sort((a, b) => b[1] - a[1])[0]
}

function averageRating(sessions) {
  const vals = sessions.map(safeNumberRating).filter((v) => v != null)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function bestRatedSession(sessions) {
  let best = null
  for (const s of sessions) {
    const r = safeNumberRating(s)
    if (r == null) continue
    if (!best || r > best.rating) {
      best = { session: s, rating: r }
    }
  }
  return best
}

function avgRatingByProductType(sessions) {
  const map = {}
  for (const s of sessions) {
    const r = safeNumberRating(s)
    if (r == null) continue
    const key = toCountKey(s?.productType)
    if (!map[key]) map[key] = { sum: 0, n: 0 }
    map[key].sum += r
    map[key].n += 1
  }
  return Object.entries(map).map(([type, { sum, n }]) => ({
    type,
    avg: sum / n,
    n,
  }))
}

function avgRatingByStrainType(sessions) {
  const map = {}
  for (const s of sessions) {
    const r = safeNumberRating(s)
    if (r == null) continue
    const key = toCountKey(s?.strainType)
    if (!map[key]) map[key] = { sum: 0, n: 0 }
    map[key].sum += r
    map[key].n += 1
  }
  return Object.entries(map).map(([type, { sum, n }]) => ({
    type,
    avg: sum / n,
    n,
  }))
}

/** Pick category with highest average rating (tie-break: more ratings, then name). */
function bestCategoryByAvgRating(rows) {
  const filtered = rows.filter((r) => r && r.n > 0 && Number.isFinite(r.avg))
  if (!filtered.length) return null
  filtered.sort((a, b) => {
    if (b.avg !== a.avg) return b.avg - a.avg
    if (b.n !== a.n) return b.n - a.n
    return String(a.type).localeCompare(String(b.type))
  })
  return filtered[0]
}

/** Share of sessions (with numeric moods) where moodAfter > moodBefore. */
function moodImprovementPercent(sessions) {
  let withNumeric = 0
  let positive = 0
  for (const s of sessions) {
    const b = Number(s?.moodBefore)
    const a = Number(s?.moodAfter)
    if (!Number.isFinite(b) || !Number.isFinite(a)) continue
    withNumeric += 1
    if (a - b > 0) positive += 1
  }
  if (withNumeric === 0) return null
  return Math.round((positive / withNumeric) * 100)
}

const PERSONAL_INSIGHTS_FALLBACK =
  'Log more sessions to unlock personalized insights'

function buildPersonalInsightLines(sessions) {
  if (sessions.length < 3) {
    return [PERSONAL_INSIGHTS_FALLBACK]
  }

  const lines = []

  const bestProd = bestCategoryByAvgRating(avgRatingByProductType(sessions))
  if (bestProd) {
    lines.push(
      `You tend to rate ${formatDisplayLabel(bestProd.type)} highest (avg ${bestProd.avg.toFixed(1)}/5).`,
    )
  }

  const moodPct = moodImprovementPercent(sessions)
  if (moodPct != null) {
    lines.push(`Your mood improves in ${moodPct}% of sessions.`)
  }

  const bestStrain = bestCategoryByAvgRating(avgRatingByStrainType(sessions))
  if (bestStrain) {
    lines.push(
      `You tend to rate ${formatDisplayLabel(bestStrain.type)} highest (avg ${bestStrain.avg.toFixed(1)}/5).`,
    )
  }

  const topEffect = maxCountEntry(countEffects(sessions))
  if (topEffect) {
    lines.push(
      `Your most frequent effect is ${formatDisplayLabel(topEffect[0])}.`,
    )
  }

  if (!lines.length) {
    return [PERSONAL_INSIGHTS_FALLBACK]
  }

  return lines
}

function sortedCountEntries(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

function BarBlock({ title, counts }) {
  const entries = sortedCountEntries(counts)
  const max = entries.reduce((m, [, c]) => Math.max(m, c), 0)

  if (!entries.length) {
    return (
      <div className="detail-card">
        <h2 className="insight-section-title">{title}</h2>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          No data for this breakdown yet.
        </p>
      </div>
    )
  }

  return (
    <div className="detail-card">
      <h2 className="insight-section-title">{title}</h2>
      <div className="insight-bar-list">
        {entries.map(([normalizedKey, count]) => (
          <div key={normalizedKey} className="insight-bar-row">
            <div className="insight-bar-label">
              <span>{formatDisplayLabel(normalizedKey)}</span>
              <span className="insight-bar-count">
                {count} session{count !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="insight-bar-track">
              <div
                className="insight-bar-fill"
                style={{ width: `${max > 0 ? Math.max(4, (count / max) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Insights() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true)
      setError(null)

      try {
        const { response, data, unauthorized } = await apiFetch(API, {}, navigate)
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

  const stats = useMemo(() => {
    const total = sessions.length
    const avg = averageRating(sessions)
    const productCounts = countByField(sessions, 'productType')
    const strainCounts = countByField(sessions, 'strainType')
    const effectCounts = countEffects(sessions)

    const topProductKey = maxCountEntry(productCounts)?.[0]
    const topStrainKey = maxCountEntry(strainCounts)?.[0]
    const topEffectEntry = maxCountEntry(effectCounts)

    const topProductType =
      topProductKey != null ? formatDisplayLabel(topProductKey) : '—'
    const topStrainType =
      topStrainKey != null ? formatDisplayLabel(topStrainKey) : '—'
    const topEffect = topEffectEntry
      ? formatDisplayLabel(topEffectEntry[0])
      : '—'

    const best = bestRatedSession(sessions)
    const bestRatedLabel = best
      ? `${best.session?.productName || 'Session'} — ${best.rating}/5`
      : '—'

    const personalInsightLines = buildPersonalInsightLines(sessions)

    return {
      total,
      avg,
      topProductType,
      topStrainType,
      topEffect,
      bestRatedLabel,
      productCounts,
      strainCounts,
      effectCounts,
      personalInsightLines,
      insightOfWeek:
        personalInsightLines.find((line) => line !== PERSONAL_INSIGHTS_FALLBACK) ||
        PERSONAL_INSIGHTS_FALLBACK,
    }
  }, [sessions])

  if (loading) {
    return (
      <section className="container section">
        <div className="detail-card">
          <h1>Insights</h1>
          <p className="page-subtitle">Analytics from your logged sessions.</p>
          <p className="empty-state">Loading sessions...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container section">
        <div className="detail-card">
          <h1>Insights</h1>
          <p className="page-subtitle">Analytics from your logged sessions.</p>
          <p className="empty-state">{error}</p>
        </div>
      </section>
    )
  }

  if (sessions.length === 0) {
    return (
      <section className="container section">
        <div className="detail-card">
          <h1>Insights</h1>
          <p className="page-subtitle">Analytics from your logged sessions.</p>
          <p className="empty-state">{EMPTY_COPY}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container section insights-page">
      <div className="detail-card">
        <h1>Insights</h1>
        <p className="page-subtitle">Analytics from your logged sessions.</p>
      </div>

      <div className="detail-card insight-week-card">
        <p className="insight-week-kicker">
          <Sparkles size={15} />
          Insight of the Week
        </p>
        <p className="insight-week-text">{stats.insightOfWeek}</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total sessions" value={String(stats.total)} icon={BarChart3} tone="mint" />
        <StatCard
          label="Average rating"
          value={stats.avg != null ? `${stats.avg.toFixed(1)}/5` : '—'}
          icon={Star}
          tone="warm"
        />
        <StatCard
          label="Most used product type"
          value={stats.topProductType}
          icon={Leaf}
          tone="mint"
        />
        <StatCard
          label="Most common strain type"
          value={stats.topStrainType}
          icon={TrendingUp}
          tone="sky"
        />
        <StatCard label="Most common effect" value={stats.topEffect} icon={Sparkles} tone="sky" />
        <StatCard label="Best-rated session" value={stats.bestRatedLabel} icon={Medal} tone="warm" />
      </div>

      <div className="insights-stack">
        <BarBlock title="Product type breakdown" counts={stats.productCounts} />
        <BarBlock title="Strain type breakdown" counts={stats.strainCounts} />
        <BarBlock title="Effect frequency" counts={stats.effectCounts} />
      </div>

      <div className="detail-card">
        <h2 className="insight-section-title insight-title-with-icon">
          <Brain size={17} />
          Personal Insights
        </h2>
        <ul className="personal-insight-list">
          {stats.personalInsightLines.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Insights
