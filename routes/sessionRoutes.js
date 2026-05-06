import express from 'express'
import {
  createSession,
  deleteSession,
  getSessionById,
  getSessions,
  updateSession,
} from '../controllers/sessionController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { uploadSessionImage } from '../middleware/uploadSessionImage.js'

const router = express.Router()

router.use(authMiddleware)

router.route('/').get(getSessions).post(uploadSessionImage, createSession)
router
  .route('/:id')
  .get(getSessionById)
  .put(uploadSessionImage, updateSession)
  .delete(deleteSession)

export default router
