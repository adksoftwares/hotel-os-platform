-- Align the database with fields used by the reservation and stay services.
ALTER TABLE "Reservation" ADD COLUMN "roomId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "metadata" JSONB;

CREATE INDEX "Reservation_roomId_idx" ON "Reservation"("roomId");

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "Room"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
