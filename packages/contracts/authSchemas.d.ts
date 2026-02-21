import { z } from 'zod';
import type {
  ApiUserSkill,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload
} from './auth';

export declare const apiUserSkillSchema: z.ZodType<ApiUserSkill>;
export declare const loginPayloadSchema: z.ZodType<LoginPayload>;
export declare const registerPayloadSchema: z.ZodType<RegisterPayload>;
export declare const updateProfilePayloadSchema: z.ZodType<UpdateProfilePayload>;
