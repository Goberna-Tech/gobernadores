import { Router } from 'express';
import { RegistroController } from './registro.controller.js';

export const registroRouter = Router();

registroRouter.post('/', RegistroController.register);
registroRouter.get('/stats', RegistroController.getStats);

