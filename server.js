import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from "./routes/authRoutes.js"
import sessionRoutes from './routes/sessionRoutes.js'

dotenv.config()

if (!process.env.JWT_SECRET) {
  console.warn(
    '[sesh-tracker] JWT_SECRET is missing. Auth (register/login) will error until you set JWT_SECRET in .env',
  )
}

connectDB()

const app = express()

app.use(cors())
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
