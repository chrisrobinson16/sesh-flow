import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  noteFieldsFromSession,
  clampMood,
  clampRating,
  mergeOptionList,
  normalizeToAllowed,
  effectsFromSession,
  effectPillOptions,
} from '../lib/sessionForm.js'

function EditSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saveMessage, setSaveMessage] = useState('')
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('Flower')
  const [strainType, setStrainType] = useState('Hybrid')
  const [amount, setAmount] = useState('')
  const [moodBefore, setMoodBefore] = useState(5)
  const [moodAfter, setMoodAfter] = useState(5)
  const [rating, setRating] = useState(3)
  const [effects, setEffects] = useState(() => new Set())

  const [noteSetting, setNoteSetting] = useState('')
  const [noteHit, setNoteHit] = useState('')
  const [noteRemember, setNoteRemember] = useState('')
  const [noteExtra, setNoteExtra] = useState('')
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [sessionImageFile, setSessionImageFile] = useState(null)
  const [sessionImagePreview, setSessionImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const productOptions = useMemo(
    () => mergeOptionList(PRODUCT_TYPES, productType),
    [productType],
  )
  const strainOptions = useMemo(
    () => mergeOptionList(STRAIN_TYPES, strainType),
    [strainType],
  )
  const pillOptions = useMemo(() => effectPillOptions(effects), [effects])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const { response, data, unauthorized } = await apiFetch(
          `${API_BASE}/${id}`,
          {},
          navigate,
        )
        if (unauthorized) return
        if (response.status === 404) {
          setLoadError('notfound')
          return
        }
        if (!response.ok) {
          setLoadError(data.message || 'Failed to load session')
          return
        }
        setProductName(data.productName ?? '')
        setProductType(
          normalizeToAllowed(data.productType, PRODUCT_TYPES, 'Flower'),
        )
        setStrainType(normalizeToAllowed(data.strainType, STRAIN_TYPES, 'Hybrid'))
        setAmount(data.amount != null ? String(data.amount) : '')
        setMoodBefore(clampMood(data.moodBefore))
        setMoodAfter(clampMood(data.moodAfter))
        setRating(clampRating(data.rating))
        setEffects(effectsFromSession(data.effects))
        const parsed = noteFieldsFromSession(data)
        setNoteSetting(parsed.setting)
        setNoteHit(parsed.hit)
        setNoteRemember(parsed.remember)
        setNoteExtra(parsed.extra)
        setCurrentImageUrl(data.imageUrl || '')
        setSessionImageFile(null)
        setSessionImagePreview('')
      } catch (e) {
        console.error(e)
        setLoadError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, navigate])

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

  const handleRemoveImageSelection = () => {
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
    if (amount.trim()) formData.append('amount', amount.trim())
    formData.append('moodBefore', String(moodBefore))
    formData.append('moodAfter', String(moodAfter))
    formData.append('effects', JSON.stringify(Array.from(effects)))
    formData.append('rating', String(Number(rating)))
    formData.append('sessionNotes', JSON.stringify(sessionNotes))
    if (sessionImageFile) {
      formData.append('sessionImage', sessionImageFile)
    }

    try {
      const { response, data, unauthorized } = await apiFetch(
        `${API_BASE}/${id}`,
        {
          method: 'PUT',
          body: formData,
        },
        navigate,
      )
      if (unauthorized) return
      if (!response.ok) {
        setSaveMessage(data.message || 'Could not update session.')
        return
      }
      navigate(`/sessions/${id}`, {
        state: { saveMessage: 'Session updated.' },
      })
    } catch (e) {
      console.error(e)
      setSaveMessage('Could not update session.')
    }
  }

  if (loading) {
    return (
      <section className="container section">
        <p className="empty-state">Loading session…</p>
      </section>
    )
  }

  if (loadError === 'notfound') {
    return (
      <section className="container section">
        <h1>Session not found</h1>
        <Link to="/sessions" className="text-link">
          Back to history
        </Link>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="container section">
        <p className="empty-state">{loadError}</p>
        <Link to="/sessions" className="text-link">
          Back to history
        </Link>
      </section>
    )
  }

  return (
    <section className="container section">
      <div className="form-wrapper form-wrapper-enhanced">
        <h1>Edit session</h1>
        <p className="page-subtitle">
          Update anything you logged before — same quick chips and note prompts as new
          sessions.
        </p>
        <form onSubmit={handleSubmit} className="form-grid form-grid-enhanced">
          <div className="form-field">
            <label htmlFor="edit-productName">Product name</label>
            <input
              id="edit-productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <ChipGroup
            label="Product type"
            fieldId="edit-product-type"
            options={productOptions}
            value={productType}
            onChange={setProductType}
          />

          <ChipGroup
            label="Strain type"
            fieldId="edit-strain-type"
            options={strainOptions}
            value={strainType}
            onChange={setStrainType}
          />

          <div className="form-field">
            <label htmlFor="edit-amount">Amount (optional)</label>
            <input
              id="edit-amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 0.5g, one gummy"
            />
          </div>

          <MoodStepper
            label="Mood before"
            fieldId="edit-mood-before"
            value={moodBefore}
            onChange={setMoodBefore}
          />

          <MoodStepper
            label="Mood after"
            fieldId="edit-mood-after"
            value={moodAfter}
            onChange={setMoodAfter}
          />

          <RatingChips value={rating} onChange={setRating} />

          <EffectPills
            selected={effects}
            onToggle={toggleEffect}
            optionList={pillOptions}
          />

          <fieldset className="notes-fieldset">
            <legend className="form-field-label">Session notes</legend>
            <p className="form-field-hint block">
              Structured lines are rebuilt on save; free text stays at the bottom.
            </p>
            <label htmlFor="edit-note-setting" className="notes-mini-label">
              Where / setting?
            </label>
            <input
              id="edit-note-setting"
              type="text"
              value={noteSetting}
              onChange={(e) => setNoteSetting(e.target.value)}
            />
            <label htmlFor="edit-note-hit" className="notes-mini-label">
              How did it hit?
            </label>
            <input
              id="edit-note-hit"
              type="text"
              value={noteHit}
              onChange={(e) => setNoteHit(e.target.value)}
            />
            <label htmlFor="edit-note-remember" className="notes-mini-label">
              Remember for next time?
            </label>
            <input
              id="edit-note-remember"
              type="text"
              value={noteRemember}
              onChange={(e) => setNoteRemember(e.target.value)}
            />
            <label htmlFor="edit-note-extra" className="notes-mini-label">
              Anything else (optional)
            </label>
            <textarea
              id="edit-note-extra"
              rows={3}
              value={noteExtra}
              onChange={(e) => setNoteExtra(e.target.value)}
            />
          </fieldset>

          <div className="form-field">
            <label htmlFor="edit-session-image">Session image (optional)</label>
            <input
              ref={fileInputRef}
              id="edit-session-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="session-upload-input"
            />
            {sessionImagePreview && sessionImageFile ? (
              <div className="session-upload-preview-wrap">
                <img
                  src={sessionImagePreview}
                  alt="New session image preview"
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
                      onClick={handleRemoveImageSelection}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : currentImageUrl ? (
              <div className="session-upload-preview-wrap">
                <img
                  src={currentImageUrl}
                  alt="Current session"
                  className="session-image-preview"
                />
                <div className="session-upload-file-row">
                  <p className="session-upload-file-name">
                    <ImagePlus size={14} />
                    Current image
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
                  </div>
                </div>
              </div>
            ) : (
              <label htmlFor="edit-session-image" className="session-upload-card">
                <UploadCloud size={20} />
                <p className="session-upload-title">Tap to upload a session photo</p>
                <p className="session-upload-subtitle">Jars, flower, setup, vibe, etc.</p>
              </label>
            )}
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
            <Link to={`/sessions/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
        {saveMessage && <p className="status-message">{saveMessage}</p>}
      </div>
    </section>
  )
}

export default EditSession
