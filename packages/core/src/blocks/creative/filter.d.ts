import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const FilterInput: z.ZodObject<
  {
    source: z.ZodString;
    conditions: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    source: string;
    conditions: string;
  },
  {
    source: string;
    conditions: string;
  }
>;
export declare const FilterOutput: z.ZodObject<
  {
    filtered: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    filtered: string;
  },
  {
    filtered: string;
  }
>;
export declare const filterBlock: BlockDefinition<
  typeof FilterInput,
  typeof FilterOutput
>;
//# sourceMappingURL=filter.d.ts.map
