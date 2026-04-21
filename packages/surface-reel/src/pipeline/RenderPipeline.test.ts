import { describe, it, expect, vi } from 'vitest';
import { RenderPipeline, RenderOptions } from './RenderPipeline';

describe('MP4 Render Pipeline (Red/Green Phase)', () => {
  it('orchestrates rendering by calling ffmpeg with ordered scenes', async () => {
    const mockFfmpegProcess = vi.fn().mockImplementation(async (opts) => opts.outputFileName);
    const pipeline = new RenderPipeline(mockFfmpegProcess);
    
    const options: RenderOptions = {
      scenes: [
        { id: '1', imageUrl: 'a.png', durationMs: 2000 },
        { id: '2', imageUrl: 'b.png', durationMs: 3000 }
      ],
      outputFileName: 'test.mp4'
    };

    const result = await pipeline.render(options);
    expect(result).toBe('test.mp4');
    expect(mockFfmpegProcess).toHaveBeenCalled();
  });

  it('updates progress state during build', async () => {
    const mockFfmpegProcess = vi.fn().mockImplementation(async (opts, onProgress) => {
      onProgress(50);
      onProgress(100);
      return opts.outputFileName;
    });
    
    const pipeline = new RenderPipeline(mockFfmpegProcess);
    const progressCallback = vi.fn();
    
    pipeline.on('progress', progressCallback);
    await pipeline.render({ scenes: [{ id: '1', imageUrl: 'a.png', durationMs: 1000 }], outputFileName: 'test.mp4' });
    
    expect(progressCallback).toHaveBeenCalledWith(50);
    expect(progressCallback).toHaveBeenCalledWith(100);
  });

  describe('Adversarial Scenarios', () => {
    it('throws error if a scene has a zero or negative duration', async () => {
      const pipeline = new RenderPipeline(vi.fn());
      await expect(
        pipeline.render({ scenes: [{ id: '1', durationMs: 0 }], outputFileName: 'test.mp4' })
      ).rejects.toThrow('Scene duration must be strictly positive');
    });

    it('handles missing media assets gracefully', async () => {
      const pipeline = new RenderPipeline(vi.fn());
      // A scene with no image URL
      await expect(
        pipeline.render({ scenes: [{ id: '1', durationMs: 1000 }], outputFileName: 'test.mp4' })
      ).rejects.toThrow('Scene missing required media asset (imageUrl)');
    });
  });
});