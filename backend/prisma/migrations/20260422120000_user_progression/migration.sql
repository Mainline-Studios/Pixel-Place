-- AlterTable user progression domain

CREATE TABLE "user_profiles" (
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "user_progress" (
    "user_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "pixel_stats" (
    "user_id" TEXT NOT NULL,
    "pixels_placed" INTEGER NOT NULL DEFAULT 0,
    "last_placed_at" TIMESTAMP(3),

    CONSTRAINT "pixel_stats_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_key" TEXT NOT NULL DEFAULT 'star',
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "requirement" JSONB NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_achievements" (
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id","achievement_id")
);

CREATE TABLE "user_engagement" (
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TEXT,
    "last_daily_claim_date" TEXT,

    CONSTRAINT "user_engagement_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_inventory_items" (
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_inventory_items_pkey" PRIMARY KEY ("user_id","item_id")
);

ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pixel_stats" ADD CONSTRAINT "pixel_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_engagement" ADD CONSTRAINT "user_engagement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_inventory_items" ADD CONSTRAINT "user_inventory_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_inventory_items" ADD CONSTRAINT "user_inventory_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "catalog_items" ("id", "name", "description", "type", "metadata") VALUES
('starter_spray', 'Spray can', 'Show off your placement style.', 'tool', '{"kind":"cosmetic_flair"}'),
('pixel_sticker', 'Pixel sticker', 'Profile decoration.', 'cosmetic', '{"slot":"profile"}'),
('grid_ruler', 'Grid ruler', 'Alignment helper (cosmetic).', 'tool', '{"kind":"alignment"}')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "achievements" ("id", "name", "description", "icon_key", "xp_reward", "requirement") VALUES
('first_pixel', 'First pixel', 'Place your first pixel.', 'pixel', 25, '{"kind":"pixels_placed","atLeast":1}'),
('pixel_100', 'Century', 'Place 100 pixels.', 'pixel', 50, '{"kind":"pixels_placed","atLeast":100}'),
('pixel_1000', 'Dedicated', 'Place 1,000 pixels.', 'pixel', 200, '{"kind":"pixels_placed","atLeast":1000}'),
('level_5', 'Regular', 'Reach account level 5.', 'star', 100, '{"kind":"level","atLeast":5}'),
('streak_7', 'Week warrior', 'Maintain a 7-day daily reward streak.', 'fire', 150, '{"kind":"daily_streak","atLeast":7}')
ON CONFLICT ("id") DO NOTHING;
