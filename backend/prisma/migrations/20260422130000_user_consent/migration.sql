-- CreateTable
CREATE TABLE "user_consents" (
    "user_id" TEXT NOT NULL,
    "terms_version" TEXT NOT NULL DEFAULT '1',
    "privacy_version" TEXT NOT NULL DEFAULT '1',
    "analytics_cookies" BOOLEAN NOT NULL DEFAULT false,
    "marketing_cookies" BOOLEAN NOT NULL DEFAULT false,
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
