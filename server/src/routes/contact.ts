import { Router, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { parseBody } from '../utils/validation.js'
import { sendContactFormEmail } from '../utils/email.js'

const router = Router()

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' },
})

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().toLowerCase(),
  message: z.string().trim().min(10).max(2000),
})

// POST /contact — public contact form
router.post('/', contactLimiter, async (req: Request, res: Response) => {
  try {
    const body = parseBody(contactSchema, req.body, res)
    if (!body) return

    const result = await sendContactFormEmail(body)
    if (!result.ok) {
      res.status(503).json({ error: result.error || 'Unable to send message right now' })
      return
    }

    res.json({ message: 'Message sent successfully' })
  } catch (err) {
    console.error('Contact form error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
