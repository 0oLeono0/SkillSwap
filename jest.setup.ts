import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  // @ts-expect-error Node's TextDecoder signature differs but is compatible for tests
  globalThis.TextDecoder = TextDecoder;
}
