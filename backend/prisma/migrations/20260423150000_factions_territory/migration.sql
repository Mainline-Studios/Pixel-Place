-- Factions, seasons, territory, chat, leaderboards

CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "event_tag" TEXT,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "seasons_slug_key" ON "seasons"("slug");

CREATE TABLE "factions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" VARCHAR(4) NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "factions_tag_key" ON "factions"("tag");

ALTER TABLE "factions" ADD CONSTRAINT "factions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "faction_members" (
    "user_id" TEXT NOT NULL,
    "faction_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faction_members_pkey" PRIMARY KEY ("user_id")
);

CREATE UNIQUE INDEX "faction_members_faction_id_user_id_key" ON "faction_members"("faction_id", "user_id");
CREATE INDEX "faction_members_faction_id_idx" ON "faction_members"("faction_id");

ALTER TABLE "faction_members" ADD CONSTRAINT "faction_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "faction_members" ADD CONSTRAINT "faction_members_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "faction_invites" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "faction_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "max_uses" INTEGER NOT NULL DEFAULT 50,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faction_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "faction_invites_code_key" ON "faction_invites"("code");
CREATE INDEX "faction_invites_faction_id_idx" ON "faction_invites"("faction_id");

ALTER TABLE "faction_invites" ADD CONSTRAINT "faction_invites_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "faction_invites" ADD CONSTRAINT "faction_invites_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "territory_cells" (
    "season_id" TEXT NOT NULL,
    "canvas_id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "faction_id" TEXT NOT NULL,
    "placed_by_user_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "territory_cells_pkey" PRIMARY KEY ("season_id","canvas_id","x","y")
);

CREATE INDEX "territory_cells_season_id_faction_id_idx" ON "territory_cells"("season_id", "faction_id");
CREATE INDEX "territory_cells_season_id_canvas_id_idx" ON "territory_cells"("season_id", "canvas_id");

ALTER TABLE "territory_cells" ADD CONSTRAINT "territory_cells_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "territory_cells" ADD CONSTRAINT "territory_cells_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "territory_cells" ADD CONSTRAINT "territory_cells_placed_by_user_id_fkey" FOREIGN KEY ("placed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "user_season_scores" (
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "pixels_placed" INTEGER NOT NULL DEFAULT 0,
    "tiles_captured" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_season_scores_pkey" PRIMARY KEY ("user_id","season_id")
);

CREATE INDEX "user_season_scores_season_id_pixels_placed_idx" ON "user_season_scores"("season_id", "pixels_placed" DESC);

ALTER TABLE "user_season_scores" ADD CONSTRAINT "user_season_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_season_scores" ADD CONSTRAINT "user_season_scores_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "faction_season_scores" (
    "faction_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "tiles_owned" INTEGER NOT NULL DEFAULT 0,
    "pixels_from_members" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faction_season_scores_pkey" PRIMARY KEY ("faction_id","season_id")
);

CREATE INDEX "faction_season_scores_season_id_tiles_owned_idx" ON "faction_season_scores"("season_id", "tiles_owned" DESC);

ALTER TABLE "faction_season_scores" ADD CONSTRAINT "faction_season_scores_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "faction_season_scores" ADD CONSTRAINT "faction_season_scores_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "faction_chat_messages" (
    "id" TEXT NOT NULL,
    "faction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faction_chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "faction_chat_messages_faction_id_created_at_idx" ON "faction_chat_messages"("faction_id", "created_at");

ALTER TABLE "faction_chat_messages" ADD CONSTRAINT "faction_chat_messages_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "faction_chat_messages" ADD CONSTRAINT "faction_chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "seasons" ("id","slug","name","starts_at","ends_at","is_active","event_tag")
VALUES ('init_season_1','season-1','Season 1', CURRENT_TIMESTAMP, NULL, true, NULL)
ON CONFLICT ("id") DO NOTHING;
