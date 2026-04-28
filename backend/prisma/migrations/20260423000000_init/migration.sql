-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "username_lower" TEXT NOT NULL,
    "password_hash" TEXT,
    "email" TEXT,
    "gender" TEXT NOT NULL DEFAULT '',
    "google_id" TEXT,
    "apple_id" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "coins" INTEGER NOT NULL DEFAULT 0,
    "safety_points" INTEGER NOT NULL DEFAULT 0,
    "owned_skins" JSONB NOT NULL DEFAULT '[]',
    "equipped_skin" TEXT NOT NULL DEFAULT '',
    "owned_faces" JSONB NOT NULL DEFAULT '[]',
    "equipped_face" TEXT,
    "owned_accessories" JSONB NOT NULL DEFAULT '[]',
    "equipped_accessories" JSONB NOT NULL DEFAULT '[]',
    "friends" JSONB NOT NULL DEFAULT '[]',
    "friend_requests" JSONB NOT NULL DEFAULT '[]',
    "sent_friend_requests" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_lower_key" ON "users"("username_lower");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_key" ON "users"("apple_id");

