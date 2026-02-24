import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useMemo } from "react";
import { ShieldAlert } from "lucide-react";

export type BudgetGuardNodeData = {
  label: string;
  monthlyBudget?: number;
  trackedSpend?: number;
};

export type BudgetGuardNodeType = Node<
  BudgetGuardNodeData,
  "budgetGuardNode"
>;

export function BudgetGuardNode({
  id,
  data,
}: NodeProps<BudgetGuardNodeType>) {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: e.target.value });
    },
    [id, updateNodeData],
  );

  const handleBudgetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(e.target.value);
      updateNodeData(id, {
        monthlyBudget: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const handleSpendChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(e.target.value);
      updateNodeData(id, {
        trackedSpend: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const remaining = useMemo(() => {
    const budget = data.monthlyBudget ?? 0;
    const spend = data.trackedSpend ?? 0;
    return budget - spend;
  }, [data.monthlyBudget, data.trackedSpend]);

  const statusColor = remaining < 0 ? "text-rose-600" : "text-emerald-600";

  return (
    <div className="relative flex min-w-[260px] max-w-[320px] flex-col rounded-2xl border border-amber-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-white bg-amber-500"
      />

      <div className="mb-2 flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
          Budget Guard
        </span>
      </div>

      <input
        type="text"
        value={data.label}
        onChange={handleLabelChange}
        onKeyDown={(event) => event.stopPropagation()}
        className="nodrag nopan nowheel mb-2 rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold outline-none focus:border-amber-300"
        placeholder="Budget rule"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          value={data.monthlyBudget ?? ""}
          onChange={handleBudgetChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-amber-300"
          placeholder="Budget $"
        />

        <input
          type="number"
          step="0.01"
          value={data.trackedSpend ?? ""}
          onChange={handleSpendChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-amber-300"
          placeholder="Spend $"
        />
      </div>

      <p className={`mt-2 text-xs font-semibold ${statusColor}`}>
        Remaining: ${remaining.toFixed(2)}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-white bg-amber-500"
      />
    </div>
  );
}
