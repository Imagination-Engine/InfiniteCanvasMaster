import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useMemo } from "react";
import { CalendarClock } from "lucide-react";

export type FuturePurchaseNodeData = {
  label: string;
  targetCost?: number;
  monthlyContribution?: number;
};

export type FuturePurchaseNodeType = Node<
  FuturePurchaseNodeData,
  "futurePurchaseNode"
>;

export function FuturePurchaseNode({
  id,
  data,
}: NodeProps<FuturePurchaseNodeType>) {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: e.target.value });
    },
    [id, updateNodeData],
  );

  const handleCostChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(e.target.value);
      updateNodeData(id, {
        targetCost: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const handleMonthlyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(e.target.value);
      updateNodeData(id, {
        monthlyContribution: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const payoffMonths = useMemo(() => {
    const cost = data.targetCost ?? 0;
    const monthly = data.monthlyContribution ?? 0;

    if (cost <= 0 || monthly <= 0) {
      return null;
    }

    return Math.ceil(cost / monthly);
  }, [data.monthlyContribution, data.targetCost]);

  return (
    <div className="relative flex min-w-[260px] max-w-[320px] flex-col rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-white bg-emerald-500"
      />

      <div className="mb-2 flex items-center gap-1.5">
        <CalendarClock className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
          Future Purchase
        </span>
      </div>

      <input
        type="text"
        value={data.label}
        onChange={handleLabelChange}
        onKeyDown={(event) => event.stopPropagation()}
        className="nodrag nopan nowheel mb-2 rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold outline-none focus:border-emerald-300"
        placeholder="Goal label"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          value={data.targetCost ?? ""}
          onChange={handleCostChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-300"
          placeholder="Target $"
        />

        <input
          type="number"
          step="0.01"
          value={data.monthlyContribution ?? ""}
          onChange={handleMonthlyChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-300"
          placeholder="Monthly $"
        />
      </div>

      <p className="mt-2 text-xs text-slate-600">
        {payoffMonths
          ? `Estimated timeline: ${payoffMonths} month${payoffMonths > 1 ? "s" : ""}.`
          : "Set a target and monthly contribution to estimate timeline."}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-white bg-emerald-500"
      />
    </div>
  );
}
