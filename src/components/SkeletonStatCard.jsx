import { SkeletonBlock } from './SkeletonCard'

export default function SkeletonStatCard() {
  return (
    <article className="stat-card skeleton-stat-card" aria-hidden="true">
      <SkeletonBlock className="skeleton-stat-icon" />
      <SkeletonBlock className="skeleton-stat-label" />
      <SkeletonBlock className="skeleton-stat-value" />
    </article>
  )
}
