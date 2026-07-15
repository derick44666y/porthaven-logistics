import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import shipmentRoutes from './routes/shipments.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8443'

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/shipments', shipmentRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Porthaven server running on http://localhost:${PORT}`)
  console.log(`CORS origin: ${FRONTEND_URL}`)
})