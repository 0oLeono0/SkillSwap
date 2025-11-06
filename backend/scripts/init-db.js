import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
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
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");`,
    `CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");`,
    `CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"("token");`,
];
async function main() {
    for (const sql of statements) {
        await prisma.$executeRawUnsafe(sql);
    }
}
main()
    .catch((error) => {
    console.error('[db:init] Failed to apply schema', error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=init-db.js.map