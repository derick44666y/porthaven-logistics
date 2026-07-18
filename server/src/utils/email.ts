import { Resend } from 'resend'

const COLORS = {
  navy: '#152641',
  navyDark: '#0d1a2e',
  sky: '#1d8fda',
  ember: '#f97316',
  slate: '#f5f7fa',
  muted: '#64748b',
  white: '#ffffff',
}

export const STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Order Created',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  ARRIVED_AT_FACILITY: 'Arrived at Facility',
  CUSTOMS_CLEARANCE: 'Customs Clearance',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception/Delayed',
}

function requireEnv(name: string): string | null {
  const value = process.env[name]?.trim()
  return value || null
}

export function getSiteUrl(): string {
  const site = process.env.SITE_URL?.trim()
  if (site) return site.replace(/\/$/, '')
  const front = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .find(Boolean)
  if (front) return front.replace(/\/$/, '')
  return 'https://www.porthavenlogistic.com'
}

function getResendConfig() {
  return {
    apiKey: requireEnv('RESEND_API_KEY'),
    from: requireEnv('NOTIFY_FROM_EMAIL'),
    adminNotify: requireEnv('ADMIN_NOTIFY_EMAIL'),
  }
}

export function getEmailConfigFlags() {
  const { apiKey, from, adminNotify } = getResendConfig()
  return {
    configured: Boolean(apiKey && from && adminNotify),
    hasResendApiKey: Boolean(apiKey),
    hasNotifyFromEmail: Boolean(from),
    hasAdminNotifyEmail: Boolean(adminNotify),
  }
}

export function isEmailConfigured(): boolean {
  return getEmailConfigFlags().configured
}

export function logEmailConfigStatus(): void {
  const { apiKey, from, adminNotify } = getResendConfig()
  console.log(
    `Email (Resend): ${apiKey ? 'API key set' : 'API key MISSING'}, ` +
      `from=${from || 'MISSING'}, adminNotify=${adminNotify || 'MISSING'}`,
  )
}

function getResendClient(): Resend | null {
  const { apiKey } = getResendConfig()
  if (!apiKey) {
    console.warn('Resend: RESEND_API_KEY not set — skipping email send')
    return null
  }
  return new Resend(apiKey)
}

