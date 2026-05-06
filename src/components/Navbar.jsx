import { NavLink, useLocation } from 'react-router-dom'

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

  return (
    <header className="navbar">
      <div className="container">
        <p className="brand">
          <img
            src="/brand/sesh-logo-navbar.png"
            alt="Sesh Tracker"
            className="brand-logo"
          />
        </p>
        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end === true}
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
