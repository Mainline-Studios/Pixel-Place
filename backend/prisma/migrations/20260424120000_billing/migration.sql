-- Stripe / monetization (fair play: cosmetic + convenience; cooldown boost hard-capped server-side)

ALTER TABLE "users" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" TEXT;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" TEXT;
ALTER TABLE "users" ADD COLUMN "subscription_status" TEXT;
ALTER TABLE "users" ADD COLUMN "subscription_period_end" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "billing_entitlements" JSONB NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");
