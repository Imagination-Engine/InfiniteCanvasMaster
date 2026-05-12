import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const FormatterInput: z.ZodObject<
  {
    file: z.ZodString;
    desiredFormat: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    file: string;
    desiredFormat: string;
  },
  {
    file: string;
    desiredFormat: string;
  }
>;
export declare const FormatterOutput: z.ZodObject<
  {
    formattedFile: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    formattedFile: string;
  },
  {
    formattedFile: string;
  }
>;
export declare const formatterBlock: BlockDefinition<
  typeof FormatterInput,
  typeof FormatterOutput
>;
//# sourceMappingURL=formatter.d.ts.map
