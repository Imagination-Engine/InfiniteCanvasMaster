import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useMemo } from "react";
import { Repeat } from "lucide-react";

export type RecurringDetectorNodeData = {
  label: string;
  recurringAmount?: number;
  cadencePerMonth?: number;
};

export type RecurringDetectorNodeType = Node<
  RecurringDetectorNodeData,
  "recurringDetectorNode"
>;

export function RecurringDetectorNode({
  id,
  data,
}: NodeProps<RecurringDetectorNodeType>) {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: event.target.value });
    },
    [id, updateNodeData],
  );

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      updateNodeData(id, {
        recurringAmount: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const handleCadenceChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      updateNodeData(id, {
        cadencePerMonth: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const annualized = useMemo(() => {
    const amount = data.recurringAmount ?? 0;
    const cadence = data.cadencePerMonth ?? 0;
    return amount * cadence * 12;
  }, [data.cadencePerMonth, data.recurringAmount]);

  return (
    <div className="relative flex min-w-[280px] max-w-[330px] flex-col rounded-2xl border border-fuchsia-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-white bg-fuchsia-500"
      />

      <div className="mb-2 flex items-center gap-1.5">
        <Repeat className="h-3.5 w-3.5 text-fuchsia-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-600">
          Recurring Detector
        </span>
      </div>

      <input
        type="text"
        value={data.label}
        onChange={handleLabelChange}
        onKeyDown={(event) => event.stopPropagation()}
        className="nodrag nopan nowheel mb-2 rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold outline-none focus:border-fuchsia-300"
        placeholder="Detector label"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          value={data.recurringAmount ?? ""}
          onChange={handleAmountChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-fuchsia-300"
          placeholder="Amount $"
        />

        <input
          type="number"
          step="1"
          value={data.cadencePerMonth ?? ""}
          onChange={handleCadenceChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-fuchsia-300"
          placeholder="Times/mo"
        />
      </div>

      <p className="mt-2 text-xs text-slate-600">
        Estimated annual recurring cost: <span className="font-semibold">${annualized.toFixed(2)}</span>
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-white bg-fuchsia-500"
      />
    </div>
  );
}
