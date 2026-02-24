export type SourceMode = "DEMO" | "PLAID";

export interface LocalSession {
  name: string;
  email: string;
  sourceMode: SourceMode;
  loggedInAt: string;
}
