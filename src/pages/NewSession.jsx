import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, RefreshCw, Trash2, UploadCloud } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const [sessionImageFile, setSessionImageFile] = useState(null)
  const [sessionImagePreview, setSessionImagePreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (sessionImagePreview) {
        URL.revokeObjectURL(sessionImagePreview)
      }
    }
  }, [sessionImagePreview])

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
    setSessionImageFile(null)
    setSessionImagePreview('')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setSessionImageFile(null)
      setSessionImagePreview('')
      return
    }
    if (sessionImagePreview) {
      URL.revokeObjectURL(sessionImagePreview)
    }
    setSessionImageFile(file)
    setSessionImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    if (sessionImagePreview) {
      URL.revokeObjectURL(sessionImagePreview)
    }
    setSessionImageFile(null)
    setSessionImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
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

    const formData = new FormData()
    formData.append('productName', name)
    formData.append('productType', productType)
    formData.append('strainType', strainType)
    formData.append('moodBefore', String(moodBefore))
    formData.append('moodAfter', String(moodAfter))
    formData.append('effects', JSON.stringify(Array.from(effects)))
    formData.append('rating', String(Number(rating)))
    if (Object.keys(sessionNotes).length > 0) {
      formData.append('sessionNotes', JSON.stringify(sessionNotes))
    }
    if (sessionImageFile) {
      formData.append('sessionImage', sessionImageFile)
    }

    try {
      setIsSubmitting(true)
      const { response, data, unauthorized } = await apiFetch(
        API_BASE,
        {
          method: 'POST',
          body: formData,
        },
        navigate,
      )
      if (unauthorized) return
      console.log('Saved to DB:', data)

      if (!response.ok) {
        setSaveMessage(data.message || 'Error saving session ❌')
        setIsSubmitting(false)
        return
      }

      resetForm()
      setSaveMessage('Session saved.')
      navigate('/sessions', {
        state: { saveMessage: 'Session saved.' },
      })
    } catch (error) {
      console.error('Error saving session:', error)
      setSaveMessage('Error saving session ❌')
      setIsSubmitting(false)
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

          <div className="form-field">
            <label htmlFor="session-image">Session image (optional)</label>
            <input
              ref={fileInputRef}
              id="session-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="session-upload-input"
            />
            {sessionImagePreview && sessionImageFile ? (
              <div className="session-upload-preview-wrap">
                <img
                  src={sessionImagePreview}
                  alt="Session preview"
                  className="session-image-preview"
                />
                <div className="session-upload-file-row">
                  <p className="session-upload-file-name">
                    <ImagePlus size={14} />
                    {sessionImageFile.name}
                  </p>
                  <div className="session-upload-actions">
                    <button
                      type="button"
                      className="btn btn-secondary session-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RefreshCw size={14} />
                      Replace
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary session-upload-btn"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label htmlFor="session-image" className="session-upload-card">
                <UploadCloud size={20} />
                <p className="session-upload-title">Tap to upload a session photo</p>
                <p className="session-upload-subtitle">Jars, flower, setup, vibe, etc.</p>
              </label>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving session...' : 'Save session'}
          </button>
        </form>
        {saveMessage && <p className="status-message">{saveMessage}</p>}
      </div>
    </section>
  )
}

export default NewSession
