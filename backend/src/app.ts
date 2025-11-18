import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { requestsRouter } from './routes/requests.js';
import { favoritesRouter } from './routes/favorites.js';
import { exchangesRouter } from './routes/exchanges.js';
import { adminRouter } from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { catalogRouter } from './routes/catalog.js';

export const app = express();

const allowedOrigins = new Set(config.clientOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/exchanges', exchangesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/catalog', catalogRouter);

app.use(errorHandler);
