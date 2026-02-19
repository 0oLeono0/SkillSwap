import type { ApiMockData } from './types.js';
import { loadMockData } from './mockDataLoader.js';

export const db: ApiMockData = loadMockData();
