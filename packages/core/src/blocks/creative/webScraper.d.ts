import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const WebScraperInput: z.ZodObject<
  {
    url: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    url: string;
  },
  {
    url: string;
  }
>;
export declare const WebScraperOutput: z.ZodObject<
  {
    text: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    text: string;
  },
  {
    text: string;
  }
>;
export declare const webScraperBlock: BlockDefinition<
  typeof WebScraperInput,
  typeof WebScraperOutput
>;
//# sourceMappingURL=webScraper.d.ts.map
