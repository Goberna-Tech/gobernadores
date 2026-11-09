import { Router } from 'express';
import { InfoController } from './info.controller.js';

export const infoRouter = Router();

infoRouter.get('/', InfoController.getEventInfo);
infoRouter.get('/whatsapp', InfoController.getWhatsAppLink);

