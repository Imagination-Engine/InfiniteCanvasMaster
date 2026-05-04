import fs from "fs";
import path from "path";
import { GapEntry } from "./gap-tracker";

export function verifyGaps(gaps: GapEntry[]) {
  for (const gap of gaps) {
    if (gap.status === "Verified") {
      if (!gap.testFile) {
        throw new Error(
          `Verification Failed: GAP ${gap.id} is marked as Verified but must specify a testFile.`,
        );
      }

      const absolutePath = path.resolve(process.cwd(), gap.testFile);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(
          `Verification Failed: Test file not found for GAP ${gap.id} at path: ${gap.testFile}`,
        );
      }
    }
  }
}
