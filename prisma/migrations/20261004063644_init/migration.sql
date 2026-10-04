-- CreateEnum
CREATE TYPE "queue_status" AS ENUM ('WAITING', 'IN_TURN', 'DONE', 'EXTENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "queue" (
    "id" TEXT NOT NULL,
    "cust_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "date" DATE NOT NULL,
    "queue_number" INTEGER NOT NULL,
    "queue_status" "queue_status" NOT NULL DEFAULT 'WAITING',
    "estimated_end_at" TIMESTAMP(3),
    "id_booth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booth" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "qr_file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "queue_id_booth_date_queue_status_idx" ON "queue"("id_booth", "date", "queue_status");

-- CreateIndex
CREATE INDEX "queue_date_queue_status_idx" ON "queue"("date", "queue_status");

-- CreateIndex
CREATE UNIQUE INDEX "queue_id_booth_date_queue_number_key" ON "queue"("id_booth", "date", "queue_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "queue" ADD CONSTRAINT "queue_id_booth_fkey" FOREIGN KEY ("id_booth") REFERENCES "booth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
