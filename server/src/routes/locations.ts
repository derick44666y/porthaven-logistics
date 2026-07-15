import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /locations?search=lon&limit=20 — public, used by admin location autocomplete
router.get('/', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    const limitRaw = parseInt(typeof req.query.limit === 'string' ? req.query.limit : '20', 10)
    const limit = Math.min(Math.max(isNaN(limitRaw) ? 20 : limitRaw, 1), 50)

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { country: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const locations = await prisma.location.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
    })

    res.json({ locations })
  } catch (err) {
    console.error('Get locations error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router