import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChipGroup,
  EffectPills,
  MoodStepper,
  RatingChips,
} from '../components/SessionFormControls.jsx'
import { apiFetch } from '../lib/apiFetch'
import {
  PRODUCT_TYPES,
  STRAIN_TYPES,
  API_BASE,
  buildSessionNotesPayload,
} from '../lib/sessionForm.js'

function NewSession() {
  const navigate = useNavigate()
  const [saveMessage, setSaveMessage] = useState('')

  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('Flower')
  const [strainType, setStrainType] = useState('Hybrid')
  const [moodBefore, setMoodBefore] = useState(5)
  const [moodAfter, setMoodAfter] = useState(5)
  const [rating, setRating] = useState(3)
  const [effects, setEffects] = useState(() => new Set())

  const [noteSetting, setNoteSetting] = useState('')
  const [noteHit, setNoteHit] = useState('')
  const [noteRemember, setNoteRemember] = useState('')
  const [noteExtra, setNoteExtra] = useState('')

  const toggleEffect = (effect) => {
    setEffects((prev) => {
      const next = new Set(prev)
      if (next.has(effect)) next.delete(effect)
      else next.add(effect)
      return next
    })
  }

  const resetForm = () => {
    setProductName('')
    setProductType('Flower')
    setStrainType('Hybrid')
    setMoodBefore(5)
    setMoodAfter(5)
    setRating(3)
    setEffects(new Set())
    setNoteSetting('')
    setNoteHit('')
    setNoteRemember('')
    setNoteExtra('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaveMessage('')

    const name = productName.trim()
    if (!name) {
      setSaveMessage('Please enter a product name.')
      return
    }

    const sessionNotes = buildSessionNotesPayload(
      noteSetting,
      noteHit,
      noteRemember,
      noteExtra,
    )

    const payload = {
      productName: name,
      productType,
      strainType,
      moodBefore: String(moodBefore),
      moodAfter: String(moodAfter),
      effects: Array.from(effects),
      rating: Number(rating),
      ...(Object.keys(sessionNotes).length > 0 && { sessionNotes }),
    }

    try {
      const { response, data, unauthorized } = await apiFetch(
        API_BASE,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        navigate,
      )
      if (unauthorized) return
      console.log('Saved to DB:', data)

      if (!response.ok) {
        setSaveMessage(data.message || 'Error saving session ❌')
        return
      }

      resetForm()
      setSaveMessage('Session saved to database ✅')
      navigate('/sessions', {
        state: { saveMessage: 'Session saved to database ✅' },
      })
    } catch (error) {
      console.error('Error saving session:', error)
      setSaveMessage('Error saving session ❌')
    }
  }

  return (
    <section className="container section">
      <div className="form-wrapper form-wrapper-enhanced">
        <h1>Log New Session</h1>
        <p className="page-subtitle">
          Capture details while the session is fresh — tap chips instead of hunting
          in dropdowns.
        </p>
        <form onSubmit={handleSubmit} className="form-grid form-grid-enhanced">
          <div className="form-field">
            <label htmlFor="productName">Product name</label>
            <input
              id="productName"
              name="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              autoComplete="off"
              placeholder="e.g. Northern Lights pre-roll"
              required
            />
          </div>

          <ChipGroup
            label="Product type"
            fieldId="product-type"
            options={PRODUCT_TYPES}
            value={productType}
            onChange={setProductType}
          />

          <ChipGroup
            label="Strain type"
            fieldId="strain-type"
            options={STRAIN_TYPES}
            value={strainType}
            onChange={setStrainType}
          />

          <MoodStepper
            label="Mood before"
            fieldId="mood-before"
            value={moodBefore}
            onChange={setMoodBefore}
          />

          <MoodStepper
            label="Mood after"
            fieldId="mood-after"
            value={moodAfter}
            onChange={setMoodAfter}
          />

          <RatingChips value={rating} onChange={setRating} />

          <EffectPills selected={effects} onToggle={toggleEffect} />

          <fieldset className="notes-fieldset">
            <legend className="form-field-label">Session notes</legend>
            <p className="form-field-hint block">
              Short prompts — everything you fill is combined into one note on save.
            </p>
            <label htmlFor="note-setting" className="notes-mini-label">
              Where / setting?
            </label>
            <input
              id="note-setting"
              type="text"
              value={noteSetting}
              onChange={(e) => setNoteSetting(e.target.value)}
              placeholder="e.g. Evening at home, walk with a friend"
            />
            <label htmlFor="note-hit" className="notes-mini-label">
              How did it hit?
            </label>
            <input
              id="note-hit"
              type="text"
              value={noteHit}
              onChange={(e) => setNoteHit(e.target.value)}
              placeholder="Onset, intensity, what you noticed"
            />
            <label htmlFor="note-remember" className="notes-mini-label">
              Remember for next time?
            </label>
            <input
              id="note-remember"
              type="text"
              value={noteRemember}
              onChange={(e) => setNoteRemember(e.target.value)}
              placeholder="Dose, timing, pairings"
            />
            <label htmlFor="note-extra" className="notes-mini-label">
              Anything else (optional)
            </label>
            <textarea
              id="note-extra"
              rows={3}
              value={noteExtra}
              onChange={(e) => setNoteExtra(e.target.value)}
              placeholder="Free-form detail — appended after the prompts above."
            />
          </fieldset>

          <button type="submit" className="btn btn-primary">
            Save session
          </button>
        </form>
        {saveMessage && <p className="status-message">{saveMessage}</p>}
      </div>
    </section>
  )
}

export default NewSession
