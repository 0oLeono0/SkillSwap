/* eslint-env node */
/* global process, console, setTimeout */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

const require = createRequire(import.meta.url);
const { getBinaryTargetForCurrentPlatform, getNodeAPIName } = require('@prisma/get-platform');
const { enginesVersion } = require('@prisma/engines-version');

const pipelineAsync = promisify(pipeline);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const envPath = path.join(backendDir, '.env');
const examplePath = path.join(backendDir, '.env.example');
const enginesDir = path.join(backendDir, 'node_modules', '@prisma', 'engines');

function ensureEnv() {
  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
  }
}

async function downloadAndExtract(url, destination) {
  const responseStream = await new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`GET ${url} -> ${res.statusCode}`));
          return;
        }
        resolve(res);
      })
      .on('error', reject);
  });

  await pipelineAsync(responseStream, createGunzip(), fs.createWriteStream(destination));
}

async function ensureEngineFiles(binaryTarget) {
  if (!fs.existsSync(enginesDir)) {
    fs.mkdirSync(enginesDir, { recursive: true });
  }

  const ext = process.platform === 'win32' ? '.exe' : '';
  const queryEngineBinary = path.join(enginesDir, `query-engine-${binaryTarget}${ext}`);
  const schemaEngineBinary = path.join(enginesDir, `schema-engine-${binaryTarget}${ext}`);
  const queryEngineLibrary = path.join(enginesDir, getNodeAPIName(binaryTarget, 'fs'));

  const downloads = [
    {
      target: queryEngineBinary,
      downloadName: `query-engine${ext}.gz`,
    },
    {
      target: schemaEngineBinary,
      downloadName: `schema-engine${ext}.gz`,
    },
    {
      target: queryEngineLibrary,
      downloadName: `${getNodeAPIName(binaryTarget, 'url')}.gz`,
    },
  ];

  for (const { target, downloadName } of downloads) {
    if (fs.existsSync(target)) {
      continue;
    }

    const baseUrl = process.env.PRISMA_ENGINES_MIRROR || 'https://binaries.prisma.sh';
    const url = `${baseUrl}/all_commits/${enginesVersion}/${binaryTarget}/${downloadName}`;

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt += 1) {
      try {
        await downloadAndExtract(url, target);
        success = true;
      } catch (error) {
        if (attempt === 3) {
          console.warn(`Не удалось скачать ${downloadName} (${error.message}).`);
        } else {
          const waitMs = attempt * 1000;
          console.warn(`Попытка ${attempt} не удалась, повтор через ${waitMs} мс...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
    }

    if (!success) {
      console.warn(`Файл ${downloadName} отсутствует. Prisma может попытаться скачать его самостоятельно.`);
    }
  }

  return { queryEngineBinary, schemaEngineBinary, queryEngineLibrary };
}

function runPrismaGenerate(envOverrides) {
  const prismaBin = path.join(
    backendDir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
  );

  if (!fs.existsSync(prismaBin)) {
    console.warn('Prisma CLI не найден (возможно, devDependencies не установлены). Пропускаю prisma generate.');
    return;
  }

  const result = spawnSync(prismaBin, ['generate'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: envOverrides,
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error('Prisma generate завершился с ошибкой. Исправьте проблему и запустите `npx prisma generate` вручную.');
    if (result.error) {
      console.error(result.error);
    }
    process.exit(result.status ?? 1);
  }
}

function runDbInit(envOverrides) {
  const tsxBin = path.join(
    backendDir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
  );

  if (!fs.existsSync(tsxBin)) {
    console.warn('tsx не найден (возможно, devDependencies не установлены). Пропускаю init-db.');
    return;
  }

  const result = spawnSync(tsxBin, ['scripts/init-db.ts'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: envOverrides,
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error('Инициализация БД не прошла. Проверьте переменные окружения и запустите `npx tsx scripts/init-db.ts` вручную.');
    process.exit(result.status ?? 1);
  }
}

async function main() {
  ensureEnv();
  const binaryTarget = await getBinaryTargetForCurrentPlatform();
  const binaries = await ensureEngineFiles(binaryTarget);
  const prismaEnv = {
    ...process.env,
    PRISMA_CLI_BINARY_TARGETS: binaryTarget,
    PRISMA_QUERY_ENGINE_BINARY: binaries.queryEngineBinary,
    PRISMA_SCHEMA_ENGINE_BINARY: binaries.schemaEngineBinary,
    PRISMA_QUERY_ENGINE_LIBRARY: binaries.queryEngineLibrary,
  };

  runPrismaGenerate(prismaEnv);
  runDbInit(prismaEnv);
}

main().catch((error) => {
  console.error('postinstall завершился с ошибкой:', error);
  process.exit(1);
});
