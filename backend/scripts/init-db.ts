import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { db } from '../src/data/mockData.js';
import {
  normalizeUserSkillList,
  serializeImageUrls
} from '../src/types/userSkill.js';

const connectionString = process.env.DATABASE_URL;
console.log('[db:init] DATABASE_URL =', connectionString);

const prisma = new PrismaClient();

const statements = [
  `PRAGMA foreign_keys = ON;`,
  `CREATE TABLE IF NOT EXISTS "City" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "SkillGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "Skill" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    CONSTRAINT "Skill_groupId_fkey"
      FOREIGN KEY ("groupId") REFERENCES "SkillGroup" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user' CHECK ("role" IN ('user', 'admin', 'owner')),
    "avatarUrl" TEXT DEFAULT '',
    "cityId" INTEGER,
    "birthDate" DATETIME,
    "gender" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_cityId_fkey"
      FOREIGN KEY ("cityId") REFERENCES "City" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'rejected')),
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Request_fromUserId_fkey"
      FOREIGN KEY ("fromUserId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Request_toUserId_fkey"
      FOREIGN KEY ("toUserId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_targetUserId_fkey"
      FOREIGN KEY ("targetUserId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Exchange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'completed')),
    "confirmedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exchange_requestId_fkey"
      FOREIGN KEY ("requestId") REFERENCES "Request" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exchange_initiatorId_fkey"
      FOREIGN KEY ("initiatorId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exchange_recipientId_fkey"
      FOREIGN KEY ("recipientId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "ExchangeMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exchangeId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExchangeMessage_exchangeId_fkey"
      FOREIGN KEY ("exchangeId") REFERENCES "Exchange" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExchangeMessage_senderId_fkey"
      FOREIGN KEY ("senderId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "UserSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ('teach', 'learn')),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" INTEGER,
    "subcategoryId" INTEGER,
    "imageUrls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSkill_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSkill_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "SkillGroup" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserSkill_subcategoryId_fkey"
      FOREIGN KEY ("subcategoryId") REFERENCES "Skill" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"("token");`,
  `CREATE INDEX IF NOT EXISTS "Skill_groupId_idx" ON "Skill"("groupId");`,
  `CREATE INDEX IF NOT EXISTS "Request_fromUserId_idx" ON "Request"("fromUserId");`,
  `CREATE INDEX IF NOT EXISTS "Request_toUserId_idx" ON "Request"("toUserId");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_targetUserId_key" ON "Favorite"("userId", "targetUserId");`,
  `CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId");`,
  `CREATE INDEX IF NOT EXISTS "Favorite_targetUserId_idx" ON "Favorite"("targetUserId");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Exchange_requestId_key" ON "Exchange"("requestId");`,
  `CREATE INDEX IF NOT EXISTS "Exchange_initiatorId_idx" ON "Exchange"("initiatorId");`,
  `CREATE INDEX IF NOT EXISTS "Exchange_recipientId_idx" ON "Exchange"("recipientId");`,
  `CREATE INDEX IF NOT EXISTS "Exchange_status_idx" ON "Exchange"("status");`,
  `CREATE INDEX IF NOT EXISTS "Exchange_confirmedAt_idx" ON "Exchange"("confirmedAt");`,
  `CREATE INDEX IF NOT EXISTS "ExchangeMessage_exchangeId_idx" ON "ExchangeMessage"("exchangeId");`,
  `CREATE INDEX IF NOT EXISTS "ExchangeMessage_senderId_idx" ON "ExchangeMessage"("senderId");`,
  `CREATE INDEX IF NOT EXISTS "ExchangeMessage_createdAt_idx" ON "ExchangeMessage"("createdAt");`,
  `CREATE INDEX IF NOT EXISTS "UserSkill_userId_idx" ON "UserSkill"("userId");`,
  `CREATE INDEX IF NOT EXISTS "UserSkill_type_idx" ON "UserSkill"("type");`,
  `CREATE INDEX IF NOT EXISTS "UserSkill_categoryId_idx" ON "UserSkill"("categoryId");`,
  `CREATE INDEX IF NOT EXISTS "UserSkill_subcategoryId_idx" ON "UserSkill"("subcategoryId");`,
  `CREATE INDEX IF NOT EXISTS "UserSkill_userId_type_idx" ON "UserSkill"("userId", "type");`
];

const seedReferenceData = async (client: PrismaClient) => {
  const cityCount = await client.city.count();
  if (cityCount === 0) {
    await client.city.createMany({
      data: db.cities.map((city) => ({
        id: city.id,
        name: city.name
      }))
    });
  }

  const groupCount = await client.skillGroup.count();
  if (groupCount === 0) {
    await client.skillGroup.createMany({
      data: db.skills.map((group) => ({
        id: group.id,
        name: group.name
      }))
    });
  }

  const skillCount = await client.skill.count();
  if (skillCount === 0) {
    const skillData = db.skills.flatMap((group) =>
      (group.subskills ?? []).map((skill) => ({
        id: skill.id,
        name: skill.name,
        groupId: group.id
      }))
    );

    if (skillData.length) {
      await client.skill.createMany({
        data: skillData
      });
    }
  }
};

const parseLegacySkillList = (value: unknown) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return normalizeUserSkillList(parsed);
  } catch {
    return [];
  }
};

const migrateLegacySkills = async (client: PrismaClient) => {
  const existing = await client.userSkill.count();
  if (existing > 0) {
    return;
  }

  let rows: Array<{
    id: string;
    teachableSkills?: string | null;
    learningSkills?: string | null;
  }> = [];

  try {
    rows = await client.$queryRawUnsafe(
      'SELECT id, teachableSkills, learningSkills FROM "User"'
    );
  } catch {
    return;
  }

  const skillRows = rows.flatMap((row) => {
    const teachable = parseLegacySkillList(row.teachableSkills);
    const learning = parseLegacySkillList(row.learningSkills);

    const teachRows = teachable.map((skill) => ({
      id: skill.id,
      userId: row.id,
      type: 'teach',
      title: skill.title,
      description: skill.description,
      categoryId: skill.categoryId ?? null,
      subcategoryId: skill.subcategoryId ?? null,
      imageUrls: serializeImageUrls(skill.imageUrls)
    }));

    const learnRows = learning.map((skill) => ({
      id: skill.id,
      userId: row.id,
      type: 'learn',
      title: skill.title,
      description: skill.description,
      categoryId: skill.categoryId ?? null,
      subcategoryId: skill.subcategoryId ?? null,
      imageUrls: serializeImageUrls(skill.imageUrls)
    }));

    return [...teachRows, ...learnRows];
  });

  if (skillRows.length > 0) {
    await client.userSkill.createMany({ data: skillRows });
  }
};

async function main() {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }

  await seedReferenceData(prisma);
  await migrateLegacySkills(prisma);
}

main()
  .catch((error) => {
    console.error('[db:init] Failed to apply schema', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