function brandedShell(title: string, bodyHtml: string): string {
  const siteUrl = getSiteUrl()
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.slate};font-family:Arial,Helvetica,sans-serif;color:${COLORS.navy};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.slate};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(21,38,65,0.08);">
          <tr>
            <td style="background:${COLORS.navyDark};padding:28px 32px;text-align:center;">
              <div style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:10px;background:linear-gradient(135deg,${COLORS.sky},${COLORS.navy});color:${COLORS.white};font-weight:800;font-size:18px;letter-spacing:0.5px;">PH</div>
              <div style="margin-top:12px;">
                <span style="font-size:22px;font-weight:800;letter-spacing:1px;color:${COLORS.white};">PORT</span><span style="font-size:22px;font-weight:800;letter-spacing:1px;color:${COLORS.sky};">HAVEN</span>
              </div>
              <div style="margin-top:4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Logistics</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:${COLORS.slate};padding:20px 32px;text-align:center;font-size:12px;color:${COLORS.muted};border-top:1px solid #e2e8f0;">
              <a href="${siteUrl}" style="color:${COLORS.sky};text-decoration:none;font-weight:600;">PortHaven Logistics</a>
              <div style="margin-top:6px;">Delivering Trust. Delivering More.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function formatReplyTo(displayName: string, email: string): string {
  const safeName = displayName.replace(/["<>]/g, '').trim() || 'PortHaven Site'
  return `${safeName} <${email}>`
}

async function sendEmail(options: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { from, adminNotify } = getResendConfig()
  const client = getResendClient()
  if (!client || !from) {
    return { ok: false, error: 'Email not configured (RESEND_API_KEY / NOTIFY_FROM_EMAIL)' }
  }

  const replyTo = options.replyTo || adminNotify || undefined

  try {
    const { data, error } = await client.emails.send({
      from: `PortHaven Logistics <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      console.error('Resend send error:', error)
      return { ok: false, error: error.message }
    }

    console.log(`Email sent: subject="${options.subject}" to=${options.to} id=${data?.id || 'n/a'}`)
    return { ok: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Resend exception:', message)
    return { ok: false, error: message }
  }
}

export async function sendStatusUpdateEmail(params: {
  to: string
  customerName: string
  trackingNumber: string
  status: string
  location: string
  note?: string
}): Promise<{ ok: boolean; error?: string }> {
  const statusLabel = STATUS_LABELS[params.status] || params.status
  const trackUrl = `${getSiteUrl()}/track/${encodeURIComponent(params.trackingNumber)}`
  const subject = `Shipment ${params.trackingNumber} update: ${statusLabel}`

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${COLORS.navy};">Shipment update</h1>
    <p style="margin:0 0 20px;color:${COLORS.muted};font-size:15px;">Hi ${escapeHtml(params.customerName)}, your shipment status has changed.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.slate};border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Tracking number</div>
        <div style="font-family:monospace;font-size:18px;font-weight:700;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.trackingNumber)}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">New status</div>
        <div style="display:inline-block;margin-top:6px;background:${COLORS.sky};color:${COLORS.white};padding:6px 12px;border-radius:999px;font-size:13px;font-weight:700;">${escapeHtml(statusLabel)}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Location</div>
        <div style="font-size:15px;font-weight:600;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.location)}</div>
      </td></tr>
      ${params.note ? `<tr><td style="padding:0 20px 16px;"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Note</div><div style="font-size:14px;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.note)}</div></td></tr>` : ''}
    </table>
    <a href="${trackUrl}" style="display:inline-block;background:${COLORS.ember};color:${COLORS.white};text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px;font-size:15px;">Track shipment</a>
    <p style="margin:20px 0 0;font-size:13px;color:${COLORS.muted};">Or open: <a href="${trackUrl}" style="color:${COLORS.sky};">${trackUrl}</a></p>
  `

  return sendEmail({
    to: params.to,
    subject,
    html: brandedShell(subject, body),
  })
}

export async function sendWelcomeEmail(params: {
  to: string
  name: string
  password: string
}): Promise<{ ok: boolean; error?: string }> {
  const siteUrl = getSiteUrl()
  const loginUrl = `${siteUrl}/login`
  const subject = 'Your PortHaven Logistics account'
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${COLORS.navy};">Welcome aboard</h1>
    <p style="margin:0 0 20px;color:${COLORS.muted};font-size:15px;">Hi ${escapeHtml(params.name)}, your customer account is ready. Use these credentials to sign in:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.slate};border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Email</div>
        <div style="font-family:monospace;font-size:15px;font-weight:700;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.to)}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Temporary password</div>
        <div style="font-family:monospace;font-size:15px;font-weight:700;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.password)}</div>
      </td></tr>
    </table>
    <a href="${loginUrl}" style="display:inline-block;background:${COLORS.navy};color:${COLORS.white};text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px;font-size:15px;">Sign in to your dashboard</a>
    <p style="margin:20px 0 0;font-size:13px;color:${COLORS.muted};">Keep this email private. You can change your password after signing in by contacting support.</p>
  `

  return sendEmail({
    to: params.to,
    subject,
    html: brandedShell(subject, body),
  })
}

export async function sendShipmentCreatedEmail(params: {
  to: string
  customerName: string
  trackingNumber: string
  senderName: string
  receiverName: string
  origin: string
  destination: string
  mode: string
  estimatedDelivery: string
}): Promise<{ ok: boolean; error?: string }> {
  const trackUrl = `${getSiteUrl()}/track/${encodeURIComponent(params.trackingNumber)}`
  const modeLabel = params.mode === 'AIR' ? 'Air Freight' : 'Sea Freight'
  const subject = `Your shipment is booked — ${params.trackingNumber}`
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${COLORS.navy};">Shipment booked</h1>
    <p style="margin:0 0 20px;color:${COLORS.muted};font-size:15px;">Hi ${escapeHtml(params.customerName)}, your shipment has been created and is now being processed.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.slate};border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Tracking number</div>
        <div style="font-family:monospace;font-size:18px;font-weight:700;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.trackingNumber)}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Service</div>
        <div style="font-size:15px;font-weight:600;color:${COLORS.navy};margin-top:4px;">${escapeHtml(modeLabel)}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">From → To</div>
        <div style="font-size:15px;font-weight:600;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.origin)} → ${escapeHtml(params.destination)}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Receiver</div>
        <div style="font-size:15px;font-weight:600;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.receiverName)}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Estimated delivery</div>
        <div style="font-size:15px;font-weight:600;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.estimatedDelivery)}</div>
      </td></tr>
    </table>
    <a href="${trackUrl}" style="display:inline-block;background:${COLORS.ember};color:${COLORS.white};text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px;font-size:15px;">Track your shipment</a>
    <p style="margin:20px 0 0;font-size:13px;color:${COLORS.muted};">Or open: <a href="${trackUrl}" style="color:${COLORS.sky};">${trackUrl}</a></p>
  `

  return sendEmail({
    to: params.to,
    subject,
    html: brandedShell(subject, body),
  })
}

export async function sendContactFormEmail(params: {
  name: string
  email: string
  message: string
}): Promise<{ ok: boolean; error?: string }> {
  const { adminNotify } = getResendConfig()
  if (!adminNotify) {
    return { ok: false, error: 'ADMIN_NOTIFY_EMAIL not configured' }
  }

  const subject = `Contact form: ${params.name}`
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${COLORS.navy};">New contact message</h1>
    <p style="margin:0 0 202;color:${COLORS.muted};font-size:15px;">Someone submitted the contact form on PortHaven Logistics.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.slate};border-radius:12px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">From</div>
        <div style="font-size:15px;font-weight:700;color:${COLORS.navy};margin-top:4px;">${escapeHtml(params.name)}</div>
        <div style="font-size:14px;color:${COLORS.sky};margin-top:4px;"><a href="mailto:${escapeHtml(params.email)}" style="color:${COLORS.sky};">${escapeHtml(params.email)}</a></div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};">Message</div>
        <div style="font-size:15px;color:${COLORS.navy};margin-top:8px;white-space:pre-wrap;line-height:1.5;">${escapeHtml(params.message)}</div>
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:${COLORS.muted};">Reply directly to this email to respond to the sender.</p>
  `

  // Reply-To keeps the visitor's real address (so staff can reply) but wraps it in a
  // "via PortHaven Site" display name. The From address stays fully on the verified
  // domain (SPF/DKIM aligned); the labelled Reply-To reduces first-sender spam scoring.
  const replyTo = formatReplyTo(`${params.name} via PortHaven Site`, params.email)
  return sendEmail({
    to: adminNotify,
    subject,
    html: brandedShell(subject, body),
    replyTo,
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
