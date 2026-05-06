/**
 * Base skeleton primitives — soft blocks with shimmer (styles in index.css).
 */
export function SkeletonBlock({ className = '', style }) {
  return (
    <div
      className={`skeleton-block ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  )
}

/** Wraps skeleton content in a card shell matching .detail-card spacing. */
export default function SkeletonCard({ children, className = '' }) {
  return (
    <div className={`detail-card skeleton-card ${className}`.trim()}>{children}</div>
  )
}
