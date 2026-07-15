import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Fixed tracking number for client demos — idempotent upsert. */
export const DEMO_TRACKING_NUMBER = 'TRKPH202501'

async function main() {
  const now = new Date()
  const estimatedDelivery = new Date(now)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 14)

  const eventTimes = [
    { daysAgo: 5, status: 'ORDER_CREATED' as const, location: 'Shenzhen, CN', note: 'Shipment created and registered in system.' },
    { daysAgo: 4, status: 'PICKED_UP' as const, location: 'Shenzhen, CN', note: 'Collected from sender warehouse.' },
    { daysAgo: 2, status: 'IN_TRANSIT' as const, location: 'Hong Kong, HK', note: 'Departed origin hub — in transit to destination country.' },
    { daysAgo: 0, status: 'ARRIVED_AT_FACILITY' as const, location: 'Los Angeles, US', note: 'Arrived at destination facility for processing.' },
  ]

  const shipment = await prisma.shipment.upsert({
    where: { trackingNumber: DEMO_TRACKING_NUMBER },
    update: {
      senderName: 'Guangzhou Electronics Ltd',
      receiverName: 'John Smith',
      origin: 'Shenzhen, China',
      destination: 'Los Angeles, USA',
      mode: 'AIR',
      status: 'ARRIVED_AT_FACILITY',
      estimatedDelivery,
    },
    create: {
      trackingNumber: DEMO_TRACKING_NUMBER,
      senderName: 'Guangzhou Electronics Ltd',
      receiverName: 'John Smith',
      origin: 'Shenzhen, China',
      destination: 'Los Angeles, USA',
      mode: 'AIR',
      status: 'ARRIVED_AT_FACILITY',
      estimatedDelivery,
    },
  })

  await prisma.trackingEvent.deleteMany({ where: { shipmentId: shipment.id } })

  for (const evt of eventTimes) {
    const timestamp = new Date(now)
    timestamp.setDate(timestamp.getDate() - evt.daysAgo)
    timestamp.setHours(10, 0, 0, 0)

    await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: evt.status,
        location: evt.location,
        note: evt.note,
        timestamp,
      },
    })
  }

  console.log(`Demo shipment ready: ${DEMO_TRACKING_NUMBER}`)
  console.log(`Public track URL path: /track/${DEMO_TRACKING_NUMBER}`)
}

main()
  .catch((err) => {
    console.error('Demo seed failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
