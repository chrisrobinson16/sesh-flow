import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { saveAuth } from '../lib/auth'

const LOGIN_URL = 'http://localhost:5001/api/auth/login'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mapLoginError(message) {
  const raw = String(message || '').toLowerCase()
  if (raw.includes('invalid email or password')) {
    return 'Invalid email or password'
  }
  return message || 'Login failed. Try again.'
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(location.state?.message || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const cleanEmail = email.trim()

    if (!cleanEmail || !password.trim()) {
      setError('Please enter your email and password')
      return
    }

    if (!EMAIL_RE.test(cleanEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(mapLoginError(data.message))
        return
      }

      if (!data.token || !data.user) {
        setError('Unexpected response from server.')
        return
      }

      saveAuth(data.user, data.token)
      navigate('/dashboard')
    } catch {
      setError('Could not reach the server. Is the API running?')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-shell section">
      <div className="container auth-layout">
        <aside className="auth-panel">
          <Link to="/" className="auth-logo-link" aria-label="Go to home page">
            <img
              src="/brand/sesh-logo-full.png"
              alt="Sesh Tracker"
              className="auth-logo"
            />
          </Link>
          <h1>Welcome back to your session journal.</h1>
          <p>
            Pick up where you left off and keep learning what supports your best
            sessions.
          </p>
          <ul className="auth-points" aria-label="Sesh Tracker highlights">
            <li>Private and personal wellness tracking</li>
            <li>Guided prep, logging, and reflection flow</li>
            <li>Insights built from your real session history</li>
          </ul>
        </aside>

        <div className="auth-card form-wrapper">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Home
          </Link>
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit} className="form-grid auth-form-grid">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />

            <label htmlFor="login-password">Password</label>
            <div className="auth-password-row">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>

            {error ? (
              <p id="login-error" className="status-message" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Continue'}
            </button>
          </form>
          <p>
            Need an account?{' '}
            <Link to="/signup" className="text-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Login
