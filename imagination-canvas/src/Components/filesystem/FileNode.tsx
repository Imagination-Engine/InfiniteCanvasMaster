import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FileSystemNodeData } from "./types";

const BASE_NODE_CLASS =
  "w-[240px] rounded-xl border bg-white px-4 py-3 shadow-sm transition-colors";

export const FileNode = memo(
  ({ data, selected }: NodeProps) => {
    const nodeData = data as FileSystemNodeData;

    if (nodeData.isEmpty) {
      return (
        <div
          className={`${BASE_NODE_CLASS} cursor-pointer border-dashed ${
            selected
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50"
          }`}
          onClick={() =>
            nodeData.onChooseFiles?.(nodeData.id)
          }
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              nodeData.onChooseFiles?.(nodeData.id);
            }
          }}
        >
          <div className="text-sm font-semibold text-slate-700">
            Click to upload file or folder
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700"
              onClick={(event) => {
                event.stopPropagation();
                nodeData.onChooseFiles?.(nodeData.id);
              }}
            >
              Upload File
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700"
              onClick={(event) => {
                event.stopPropagation();
                nodeData.onChooseFolder?.(nodeData.id);
              }}
            >
              Upload Folder
            </button>
          </div>
        </div>
      );
    }

    const isFolder = nodeData.type === "folder";
    return (
      <div
        className={`${BASE_NODE_CLASS} ${
          selected
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300"
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="in"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="out"
        />
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {isFolder ? "Folder" : "File"}
        </div>
        <div className="mt-1 truncate text-sm font-semibold text-slate-900">
          {nodeData.name}
        </div>
        <div className="mt-1 truncate text-xs text-slate-500">
          {nodeData.path}
        </div>
      </div>
    );
  },
);

FileNode.displayName = "FileNode";

