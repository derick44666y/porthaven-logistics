import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let n = ''
  for (let i = 0; i < 8; i++) n += chars[Math.floor(Math.random() * chars.length)]
  return `TRK${n}`
}

// GET /shipments/:trackingNumber — public
router.get('/:trackingNumber', async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params
    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber: trackingNumber.toUpperCase() },
      include: {
        events: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })

    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    res.json({ shipment })
  } catch (err) {
    console.error('Get shipment error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /shipments — protected (customer sees own, admin sees all)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user!
    let shipments

    if (user.role === 'ADMIN') {
      shipments = await prisma.shipment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          events: {
            orderBy: { timestamp: 'asc' },
            take: 1,
          },
        },
      })
    } else {
      shipments = await prisma.shipment.findMany({
        where: { customerId: user.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          events: {
            orderBy: { timestamp: 'asc' },
            take: 1,
          },
        },
      })
    }

    res.json({ shipments })
  } catch (err) {
    console.error('Get shipments error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /shipments — admin only
router.post('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { senderName, receiverName, origin, destination, mode, customerId, estimatedDelivery } = req.body

    if (!senderName || !receiverName || !origin || !destination || !mode || !estimatedDelivery) {
      res.status(400).json({ error: 'Missing required fields: senderName, receiverName, origin, destination, mode, estimatedDelivery' })
      return
    }

    if (!['AIR', 'SEA'].includes(mode)) {
      res.status(400).json({ error: 'Mode must be AIR or SEA' })
      return
    }

    let trackingNumber = ''
    let exists = true
    while (exists) {
      trackingNumber = generateTrackingNumber()
      const existing = await prisma.shipment.findUnique({ where: { trackingNumber } })
      exists = !!existing
    }

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        senderName,
        receiverName,
        origin,
        destination,
        mode,
        customerId: customerId || null,
        estimatedDelivery: new Date(estimatedDelivery),
        status: 'ORDER_CREATED',
      },
    })

    // Auto-create first tracking event
    await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: 'ORDER_CREATED',
        location: origin,
        note: 'Shipment created and registered in system.',
        timestamp: new Date(),
      },
    })

    res.status(201).json({ shipment })
  } catch (err) {
    console.error('Create shipment error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /shipments/:id/events — admin only
router.post('/:id/events', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, location, note, timestamp } = req.body

    if (!status || !location) {
      res.status(400).json({ error: 'Status and location are required' })
      return
    }

    const shipment = await prisma.shipment.findUnique({ where: { id } })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    const event = await prisma.trackingEvent.create({
      data: {
        shipmentId: id,
        status,
        location,
        note: note || '',
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    // Update shipment status
    await prisma.shipment.update({
      where: { id },
      data: { status },
    })

    res.status(201).json({ event })
  } catch (err) {
    console.error('Add event error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /shipments/:id/link — customer can link shipment to their account
router.put('/:id/link', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = req.user!

    const shipment = await prisma.shipment.findUnique({ where: { id } })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    if (shipment.customerId) {
      if (shipment.customerId === user.userId) {
        res.status(400).json({ error: 'Shipment is already linked to your account' })
      } else {
        res.status(403).json({ error: 'Shipment is already linked to another account' })
      }
      return
    }

    const updated = await prisma.shipment.update({
      where: { id },
      data: { customerId: user.userId },
    })

    res.json({ shipment: updated })
  } catch (err) {
    console.error('Link shipment error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /shipments/:id — admin only
router.put('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { senderName, receiverName, origin, destination, mode, estimatedDelivery } = req.body

    const shipment = await prisma.shipment.findUnique({ where: { id } })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    const updated = await prisma.shipment.update({
      where: { id },
      data: {
        ...(senderName && { senderName }),
        ...(receiverName && { receiverName }),
        ...(origin && { origin }),
        ...(destination && { destination }),
        ...(mode && { mode }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
      },
    })

    res.json({ shipment: updated })
  } catch (err) {
    console.error('Update shipment error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /shipments/:id — admin only
router.delete('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const shipment = await prisma.shipment.findUnique({ where: { id } })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    await prisma.shipment.delete({ where: { id } })

    res.json({ message: 'Shipment deleted successfully' })
  } catch (err) {
    console.error('Delete shipment error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router