// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import { registroRouter } from './modules/registro/registro.router.js';
import { ponentesRouter } from './modules/ponentes/ponentes.router.js';
import { infoRouter } from './modules/info/info.router.js';
import { errorHandler } from './core/middlewares/errorHandler.js';
import { rateLimitMiddleware } from './core/middlewares/rateLimitMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '../../frontend');

export const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitMiddleware);

// Servir frontend estático y assets
app.use(express.static(FRONTEND_DIR));

// Módulos API
app.use('/api/registro', registroRouter);
app.use('/api/ponentes', ponentesRouter);
app.use('/api/info', infoRouter);

// Fallback a frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.use(errorHandler);

