import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const prismaDir = path.resolve(backendDir, 'prisma');

const removeIfExists = (targetPath: string) => {
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
};

const runPrisma = (args: string[]) => {
  const prismaBin = path.join(
    backendDir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
  );

  if (!fs.existsSync(prismaBin)) {
    throw new Error(
      'Prisma CLI not found. Run `npm install` in backend first.'
    );
  }

  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'cmd.exe' : prismaBin;
  const commandArgs = isWindows ? ['/d', '/s', '/c', prismaBin, ...args] : args;

  const result = spawnSync(command, commandArgs, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false
  });

  if (result.status !== 0) {
    throw new Error(
      `prisma ${args.join(' ')} failed with code ${result.status}`
    );
  }
};

const resolveSqlitePath = (databaseUrl?: string): string | null => {
  if (!databaseUrl) {
    return null;
  }

  const normalized = databaseUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!normalized.startsWith('file:')) {
    return null;
  }

  const rawPath = normalized.slice('file:'.length).split('?')[0];
  if (!rawPath || rawPath === ':memory:') {
    return null;
  }

  const decodedPath = decodeURIComponent(rawPath);
  if (path.isAbsolute(decodedPath)) {
    return decodedPath;
  }

  return path.resolve(prismaDir, decodedPath);
};

const sqliteTableExists = async (
  prisma: PrismaClient,
  tableName: string
): Promise<boolean> => {
  const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    'SELECT name FROM sqlite_master WHERE type = ? AND name = ? LIMIT 1',
    'table',
    tableName
  );

  return rows.length > 0;
};

const isLegacySqliteDatabase = async (): Promise<boolean> => {
  const prisma = new PrismaClient();

  try {
    const hasMigrationsTable = await sqliteTableExists(
      prisma,
      '_prisma_migrations'
    );

    if (hasMigrationsTable) {
      return false;
    }

    const hasAnyAppTable = await sqliteTableExists(prisma, 'User');
    return hasAnyAppTable;
  } catch {
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

const recreateLegacySqlite = async (databasePath: string) => {
  const legacy = await isLegacySqliteDatabase();
  if (!legacy) {
    return;
  }

  const backupPath = `${databasePath}.legacy-${Date.now()}.bak`;
  fs.copyFileSync(databasePath, backupPath);

  removeIfExists(databasePath);
  removeIfExists(`${databasePath}-wal`);
  removeIfExists(`${databasePath}-shm`);

  console.warn(
    `[db:init] Legacy SQLite schema detected. Database was recreated from migrations. Backup: ${backupPath}`
  );
};

const ensureSqliteFileExists = (databasePath: string) => {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  if (!fs.existsSync(databasePath)) {
    fs.closeSync(fs.openSync(databasePath, 'a'));
  }
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const sqlitePath = resolveSqlitePath(databaseUrl);

  console.log('[db:init] DATABASE_URL =', databaseUrl);

  if (sqlitePath && fs.existsSync(sqlitePath)) {
    await recreateLegacySqlite(sqlitePath);
  }

  if (sqlitePath) {
    ensureSqliteFileExists(sqlitePath);
  }

  runPrisma(['migrate', 'deploy']);
  runPrisma(['db', 'seed']);
}

main().catch((error) => {
  console.error('[db:init] Failed to initialize database', error);
  process.exitCode = 1;
});
