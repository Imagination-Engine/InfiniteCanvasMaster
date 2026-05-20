import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const RefinerInput: z.ZodObject<
  {
    text: z.ZodString;
    style: z.ZodEnum<["formal", "casual", "academic", "marketing", "poetic"]>;
  },
  "strip",
  z.ZodTypeAny,
  {
    text: string;
    style: "formal" | "casual" | "academic" | "marketing" | "poetic";
  },
  {
    text: string;
    style: "formal" | "casual" | "academic" | "marketing" | "poetic";
  }
>;
export declare const RefinerOutput: z.ZodObject<
  {
    text: z.ZodString;
    model: z.ZodString;
    latencyMs: z.ZodNumber;
  },
  "strip",
  z.ZodTypeAny,
  {
    model: string;
    text: string;
    latencyMs: number;
  },
  {
    model: string;
    text: string;
    latencyMs: number;
  }
>;
export declare const refinerBlock: BlockDefinition<
  typeof RefinerInput,
  typeof RefinerOutput
>;
//# sourceMappingURL=refiner.d.ts.map
