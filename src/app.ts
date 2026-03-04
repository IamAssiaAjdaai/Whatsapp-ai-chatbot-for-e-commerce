import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';
import webhookRouter from './routes/webhook';
import { logger } from './utils/logger';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/', webhookRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error' });
});
