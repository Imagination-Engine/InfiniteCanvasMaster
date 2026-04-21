import { describe, it, expect, vi } from 'vitest';
import { ExportPipeline } from './ExportPipeline';

describe('ExportPipeline (Red/Green Phase)', () => {
  it('generates an EPUB file stream', async () => {
    const mockEpubGen = vi.fn().mockResolvedValue('buffer_epub');
    const pipeline = new ExportPipeline(mockEpubGen, vi.fn(), vi.fn());
    
    const result = await pipeline.exportEpub([{ content: 'Hello' }]);
    expect(result).toBe('buffer_epub');
    expect(mockEpubGen).toHaveBeenCalled();
  });

  it('generates a PDF file stream using Puppeteer mock', async () => {
    const mockPuppeteer = vi.fn().mockResolvedValue('buffer_pdf');
    const pipeline = new ExportPipeline(vi.fn(), mockPuppeteer, vi.fn());
    
    const result = await pipeline.exportPdf([{ content: 'Hello' }]);
    expect(result).toBe('buffer_pdf');
    expect(mockPuppeteer).toHaveBeenCalled();
  });

  it('generates a Static HTML web export', async () => {
    const mockHtmlGen = vi.fn().mockReturnValue('<html><body>Hello</body></html>');
    const pipeline = new ExportPipeline(vi.fn(), vi.fn(), mockHtmlGen);
    
    const result = await pipeline.exportWeb([{ content: 'Hello' }]);
    expect(result).toContain('<html>');
    expect(mockHtmlGen).toHaveBeenCalled();
  });

  it('adversarial: handles empty manuscript state', async () => {
    const pipeline = new ExportPipeline(vi.fn(), vi.fn(), vi.fn());
    
    await expect(pipeline.exportEpub([])).rejects.toThrow('Cannot export empty manuscript');
    await expect(pipeline.exportPdf([])).rejects.toThrow('Cannot export empty manuscript');
  });
});