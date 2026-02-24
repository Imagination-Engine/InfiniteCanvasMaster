import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback } from "react";

export type MoneyNodeKind =
  | "OVERALL"
  | "ACCOUNT"
  | "CATEGORY"
  | "TX_SPEND"
  | "TX_TRANSFER"
  | "TX_INCOME";

export type MoneyNodeData = {
  label: string;
  subtitle?: string;
  amount?: number;
  kind: MoneyNodeKind;
};

export type MoneyNodeType = Node<MoneyNodeData, "moneyNode">;

const KIND_STYLES: Record<
  MoneyNodeKind,
  {
    title: string;
    accent: string;
    badge: string;
    inputFocus: string;
  }
> = {
  OVERALL: {
    title: "Overall",
    accent: "bg-slate-700",
    badge: "text-slate-600",
    inputFocus: "focus:text-slate-900",
  },
  ACCOUNT: {
    title: "Account",
    accent: "bg-blue-500",
    badge: "text-blue-500",
    inputFocus: "focus:text-blue-700",
  },
  CATEGORY: {
    title: "Category",
    accent: "bg-violet-500",
    badge: "text-violet-500",
    inputFocus: "focus:text-violet-700",
  },
  TX_SPEND: {
    title: "Spend",
    accent: "bg-rose-500",
    badge: "text-rose-500",
    inputFocus: "focus:text-rose-700",
  },
  TX_TRANSFER: {
    title: "Transfer",
    accent: "bg-amber-500",
    badge: "text-amber-500",
    inputFocus: "focus:text-amber-700",
  },
  TX_INCOME: {
    title: "Income",
    accent: "bg-emerald-500",
    badge: "text-emerald-500",
    inputFocus: "focus:text-emerald-700",
  },
};

const formatAmount = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }
  return `$${Math.abs(value).toFixed(2)}`;
};

export function MoneyNode({
  id,
  data,
}: NodeProps<MoneyNodeType>) {
  const { updateNodeData } = useReactFlow();
  const style = KIND_STYLES[data.kind];
  const isTransaction = data.kind.startsWith("TX_");

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: e.target.value });
    },
    [id, updateNodeData],
  );

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(e.target.value);
      updateNodeData(id, {
        amount: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  return (
    <div className="relative flex min-w-[190px] max-w-[260px] items-stretch rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-white bg-slate-500"
      />

      <div className={`w-1.5 shrink-0 rounded-l-2xl ${style.accent}`} />

      <div className="flex w-full flex-col gap-1 px-3 py-2.5">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
          {style.title}
        </span>

        <input
          type="text"
          value={data.label}
          onChange={handleLabelChange}
          onKeyDown={(event) => event.stopPropagation()}
          className={`nodrag nopan nowheel bg-transparent text-sm font-semibold text-slate-800 outline-none transition-colors ${style.inputFocus}`}
          placeholder="Label"
        />

        {data.subtitle ? (
          <span className="text-[11px] text-slate-500">{data.subtitle}</span>
        ) : null}

        {isTransaction ? (
          <div className="mt-1 flex items-center justify-between gap-2">
            <input
              type="number"
              step="0.01"
              value={data.amount ?? ""}
              onChange={handleAmountChange}
              onKeyDown={(event) => event.stopPropagation()}
              className="nodrag nopan nowheel w-full rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
              placeholder="Amount"
            />
            <span className="text-xs font-bold text-slate-600">{formatAmount(data.amount)}</span>
          </div>
        ) : null}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-white bg-slate-500"
      />
    </div>
  );
}
