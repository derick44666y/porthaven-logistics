import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { buildInvoice } from '../utils/invoice.js'
import { renderInvoicePdf } from '../utils/pdf.js'

const router = Router()
const prisma = new PrismaClient()

// GET /invoice/:id — admin only — returns a PDF invoice for the shipment
router.get('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { customer: true },
    })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    const inv = buildInvoice(shipment, shipment.customer)
    const filename = `invoice-${inv.invoiceNumber}.pdf`

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    doc.pipe(res)
    renderInvoicePdf(doc, inv)
    doc.end()
  } catch (err) {
    console.error('Invoice generation error:', err)
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' })
  }
})

export default router