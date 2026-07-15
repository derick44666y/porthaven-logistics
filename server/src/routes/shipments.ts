import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { parseBody } from '../utils/validation.js'
import { sendStatusUpdateEmail } from '../utils/email.js'

const router = Router()
const prisma = new PrismaClient()

const modeSchema = z.enum(['AIR', 'SEA'])
const statusSchema = z.enum([
  'ORDER_CREATED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED_AT_FACILITY',
  'CUSTOMS_CLEARANCE',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
])

const trimmedText = z.string().trim().min(1).max(160)
const optionalTrimmedText = z.string().trim().min(1).max(160).optional()
const dateInput = z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), 'Invalid date')

const createShipmentSchema = z.object({
  senderName: trimmedText,
  receiverName: trimmedText,
  origin: trimmedText,
  destination: trimmedText,
  mode: modeSchema,
  customerId: z.string().trim().min(1).max(128).optional().nullable(),
  estimatedDelivery: dateInput,
})

const updateShipmentSchema = z.object({
  senderName: optionalTrimmedText,
  receiverName: optionalTrimmedText,
  origin: optionalTrimmedText,
  destination: optionalTrimmedText,
  mode: modeSchema.optional(),
  estimatedDelivery: dateInput.optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required')

const createEventSchema = z.object({
  status: statusSchema,
  location: trimmedText,
  note: z.string().trim().max(500).optional(),
  timestamp: dateInput.optional(),
})

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
    const body = parseBody(createShipmentSchema, req.body, res)
    if (!body) return

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
        senderName: body.senderName,
        receiverName: body.receiverName,
        origin: body.origin,
        destination: body.destination,
        mode: body.mode,
        customerId: body.customerId || null,
        estimatedDelivery: body.estimatedDelivery,
        status: 'ORDER_CREATED',
      },
    })

    // Auto-create first tracking event
    await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: 'ORDER_CREATED',
        location: body.origin,
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
    const body = parseBody(createEventSchema, req.body, res)
    if (!body) return

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { customer: true },
    })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    const statusChanged = shipment.status !== body.status

    const event = await prisma.trackingEvent.create({
      data: {
        shipmentId: id,
        status: body.status,
        location: body.location,
        note: body.note || '',
        timestamp: body.timestamp || new Date(),
      },
    })

    // Update shipment status
    await prisma.shipment.update({
      where: { id },
      data: { status: body.status },
    })

    // Notify linked customer when status actually changes
    if (statusChanged && shipment.customer?.email) {
      const emailResult = await sendStatusUpdateEmail({
        to: shipment.customer.email,
        customerName: shipment.customer.name,
        trackingNumber: shipment.trackingNumber,
        status: body.status,
        location: body.location,
        note: body.note || '',
      })
      if (!emailResult.ok) {
        console.warn(`Status email failed for ${shipment.trackingNumber}: ${emailResult.error}`)
      }
    }

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
    const body = parseBody(updateShipmentSchema, req.body, res)
    if (!body) return

    const shipment = await prisma.shipment.findUnique({ where: { id } })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    const updated = await prisma.shipment.update({
      where: { id },
      data: {
        ...(body.senderName && { senderName: body.senderName }),
        ...(body.receiverName && { receiverName: body.receiverName }),
        ...(body.origin && { origin: body.origin }),
        ...(body.destination && { destination: body.destination }),
        ...(body.mode && { mode: body.mode }),
        ...(body.estimatedDelivery && { estimatedDelivery: body.estimatedDelivery }),
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
