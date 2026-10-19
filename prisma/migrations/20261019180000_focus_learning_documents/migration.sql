CREATE TABLE "IeltsGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetBand" DOUBLE PRECISION NOT NULL DEFAULT 7.0,
    "examDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IeltsGoal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IeltsPractice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "bandScore" DOUBLE PRECISION,
    "note" TEXT NOT NULL DEFAULT '',
    "practicedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IeltsPractice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpeakingAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "transcript" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "wordsPerMinute" INTEGER NOT NULL DEFAULT 0,
    "fillerCount" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpeakingAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonalDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IeltsGoal_userId_key" ON "IeltsGoal"("userId");
CREATE INDEX "IeltsPractice_userId_practicedAt_idx" ON "IeltsPractice"("userId", "practicedAt");
CREATE INDEX "SpeakingAttempt_userId_createdAt_idx" ON "SpeakingAttempt"("userId", "createdAt");
CREATE INDEX "PersonalDocument_userId_createdAt_idx" ON "PersonalDocument"("userId", "createdAt");

ALTER TABLE "IeltsGoal" ADD CONSTRAINT "IeltsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IeltsPractice" ADD CONSTRAINT "IeltsPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpeakingAttempt" ADD CONSTRAINT "SpeakingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalDocument" ADD CONSTRAINT "PersonalDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
