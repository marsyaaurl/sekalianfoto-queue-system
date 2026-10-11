-- Add an opaque identifier for customer-facing queue URLs and mutations.
ALTER TABLE "queue" ADD COLUMN "public_token" TEXT;

UPDATE "queue" SET "public_token" = md5(random()::text || clock_timestamp()::text || id)
WHERE "public_token" IS NULL;

ALTER TABLE "queue" ALTER COLUMN "public_token" SET NOT NULL;
CREATE UNIQUE INDEX "queue_public_token_key" ON "queue"("public_token");
