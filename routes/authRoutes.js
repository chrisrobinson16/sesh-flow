import express from 'express'
import { getMe, loginUser, registerUser } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { authLimiter } from '../middleware/rateLimits.js'

const router = express.Router()

router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/me', authMiddleware, getMe)

export default router
