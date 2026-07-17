import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.js'
import shipmentRoutes from './routes/shipments.js'
import locationRoutes from './routes/locations.js'
import adminRoutes from './routes/admin.js'
import contactRoutes from './routes/contact.js'
import { logEmailConfigStatus, isEmailConfigured, getEmailConfigFlags } from './utils/email.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

app.set('trust proxy', 1)

// Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
)

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
app.use('/api/admin', adminRoutes)
app.use('/api/contact', contactRoutes)

// Health check
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    dbStatus = 'error'
    console.error('Database health check failed:', error)
  }

  res.json({
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString(),
    email: getEmailConfigFlags(),
  })
})

// 404 fallback for unmatched API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler (must be registered last)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err)
  if (res.headersSent) return
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Porthaven server running on http://localhost:${PORT}`)
  console.log(`CORS allowed origins: ${ALLOWED_ORIGINS.join(', ') || '(none)'}`)
  logEmailConfigStatus()
})
