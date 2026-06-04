export type ComposerAttachment = {
  id: string;
  file: File;
  previewUrl: string;
  kind: "image" | "file";
};

export function createComposerAttachmentsFromFiles(
  files: FileList,
): ComposerAttachment[] {
  const next: ComposerAttachment[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) continue;
    const isImage = file.type.startsWith("image/");
    next.push({
      id: `att-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      kind: isImage ? "image" : "file",
    });
  }
  return next;
}

export function revokeComposerAttachmentUrls(
  attachments: ComposerAttachment[],
): void {
  for (const attachment of attachments) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
}

export type ImagePart = { mimeType: string; data: string };

export async function readAttachmentsAsBase64(
  attachments: ComposerAttachment[],
): Promise<ImagePart[]> {
  return Promise.all(
    attachments
      .filter((a) => a.kind === "image")
      .map(
        (a) =>
          new Promise<ImagePart>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              const comma = dataUrl.indexOf(",");
              const mimeType = dataUrl.slice(5, dataUrl.indexOf(";"));
              const data = dataUrl.slice(comma + 1);
              resolve({ mimeType, data });
            };
            reader.onerror = reject;
            reader.readAsDataURL(a.file);
          }),
      ),
  );
}
