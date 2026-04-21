import { Express, Request, Response } from 'express';

export function setupTriggers(app: Express, runCanvas: (params: any) => Promise<any>) {
  app.post('/api/trigger/webhook/:canvasId', async (req: Request, res: Response) => {
    const { canvasId } = req.params;
    if (!canvasId) {
      return res.status(400).json({ error: 'Canvas ID required' });
    }

    try {
      await runCanvas({ canvasId, payload: req.body });
      res.status(200).json({ status: 'success', executionStarted: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start execution' });
    }
  });

  app.post('/api/trigger/schedule/:canvasId', async (req: Request, res: Response) => {
    const { canvasId } = req.params;
    try {
      await runCanvas({ canvasId, source: 'schedule' });
      res.status(200).json({ status: 'success', executionStarted: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start execution' });
    }
  });
}