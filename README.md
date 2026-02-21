# SkillSwap — платформа обмена навыками

## Быстрый старт (dev)
- `npm install` в корне (устанавливает зависимости корня, `backend` и `packages/*`).
- `npm run backend:db:init` (Prisma migrate + seed).
- Запуск в двух терминалах: `npm run backend:dev` и `npm run dev`.
- Настройки можно менять в `.env` и `backend/.env` (создаются при установке, если их нет).


SkillSwap — веб‑приложение, где пользователи находят наставников, публикуют свои навыки, договариваются об обменах и ведут диалог в профиле. Фронтенд построен по FSD, бэкенд — на Express + Prisma.

## Основные возможности
- Каталог навыков с поиском, фильтрами по категориям и городам.
- Детальная страница навыка с описанием, отзывами и быстрыми действиями.
- Личный кабинет: персональные данные, заявки, обмены, избранное, управление навыками, админ‑панель для владельца.
- Многошаговая регистрация/авторизация, защита роутов через `ProtectedRoute`, сессия с access/refresh токенами.
- Избранное и заявки доступны через провайдеры и работают из любого места приложения.
- Переключение темы (light/dark) с запоминанием выбора и реакцией на `prefers-color-scheme`.
- Storybook для UI и Jest + Testing Library для тестов.

## Архитектура
```
backend/                 # Express API + Prisma
packages/contracts/      # Общие типы и Zod-схемы API-контрактов
src/                     # Фронтенд (FSD)
  app/       # Точка входа, глобальные стили, Layoutы, провайдеры, роутер
  pages/     # Страницы (Catalog, Auth, Profile, SkillDetails, ошибки)
  widgets/   # Крупные блоки (Header, Footer и др.)
  features/  # Пользовательские сценарии (фильтры, поиск, заявки)
  entities/  # Бизнес-сущности (пользователь, навыки и т.п.)
  shared/    # UI-кит, утилиты, константы, стили, API-клиенты
```

## Технологии
- **Фронтенд:** React 19, TypeScript, React Router 7, Axios, Vite 5, CSS Modules/SCSS, Storybook 9, Jest + @testing-library/react, ESLint (Airbnb, TS) + Prettier.
- **Бэкенд:** Node.js 22, Express 5, TypeScript, Prisma + SQLite (локально), JWT (access/refresh), bcrypt, Zod.
- **Контракты:** workspace-пакет `@skillswap/contracts` (общие типы и runtime-схемы).

## Переменные окружения
Файлы уже в репозитории и безопасны для публикации:
- `/.env` и `/.env.example` - фронтенд (`VITE_API_URL`).
- `/backend/.env` и `/backend/.env.example` - бэкенд (порт, CORS, БД, JWT, bcrypt, rate limit, Redis).

Если `REDIS_URL` не задан, лимиты хранятся в памяти процесса. Пример: `REDIS_URL="redis://localhost:6379"`.

Пример фронтенда (`.env`):
```
VITE_API_URL="http://localhost:4000/api"
```

Пример бэкенда (`backend/.env`):
```
PORT=4000
CLIENT_ORIGIN="http://localhost:5173,http://localhost:5174"
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="replace-with-strong-access-secret"
JWT_REFRESH_SECRET="replace-with-strong-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_LOGIN_WINDOW_MS=60000
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_REGISTER_WINDOW_MS=600000
RATE_LIMIT_REGISTER_MAX=3
RATE_LIMIT_REFRESH_WINDOW_MS=60000
RATE_LIMIT_REFRESH_MAX=10
REDIS_URL=""
```

## Быстрый старт
1. Клонируйте репозиторий и установите зависимости:
   ```bash
   git clone https://github.com/0oLeono0/SkillSwap.git
   cd skill-swap
   npm install
   ```
2. При необходимости поправьте `/.env` (например, если API запущен на другом хосте/порту).
3. Инициализируйте БД бэкенда:
   ```bash
   npm run backend:db:init
   ```
4. Запустите бэкенд:
   ```bash
   npm run backend:dev
   ```
5. Запустите фронтенд из корня:
   ```bash
   npm run dev
   ```
6. Откройте `http://localhost:5173`. Storybook — `http://localhost:6006` после `npm run storybook`.

## Скрипты
**Корень:**
- `npm run dev` — локальная разработка.
- `npm run build` — сборка (tsc + Vite).
- `npm run preview` — превью собранного билда.
- `npm run lint` — ESLint.
- `npm run check` — полный quality-check фронтенда (lint + test + build).
- `npm run check:backend` / `npm run backend:check` — backend quality-check из корня.
- `npm run check:all` — полный прогон фронтенда и бэкенда.
- `npm run backend:dev` — запуск backend dev-сервера.
- `npm run backend:build` — сборка backend.
- `npm run backend:test` — запуск backend тестов.
- `npm run backend:db:init` — миграции + seed для backend.
- `npm run backend:db:seed` — повторный seed backend.
- `npm run backend:prisma:validate` — Prisma validate для backend.
- `npm test` / `npm run test:watch` — Jest.
- `npm run storybook` / `npm run build-storybook` — Storybook.

**Бэкенд (workspace):**
- `npm run --workspace backend dev` — Express с tsx watch.
- `npm run --workspace backend build` / `npm run --workspace backend start` — сборка и запуск из `dist`.
- `npm run --workspace backend check` — backend quality-check (test + build).
- `npm run --workspace backend db:init` — инициализация БД через `prisma migrate deploy` + `prisma db seed`.
- `npm run --workspace backend db:seed` — повторный запуск сидов Prisma.
- `npm run --workspace backend prisma:generate` — генерация Prisma Client.
- `npm run --workspace backend test` / `npm run --workspace backend test:watch` — Jest + Supertest.

**Бэкенд (альтернатива через `cd backend`):**
- `npm run dev` — Express с tsx watch.
- `npm run build` / `npm start` — сборка и запуск из `dist`.
- `npm run check` — backend quality-check (test + build).
- `npm run db:init` — инициализация БД через `prisma migrate deploy` + `prisma db seed`.
- `npm run db:seed` — повторный запуск сидов Prisma.
- `npm run prisma:generate` — генерация Prisma Client.
- `npm test` / `npm run test:watch` — Jest + Supertest.

## CI
- GitHub Actions workflow: `.github/workflows/ci.yml`.
- `frontend` job запускает `npm run check`.
- `backend` job проверяет Prisma (`prisma validate`, `prisma migrate deploy`) и запускает `npm run --workspace backend check`.
