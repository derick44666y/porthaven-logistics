import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

// Path to the GeoNames cities15000 dump. Override with CITIES_FILE env if needed.
const filePath = process.env.CITIES_FILE || join(__dirname, 'cities15000.txt')

const MIN_POPULATION = 50000

interface CityRow {
  name: string
  city: string
  country: string
  type: string
  latitude: number | null
  longitude: number | null
}

function parsePopulation(raw: string): number {
  const n = parseInt(raw, 10)
  return isNaN(n) ? 0 : n
}

function toNumberOrNull(raw: string): number | null {
  const n = parseFloat(raw)
  return isNaN(n) ? null : n
}

async function main() {
  console.log(`Reading cities from: ${filePath}`)
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  const cities: CityRow[] = []
  let skipped = 0

  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    // GeoNames columns: 0 geonameid, 1 name, 2 asciiname, 3 alternatenames,
    // 4 lat, 5 lon, 6 featClass, 7 featCode, 8 country, 9 cc2,
    // 10-13 admin codes, 14 population, 15 elevation, 16 dem, 17 timezone, 18 moddate
    const name = (cols[1] || '').trim()
    const country = (cols[8] || '').trim()
    const population = parsePopulation(cols[14] || '0')

    if (!name || !country) {
      skipped++
      continue
    }
    if (population <= MIN_POPULATION) {
      skipped++
      continue
    }

    cities.push({
      name,
      city: name,
      country,
      type: 'CITY',
      latitude: toNumberOrNull(cols[4]),
      longitude: toNumberOrNull(cols[5]),
    })
  }

  console.log(`Parsed ${cities.length} cities (population > ${MIN_POPULATION}). Skipped ${skipped}.`)

  // Replace existing seeded cities for idempotent seeding.
  await prisma.location.deleteMany({ where: { type: 'CITY' } })
  console.log('Cleared existing CITY locations.')

  // Insert in batches to avoid huge single queries.
  const BATCH = 1000
  let inserted = 0
  for (let i = 0; i < cities.length; i += BATCH) {
    const batch = cities.slice(i, i + BATCH)
    await prisma.location.createMany({ data: batch })
    inserted += batch.length
    console.log(`Inserted ${inserted}/${cities.length}...`)
  }

  console.log(`Done. Seeded ${inserted} locations.`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })