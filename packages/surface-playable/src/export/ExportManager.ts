export class ExportManager {
  static generateArtifactUrl(canvasId: string): string {
    if (!canvasId) {
      throw new Error('Canvas ID cannot be empty');
    }
    const baseUrl = window?.location?.origin || 'http://localhost:3000';
    return `${baseUrl}/play/${canvasId}`;
  }

  static generateInviteLink(canvasId: string): string {
    if (!canvasId) {
      throw new Error('Canvas ID cannot be empty');
    }
    const baseUrl = window?.location?.origin || 'http://localhost:3000';
    return `${baseUrl}/join/${canvasId}`;
  }
}