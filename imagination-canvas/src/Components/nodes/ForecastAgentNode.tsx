import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useMemo } from "react";
import { TrendingUp } from "lucide-react";

export type ForecastAgentNodeData = {
  label: string;
  monthlyIncome?: number;
  monthlySpend?: number;
  forecast?: string;
};

export type ForecastAgentNodeType = Node<
  ForecastAgentNodeData,
  "forecastAgentNode"
>;

export function ForecastAgentNode({
  id,
  data,
}: NodeProps<ForecastAgentNodeType>) {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: event.target.value });
    },
    [id, updateNodeData],
  );

  const handleIncomeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      updateNodeData(id, {
        monthlyIncome: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const handleSpendChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      updateNodeData(id, {
        monthlySpend: Number.isFinite(parsed) ? parsed : undefined,
      });
    },
    [id, updateNodeData],
  );

  const projectedNet = useMemo(() => {
    const income = data.monthlyIncome ?? 0;
    const spend = data.monthlySpend ?? 0;
    return income - spend;
  }, [data.monthlyIncome, data.monthlySpend]);

  const runForecast = useCallback(() => {
    const income = data.monthlyIncome ?? 0;
    const spend = data.monthlySpend ?? 0;
    const net = income - spend;

    const nextText =
      net >= 0
        ? `Projected month-end surplus: $${net.toFixed(2)}.`
        : `Projected month-end deficit: $${Math.abs(net).toFixed(2)}.`;

    updateNodeData(id, {
      forecast: nextText,
    });
  }, [data.monthlyIncome, data.monthlySpend, id, updateNodeData]);

  return (
    <div className="relative flex min-w-[280px] max-w-[330px] flex-col rounded-2xl border border-cyan-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5 w-2.5 border border-white bg-cyan-500"
      />

      <div className="mb-2 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-cyan-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">
          Forecast Agent
        </span>
      </div>

      <input
        type="text"
        value={data.label}
        onChange={handleLabelChange}
        onKeyDown={(event) => event.stopPropagation()}
        className="nodrag nopan nowheel mb-2 rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold outline-none focus:border-cyan-300"
        placeholder="Forecast label"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          value={data.monthlyIncome ?? ""}
          onChange={handleIncomeChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-cyan-300"
          placeholder="Income $"
        />

        <input
          type="number"
          step="0.01"
          value={data.monthlySpend ?? ""}
          onChange={handleSpendChange}
          onKeyDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-cyan-300"
          placeholder="Spend $"
        />
      </div>

      <button
        onClick={runForecast}
        className="mt-2 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-600"
      >
        Run Forecast
      </button>

      <p className="mt-2 text-xs font-semibold text-slate-600">
        Net trend: ${projectedNet.toFixed(2)}
      </p>

      <p className="mt-1 min-h-8 text-xs text-slate-600">
        {data.forecast ?? "Connect income/spend nodes and run forecast."}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5 w-2.5 border border-white bg-cyan-500"
      />
    </div>
  );
}
