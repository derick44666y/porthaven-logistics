import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const MIN_PASSWORD_LENGTH = 12

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

async function main() {
  const email = requiredEnv('ADMIN_EMAIL').toLowerCase()
  const password = requiredEnv('ADMIN_PASSWORD')

  if (!email.includes('@')) {
    throw new Error('ADMIN_EMAIL must be a valid email address')
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: 'ADMIN',
        name: 'PortHaven Admin',
      },
      create: {
        email,
        passwordHash,
        role: 'ADMIN',
        name: 'PortHaven Admin',
      },
    })

    await tx.user.updateMany({
      where: {
        role: 'ADMIN',
        email: { not: email },
      },
      data: { role: 'CUSTOMER' },
    })
  })

  console.log(`Admin account ready: ${email}`)
  console.log('All other admin accounts were demoted to CUSTOMER.')
}

main()
  .catch((err) => {
    console.error('Admin seed failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
