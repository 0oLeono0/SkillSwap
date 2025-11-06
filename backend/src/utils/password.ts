import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, config.bcryptSaltRounds);
};

export const verifyPassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
