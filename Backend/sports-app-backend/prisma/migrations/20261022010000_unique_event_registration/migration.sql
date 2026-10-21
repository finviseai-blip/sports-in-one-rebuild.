-- Preserve one registration per student/event. Prefer accepted records, then pending,
-- then declined; within a status retain the oldest record.
WITH ranked AS (
  SELECT "id",
         ROW_NUMBER() OVER (
           PARTITION BY "eventId", "studentId"
           ORDER BY CASE "status"
             WHEN 'ACCEPTED' THEN 0
             WHEN 'PENDING' THEN 1
             ELSE 2
           END, "createdAt" ASC, "id" ASC
         ) AS rn
  FROM "EventInvite"
)
DELETE FROM "EventInvite"
WHERE "id" IN (SELECT "id" FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX "EventInvite_eventId_studentId_key"
ON "EventInvite"("eventId", "studentId");

CREATE INDEX "EventInvite_studentId_status_idx"
ON "EventInvite"("studentId", "status");

-- Keep cancelled bookings as history while allowing a released slot to be booked again.
DROP INDEX IF EXISTS "Booking_slotId_key";
CREATE UNIQUE INDEX "Booking_slotId_active_key"
ON "Booking"("slotId")
WHERE "status" = 'CONFIRMED';
