import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Artifact } from "./store";

export async function downloadArtifactsAsZip(
  artifacts: Artifact[],
  projectName: string,
) {
  const zip = new JSZip();

  artifacts.forEach((art) => {
    // Basic path sanitation if needed
    zip.file(art.name, art.content);
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${projectName.replace(/\s+/g, "_") || "project"}.zip`);
}
