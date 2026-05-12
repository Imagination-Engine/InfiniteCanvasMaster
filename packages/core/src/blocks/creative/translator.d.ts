import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const TranslatorInput: z.ZodObject<
  {
    text: z.ZodString;
    targetLanguage: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    text: string;
    targetLanguage: string;
  },
  {
    text: string;
    targetLanguage: string;
  }
>;
export declare const TranslatorOutput: z.ZodObject<
  {
    result: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    result: string;
  },
  {
    result: string;
  }
>;
export declare const translatorBlock: BlockDefinition<
  typeof TranslatorInput,
  typeof TranslatorOutput
>;
//# sourceMappingURL=translator.d.ts.map
