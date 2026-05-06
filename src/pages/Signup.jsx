import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { saveAuth } from '../lib/auth'
import { API_ROUTES } from '../lib/apiConfig'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mapSignupError(message) {
  const raw = String(message || '').toLowerCase()
  if (raw.includes('user already exists')) {
    return 'An account with this email already exists'
  }
  return message || 'Sign up failed. Try again.'
}

function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (!cleanName) {
      setError('Please enter your name')
      return
    }

    if (!EMAIL_RE.test(cleanEmail)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(API_ROUTES.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(mapSignupError(data.message))
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
          <h1>Start building mindful session habits.</h1>
          <p>
            Create your private tracker to log sessions, notice patterns, and make
            choices that feel better over time.
          </p>
          <ul className="auth-points" aria-label="Sesh Tracker highlights">
            <li>Calm guided prep before every session</li>
            <li>Quick logging for mood, effects, and notes</li>
            <li>Personal insights based on your data</li>
          </ul>
        </aside>

        <div className="auth-card form-wrapper">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Home
          </Link>
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit} className="form-grid auth-form-grid">
            <label htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
            />

            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
            />

            <label htmlFor="signup-password">Password</label>
            <div className="auth-password-row">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'signup-error' : undefined}
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

            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="auth-password-row">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'signup-error' : undefined}
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>

            {error ? (
              <p id="signup-error" className="status-message" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Signup
