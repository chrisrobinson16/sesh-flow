import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from "./routes/authRoutes.js"
import sessionRoutes from './routes/sessionRoutes.js'

dotenv.config({ override: true })

if (!process.env.JWT_SECRET) {
  console.warn(
    '[sesh-tracker] JWT_SECRET is missing. Auth (register/login) will error until you set JWT_SECRET in .env',
  )
}

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    '[sesh-tracker] Cloudinary env vars are missing. Session image upload will fail until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env',
  )
}

connectDB()

const app = express()

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 5173)
const corsOrigins = new Set([
  `http://localhost:${FRONTEND_PORT}`,
  `http://127.0.0.1:${FRONTEND_PORT}`,
])

// Optional custom CORS origins, comma-separated.
// Example for iPhone testing: FRONTEND_ORIGINS=http://192.168.1.42:5173
for (const value of String(process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)) {
  corsOrigins.add(value)
}

const isLanFrontendOrigin = (origin) =>
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin) ||
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(origin) ||
  /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)

app.use(
  cors({
    origin(origin, callback) {
      // Allow tools/curl without Origin header.
      if (!origin) {
        callback(null, true)
        return
      }
      if (corsOrigins.has(origin) || isLanFrontendOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API running')
})

app.use("/api/auth", authRoutes)
app.use('/api/sessions', sessionRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  })
})

const PORT = process.env.PORT || 5001
const HOST = process.env.HOST || '0.0.0.0'

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})
