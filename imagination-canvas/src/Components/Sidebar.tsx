import type { ComponentType, DragEvent } from "react";
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  CircleDollarSign,
  Sparkles,
  CalendarClock,
  ShieldAlert,
  Network,
  LogOut,
  Shapes,
  TrendingUp,
  Repeat,
  AlertTriangle,
} from "lucide-react";
import type { SourceMode } from "../types/spendtrace";

type ModuleType =
  | "overall"
  | "account"
  | "spendTx"
  | "transferTx"
  | "incomeTx"
  | "category"
  | "summaryAgent"
  | "futurePurchase"
  | "budgetGuard"
  | "forecastAgent"
  | "recurringDetector"
  | "anomalyAlert";

const MODULE_TYPES: Array<{
  type: ModuleType;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}> = [
  { type: "overall", label: "Overall Node", icon: Network, color: "text-slate-700" },
  { type: "account", label: "Account Node", icon: Landmark, color: "text-blue-500" },
  { type: "spendTx", label: "Spend Tx", icon: Wallet, color: "text-rose-500" },
  {
    type: "transferTx",
    label: "Transfer Tx",
    icon: ArrowRightLeft,
    color: "text-amber-500",
  },
  {
    type: "incomeTx",
    label: "Income Tx",
    icon: CircleDollarSign,
    color: "text-emerald-500",
  },
  { type: "category", label: "Category Cluster", icon: Shapes, color: "text-violet-500" },
  {
    type: "summaryAgent",
    label: "Summary Agent",
    icon: Sparkles,
    color: "text-indigo-500",
  },
  {
    type: "futurePurchase",
    label: "Future Purchase",
    icon: CalendarClock,
    color: "text-emerald-600",
  },
  {
    type: "budgetGuard",
    label: "Budget Guard",
    icon: ShieldAlert,
    color: "text-amber-600",
  },
  {
    type: "forecastAgent",
    label: "Forecast Agent",
    icon: TrendingUp,
    color: "text-cyan-600",
  },
  {
    type: "recurringDetector",
    label: "Recurring Detector",
    icon: Repeat,
    color: "text-fuchsia-600",
  },
  {
    type: "anomalyAlert",
    label: "Anomaly Alert",
    icon: AlertTriangle,
    color: "text-rose-600",
  },
];

type SidebarProps = {
  userName: string;
  sourceMode: SourceMode;
  onSourceModeChange: (mode: SourceMode) => void;
  onLogout: () => void;
};

export function Sidebar({
  userName,
  sourceMode,
  onSourceModeChange,
  onLogout,
}: SidebarProps) {
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    moduleType: ModuleType,
  ) => {
    event.dataTransfer.setData("application/reactflow", moduleType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="z-10 flex h-full w-[290px] min-w-[290px] flex-col gap-4 border-r border-slate-200 bg-white/90 p-5 backdrop-blur-md">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">SpendTrace</h1>
        <p className="text-xs text-slate-500">Canvas-only local experience</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-700">Session</p>
        <p className="truncate text-sm text-slate-600">{userName}</p>
        <button
          onClick={onLogout}
          className="mt-2 flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data Source</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSourceModeChange("DEMO")}
            className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              sourceMode === "DEMO"
                ? "bg-slate-800 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Demo
          </button>
          <button
            onClick={() => onSourceModeChange("PLAID")}
            className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              sourceMode === "PLAID"
                ? "bg-slate-800 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Plaid (stub)
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Nodes</h3>
        <div className="mt-2 flex max-h-[45vh] flex-col gap-2 overflow-auto pr-1">
          {MODULE_TYPES.map((module) => (
            <div
              key={module.type}
              draggable
              onDragStart={(event) => onDragStart(event, module.type)}
              className="group flex cursor-grab select-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition-all hover:scale-[1.01] hover:shadow-md active:cursor-grabbing"
            >
              <module.icon className={`h-4 w-4 shrink-0 ${module.color}`} />
              <span className="text-sm font-semibold text-slate-700">{module.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
        <p>Legend: red=spend, yellow=transfer, green=income.</p>
        <p className="mt-1">Drag nodes in, then connect handles to model money flow + planning.</p>
      </div>
    </aside>
  );
}
