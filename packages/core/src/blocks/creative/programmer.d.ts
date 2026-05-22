import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const ProgrammerInput: z.ZodObject<
  {
    prompt: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  {
    prompt: string;
    code?: string | undefined;
  },
  {
    prompt: string;
    code?: string | undefined;
  }
>;
export declare const ProgrammerOutput: z.ZodObject<
  {
    generatedCode: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    generatedCode: string;
  },
  {
    generatedCode: string;
  }
>;
export declare const programmerBlock: BlockDefinition<
  typeof ProgrammerInput,
  typeof ProgrammerOutput
>;
//# sourceMappingURL=programmer.d.ts.map
