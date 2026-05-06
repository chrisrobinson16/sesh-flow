import { API_ROUTES } from './apiConfig'

export const PRODUCT_TYPES = [
  'Flower',
  'Vape',
  'Edible',
  'Tincture',
  'Concentrate',
  'Pre-roll',
]

export const STRAIN_TYPES = ['Hybrid', 'Indica', 'Sativa', 'CBD Blend']

export const RATINGS = [1, 2, 3, 4, 5]

export const MOOD_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const EFFECT_OPTIONS = [
  'Relaxed',
  'Happy',
  'Focused',
  'Sleepy',
  'Creative',
  'Energetic',
]

export const API_BASE = API_ROUTES.sessions

export function buildNotes(setting, hit, remember, extra) {
  const parts = []
  const s = setting?.trim()
  const h = hit?.trim()
  const r = remember?.trim()
  const x = extra?.trim()
  if (s) parts.push(`Setting: ${s}`)
  if (h) parts.push(`How it hit: ${h}`)
  if (r) parts.push(`Next time: ${r}`)
  if (x) parts.push(x)
  return parts.join('\n\n')
}

/** Reverse structured notes from `buildNotes` for edit form; remainder → extra. */
/** Build API payload — only keys with non-empty trimmed text are included. */
export function buildSessionNotesPayload(setting, hit, remember, extra) {
  const s = String(setting ?? '').trim()
  const exp = String(hit ?? '').trim()
  const rem = String(remember ?? '').trim()
  const add = String(extra ?? '').trim()
  const o = {}
  if (s) o.setting = s
  if (exp) o.experience = exp
  if (rem) o.reminder = rem
  if (add) o.additional = add
  return o
}

/** Load form fields from API: prefer sessionNotes when any field has text, else legacy `notes`. */
export function noteFieldsFromSession(data) {
  const sn = data?.sessionNotes
  const hasStructured =
    sn &&
    typeof sn === 'object' &&
    [sn.setting, sn.experience, sn.reminder, sn.additional].some(
      (v) => v != null && String(v).trim() !== '',
    )
  if (hasStructured) {
    return {
      setting: String(sn.setting ?? '').trim(),
      hit: String(sn.experience ?? '').trim(),
      remember: String(sn.reminder ?? '').trim(),
      extra: String(sn.additional ?? '').trim(),
    }
  }
  return splitNotes(String(data?.notes ?? ''))
}

/**
 * Rows for SessionDetail — only sections with body text.
 * Legacy: parses old buildNotes-format strings via splitNotes; else one "Notes" block.
 */
export function getStructuredNoteSectionsForDisplay(session) {
  const sections = []

  const sn = session?.sessionNotes
  if (
    sn &&
    typeof sn === 'object' &&
    [
      sn.setting,
      sn.experience,
      sn.reminder,
      sn.additional,
    ].some((v) => v != null && String(v).trim() !== '')
  ) {
    const add = (label, val) => {
      const t = String(val ?? '').trim()
      if (t) sections.push({ label, body: t })
    }
    add('Setting', sn.setting)
    add('How it hit', sn.experience)
    add('Remember for next time', sn.reminder)
    add('Additional notes', sn.additional)
    return sections
  }

  const parsed = splitNotes(String(session?.notes ?? ''))
  if (parsed.setting) sections.push({ label: 'Setting', body: parsed.setting })
  if (parsed.hit) sections.push({ label: 'How it hit', body: parsed.hit })
  if (parsed.remember) {
    sections.push({ label: 'Remember for next time', body: parsed.remember })
  }
  if (parsed.extra) sections.push({ label: 'Additional notes', body: parsed.extra })

  if (sections.length) return sections

  const raw = session?.notes
  if (raw != null && String(raw).trim() !== '') {
    return [{ label: 'Notes', body: String(raw).trim() }]
  }

  return []
}

export function splitNotes(raw) {
  let setting = ''
  let hit = ''
  let remember = ''
  const extraParts = []
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return { setting, hit, remember, extra: '' }
  }
  const blocks = raw
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean)
  for (const block of blocks) {
    if (block.startsWith('Setting:')) {
      setting = block.replace(/^Setting:\s*/i, '').trim()
    } else if (block.startsWith('How it hit:')) {
      hit = block.replace(/^How it hit:\s*/i, '').trim()
    } else if (block.startsWith('Next time:')) {
      remember = block.replace(/^Next time:\s*/i, '').trim()
    } else {
      extraParts.push(block)
    }
  }
  return {
    setting,
    hit,
    remember,
    extra: extraParts.join('\n\n'),
  }
}

export function clampMood(value) {
  const x = Number(value)
  if (!Number.isFinite(x)) return 5
  return Math.min(10, Math.max(1, Math.round(x)))
}

export function clampRating(value) {
  const x = Number(value)
  if (!Number.isFinite(x)) return 3
  return Math.min(5, Math.max(1, Math.round(x)))
}

export function mergeOptionList(allowed, current) {
  if (current == null || String(current).trim() === '') return allowed
  const c = String(current).trim()
  const hit = allowed.find((a) => a.toLowerCase() === c.toLowerCase())
  if (hit) return allowed
  return [...allowed, c]
}

/** Match API value to canonical chip label when casing differs. */
export function normalizeToAllowed(value, allowed, fallback) {
  if (value == null || String(value).trim() === '') return fallback
  const v = String(value).trim()
  const hit = allowed.find((a) => a.toLowerCase() === v.toLowerCase())
  return hit || v
}

/** Map stored effect strings onto canonical pill labels when possible. */
export function effectsFromSession(rawEffects) {
  const set = new Set()
  const list = Array.isArray(rawEffects) ? rawEffects : []
  for (const e of list) {
    if (e == null || String(e).trim() === '') continue
    const s = String(e).trim()
    const match = EFFECT_OPTIONS.find(
      (opt) => opt.toLowerCase() === s.toLowerCase(),
    )
    set.add(match || s)
  }
  return set
}

export function effectPillOptions(selectedSet) {
  const extra = [...selectedSet].filter((e) => !EFFECT_OPTIONS.includes(e))
  return [...new Set([...EFFECT_OPTIONS, ...extra])]
}
