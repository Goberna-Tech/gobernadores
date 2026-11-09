import { Router } from 'express';
import { PonentesController } from './ponentes.controller.js';

export const ponentesRouter = Router();

ponentesRouter.get('/', PonentesController.getList);
ponentesRouter.get('/:id', PonentesController.getById);

