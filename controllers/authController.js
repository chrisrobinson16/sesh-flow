import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {
  validateLoginEmail,
  validateRegistrationEmail,
  validateRegistrationPassword,
} from '../lib/authValidation.js'

const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set on the server. Add it to your .env file.')
  }
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

const GENERIC_LOGIN_ERROR = 'Invalid email or password'

export const registerUser = async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    const password = req.body?.password

    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    const emailCheck = validateRegistrationEmail(req.body?.email)
    if (!emailCheck.ok) {
      return res.status(400).json({ message: emailCheck.message })
    }
    const emailRaw = emailCheck.value

    const passwordCheck = validateRegistrationPassword(password, {
      name,
      email: emailRaw,
    })
    if (!passwordCheck.ok) {
      return res.status(400).json({ message: passwordCheck.message })
    }

    const existing = await User.findOne({ email: emailRaw })
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(String(password), salt)

    const user = await User.create({
      name,
      email: emailRaw,
      password: hashedPassword,
    })

    const token = signToken(user._id)

    res.status(201).json({
      user: user.toJSON(),
      token,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }
    next(error)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const password = req.body?.password
    const emailCheck = validateLoginEmail(req.body?.email)

    if (!emailCheck.ok || password == null || String(password).trim() === '') {
      return res.status(401).json({ message: GENERIC_LOGIN_ERROR })
    }
    const emailRaw = emailCheck.value

    const user = await User.findOne({ email: emailRaw }).select('+password')

    if (!user) {
      return res.status(401).json({ message: GENERIC_LOGIN_ERROR })
    }

    const isMatch = await bcrypt.compare(String(password), user.password)

    if (!isMatch) {
      return res.status(401).json({ message: GENERIC_LOGIN_ERROR })
    }

    const token = signToken(user._id)

    user.password = undefined

    res.status(200).json({
      user: user.toJSON(),
      token,
    })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    next(error)
  }
}
