import { Hono } from 'hono';
import { healthRouter } from './routes/health';

const app = new Hono();

app.route('/api/health', healthRouter);

export { app };