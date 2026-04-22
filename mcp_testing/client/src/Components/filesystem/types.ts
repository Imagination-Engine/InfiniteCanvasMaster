export type FileSystemNodeKind = "file" | "folder";

export type FileSystemNodeData = {
  id: string;
  name: string;
  type: FileSystemNodeKind;
  content?: string;
  parentId?: string;
  path: string;
  isEmpty?: boolean;
  width?: number;
  height?: number;
  onChooseFiles?: (nodeId: string) => void;
  onChooseFolder?: (nodeId: string) => void;
};

export type AnalyzeFileInput = {
  name: string;
  path: string;
  content: string;
};

export type AnalyzeResponse = {
  summary: string;
  connections: string;
  keyTerms: string;
  organization: string;
};

