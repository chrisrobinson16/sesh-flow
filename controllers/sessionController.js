import mongoose from 'mongoose'
import Session from '../models/Session.js'

const stripUserFromBody = (body) => {
  if (!body || typeof body !== 'object') return {}
  const { user: _ignored, ...rest } = body
  return rest
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
    const data = stripUserFromBody(req.body)

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

    const updates = stripUserFromBody(req.body)

    const session = await Session.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    )

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

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

    const session = await Session.findOneAndDelete({ _id: id, user: req.user._id })

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    res.status(200).json({ message: 'Session removed' })
  } catch (error) {
    next(error)
  }
}
