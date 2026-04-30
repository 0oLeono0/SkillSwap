-- Add user lifecycle status. Existing users remain active.
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'inactive'));

-- CreateTable
CREATE TABLE "ExchangeRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exchangeId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExchangeRating_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExchangeRating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExchangeRating_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExchangeRating_score_check" CHECK ("score" >= 1 AND "score" <= 5),
    CONSTRAINT "ExchangeRating_distinct_users_check" CHECK ("raterId" <> "ratedUserId")
);

-- CreateTable
CREATE TABLE "UserSkillMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userSkillId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSkillMaterial_userSkillId_fkey" FOREIGN KEY ("userSkillId") REFERENCES "UserSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSkillMaterial_type_check" CHECK ("type" IN ('theory', 'practice', 'testing'))
);

-- CreateTable
CREATE TABLE "MaterialQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaterialQuestion_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "UserSkillMaterial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialAnswerOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaterialAnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MaterialQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRating_exchangeId_raterId_key" ON "ExchangeRating"("exchangeId", "raterId");

-- CreateIndex
CREATE INDEX "ExchangeRating_exchangeId_idx" ON "ExchangeRating"("exchangeId");

-- CreateIndex
CREATE INDEX "ExchangeRating_raterId_idx" ON "ExchangeRating"("raterId");

-- CreateIndex
CREATE INDEX "ExchangeRating_ratedUserId_idx" ON "ExchangeRating"("ratedUserId");

-- CreateIndex
CREATE INDEX "UserSkillMaterial_userSkillId_idx" ON "UserSkillMaterial"("userSkillId");

-- CreateIndex
CREATE INDEX "UserSkillMaterial_type_idx" ON "UserSkillMaterial"("type");

-- CreateIndex
CREATE INDEX "UserSkillMaterial_userSkillId_type_idx" ON "UserSkillMaterial"("userSkillId", "type");

-- CreateIndex
CREATE INDEX "MaterialQuestion_materialId_idx" ON "MaterialQuestion"("materialId");

-- CreateIndex
CREATE INDEX "MaterialAnswerOption_questionId_idx" ON "MaterialAnswerOption"("questionId");

-- Enforce that ratings can only connect the two users participating in the exchange.
CREATE TRIGGER "ExchangeRating_participants_insert"
BEFORE INSERT ON "ExchangeRating"
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM "Exchange"
            WHERE "id" = NEW."exchangeId"
              AND (
                ("initiatorId" = NEW."raterId" AND "recipientId" = NEW."ratedUserId")
                OR
                ("initiatorId" = NEW."ratedUserId" AND "recipientId" = NEW."raterId")
              )
        )
        THEN RAISE(ABORT, 'ExchangeRating users must be exchange participants')
    END;
END;

CREATE TRIGGER "ExchangeRating_participants_update"
BEFORE UPDATE OF "exchangeId", "raterId", "ratedUserId" ON "ExchangeRating"
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM "Exchange"
            WHERE "id" = NEW."exchangeId"
              AND (
                ("initiatorId" = NEW."raterId" AND "recipientId" = NEW."ratedUserId")
                OR
                ("initiatorId" = NEW."ratedUserId" AND "recipientId" = NEW."raterId")
              )
        )
        THEN RAISE(ABORT, 'ExchangeRating users must be exchange participants')
    END;
END;
