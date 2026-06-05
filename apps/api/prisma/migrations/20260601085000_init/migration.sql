-- CreateTable
CREATE TABLE "USERS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'USER',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "company_name" VARCHAR(255),
    "phone" VARCHAR(20),
    "kyc_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "USERS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CAMPAIGNS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "banner_url" VARCHAR(512),
    "avatar_url" VARCHAR(512),
    "event_type" VARCHAR(50) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "max_seats_per_order" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CAMPAIGNS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TICKET_SALE_SESSIONS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TICKET_SALE_SESSIONS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEATS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "area_name" VARCHAR(100) NOT NULL,
    "row_name" VARCHAR(10) NOT NULL,
    "col_name" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SEATS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DRAW_SEATS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seat_id" UUID NOT NULL,
    "x_coord" INTEGER NOT NULL,
    "y_coord" INTEGER NOT NULL,
    "color" VARCHAR(20),
    "label" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DRAW_SEATS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TICKETS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "seat_id" UUID NOT NULL,
    "order_id" UUID,
    "price" DECIMAL(12,2) NOT NULL,
    "ticket_code" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TICKETS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ORDERS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "payment_gateway" VARCHAR(50),
    "idempotency_key" VARCHAR(255) NOT NULL,
    "virtual_account_number" VARCHAR(100),
    "virtual_account_expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ORDERS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PAYMENT_TRANSACTIONS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "transaction_reference" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "callback_payload" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PAYMENT_TRANSACTIONS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "REFUND_REQUESTS" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "processed_by" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "REFUND_REQUESTS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SYSTEM_CONFIGS" (
    "config_key" VARCHAR(255) NOT NULL,
    "config_value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SYSTEM_CONFIGS_pkey" PRIMARY KEY ("config_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "USERS_email_key" ON "USERS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SEATS_campaign_id_row_name_col_name_key" ON "SEATS"("campaign_id", "row_name", "col_name");

-- CreateIndex
CREATE UNIQUE INDEX "DRAW_SEATS_seat_id_key" ON "DRAW_SEATS"("seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "TICKETS_ticket_code_key" ON "TICKETS"("ticket_code");

-- CreateIndex
CREATE UNIQUE INDEX "TICKETS_session_id_seat_id_key" ON "TICKETS"("session_id", "seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "ORDERS_idempotency_key_key" ON "ORDERS"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "REFUND_REQUESTS_order_id_key" ON "REFUND_REQUESTS"("order_id");

-- AddForeignKey
ALTER TABLE "CAMPAIGNS" ADD CONSTRAINT "CAMPAIGNS_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TICKET_SALE_SESSIONS" ADD CONSTRAINT "TICKET_SALE_SESSIONS_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "CAMPAIGNS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEATS" ADD CONSTRAINT "SEATS_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "CAMPAIGNS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DRAW_SEATS" ADD CONSTRAINT "DRAW_SEATS_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "SEATS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TICKETS" ADD CONSTRAINT "TICKETS_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "TICKET_SALE_SESSIONS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TICKETS" ADD CONSTRAINT "TICKETS_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "SEATS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TICKETS" ADD CONSTRAINT "TICKETS_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ORDERS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ORDERS" ADD CONSTRAINT "ORDERS_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ORDERS" ADD CONSTRAINT "ORDERS_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "CAMPAIGNS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ORDERS" ADD CONSTRAINT "ORDERS_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "TICKET_SALE_SESSIONS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAYMENT_TRANSACTIONS" ADD CONSTRAINT "PAYMENT_TRANSACTIONS_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ORDERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REFUND_REQUESTS" ADD CONSTRAINT "REFUND_REQUESTS_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "ORDERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REFUND_REQUESTS" ADD CONSTRAINT "REFUND_REQUESTS_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REFUND_REQUESTS" ADD CONSTRAINT "REFUND_REQUESTS_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "USERS"("id") ON DELETE SET NULL ON UPDATE CASCADE;
