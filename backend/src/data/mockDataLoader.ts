import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiMockDataSchema, type ApiMockData } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOCK_DATA_PATH = path.resolve(__dirname, 'mockData.json');

let cachedData: ApiMockData | null = null;

const readMockDataFile = () => {
  const fileContents = fs.readFileSync(MOCK_DATA_PATH, 'utf8');

  if (fileContents.includes('\uFFFD')) {
    throw new Error(
      '[mockData] Invalid UTF-8 sequence detected in mockData.json'
    );
  }

  return JSON.parse(fileContents) as unknown;
};

const parseMockData = (payload: unknown): ApiMockData => {
  const parsed = apiMockDataSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(
      `[mockData] mockData.json is invalid: ${parsed.error.message}`
    );
  }

  return parsed.data;
};

export const loadMockData = (): ApiMockData => {
  if (cachedData) {
    return cachedData;
  }

  cachedData = parseMockData(readMockDataFile());
  return cachedData;
};
