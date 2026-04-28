-- Bot / abuse prevention: user state, device links, mod review flags
ALTER TABLE "users" ADD COLUMN "abuse_locked_until" TIMESTAMP(3),
ADD COLUMN "abuse_cooldown_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN "abuse_suspicion_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "abuse_suspicion_updated_at" TIMESTAMP(3),
ADD COLUMN "abuse_captcha_required_until" TIMESTAMP(3),
ADD COLUMN "abuse_last_territory_claim_at" TIMESTAMP(3);

CREATE TABLE "device_fingerprint_links" (
    "id" TEXT NOT NULL,
    "fingerprint_hash" VARCHAR(64) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_fingerprint_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "device_fingerprint_links_fingerprint_hash_user_id_key" ON "device_fingerprint_links"("fingerprint_hash", "user_id");
CREATE INDEX "device_fingerprint_links_fingerprint_hash_idx" ON "device_fingerprint_links"("fingerprint_hash");

ALTER TABLE "device_fingerprint_links" ADD CONSTRAINT "device_fingerprint_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "abuse_review_flags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" VARCHAR(160) NOT NULL,
    "score_snapshot" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "abuse_review_flags_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "abuse_review_flags_user_id_created_at_idx" ON "abuse_review_flags"("user_id", "created_at");

ALTER TABLE "abuse_review_flags" ADD CONSTRAINT "abuse_review_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
