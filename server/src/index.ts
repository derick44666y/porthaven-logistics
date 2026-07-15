import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import shipmentRoutes from './routes/shipments.js'
import locationRoutes from './routes/locations.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// Allowed CORS origins (comma-separated FRONTEND_URL env, or sensible defaults)
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:8443')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

function corsOrigin(origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) {
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

// Middleware
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/locations', locationRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Porthaven server running on http://localhost:${PORT}`)
  console.log(`CORS allowed origins: ${ALLOWED_ORIGINS.join(', ') || '(none)'}`)
})
