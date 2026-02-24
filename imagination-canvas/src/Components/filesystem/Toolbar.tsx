type ToolbarProps = {
  isLassoActive: boolean;
  onToggleLasso: () => void;
  onAddEmptyNode: () => void;
};

export function Toolbar({
  isLassoActive,
  onToggleLasso,
  onAddEmptyNode,
}: ToolbarProps) {
  return (
    <aside className="flex h-full w-[88px] min-w-[88px] flex-col items-center gap-3 border-r border-slate-200 bg-white px-3 py-4">
      <button
        type="button"
        className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700"
        onClick={onAddEmptyNode}
      >
        Add Node
      </button>
      <button
        type="button"
        className={`w-full rounded-lg border px-2 py-2 text-xs font-semibold ${
          isLassoActive
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-slate-300 text-slate-700"
        }`}
        onClick={onToggleLasso}
      >
        Lasso
      </button>
    </aside>
  );
}

