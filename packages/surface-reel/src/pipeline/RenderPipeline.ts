export interface SceneRenderInfo {
  id: string;
  imageUrl?: string;
  dialogueUrl?: string;
  durationMs: number;
}

export interface RenderOptions {
  scenes: SceneRenderInfo[];
  outputFileName: string;
}

export type FfmpegProcessFunction = (
  options: RenderOptions, 
  onProgress: (percent: number) => void
) => Promise<string>;

export class RenderPipeline {
  private progressListeners: Array<(percent: number) => void> = [];

  constructor(private ffmpegProcess: FfmpegProcessFunction) {}

  on(event: 'progress', callback: (percent: number) => void) {
    if (event === 'progress') {
      this.progressListeners.push(callback);
    }
  }

  async render(options: RenderOptions): Promise<string> {
    if (!options.scenes || options.scenes.length === 0) {
      throw new Error('No scenes provided for rendering');
    }

    for (const scene of options.scenes) {
      if (scene.durationMs <= 0) {
        throw new Error(`Scene duration must be strictly positive (scene: ${scene.id})`);
      }
      if (!scene.imageUrl) {
        throw new Error(`Scene missing required media asset (imageUrl) (scene: ${scene.id})`);
      }
    }

    return this.ffmpegProcess(options, (percent) => {
      this.progressListeners.forEach(listener => listener(percent));
    });
  }
}