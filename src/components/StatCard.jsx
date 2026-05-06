function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      {Icon ? (
        <span className="stat-icon" aria-hidden="true">
          <Icon size={16} />
        </span>
      ) : null}
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </article>
  )
}

export default StatCard
