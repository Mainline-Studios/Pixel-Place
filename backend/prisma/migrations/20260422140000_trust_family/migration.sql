-- AlterTable
ALTER TABLE "users" ADD COLUMN "safe_mode_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "educational_mode_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "family_link_code_hash" VARCHAR(64);
ALTER TABLE "users" ADD COLUMN "family_link_code_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "verified_creator" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "verified_creator_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "verified_creator_label" VARCHAR(64);

-- CreateTable
CREATE TABLE "family_links" (
    "id" TEXT NOT NULL,
    "parent_user_id" TEXT NOT NULL,
    "child_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "family_links_child_user_id_key" ON "family_links"("child_user_id");

-- CreateIndex
CREATE INDEX "family_links_parent_user_id_idx" ON "family_links"("parent_user_id");

-- AddForeignKey
ALTER TABLE "family_links" ADD CONSTRAINT "family_links_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_links" ADD CONSTRAINT "family_links_child_user_id_fkey" FOREIGN KEY ("child_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
