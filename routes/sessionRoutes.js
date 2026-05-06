import express from 'express'
import {
  createSession,
  deleteSession,
  getSessionById,
  getSessions,
  updateSession,
} from '../controllers/sessionController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.route('/').get(getSessions).post(createSession)
router.route('/:id').get(getSessionById).put(updateSession).delete(deleteSession)

export default router
