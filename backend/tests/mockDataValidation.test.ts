import { describe, expect, it } from '@jest/globals';
import { validateMockData } from '../src/data/validateMockData.js';
import type { ApiMockData } from '../src/data/types.js';
import { db } from '../src/data/mockData.js';

const buildBaseMockData = (): ApiMockData => ({
  users: [
    {
      id: 1,
      email: 'user@example.com',
      password: 'password',
      avatarUrl: 'https://example.com/avatar.jpg',
      name: 'User',
      city: 'Moscow',
      birthDate: '1990-01-01',
      gender: 'Male',
      bio: 'Bio',
      teachableSkills: [11],
      learningSkills: [12]
    }
  ],
  skills: [
    {
      id: 1,
      name: 'Business',
      subskills: [
        { id: 11, name: 'Team management' },
        { id: 12, name: 'Marketing' }
      ]
    }
  ],
  cities: [
    {
      id: 1,
      name: 'Moscow'
    }
  ]
});

describe('validateMockData', () => {
  it('accepts current project mock data', () => {
    expect(() => validateMockData(db)).not.toThrow();
  });

  it('throws on duplicate user email', () => {
    const data = buildBaseMockData();
    const [firstUser] = data.users;
    if (!firstUser) {
      throw new Error('Fixture user is missing');
    }
    data.users.push({
      ...firstUser,
      id: 2
    });

    expect(() => validateMockData(data)).toThrow(/users\.email/);
  });

  it('throws when user references unknown city', () => {
    const data = buildBaseMockData();
    const [firstUser] = data.users;
    if (!firstUser) {
      throw new Error('Fixture user is missing');
    }
    firstUser.city = 'Unknown city';

    expect(() => validateMockData(data)).toThrow(/unknown city/i);
  });

  it('throws when user references unknown skill id', () => {
    const data = buildBaseMockData();
    const [firstUser] = data.users;
    if (!firstUser) {
      throw new Error('Fixture user is missing');
    }
    firstUser.teachableSkills = [999];

    expect(() => validateMockData(data)).toThrow(/teachableSkills/);
  });

  it('throws when one skill is both teachable and learning', () => {
    const data = buildBaseMockData();
    const [firstUser] = data.users;
    if (!firstUser) {
      throw new Error('Fixture user is missing');
    }
    firstUser.learningSkills = [11];

    expect(() => validateMockData(data)).toThrow(
      /both teachableSkills and learningSkills/
    );
  });

  it('throws when required text fields are blank', () => {
    const data = buildBaseMockData();
    const [firstCity] = data.cities;
    if (!firstCity) {
      throw new Error('Fixture city is missing');
    }
    firstCity.name = '   ';

    expect(() => validateMockData(data)).toThrow(/schema validation failed/i);
  });
});
