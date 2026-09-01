import 'dotenv/config';
import express from 'express';
import { eventRoutes } from './routes/eventRoutes';
import { integrationRoutes } from './routes/integrationRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/events', eventRoutes);
app.use('/integrations', integrationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Calendar API listening on port ${PORT}`));
