import mongoose from 'mongoose'
import { getCloudinary } from '../config/cloudinary.js'
import Session from '../models/Session.js'

const stripUserFromBody = (body) => {
  if (!body || typeof body !== 'object') return {}
  const { user: _ignored, ...rest } = body
  return rest
}

const parseMaybeJson = (value, fallback) => {
  if (value == null) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const normalizeSessionPayload = (rawBody) => {
  const body = stripUserFromBody(rawBody)

  // Multipart form fields arrive as strings; keep compatibility with JSON requests.
  const normalized = {
    ...body,
  }

  if (body.effects != null) {
    const parsedEffects = parseMaybeJson(body.effects, body.effects)
    normalized.effects = Array.isArray(parsedEffects)
      ? parsedEffects
      : String(parsedEffects || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
  }

  if (body.sessionNotes != null) {
    const parsedNotes = parseMaybeJson(body.sessionNotes, {})
    normalized.sessionNotes =
      parsedNotes && typeof parsedNotes === 'object' ? parsedNotes : {}
  }

  return normalized
}

const uploadBufferToCloudinary = (buffer, folder = 'sesh-tracker/sessions') =>
  new Promise((resolve, reject) => {
    const cloudinary = getCloudinary()
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        resolve(result)
      },
    )
    stream.end(buffer)
  })

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return
  try {
    const cloudinary = getCloudinary()
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    // Non-fatal for UX; log and continue.
    console.warn('[sesh-tracker] Failed to remove Cloudinary image:', error.message)
  }
}

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json(sessions)
  } catch (error) {
    next(error)
  }
}

export const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid session id' })
    }

    const session = await Session.findOne({ _id: id, user: req.user._id })

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    res.status(200).json(session)
  } catch (error) {
    next(error)
  }
}

export const createSession = async (req, res, next) => {
  try {
    const data = normalizeSessionPayload(req.body)

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer)
      data.imageUrl = uploaded.secure_url
      data.imagePublicId = uploaded.public_id
    }

    const session = await Session.create({
      ...data,
      user: req.user._id,
    })

    res.status(201).json(session)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }

    next(error)
  }
}

export const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid session id' })
    }

    const updates = normalizeSessionPayload(req.body)
    const existing = await Session.findOne({ _id: id, user: req.user._id })

    if (!existing) {
      return res.status(404).json({ message: 'Session not found' })
    }

    if (req.file) {
      await deleteCloudinaryImage(existing.imagePublicId)
      const uploaded = await uploadBufferToCloudinary(req.file.buffer)
      updates.imageUrl = uploaded.secure_url
      updates.imagePublicId = uploaded.public_id
    }

    const session = await Session.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    )

    res.status(200).json(session)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }

    next(error)
  }
}

export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid session id' })
    }

    const session = await Session.findOne({ _id: id, user: req.user._id })

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    await deleteCloudinaryImage(session.imagePublicId)
    await Session.deleteOne({ _id: session._id })

    res.status(200).json({ message: 'Session removed' })
  } catch (error) {
    next(error)
  }
}
