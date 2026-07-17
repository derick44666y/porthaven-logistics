import PDFDocument from 'pdfkit'
import type { InvoiceData } from './invoice.js'
import { formatCents } from './invoice.js'

/**
 * Render an invoice to a PDFKit document. The caller is responsible for
 * piping/ending the document. All monetary values are formatted from integer
 * cents so the displayed totals are exact.
 */
export function renderInvoicePdf(doc: PDFKit.PDFDocument, inv: InvoiceData): void {
  const margin = 50
  const pageWidth = doc.page.width
  const contentWidth = pageWidth - margin * 2

  // ── Header: company + INVOICE title ──────────────────────────────────────
  doc.fontSize(20).font('Helvetica-Bold').text(inv.company.name, margin, margin)
  doc.fontSize(9).font('Helvetica').fillColor('#475569')
  doc.text(inv.company.address, margin, margin + 26)
  doc.text(`Email: ${inv.company.email}`, margin, margin + 40)
  doc.text(`Phone: ${inv.company.phone}`, margin, margin + 54)
  doc.text(`Tax ID: ${inv.company.taxId}`, margin, margin + 68)
  doc.text(inv.company.website, margin, margin + 82)

  doc.fontSize(28).font('Helvetica-Bold').fillColor('#0f172a')
  doc.text('INVOICE', pageWidth - margin - 200, margin, { width: 200, align: 'right' })

  // ── Invoice meta box (right) ─────────────────────────────────────────────
  const metaX = pageWidth - margin - 200
  let metaY = margin + 38
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a')
  doc.text('Invoice Number', metaX, metaY)
  doc.font('Helvetica').fillColor('#334155')
  doc.text(inv.invoiceNumber, metaX, metaY + 14)

  metaY += 34
  doc.font('Helvetica-Bold').fillColor('#0f172a')
  doc.text('Issue Date', metaX, metaY)
  doc.font('Helvetica').fillColor('#334155')
  doc.text(inv.issueDate, metaX, metaY + 14)

  metaY += 34
  doc.font('Helvetica-Bold').fillColor('#0f172a')
  doc.text('Due Date', metaX, metaY)
  doc.font('Helvetica').fillColor('#334155')
  doc.text(inv.dueDate, metaX, metaY + 14)

  // ── Divider ──────────────────────────────────────────────────────────────
  let y = margin + 110
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#cbd5e1').lineWidth(1).stroke()
  y += 24

  // ── Bill To ──────────────────────────────────────────────────────────────
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a')
  doc.text('BILL TO', margin, y)
  doc.font('Helvetica').fillColor('#334155')
  let by = y + 16
  doc.text(inv.billTo.name, margin, by)
  by += 14
  if (inv.billTo.email) {
    doc.text(inv.billTo.email, margin, by)
    by += 14
  }
  inv.billTo.address.split('\n').forEach((line) => {
    doc.text(line, margin, by)
    by += 14
  })

  // ── Shipment summary (right) ─────────────────────────────────────────────
  const sumX = pageWidth - margin - 240
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a')
  doc.text('SHIPMENT', sumX, y)
  doc.font('Helvetica').fillColor('#334155')
  let sy = y + 16
  const shipLines: [string, string][] = [
    ['Tracking', inv.shipment.trackingNumber],
    ['Service', inv.shipment.mode],
    ['Route', `${inv.shipment.origin} → ${inv.shipment.destination}`],
    ['Receiver', inv.shipment.receiverName],
    ['Est. Delivery', inv.shipment.estimatedDelivery],
    ['Status', inv.shipment.status],
  ]
  shipLines.forEach(([k, v]) => {
    doc.font('Helvetica-Bold').fillColor('#64748b').text(`${k}: `, sumX, sy, { continued: true })
    doc.font('Helvetica').fillColor('#334155').text(v, { width: 240 })
    sy += 16
  })

  // ── Line items table ─────────────────────────────────────────────────────
  y = Math.max(by, sy) + 30
  const tableTop = y
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a')
  doc.text('DESCRIPTION', margin, tableTop)
  doc.text('DETAIL', margin + 220, tableTop)
  doc.text('AMOUNT', pageWidth - margin - 120, tableTop, { width: 120, align: 'right' })

  y = tableTop + 18
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#cbd5e1').lineWidth(1).stroke()
  y += 10

  inv.lineItems.forEach((item) => {
    doc.font('Helvetica').fillColor('#334155').fontSize(10)
    doc.text(item.description, margin, y, { width: 210 })
    doc.text(item.detail, margin + 220, y, { width: pageWidth - margin - 220 - 130 })
    doc.text(formatCents(item.amountCents, inv.currency), pageWidth - margin - 120, y, {
      width: 120,
      align: 'right',
    })
    y += 28
  })

  // ── Totals ───────────────────────────────────────────────────────────────
  y += 6
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#cbd5e1').lineWidth(1).stroke()
  y += 14

  const totalsX = pageWidth - margin - 220
  const totalsValX = pageWidth - margin - 120

  doc.font('Helvetica').fillColor('#334155').fontSize(10)
  doc.text('Subtotal', totalsX, y, { width: 200, align: 'right' })
  doc.text(formatCents(inv.subtotalCents, inv.currency), totalsValX, y, { width: 120, align: 'right' })
  y += 20

  doc.text(`Tax (${inv.taxRatePercent}%)`, totalsX, y, { width: 200, align: 'right' })
  doc.text(formatCents(inv.taxCents, inv.currency), totalsValX, y, { width: 120, align: 'right' })
  y += 24

  doc.moveTo(totalsX - 10, y - 8).lineTo(pageWidth - margin, y - 8).strokeColor('#cbd5e1').lineWidth(1).stroke()

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a')
  doc.text('TOTAL DUE', totalsX, y, { width: 200, align: 'right' })
  doc.text(formatCents(inv.totalCents, inv.currency), totalsValX, y, { width: 120, align: 'right' })

  // ── Footer / notes ───────────────────────────────────────────────────────
  y = Math.max(y + 50, doc.page.height - margin - 80)
  doc.fontSize(9).font('Helvetica').fillColor('#64748b')
  doc.text(
    'Thank you for your business. Payment is due by the due date above. ' +
      'This invoice was generated automatically by PortHaven Logistics.',
    margin,
    y,
    { width: contentWidth },
  )
  doc.text(`Invoice ${inv.invoiceNumber} — ${inv.company.name}`, margin, doc.page.height - margin - 20, {
    width: contentWidth,
    align: 'center',
  })
}