import 'dotenv/config'
import { writeFileSync } from 'fs'
import { sendContactFormEmail, sendWelcomeEmail, sendStatusUpdateEmail, isEmailConfigured, getSiteUrl } from '../src/utils/email.js'

async function main() {
  console.log('SITE_URL:', getSiteUrl())
  console.log('Configured:', isEmailConfigured())

  if (!isEmailConfigured()) {
    console.error('Set RESEND_API_KEY, NOTIFY_FROM_EMAIL, and ADMIN_NOTIFY_EMAIL in server/.env to send a real test.')
    process.exit(1)
  }

  const to = process.env.EMAIL_TEST_TO?.trim() || process.env.ADMIN_NOTIFY_EMAIL!.trim()

  const contact = await sendContactFormEmail({
    name: 'Local Format Test',
    email: 'format-test@example.com',
    message: 'This is a local Resend formatting test from PortHaven. Please ignore.',
  })
  console.log('contact:', contact)

  const welcome = await sendWelcomeEmail({
    to,
    name: 'Format Test Customer',
    password: 'TempPass-LocalOnly1',
  })
  console.log('welcome:', welcome)

  const status = await sendStatusUpdateEmail({
    to,
    customerName: 'Format Test Customer',
    trackingNumber: 'TRKPH202501',
    status: 'IN_TRANSIT',
    location: 'Hong Kong, HK',
    note: 'Local formatting test — in transit.',
  })
  console.log('status:', status)

  const summary = { contact, welcome, status, to, siteUrl: getSiteUrl() }
  writeFileSync(new URL('./_last_email_test.json', import.meta.url), JSON.stringify(summary, null, 2))
  console.log('Wrote prisma/_last_email_test.json')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
