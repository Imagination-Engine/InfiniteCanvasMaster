export interface ManuscriptChapter {
  title?: string;
  content: string; // HTML string from Tiptap
}

export class ExportPipeline {
  constructor(
    private epubGenerator: (chapters: ManuscriptChapter[]) => Promise<any>,
    private pdfGenerator: (chapters: ManuscriptChapter[]) => Promise<any>,
    private htmlGenerator: (chapters: ManuscriptChapter[]) => string
  ) {}

  async exportEpub(chapters: ManuscriptChapter[]) {
    if (chapters.length === 0) throw new Error('Cannot export empty manuscript');
    return this.epubGenerator(chapters);
  }

  async exportPdf(chapters: ManuscriptChapter[]) {
    if (chapters.length === 0) throw new Error('Cannot export empty manuscript');
    return this.pdfGenerator(chapters);
  }

  async exportWeb(chapters: ManuscriptChapter[]) {
    if (chapters.length === 0) throw new Error('Cannot export empty manuscript');
    return this.htmlGenerator(chapters);
  }
}