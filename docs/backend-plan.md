# Обзор backend

## Текущая архитектура
Репозиторий использует workspace-структуру:

```
/
  backend/                 # Express API + Prisma
  packages/contracts/      # Общие API-контракты (типы + runtime-схемы)
  src/                     # Фронтенд-приложение
```

Backend разрабатывается и запускается из корня через workspace-команды:

- `npm run backend:dev`
- `npm run backend:test`
- `npm run backend:build`
- `npm run backend:db:init`

## Стек
- Runtime: Node.js 22
- Framework: Express 5
- Language: TypeScript
- ORM: Prisma (SQLite локально)
- Validation: Zod
- Auth: JWT access/refresh + httpOnly refresh-cookie

## Структура backend
```
backend/
  src/
    app.ts
    server.ts
    routes/
    controllers/
    services/
    repositories/
    middleware/
    utils/
    data/
  prisma/
  scripts/
  package.json
  tsconfig.json
```

## Контракты
Общие контракты находятся в `packages/contracts`:

- `auth.d.ts` — общие auth-типы запросов и ответов
- `authSchemas.js` — общие runtime Zod-схемы для валидации auth-запросов
- `authSchemas.d.ts` — типизированная поверхность схем

Backend-контроллеры импортируют схемы из:

- `@skillswap/contracts/authSchemas`

Frontend API-типизация импортирует типы из:

- `@skillswap/contracts/auth`

## Правила проектирования
1. Транспортные контракты хранятся в `packages/contracts`.
2. Не дублируйте auth-типы в папках frontend/backend.
3. Валидация входящих payload на backend должна использовать общие Zod-схемы.
4. При изменении контрактов обновляйте backend-тесты и frontend-использование в одном PR.

## Чек-лист проверки
1. `npm run backend:test`
2. `npm run backend:build`
3. `npm run check`
