import { Link } from 'react-router-dom'
import { Brain, Leaf, LineChart } from 'lucide-react'

const WHY_MATTERS = [
  {
    icon: Leaf,
    title: 'Track what actually works',
    description: 'Capture product type, timing, mood shifts, effects, and notes in one calm flow.',
  },
  {
    icon: LineChart,
    title: 'Spot patterns over time',
    description: 'Review trends across sessions so you can see what consistently supports your goals.',
  },
  {
    icon: Brain,
    title: 'Build better routines',
    description: 'Turn personal session history into practical choices for your next session.',
  },
]

const STEPS = [
  {
    number: '1',
    title: 'Prep your session',
    description: 'Use the guided prep flow to settle in, check essentials, and set intention.',
  },
  {
    number: '2',
    title: 'Log details quickly',
    description: 'Capture product, mood before/after, effects, and notes in a clean tracker.',
  },
  {
    number: '3',
    title: 'Review patterns over time',
    description: 'See trends and recommendations so your routine improves session by session.',
  },
]

function Landing() {
  return (
    <section className="mkt-landing section">
      <div className="container">
        <header className="mkt-header">
          <img
            src="/brand/sesh-logo-navbar.png"
            alt="Sesh Tracker"
            className="mkt-brand-logo"
          />
          <div className="mkt-header-actions">
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Create Account
            </Link>
          </div>
        </header>

        <div className="mkt-hero">
          <div className="mkt-hero-copy">
            <img
              src="/brand/sesh-logo-full.png"
              alt="Sesh Tracker"
              className="mkt-hero-logo"
            />
            <p className="mkt-eyebrow">Private wellness tracking for mindful sessions</p>
            <h1>Know your sessions. Understand your patterns.</h1>
            <p>
              A calm, private journal for tracking cannabis use, mood shifts, effects,
              and what works best for you.
            </p>
            <div className="button-row">
              <Link to="/signup" className="btn btn-primary">
                Start Tracking
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>

          <aside className="mkt-preview" aria-label="Product preview">
            <p className="mkt-preview-kicker">Product Preview</p>
            <h2>Today&apos;s Session</h2>
            <div className="mkt-preview-panel">
              <p className="mkt-preview-title">Session Prep</p>
              <ul className="mkt-checklist">
                <li>✓ Grab water</li>
                <li>✓ Set intention</li>
                <li>✓ Choose a calm environment</li>
              </ul>
              <div className="mkt-metrics">
                <p>
                  <strong>Mood before</strong>
                  <span>4 / 10</span>
                </p>
                <p>
                  <strong>Mood after</strong>
                  <span>8 / 10</span>
                </p>
                <p>
                  <strong>Rating</strong>
                  <span>4.5 / 5</span>
                </p>
              </div>
              <div className="mkt-insight">
                <p>Insight</p>
                <p>You usually feel best with low-dose evening hybrid sessions.</p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mkt-section">
          <div className="mkt-section-head">
            <h2>Why it matters</h2>
            <p>Build a clearer relationship with your routine through consistent, mindful tracking.</p>
          </div>
          <div className="mkt-benefits">
            {WHY_MATTERS.map((item) => (
              <article key={item.title} className="mkt-benefit-card">
                <item.icon className="mkt-benefit-icon" aria-hidden="true" size={20} strokeWidth={2} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mkt-section">
          <div className="mkt-section-head">
            <h2>How it works</h2>
            <p>Simple enough to use daily, powerful enough to surface meaningful insights.</p>
          </div>
          <div className="mkt-steps">
            {STEPS.map((step) => (
              <article key={step.number} className="mkt-step-card">
                <p className="mkt-step-number">{step.number}</p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mkt-cta">
          <h2>Ready to learn what works best for you?</h2>
          <p>Start your private session journal in minutes and discover your own patterns.</p>
          <div className="button-row">
            <Link to="/signup" className="btn btn-primary">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </section>
      </div>
    </section>
  )
}

export default Landing
