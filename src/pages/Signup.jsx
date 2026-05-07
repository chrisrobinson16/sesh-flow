import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { saveAuth } from '../lib/auth'
import { API_ROUTES } from '../lib/apiConfig'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PLACEHOLDER_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com',
  'asdf.com',
  'qwerty.com',
  'localhost',
  'localhost.com',
  'sample.com',
])
const RESERVED_TLDS = new Set(['test', 'example', 'invalid', 'localhost', 'local'])

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password1',
  'password12',
  'password123',
  'password1234',
  'passw0rd',
  'qwerty',
  'qwerty1',
  'qwerty12',
  'qwerty123',
  '12345678',
  '123456789',
  '1234567890',
  'iloveyou1',
  'admin123',
  'admin1234',
  'letmein1',
  'welcome1',
  'welcome123',
  'changeme1',
  'changeme123',
])

function localValidateEmail(email) {
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address'
  const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase()
  const tld = domain.split('.').pop() || ''
  if (PLACEHOLDER_DOMAINS.has(domain) || RESERVED_TLDS.has(tld)) {
    return 'Please use a real email address (placeholder domains are not allowed)'
  }
  return ''
}

function localValidatePassword(password, { name, email }) {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password must be 128 characters or fewer'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain at least one letter and one number'
  }
  const lowered = password.toLowerCase()
  if (COMMON_WEAK_PASSWORDS.has(lowered)) {
    return 'That password is too common. Please choose a stronger one.'
  }
  const cleanName = String(name || '').trim().toLowerCase()
  if (cleanName && cleanName.length >= 4 && lowered === cleanName) {
    return 'Password cannot be the same as your name'
  }
  const local = String(email || '').split('@')[0].toLowerCase()
  if (local && local.length >= 4 && lowered === local) {
    return 'Password cannot be the same as your email'
  }
  return ''
}

function mapSignupError(message) {
  const m = String(message || '').trim()
  if (!m) return 'Sign up failed. Try again.'
  const raw = m.toLowerCase()
  if (raw.includes('too many attempts')) {
    return 'Too many attempts. Please try again later.'
  }
  if (raw.includes('user already exists') || raw.includes('already exists')) {
    return 'An account with this email already exists'
  }
  return m
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

    const emailErr = localValidateEmail(cleanEmail)
    if (emailErr) {
      setError(emailErr)
      return
    }

    const passwordErr = localValidatePassword(password, {
      name: cleanName,
      email: cleanEmail,
    })
    if (passwordErr) {
      setError(passwordErr)
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
        if (res.status === 429) {
          setError('Too many attempts. Please try again later.')
          return
        }
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
                maxLength={128}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ? 'signup-error signup-password-hint' : 'signup-password-hint'
                }
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
            <p className="auth-hint" id="signup-password-hint">
              At least 8 characters, with letters and numbers.
            </p>

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
                maxLength={128}
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
