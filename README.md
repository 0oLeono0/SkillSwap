# SkillSwap — платформа обмена навыками

## Быстрый старт (dev)
- `npm install` в корне > `npm run dev` (frontend, .env копируется из .env.example при отсутствии).
- `cd backend && npm install` (автокопия backend/.env, Prisma generate, SQLite-схема) > `npm run dev`.
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

## Архитектура (FSD)
```
src/
  app/       # Точка входа, глобальные стили, Layoutы, провайдеры, роутер
  pages/     # Страницы (Catalog, Auth, Profile, SkillDetails, ошибки)
  widgets/   # Крупные блоки (Header, Footer и др.)
  features/  # Пользовательские сценарии (фильтры, поиск, заявки)
  entities/  # Бизнес-сущности (пользователь, навыки и т.п.)
  shared/    # UI-кит, утилиты, константы, стили
  api/       # HTTP‑клиенты, заглушки и типы
```

## Технологии
- **Фронтенд:** React 19, TypeScript, React Router 7, Axios, Vite 5, CSS Modules/SCSS, Storybook 9, Jest + @testing-library/react, ESLint (Airbnb, TS) + Prettier.
- **Бэкенд:** Node.js 22, Express 5, TypeScript, Prisma + SQLite (локально), JWT (access/refresh), bcrypt, Zod.

## Переменные окружения
Файлы уже в репозитории и безопасны для публикации:
- `/.env` и `/.env.example` — фронтенд (`VITE_API_URL`).
- `/backend/.env` и `/backend/.env.example` — бэкенд (порт, CORS, БД, JWT, bcrypt).

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
```

## Быстрый старт
1. Клонируйте репозиторий и установите фронтенд-зависимости:
   ```bash
   git clone https://github.com/0oLeono0/SkillSwap.git
   cd skill-swap
   npm install
   ```
2. При необходимости поправьте `/.env` (например, если API запущен на другом хосте/порту).
3. Поднимите бэкенд:
   ```bash
   cd backend
   npm install
   npm run db:init   # создаёт SQLite БД (для PostgreSQL используйте prisma migrate)
   npm run dev       # API на 4000
   ```
4. Запустите фронтенд из корня:
   ```bash
   npm run dev
   ```
5. Откройте `http://localhost:5173`. Storybook — `http://localhost:6006` после `npm run storybook`.

## Скрипты
**Фронтенд (корень):**
- `npm run dev` — локальная разработка.
- `npm run build` — сборка (tsc + Vite).
- `npm run preview` — превью собранного билда.
- `npm run lint` — ESLint.
- `npm test` / `npm run test:watch` — Jest.
- `npm run storybook` / `npm run build-storybook` — Storybook.

**Бэкенд (`cd backend`):**
- `npm run dev` — Express с tsx watch.
- `npm run build` / `npm start` — сборка и запуск из `dist`.
- `npm run db:init` — инициализация SQLite схемы SQL-скриптом.
- `npm run prisma:generate` — генерация Prisma Client.
- `npm test` / `npm run test:watch` — Jest + Supertest.
