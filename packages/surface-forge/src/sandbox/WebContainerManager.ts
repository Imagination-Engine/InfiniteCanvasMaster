import { BlackboardState } from '../state/BlackboardManager';

// Minimal interface to represent the WebContainer API we need
export interface IWebContainer {
  mount(tree: Record<string, any>): Promise<void>;
  spawn(command: string, args: string[]): Promise<{ exit: Promise<number> }>;
  on?(event: 'server-ready', callback: (port: number, url: string) => void): void;
}

export class WebContainerManager {
  constructor(private container: IWebContainer) {}

  private mapStateToFilesystem(state: BlackboardState) {
    const tree: Record<string, any> = {};
    for (const [filename, contents] of Object.entries(state.code || {})) {
      tree[filename] = { file: { contents } };
    }
    return tree;
  }

  async compile(state: BlackboardState): Promise<void> {
    const tree = this.mapStateToFilesystem(state);
    await this.container.mount(tree);

    // Simulate standard npm install
    const process = await this.container.spawn('npm', ['install']);
    const exitCode = await process.exit;
    if (exitCode !== 0) {
      throw new Error('Installation failed');
    }
  }

  async compileWithTimeout(state: BlackboardState, timeoutMs: number): Promise<void> {
    return Promise.race([
      this.compile(state),
      new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Compilation timeout')), timeoutMs)
      )
    ]);
  }
}