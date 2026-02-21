import { describe, expect, it } from '@jest/globals';
import {
  parseNumberParamOrNotFound,
  requireStringParam
} from '../src/utils/routeParams.js';

describe('routeParams utils', () => {
  it('returns required string param when present', () => {
    const value = requireStringParam(
      { userId: 'user-1' },
      'userId',
      'Required'
    );
    expect(value).toBe('user-1');
  });

  it('throws bad request when required string param is missing', () => {
    expect(() =>
      requireStringParam({}, 'userId', 'User id is required')
    ).toThrow('User id is required');
  });

  it('parses numeric param when finite', () => {
    const value = parseNumberParamOrNotFound({ id: '42' }, 'id', 'Not found');
    expect(value).toBe(42);
  });

  it('throws not found when numeric param is invalid', () => {
    expect(() =>
      parseNumberParamOrNotFound({ id: 'abc' }, 'id', 'City not found')
    ).toThrow('City not found');
  });
});
