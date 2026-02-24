import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useMemo } from "react";
import { AlertTriangle } from "lucide-react";

export type AnomalyAlertNodeData = {
  label: string;
  baselineAmount?: number;
  currentAmount?: number;
  alertThresholdPct?: number;
};

export type AnomalyAlertNodeType = Node<
  AnomalyAlertNodeData,
  "anomalyAlertNode"
>;

export function AnomalyAlertNode({
  id,
  data,
}: NodeProps<AnomalyAlertNodeType>) {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: event.target.value });
    },
    [id, updateNodeData],
  );

  const handleBaselineChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      updateNodeData(id, {
        baselineAmount: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const handleCurrentChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      updateNodeData(id, {
        currentAmount: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const handleThresholdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      updateNodeData(id, {
        alertThresholdPct: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const deltaPct = useMemo(() => {
    const baseline = data.baselineAmount ?? 0;
    const current = data.currentAmount ?? 0;
    if (baseline <= 0) {
      return 0;
    }
    return ((current - baseline) / baseline) * 100;
  }, [data.baselineAmount, data.currentAmount]);

  const threshold = data.alertThresholdPct ?? 25;
  const isAlert = deltaPct >= threshold;

  return (
    <div className="relative flex min-w-[290px] max-w-[340px] flex-col rounded-2xl border border-rose-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-white bg-rose-500"
      />

      <div className="mb-2 flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
          Anomaly Alert
        </span>
      </div>

      <input
        type="text"
        value={data.label}
        onChange={handleLabelChange}
        onKeyDown={(event) => event.stopPropagation()}
        className="nodrag nopan nowheel mb-2 rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold outline-none focus:border-rose-300"
        placeholder="Alert label"
      />

      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          step="0.01"
          value={data.baselineAmount ?? ""}
          onChange={handleBaselineChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-rose-300"
          placeholder="Baseline $"
        />

        <input
          type="number"
          step="0.01"
          value={data.currentAmount ?? ""}
          onChange={handleCurrentChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-rose-300"
          placeholder="Current $"
        />

        <input
          type="number"
          step="1"
          value={data.alertThresholdPct ?? 25}
          onChange={handleThresholdChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-rose-300"
          placeholder="Threshold %"
        />
      </div>

      <p className={`mt-2 text-xs font-semibold ${isAlert ? "text-rose-600" : "text-emerald-600"}`}>
        {isAlert
          ? `Alert: up ${deltaPct.toFixed(1)}% vs baseline`
          : `Normal: ${deltaPct.toFixed(1)}% vs baseline`}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-white bg-rose-500"
      />
    </div>
  );
}
