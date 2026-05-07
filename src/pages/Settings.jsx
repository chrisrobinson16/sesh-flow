import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react'
import { SkeletonBlock } from '../components/SkeletonCard'
import { getUser, logout } from '../lib/auth'

function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    setUser(getUser())
    setProfileReady(true)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = String(user?.name || 'S')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (!profileReady) {
    return (
      <section className="container section" aria-busy="true">
        <div className="section-header">
          <div>
            <h1>Settings</h1>
            <p className="page-subtitle">Manage your account and app access.</p>
          </div>
        </div>

        <div className="detail-card settings-profile-card skeleton-settings-card">
          <div className="skeleton-settings-head">
            <SkeletonBlock className="skeleton-settings-avatar" />
            <div>
              <SkeletonBlock className="skeleton-settings-name" />
              <SkeletonBlock className="skeleton-settings-email" />
            </div>
          </div>
          <div className="skeleton-settings-grid">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton-settings-item">
                <SkeletonBlock className="skeleton-settings-item-icon" />
                <div className="skeleton-settings-item-lines">
                  <SkeletonBlock className="skeleton-filter-label" />
                  <SkeletonBlock className="skeleton-detail-line" style={{ maxWidth: '11rem' }} />
                </div>
              </div>
            ))}
          </div>
          <SkeletonBlock className="skeleton-settings-logout" />
        </div>
      </section>
    )
  }

  return (
    <section className="container section">
      <div className="section-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account and app access.</p>
        </div>
      </div>

      <div className="detail-card settings-profile-card content-reveal">
        <div className="settings-profile-head">
          <div className="settings-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h2>{user?.name ?? 'Sesh Tracker User'}</h2>
            <p>{user?.email ?? '—'}</p>
          </div>
        </div>

        <div className="settings-info-grid">
          <div className="settings-info-item">
            <UserCircle2 size={16} />
            <p>
              <span>Name</span>
              <strong>{user?.name ?? '—'}</strong>
            </p>
          </div>
          <div className="settings-info-item">
            <ShieldCheck size={16} />
            <p>
              <span>Account Email</span>
              <strong>{user?.email ?? '—'}</strong>
            </p>
          </div>
        </div>

        <button type="button" className="btn btn-danger settings-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <p className="settings-disclaimer" role="note">
        Sesh Tracker is a portfolio/demo project. Please avoid uploading sensitive
        personal information.
      </p>
    </section>
  )
}

export default Settings
