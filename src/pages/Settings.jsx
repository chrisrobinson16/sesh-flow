import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react'
import { getUser, logout } from '../lib/auth'

function Settings() {
  const navigate = useNavigate()
  const user = getUser()
  const initials = String(user?.name || 'S')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <section className="container section">
      <div className="section-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account and app access.</p>
        </div>
      </div>

      <div className="detail-card settings-profile-card">
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
    </section>
  )
}

export default Settings
