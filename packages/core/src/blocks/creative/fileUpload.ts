import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const fileUploadBlock: BlockDefinition<any, any> = {
  id: "iem.core.fileUpload",
  name: "File Upload",
  description:
    "Represents an uploaded text/JSON/image file for downstream nodes.",
  category: "creative",
  input: z.object({
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    fileUrl: z.string().optional(),
    error: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "process_file_upload",
    invoke: async (input: any) => {
      // In a real execution, this node might read from a multipart form upload stream
      // mapped by an orchestration ID. For now, it validates context.
      const url = `https://storage.iem.local/uploads/${input.fileName || "default.txt"}`;

      return {
        success: true,
        fileUrl: url,
      };
    },
  },
};
