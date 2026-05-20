import { z } from "zod";
import type { BlockDefinition } from "./protocol";
export declare function createMagnificentBlock(config: {
  id: string;
  name: string;
  description: string;
  category: "creative" | "knowledge" | "forge" | "media" | "uncategorized";
  systemPrompt: string;
  inputSchema: z.ZodObject<any, any>;
  outputSchema: z.ZodObject<any, any>;
}): BlockDefinition<any, any>;
export declare function generateCoreCapabilities(): void;
//# sourceMappingURL=factory.d.ts.map
