-- DropForeignKey
ALTER TABLE "tracking_events" DROP CONSTRAINT "tracking_events_shipment_id_fkey";

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
