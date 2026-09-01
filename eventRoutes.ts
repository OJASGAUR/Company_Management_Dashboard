import { Router } from 'express';
import { eventController } from '../controllers/eventController';

export const eventRoutes = Router();

eventRoutes.post('/', eventController.create);
eventRoutes.get('/', eventController.list);
eventRoutes.get('/:id', eventController.getById);
eventRoutes.put('/:id', eventController.update);
eventRoutes.delete('/:id', eventController.remove);
