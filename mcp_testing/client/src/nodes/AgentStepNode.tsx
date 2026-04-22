import { Handle, Position } from '@xyflow/react';
import { Play, Check, X, Pause } from 'lucide-react';

export default function AgentStepNode({ data }: any) {
  const isCompleted = data.status === 'completed';
  const isFailed = data.status === 'failed';
  const isWaiting = data.status === 'waiting_for_human';

  let borderColor = 'border-slate-700';
  let icon = <Play className="h-4 w-4 text-blue-400" />;
  
  if (isCompleted) {
    borderColor = 'border-green-600/50';
    icon = <Check className="h-4 w-4 text-green-500" />;
  } else if (isFailed) {
    borderColor = 'border-red-600/50';
    icon = <X className="h-4 w-4 text-red-500" />;
  } else if (isWaiting) {
    borderColor = 'border-amber-500/50';
    icon = <Pause className="h-4 w-4 text-amber-500" />;
  }

  return (
    <div className={`relative min-w-[280px] rounded-xl border ${borderColor} bg-slate-900 shadow-2xl overflow-hidden`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-700 w-3 h-3" />
      
      <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-3 border-b border-slate-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
          {icon}
        </div>
        <div className="flex-1 truncate">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{data.type}</div>
          <div className="font-bold text-slate-200 truncate">{data.name}</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {data.tool_name && (
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Tool</div>
            <div className="text-sm text-slate-300 font-mono bg-slate-950 p-2 rounded">{data.tool_name}</div>
          </div>
        )}
        <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Status: <span className={isCompleted ? 'text-green-400' : isFailed ? 'text-red-400' : isWaiting ? 'text-amber-400' : 'text-blue-400'}>{data.status}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-700 w-3 h-3" />
    </div>
  );
}
