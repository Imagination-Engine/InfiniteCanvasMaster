import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Toolbar } from "./Toolbar";
import { FilesystemCanvas } from "./FilesystemCanvas";
import { AnalysisPanel } from "./AnalysisPanel";
import type { FileSystemNodeData } from "./types";

export function FilesystemPage() {
  const [isLassoActive, setIsLassoActive] =
    useState(false);
  const [addNodeNonce, setAddNodeNonce] = useState(0);
  const [selectedNodes, setSelectedNodes] = useState<
    FileSystemNodeData[]
  >([]);

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900">
      <Toolbar
        isLassoActive={isLassoActive}
        onToggleLasso={() =>
          setIsLassoActive((current) => !current)
        }
        onAddEmptyNode={() =>
          setAddNodeNonce((current) => current + 1)
        }
      />

      <div className="flex h-full flex-1 flex-col">
        <div className="h-1/2 min-h-0 border-b border-slate-200">
          <ReactFlowProvider>
            <FilesystemCanvas
              isLassoActive={isLassoActive}
              addNodeNonce={addNodeNonce}
              onSelectionDataChange={setSelectedNodes}
            />
          </ReactFlowProvider>
        </div>
        <div className="h-1/2 min-h-0 bg-white">
          <AnalysisPanel selectedNodes={selectedNodes} />
        </div>
      </div>
    </div>
  );
}

