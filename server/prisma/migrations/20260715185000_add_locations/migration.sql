-- CreateTable
CREATE TABLE IF NOT EXISTS "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CITY',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "locations_name_idx" ON "locations"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "locations_city_idx" ON "locations"("city");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "locations_country_idx" ON "locations"("country");
