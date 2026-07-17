import type { Shipment, User } from '@prisma/client'

export interface InvoiceLineItem {
  description: string
  detail: string
  amountCents: number
}

export interface InvoiceData {
  invoiceNumber: string
  issueDate: string // ISO yyyy-mm-dd
  dueDate: string // ISO yyyy-mm-dd
  currency: string
  company: {
    name: string
    address: string
    email: string
    phone: string
    taxId: string
    website: string
  }
  billTo: {
    name: string
    email: string
    address: string
  }
  shipment: {
    trackingNumber: string
    mode: string
    origin: string
    destination: string
    senderName: string
    receiverName: string
    estimatedDelivery: string
    status: string
  }
  lineItems: InvoiceLineItem[]
  subtotalCents: number
  taxRatePercent: number
  taxCents: number
  totalCents: number
}

const COMPANY_DEFAULTS = {
  name: 'PortHaven Logistics',
  address: '123 Harbour Plaza, Suite 400, Los Angeles, CA 90012, USA',
  email: 'billing@porthavenlogistic.com',
  phone: '+1 (800) 555-0142',
  taxId: 'US-GBL-88420193',
  website: 'https://www.porthavenlogistic.com',
}

function env(name: string, fallback: string): string {
  const v = process.env[name]?.trim()
  return v || fallback
}

function getCompany() {
  return {
    name: env('COMPANY_NAME', COMPANY_DEFAULTS.name),
    address: env('COMPANY_ADDRESS', COMPANY_DEFAULTS.address),
    email: env('COMPANY_EMAIL', COMPANY_DEFAULTS.email),
    phone: env('COMPANY_PHONE', COMPANY_DEFAULTS.phone),
    taxId: env('COMPANY_TAX_ID', COMPANY_DEFAULTS.taxId),
    website: env('COMPANY_WEBSITE', COMPANY_DEFAULTS.website),
  }
}

/** Parse a tax rate percentage from env, clamped to [0, 100]. */
export function getTaxRatePercent(): number {
  const raw = parseFloat(process.env.INVOICE_TAX_RATE || '0')
  if (!Number.isFinite(raw) || raw < 0) return 0
  if (raw > 100) return 100
  return raw
}

/**
 * Convert a Decimal/number amount to integer cents, rounding to the nearest
 * cent using banker-safe rounding. This avoids floating-point errors in the
 * invoice totals.
 */
export function toCents(amount: number | { toNumber?: () => number } | null | undefined): number {
  if (amount == null) return 0
  const value = typeof amount === 'number' ? amount : (amount as { toNumber: () => number }).toNumber()
  // Round to 2 decimals then to cents. Multiply by 100 and round half-up.
  return Math.round((Math.round(value * 100) / 100) * 100)
}

/** Format integer cents as a currency string, e.g. 12345 -> "123.45". */
export function formatCents(cents: number, currency: string): string {
  const negative = cents < 0
  const abs = Math.abs(cents)
  const major = Math.floor(abs / 100)
  const minor = (abs % 100).toString().padStart(2, '0')
  const majorGrouped = major.toLocaleString('en-US')
  return `${negative ? '-' : ''}${majorGrouped}.${minor} ${currency}`
}

/** Stable, legible invoice number derived from the shipment (never changes). */
export function invoiceNumberFor(shipment: Shipment): string {
  const year = new Date(shipment.createdAt).getUTCFullYear()
  const suffix = shipment.trackingNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10)
  return `INV-${year}-${suffix}`
}

function formatDate(iso: Date | string): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Build a fully-computed invoice for a shipment. All monetary values are
 * carried as integer cents so totals are exact. The freight amount comes from
 * the shipment's `amount` field; if absent, the line item shows "0.00" and the
 * invoice is still structurally valid (admin should set an amount).
 */
export function buildInvoice(shipment: Shipment, customer: User | null): InvoiceData {
  const currency = shipment.currency || 'USD'
  const amountCents = toCents(shipment.amount)
  const taxRatePercent = getTaxRatePercent()

  // Tax computed on the rounded subtotal, rounded to the nearest cent.
  const taxCents = Math.round((amountCents * taxRatePercent) / 100)
  const totalCents = amountCents + taxCents

  const modeLabel = shipment.mode === 'AIR' ? 'Air Freight' : 'Sea Freight'

  const billTo = customer
    ? {
        name: customer.name,
        email: customer.email,
        address: `${shipment.receiverName}\n${shipment.destination}`,
      }
    : {
        name: shipment.receiverName,
        email: '',
        address: shipment.destination,
      }

  const issueDate = formatDate(shipment.createdAt)
  const dueDate = addDays(issueDate, 14)

  return {
    invoiceNumber: invoiceNumberFor(shipment),
    issueDate,
    dueDate,
    currency,
    company: getCompany(),
    billTo,
    shipment: {
      trackingNumber: shipment.trackingNumber,
      mode: modeLabel,
      origin: shipment.origin,
      destination: shipment.destination,
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      estimatedDelivery: formatDate(shipment.estimatedDelivery),
      status: shipment.status,
    },
    lineItems: [
      {
        description: `${modeLabel} shipment`,
        detail: `${shipment.origin} → ${shipment.destination} (${shipment.trackingNumber})`,
        amountCents,
      },
    ],
    subtotalCents: amountCents,
    taxRatePercent,
    taxCents,
    totalCents,
  }
}