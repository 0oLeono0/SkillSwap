import { userRepository } from '../repositories/userRepository.js';
import { sanitizeUser, type SanitizedUser } from './userService.js';
import { createBadRequest, createNotFound } from '../utils/httpErrors.js';
import { isUserRole, type UserRole, USER_ROLE } from '../types/userRole.js';

const ensureUser = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw createNotFound('User not found');
  }
  return user;
};

export const adminService = {
  async deleteUser(userId: string): Promise<void> {
    const user = await ensureUser(userId);
    if (isUserRole(user.role) && user.role === USER_ROLE.owner) {
      throw createBadRequest('Owner account cannot be deleted');
    }
    await userRepository.deleteById(userId);
  },

  async updateUserRole(userId: string, role: UserRole): Promise<SanitizedUser> {
    const user = await ensureUser(userId);

    if (user.role === USER_ROLE.owner) {
      throw createBadRequest('Owners cannot be reassigned');
    }

    if (role === USER_ROLE.owner) {
      throw createBadRequest('Assigning owner role is not allowed');
    }

    if (user.role === role) {
      const sanitized = sanitizeUser(user);
      if (!sanitized) {
        throw createNotFound('User not found');
      }
      return sanitized;
    }

    const updated = await userRepository.updateById(userId, { role });
    const sanitized = sanitizeUser(updated);
    if (!sanitized) {
      throw createNotFound('User not found');
    }
    return sanitized;
  }
};
