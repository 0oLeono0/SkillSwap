import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { db } from '../src/data/mockData.js';

const connectionString = process.env.DATABASE_URL;
console.log('[db:init] DATABASE_URL =', connectionString);

const prisma = new PrismaClient();

const statements = [
  `PRAGMA foreign_keys = ON;`,
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT DEFAULT '',
    "cityId" INTEGER,
    "birthDate" DATETIME,
    "gender" TEXT,
    "bio" TEXT,
    "teachableSkills" TEXT NOT NULL DEFAULT '[]',
    "learningSkills" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"("token");`,
  `CREATE INDEX IF NOT EXISTS "Skill_groupId_idx" ON "Skill"("groupId");`,
];

const seedReferenceData = async (client: PrismaClient) => {
  const cityCount = await client.city.count();
  if (cityCount === 0) {
    await client.city.createMany({
      data: db.cities.map((city) => ({
        id: city.id,
        name: city.name,
      })),
    });
  }

  const groupCount = await client.skillGroup.count();
  if (groupCount === 0) {
    await client.skillGroup.createMany({
      data: db.skills.map((group) => ({
        id: group.id,
        name: group.name,
      })),
    });
  }

  const skillCount = await client.skill.count();
  if (skillCount === 0) {
    const skillData = db.skills.flatMap((group) =>
      (group.subskills ?? []).map((skill) => ({
        id: skill.id,
        name: skill.name,
        groupId: group.id,
      })),
    );

    if (skillData.length) {
      await client.skill.createMany({
        data: skillData,
      });
    }
  }
};

async function main() {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }

  await seedReferenceData(prisma);
}

main()
  .catch((error) => {
    console.error('[db:init] Failed to apply schema', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
