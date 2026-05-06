import { SkeletonBlock } from './SkeletonCard'

export default function SkeletonSessionCard() {
  return (
    <div className="session-card skeleton-session-card" aria-hidden="true">
      <div className="session-card-top">
        <SkeletonBlock className="skeleton-session-title" />
      </div>
      <SkeletonBlock className="skeleton-session-thumb" />
      <div className="skeleton-session-badges">
        <SkeletonBlock className="skeleton-session-badge" />
        <SkeletonBlock className="skeleton-session-badge skeleton-session-badge--short" />
      </div>
      <div className="skeleton-session-rating-row">
        <SkeletonBlock className="skeleton-session-rating-label" />
        <SkeletonBlock className="skeleton-session-dots" />
      </div>
      <SkeletonBlock className="skeleton-session-date" />
      <SkeletonBlock className="skeleton-session-meta" />
    </div>
  )
}
