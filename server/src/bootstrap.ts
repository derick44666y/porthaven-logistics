import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const MIN_PASSWORD_LENGTH = 12

/**
 * Ensures an admin account exists when ADMIN_EMAIL and ADMIN_PASSWORD are set
 * in the environment (e.g. on Render). This lets operators provision the admin
 * account purely via environment variables — no separate seed run required.
 *
 * It only creates/updates the admin when BOTH vars are present. It never
 * demotes other admins, so it is safe to run on every boot.
 */
export async function ensureAdminAccount(prisma: PrismaClient): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD?.trim()

  if (!email || !password) return
  if (!email.includes('@')) {
    console.warn('ADMIN_EMAIL is not a valid email; skipping admin provisioning.')
    return
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.warn(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters; skipping admin provisioning.`,
    )
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role: 'ADMIN', name: 'PortHaven Admin' },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
      name: 'PortHaven Admin',
    },
  })

  console.log(`Admin account ensured: ${email.toLowerCase()}`)
}