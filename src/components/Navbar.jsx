import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sessions', label: 'Sessions', end: true },
  {
    to: '/sessions/prep',
    label: 'New Session',
    newSessionFlow: true,
  },
  { to: '/insights', label: 'Insights' },
  { to: '/settings', label: 'Settings' },
]

function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-top-row">
          <p className="brand">
            <img
              src="/brand/sesh-logo-navbar.png"
              alt="Sesh Tracker"
              className="brand-logo"
            />
          </p>
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-nav"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <nav
          id="primary-nav"
          className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end === true}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => {
                const flowActive =
                  link.newSessionFlow &&
                  (location.pathname === '/sessions/prep' ||
                    location.pathname === '/sessions/new')
                return isActive || flowActive ? 'nav-link active' : 'nav-link'
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
