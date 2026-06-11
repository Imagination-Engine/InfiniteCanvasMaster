import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Loader2,
  Download,
  Eye,
  ExternalLink,
  Play,
  Film,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Code,
  Zap,
} from "lucide-react";
import JSZip from "jszip";

interface RunPanelProps {
  run: {
    id: string;
    runId?: string;
    success?: boolean;
    status: "running" | "success" | "failed";
    error?: string;
    results?: any;
    steps?: Record<string, any>;
    startTime: number;
    projectName: string;
  };
  onClose: () => void;
  onPreviewVideo: (url: string) => void;
  onPreviewWeb: (data: { content: string; title: string }) => void;
}

export const RunPanel: React.FC<RunPanelProps> = ({
  run,
  onClose,
  onPreviewVideo,
  onPreviewWeb,
}) => {
  const [artifacts, setArtifacts] = useState<any[]>([]);

  const downloadFile = (
    filename: string,
    content: any,
    mime = "text/plain",
  ) => {
    if (!content) return;
    const isUrl =
      typeof content === "string" &&
      (content.startsWith("http") ||
        content.startsWith("/") ||
        content.startsWith("blob:") ||
        content.startsWith("data:"));

    if (isUrl) {
      const a = document.createElement("a");
      a.href = content;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const strContent =
        typeof content === "object"
          ? JSON.stringify(content, null, 2)
          : String(content);
      const blob = new Blob([strContent], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const openContentInNewTab = (content: string, mime = "text/html") => {
    if (!content) return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const buildPreviewHtmlFromFiles = (files: any[]) => {
    const htmlFile =
      files.find((file: any) => file.name === "index.html") ||
      files.find((file: any) => String(file.name || "").endsWith(".html"));

    if (!htmlFile?.content) return null;

    let html = String(htmlFile.content);
    const cssFiles = files.filter((file: any) =>
      String(file.name || "").endsWith(".css"),
    );
    const jsFiles = files.filter((file: any) =>
      String(file.name || "").endsWith(".js"),
    );

    const css = cssFiles
      .map((file: any) => `\n/* ${file.name} */\n${file.content}`)
      .join("\n");
    const js = jsFiles
      .map((file: any) => `\n// ${file.name}\n${file.content}`)
      .join("\n");

    if (css) {
      const styleTag = `<style>${css}</style>`;
      html = html.includes("</head>")
        ? html.replace("</head>", `${styleTag}</head>`)
        : `${styleTag}${html}`;
    }

    if (js) {
      const scriptTag = `<script>${js}</script>`;
      html = html.includes("</body>")
        ? html.replace("</body>", `${scriptTag}</body>`)
        : `${html}${scriptTag}`;
    }

    if (!html.includes("<html")) {
      html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${html}</body></html>`;
    }

    return html;
  };

  useEffect(() => {
    if (run.status === "running") return;

    const found: any[] = [];
    const seen = new Set();

    const processPayload = async (payload: any, source: string) => {
      if (!payload || typeof payload !== "object") return;

      let hasZip = false;

      const hasFiles = payload.files && Array.isArray(payload.files);
      const hasCode = !!payload.generatedCode || !!payload.code;

      // Handle multi-file project (ZIP) OR package single code output into ZIP
      if (hasFiles || hasCode) {
        try {
          const zip = new JSZip();

          if (hasFiles) {
            payload.files.forEach((file: any) => {
              zip.file(file.name, file.content);
            });
          }

          const previewContent = hasFiles
            ? buildPreviewHtmlFromFiles(payload.files)
            : null;

          if (
            payload.generatedCode &&
            (!hasFiles ||
              !payload.files.find(
                (f: any) => f.content === payload.generatedCode,
              ))
          ) {
            const ext =
              typeof payload.generatedCode === "string" &&
              payload.generatedCode.includes("import React")
                ? "tsx"
                : "ts";
            zip.file(`main_output.${ext}`, payload.generatedCode);
          }

          if (
            payload.code &&
            (!hasFiles ||
              !payload.files.find((f: any) => f.content === payload.code))
          ) {
            const ext =
              typeof payload.code === "string" &&
              payload.code.includes("import React")
                ? "tsx"
                : "ts";
            zip.file(`code_output.${ext}`, payload.code);
          }

          const zipBlob = await zip.generateAsync({ type: "blob" });
          const zipUrl = URL.createObjectURL(zipBlob);

          const safeProjectName = (run.projectName || "Project")
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();

          found.push({
            id: `${source}-project-zip`,
            name: `${safeProjectName}.zip`,
            type: "file",
            content: zipUrl,
            mime: "application/zip",
            label: "Packaged Project (ZIP)",
            icon: File,
            source,
            previewable: !!previewContent,
            previewContent,
          });
          hasZip = true;
        } catch (e) {
          console.error("Failed to generate ZIP artifact", e);
        }
      }

      const config = [
        {
          key: "generatedCode",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
          skipIfZip: true,
        },
        {
          key: "code",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
          skipIfZip: true,
        },
        {
          key: "formattedFile",
          type: "code",
          ext: "ts",
          mime: "text/plain",
          icon: Code,
        },
        {
          key: "spec",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
          skipIfZip: true,
        },
        {
          key: "design",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
          skipIfZip: true,
        },
        {
          key: "specs",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
          skipIfZip: true,
        },
        {
          key: "assets",
          type: "text",
          ext: "md",
          mime: "text/markdown",
          icon: FileText,
          skipIfZip: true,
        },
        {
          key: "imageUrl",
          type: "image",
          ext: "png",
          mime: "image/png",
          icon: ImageIcon,
        },
        {
          key: "audioUrl",
          type: "audio",
          ext: "mp3",
          mime: "audio/mpeg",
          icon: Music,
        },
        {
          key: "fileUrl",
          type: "file",
          ext: "bin",
          mime: "application/octet-stream",
          icon: File,
        },
        {
          key: "trackUrl",
          type: "audio",
          ext: "mp3",
          mime: "audio/mpeg",
          icon: Music,
        },
        {
          key: "clipUrl",
          type: "video",
          ext: "mp4",
          mime: "video/mp4",
          icon: Film,
        },
        {
          key: "results",
          type: "text",
          ext: "txt",
          mime: "text/plain",
          icon: FileText,
        },
      ];

      config.forEach(({ key, type, ext, mime, icon, skipIfZip }) => {
        if (payload[key]) {
          if (hasZip && skipIfZip) return;

          const content = payload[key];
          let finalExt = ext;
          let finalMime = mime;
          let finalType = type;

          if (typeof content === "string") {
            if (
              content.includes("<!DOCTYPE html>") ||
              content.includes("<html")
            ) {
              finalExt = "html";
              finalMime = "text/html";
              finalType = "code";
            } else if (
              content.includes("import React") ||
              content.includes("export default")
            ) {
              finalExt = "tsx";
              finalType = "code";
            } else if (
              content.includes("def ") ||
              content.includes("import os") ||
              content.includes("import sys")
            ) {
              finalExt = "py";
              finalType = "code";
            }
          }

          const safeProjectName = (run.projectName || "Project")
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();

          const hash = `${finalType}-${typeof content === "string" ? (content.length > 100 ? content.substring(0, 100) : content) : JSON.stringify(content)}`;
          if (!seen.has(hash)) {
            seen.add(hash);
            found.push({
              id: `${source}-${key}`,
              name: `${safeProjectName}_${key.toLowerCase()}.${finalExt}`,
              type: finalType,
              content,
              mime: finalMime,
              label: key,
              icon,
              source,
            });
          }
        }
      });
    };

    const loadArtifacts = async () => {
      // 1. Process final results
      const finalPayload = run.results?.payload || run.results;
      await processPayload(finalPayload, "final");

      // 2. Process all steps
      if (run.steps) {
        for (const [stepId, step] of Object.entries(run.steps)) {
          const stepPayload =
            (step as any).output?.payload || (step as any).output;
          await processPayload(stepPayload, stepId);
        }
      }
      setArtifacts(found);
    };

    loadArtifacts();
  }, [run]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: 20, y: -20, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      className="absolute right-4 bottom-4 z-[60] w-[520px] max-w-[92vw] max-h-[60vh] overflow-hidden rounded-2xl border border-white/10 bg-brand-bg-page/90 backdrop-blur-2xl shadow-2xl text-white cursor-default"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-move">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            Run · {new Date(run.startTime).toLocaleTimeString()}
          </div>
          <div className="text-xs text-white/80 truncate">
            runId: {run.runId || "—"} ·{" "}
            <span
              className={
                run.status === "failed" ? "text-rose-400" : "text-brand-cyan"
              }
            >
              {run.status}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 overflow-auto max-h-[50vh] custom-scrollbar">
        {run.status === "running" ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2
              size={32}
              className="text-brand-purple animate-spin mb-4"
            />
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
              Assembling vision...
            </p>
          </div>
        ) : run.status === "failed" ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-rose-500 bg-rose-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <X size={24} />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              Execution Failed
            </p>
            <p className="text-xs text-white/50 px-6 line-clamp-3">
              {run.error || "An unknown error occurred"}
            </p>
          </div>
        ) : (
          <>
            {artifacts.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    Generated Artifacts
                  </div>
                  <div className="flex items-center gap-2">
                    {artifacts.some(
                      (a) => a.previewable || a.mime === "text/html",
                    ) && (
                      <>
                        <button
                          onClick={() => {
                            const mainArt =
                              artifacts.find((a) => a.name === "index.html") ||
                              artifacts.find((a) => a.previewable) ||
                              artifacts.find((a) => a.mime === "text/html");

                            if (mainArt) {
                              onPreviewWeb({
                                content:
                                  mainArt.previewContent || mainArt.content,
                                title: mainArt.name,
                              });
                            }
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-cyan text-black hover:bg-brand-cyan/80 border border-brand-cyan/30 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-cyan/20 transition-all active:scale-95"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            const mainArt =
                              artifacts.find((a) => a.previewable) ||
                              artifacts.find((a) => a.mime === "text/html");

                            if (mainArt) {
                              openContentInNewTab(
                                mainArt.previewContent || mainArt.content,
                                "text/html",
                              );
                            }
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          <ExternalLink size={14} />
                          Open Tab
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        artifacts.forEach((art) => {
                          setTimeout(() => {
                            downloadFile(art.name, art.content, art.mime);
                          }, 100);
                        });
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-purple text-white hover:bg-brand-purple-light border border-brand-purple/30 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Download size={14} />
                      Export All
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {artifacts.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {art.type === "image" &&
                    typeof art.content === "string" &&
                    (art.content.startsWith("data:") ||
                      art.content.startsWith("http")) ? (
                      <img
                        src={art.content}
                        className="w-10 h-10 rounded-lg bg-black/20 object-cover border border-white/10"
                        alt="preview"
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-brand-purple/20 text-brand-purple-light">
                        <art.icon size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">
                        {art.name}
                      </div>
                      <div className="text-[9px] text-white/40 uppercase tracking-tighter">
                        {art.type} · {art.source}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {art.type === "video" && (
                      <button
                        onClick={() =>
                          onPreviewVideo(art.content?.clipUrl || art.content)
                        }
                        className="p-2 rounded-lg bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 transition-colors"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                    )}
                    {(art.previewable || art.mime === "text/html") && (
                      <>
                        <button
                          onClick={() =>
                            onPreviewWeb({
                              content: art.previewContent || art.content,
                              title: art.name,
                            })
                          }
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() =>
                            openContentInNewTab(
                              art.previewContent || art.content,
                              "text/html",
                            )
                          }
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        downloadFile(art.name, art.content, art.mime)
                      }
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
