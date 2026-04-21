import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupTriggers } from './triggerListeners';

describe('Trigger Listeners (Red/Green Phase)', () => {
  const mockSchedulerRun = vi.fn().mockResolvedValue({ status: 'success' });
  
  const app = express();
  app.use(express.json());
  
  setupTriggers(app, mockSchedulerRun);

  it('handles webhook triggers by starting a canvas execution', async () => {
    const payload = { key: 'value' };
    
    const response = await request(app)
      .post('/api/trigger/webhook/my_canvas_123')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'success', executionStarted: true });
    
    expect(mockSchedulerRun).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasId: 'my_canvas_123',
        payload
      })
    );
  });

  it('rejects webhooks without canvasId', async () => {
    const response = await request(app)
      .post('/api/trigger/webhook/');

    expect(response.status).toBe(404);
  });
  
  // Minimal unit test for the schedule endpoint (though typically schedules are cron jobs, 
  // an API to manually invoke scheduled workflows is useful for testing)
  it('handles manual schedule trigger invocations', async () => {
    const response = await request(app)
      .post('/api/trigger/schedule/my_canvas_456');

    expect(response.status).toBe(200);
    expect(mockSchedulerRun).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasId: 'my_canvas_456',
        source: 'schedule'
      })
    );
  });

  it('adversarial: handles underlying scheduler failure gracefully', async () => {
    const errorSchedulerRun = vi.fn().mockRejectedValue(new Error('Scheduler exploded'));
    const errorApp = express();
    errorApp.use(express.json());
    setupTriggers(errorApp, errorSchedulerRun);

    const response = await request(errorApp)
      .post('/api/trigger/webhook/my_canvas_fail')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to start execution');
  });
});