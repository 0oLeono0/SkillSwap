# Backend Overview

## Stack Choice
- **Runtime**: Node.js 22 (matches modern LTS, already available in project scripts).
- **Framework**: Express 5 (minimalistic HTTP layer, easy integration with existing front-end).
- **Language**: TypeScript (consistency with front-end codebase, static typing).
- **ORM**: Prisma with SQLite for local development (file-based DB → true relational model; later switchable to PostgreSQL by changing connection string and running migrations).
- **Auth**: bcrypt for password hashing, JSON Web Tokens for stateless sessions (access token via `Authorization` header, refresh token stored as HTTP-only cookie).
- **Env management**: dotenv for configuration keys (`DATABASE_URL`, `JWT_SECRET` etc.).

## Service Layout
```
backend/
  src/
    app.ts            # Express app wiring (routes, middlewares).
    server.ts         # Entry point that starts HTTP server.
    routes/
      auth.ts         # /api/auth endpoints (register, login, refresh, logout).
    controllers/
      authController.ts
    services/
      authService.ts
      tokenService.ts
    repositories/
      userRepository.ts
    middleware/
      authMiddleware.ts
    utils/
      validators.ts   # Zod schemas for request validation.
  prisma/
    schema.prisma     # DB schema for User, RefreshToken tables.
  package.json
  tsconfig.json
  .env (local secrets)
```

## Integration Notes
- Front-end `AuthProvider` будет отправлять запросы на `backend` (`/api/auth/login`, `/api/auth/register`) и хранить только access-token в памяти.
- Protected маршруты получат access-token через контекст и будут прикладывать его в `Authorization` заголовок.
- Refresh токен автоматически продлевается через `Set-Cookie` HTTP-only.

## Verification
1. Открыть файл, убедиться, что структура понятна.
2. При необходимости скорректировать стек до начала реализации последующих шагов.
