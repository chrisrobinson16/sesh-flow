import rateLimit from 'express-rate-limit'

const rateMessage = { message: 'Too many attempts. Please try again later.' }

/** Stricter limit for auth endpoints (per IP). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateMessage,
})

/** Moderate limit for creating sessions (per IP). */
export const sessionCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateMessage,
})
