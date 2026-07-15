import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { parseBody } from '../utils/validation.js'

const router = Router()
const prisma = new PrismaClient()

const createCustomerSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(256),
  name: z.string().trim().min(1).max(100),
})

router.use(authMiddleware, adminMiddleware)

// POST /admin/users — create a customer account
router.post('/users', async (req: Request, res: Response) => {
  try {
    const body = parseBody(createCustomerSchema, req.body, res)
    if (!body) return

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) {
      res.status(409).json({ error: 'A user with this email already exists' })
      return
    }

    const passwordHash = await bcrypt.hash(body.password, 10)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        role: 'CUSTOMER',
      },
    })

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      credentials: {
        email: body.email,
        password: body.password,
      },
    })
  } catch (err) {
    console.error('Create customer error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
