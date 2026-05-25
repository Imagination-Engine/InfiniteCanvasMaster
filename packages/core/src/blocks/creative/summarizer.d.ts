import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const SummarizerInput: z.ZodObject<
  {
    text: z.ZodOptional<z.ZodString>;
    sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    additionalInstructions: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  {
    sources?: string[] | undefined;
    text?: string | undefined;
    additionalInstructions?: string | undefined;
  },
  {
    sources?: string[] | undefined;
    text?: string | undefined;
    additionalInstructions?: string | undefined;
  }
>;
export declare const SummarizerOutput: z.ZodObject<
  {
    summary: z.ZodString;
    analysis: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    summary: string;
    analysis: string;
  },
  {
    summary: string;
    analysis: string;
  }
>;
export declare const summarizerBlock: BlockDefinition<
  typeof SummarizerInput,
  typeof SummarizerOutput
>;
//# sourceMappingURL=summarizer.d.ts.map
