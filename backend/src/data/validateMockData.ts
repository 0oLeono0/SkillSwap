import type { ApiMockData } from './types.js';
import { apiMockDataSchema } from './types.js';

const buildDuplicatesList = (values: Array<string | number>) => {
  const counts = new Map<string | number, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([value]) => String(value));
};

const uniqueBy = <T>(
  values: T[],
  toKey: (value: T) => string | number,
  label: string
) => {
  const duplicates = buildDuplicatesList(values.map(toKey));
  if (duplicates.length === 0) {
    return [];
  }

  return [`${label}: duplicate values [${duplicates.join(', ')}]`];
};

const validateUserSkillLinks = (data: ApiMockData) => {
  const issues: string[] = [];
  const skillIds = new Set(
    data.skills.flatMap((group) =>
      (group.subskills ?? []).map((skill) => skill.id)
    )
  );

  data.users.forEach((user) => {
    const unknownTeachable = user.teachableSkills.filter(
      (id) => !skillIds.has(id)
    );
    const unknownLearning = user.learningSkills.filter(
      (id) => !skillIds.has(id)
    );
    const duplicateSkillIds = user.teachableSkills.filter((id) =>
      user.learningSkills.includes(id)
    );

    if (unknownTeachable.length > 0) {
      issues.push(
        `users[id=${user.id}].teachableSkills contains unknown ids [${unknownTeachable.join(', ')}]`
      );
    }

    if (unknownLearning.length > 0) {
      issues.push(
        `users[id=${user.id}].learningSkills contains unknown ids [${unknownLearning.join(', ')}]`
      );
    }

    if (duplicateSkillIds.length > 0) {
      issues.push(
        `users[id=${user.id}] has skills in both teachableSkills and learningSkills [${duplicateSkillIds.join(', ')}]`
      );
    }
  });

  return issues;
};

const validateUserCities = (data: ApiMockData) => {
  const cityNames = new Set(data.cities.map((city) => city.name));

  return data.users
    .filter((user) => !cityNames.has(user.city))
    .map(
      (user) =>
        `users[id=${user.id}].city references unknown city "${user.city}"`
    );
};

export const validateMockData = (data: ApiMockData) => {
  const parsedSchema = apiMockDataSchema.safeParse(data);
  if (!parsedSchema.success) {
    throw new Error(
      `Mock data schema validation failed:\n- ${parsedSchema.error.message}`
    );
  }

  const normalizedData = parsedSchema.data;

  const issues = [
    ...uniqueBy(normalizedData.users, (user) => user.id, 'users.id'),
    ...uniqueBy(normalizedData.users, (user) => user.email, 'users.email'),
    ...uniqueBy(normalizedData.cities, (city) => city.id, 'cities.id'),
    ...uniqueBy(normalizedData.cities, (city) => city.name, 'cities.name'),
    ...uniqueBy(normalizedData.skills, (group) => group.id, 'skills.id'),
    ...uniqueBy(normalizedData.skills, (group) => group.name, 'skills.name'),
    ...uniqueBy(
      normalizedData.skills.flatMap((group) => group.subskills ?? []),
      (skill) => skill.id,
      'skills.subskills.id'
    ),
    ...validateUserCities(normalizedData),
    ...validateUserSkillLinks(normalizedData)
  ];

  if (issues.length > 0) {
    const details = issues.map((issue) => `- ${issue}`).join('\n');
    throw new Error(`Mock data validation failed:\n${details}`);
  }
};
