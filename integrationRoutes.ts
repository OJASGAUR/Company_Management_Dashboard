import { Router } from 'express';
import { integrationController } from '../controllers/integrationController';

export const integrationRoutes = Router();

// provider = 'google' | 'outlook'
integrationRoutes.get('/:provider/connect', integrationController.connect);
integrationRoutes.get('/:provider/callback', integrationController.callback);
integrationRoutes.post('/:provider/sync', integrationController.sync);
