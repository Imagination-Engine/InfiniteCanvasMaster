import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";
export declare const ColorSwapperInput: z.ZodObject<
  {
    imagePrimary: z.ZodString;
    imagePaletteSource: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    imagePrimary: string;
    imagePaletteSource: string;
  },
  {
    imagePrimary: string;
    imagePaletteSource: string;
  }
>;
export declare const ColorSwapperOutput: z.ZodObject<
  {
    image: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    image: string;
  },
  {
    image: string;
  }
>;
export declare const colorSwapperBlock: BlockDefinition<
  typeof ColorSwapperInput,
  typeof ColorSwapperOutput
>;
//# sourceMappingURL=colorSwapper.d.ts.map
