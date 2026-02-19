import { z } from 'zod';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const nonBlankString = z
  .string()
  .refine((value) => value.trim().length > 0, 'Expected non-empty string');

export const apiMockUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  password: nonBlankString,
  avatarUrl: z.string().url(),
  name: nonBlankString,
  city: nonBlankString,
  birthDate: z.string().regex(isoDatePattern, 'Expected YYYY-MM-DD'),
  gender: nonBlankString,
  bio: nonBlankString,
  teachableSkills: z.array(z.number().int().positive()),
  learningSkills: z.array(z.number().int().positive())
});

export const apiMockSubskillSchema = z.object({
  id: z.number().int().positive(),
  name: nonBlankString
});

export const apiMockSkillGroupSchema = z.object({
  id: z.number().int().positive(),
  name: nonBlankString,
  subskills: z.array(apiMockSubskillSchema).optional()
});

export const apiMockCitySchema = z.object({
  id: z.number().int().positive(),
  name: nonBlankString
});

export const apiMockDataSchema = z.object({
  users: z.array(apiMockUserSchema),
  skills: z.array(apiMockSkillGroupSchema),
  cities: z.array(apiMockCitySchema)
});

export type ApiMockUser = z.infer<typeof apiMockUserSchema>;
export type ApiMockSubskill = z.infer<typeof apiMockSubskillSchema>;
export type ApiMockSkillGroup = z.infer<typeof apiMockSkillGroupSchema>;
export type ApiMockCity = z.infer<typeof apiMockCitySchema>;
export type ApiMockData = z.infer<typeof apiMockDataSchema>;
