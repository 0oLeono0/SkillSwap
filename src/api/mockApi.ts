import { db } from './mockData';
import type { User, City, SkillCategory } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ApiError extends Error {
  status: number;
}

const createError = (message: string, status: number): ApiError => {
  const error: ApiError = new Error(message) as ApiError;
  error.status = status;
  return error;
};

/**
 * API для работы с данными:
 * @example
 * const users = await api.getUsers();
 * const user = await api.getUserById(1);
 * const newUser = await api.registerUser({ email: "test@test.com", password: "123", name: "Test" });
 * const updatedUser = await api.updateUser(1, { name: "Новое имя" });
 * const loginedUser = await api.login({ email: "test@test.com", password: "123" });
 * ...
 */

export const api = {
  // ------------ users ------------
  async getUsers(): Promise<User[]> {
    await delay(200);
    return db.users;
  },

  async getUserById(id: number): Promise<User> {
    await delay(200);
    const user = db.users.find((user) => user.id === id);
    if (!user) {
      throw createError('Пользователь не найден', 404);
    }
    return user;
  },

  async registerUser(userData: Omit<User, 'id'>): Promise<User> {
    await delay(200);

    if (!userData.email || !userData.password) {
      throw createError('Email и пароль обязательны', 400);
    }

    const existingUser = db.users.find((user) => user.email === userData.email);
    if (existingUser) {
      throw createError('Пользователь уже существует', 409);
    }

    const newUser: User = {
      ...userData,
      id: Date.now()
    };

    db.users.push(newUser);
    return newUser;
  },

  async updateUser(
    id: User['id'],
    userData: Omit<Partial<User>, 'id'>
  ): Promise<User> {
    await delay(200);

    const userIndex = db.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw createError('Пользователь не найден', 404);
    }

    db.users[userIndex] = { ...db.users[userIndex], ...userData };
    return db.users[userIndex];
  },

  // ------------ login ------------

  async login(loginData: Pick<User, 'email' | 'password'>): Promise<User> {
    await delay(200);

    const user = db.users.find(
      (user) =>
        user.email === loginData.email && user.password === loginData.password
    );

    if (!user) {
      throw createError('Неверный email или пароль', 401);
    }

    return user;
  },

  // ------------ skills ------------

  async getSkills(): Promise<SkillCategory[]> {
    await delay(200);
    return db.skills;
  },

  async getSkillById(id: SkillCategory['id']): Promise<SkillCategory> {
    await delay(200);
    const skill = db.skills.find((skill) => skill.id === id);
    if (!skill) {
      throw createError('Навык не найден', 404);
    }
    return skill;
  },

  // ------------ cities ------------

  async getCities(): Promise<City[]> {
    await delay(200);
    return db.cities;
  },

  async getCityById(id: City['id']): Promise<City> {
    await delay(200);
    const city = db.cities.find((city) => city.id === id);
    if (!city) {
      throw createError('Город не найден', 404);
    }
    return city;
  }
};
