-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dubbingCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hasVietnameseTTS" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ttsLastReset" TEXT,
ADD COLUMN     "ttsUsageChars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vietnameseTTSChars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vietnameseTTSExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "dubbing_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "videoUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "duration" INTEGER,
    "outputUrl" TEXT,
    "transcript" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dubbing_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_attributions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anonId" TEXT,
    "firstUtmSource" TEXT,
    "firstUtmMedium" TEXT,
    "firstUtmCampaign" TEXT,
    "firstUtmTerm" TEXT,
    "firstUtmContent" TEXT,
    "firstGclid" TEXT,
    "firstReferrer" TEXT,
    "firstLandingPath" TEXT,
    "firstSeenAt" TIMESTAMP(3),
    "lastUtmSource" TEXT,
    "lastUtmMedium" TEXT,
    "lastUtmCampaign" TEXT,
    "lastUtmTerm" TEXT,
    "lastUtmContent" TEXT,
    "lastGclid" TEXT,
    "lastReferrer" TEXT,
    "lastLandingPath" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_attributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "path" TEXT,
    "properties" JSONB,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_roadmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelTopic" TEXT,
    "channelGoal" TEXT,
    "availableTime" TEXT,
    "contentMix" TEXT,
    "timezone" TEXT,
    "postingTime" TEXT,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_roadmap_progress" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "unlockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "teacher_roadmap_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_attributions_userId_key" ON "user_attributions"("userId");

-- CreateIndex
CREATE INDEX "events_name_createdAt_idx" ON "events"("name", "createdAt");

-- CreateIndex
CREATE INDEX "events_userId_idx" ON "events"("userId");

-- CreateIndex
CREATE INDEX "events_anonId_idx" ON "events"("anonId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_roadmaps_userId_key" ON "teacher_roadmaps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_roadmap_progress_roadmapId_day_key" ON "teacher_roadmap_progress"("roadmapId", "day");

-- AddForeignKey
ALTER TABLE "dubbing_projects" ADD CONSTRAINT "dubbing_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_attributions" ADD CONSTRAINT "user_attributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_roadmaps" ADD CONSTRAINT "teacher_roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_roadmap_progress" ADD CONSTRAINT "teacher_roadmap_progress_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "teacher_roadmaps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
