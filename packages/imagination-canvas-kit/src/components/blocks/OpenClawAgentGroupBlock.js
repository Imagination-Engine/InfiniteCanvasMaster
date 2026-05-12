import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { Users, Target, Play, Pause, Square, Activity } from "lucide-react";
import { useOpenClawGroupControl } from "../../hooks/useOpenClawGroupControl";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const OpenClawAgentGroupBlock = ({ object }) => {
  //
  const data = object.metadata || {};
  // removed double decl
  const status = data.state?.status || "idle";
  const memberCount = data.memberBlockIds?.length || 0;
  const { startGroupTask, pauseGroup, stopGroup, isOrchestrating } =
    useOpenClawGroupControl(object.id);
  const getStatusColor = (s) => {
    switch (s) {
      case "running":
        return "text-brand-cyan";
      case "planning":
        return "text-brand-purple animate-pulse";
      case "waiting_for_approval":
        return "text-amber-500";
      case "failed":
        return "text-red-500";
      case "completed":
        return "text-green-500";
      default:
        return "text-white/40";
    }
  };
  return _jsxs("div", {
    className: "flex flex-col h-full text-white font-sans select-none",
    children: [
      _jsxs("div", {
        className: "flex items-center justify-between mb-4",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              _jsx("div", {
                className:
                  "p-2 bg-brand-purple/10 rounded-xl text-brand-purple shadow-[0_0_15px_rgba(180,0,255,0.1)]",
                children: _jsx(Users, { size: 18 }),
              }),
              _jsxs("div", {
                className: "flex flex-col",
                children: [
                  _jsx("span", {
                    className:
                      "text-xs font-black uppercase tracking-tighter leading-none",
                    children: data.title || "Agent Task Force",
                  }),
                  _jsxs("span", {
                    className: cn(
                      "text-[8px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1",
                      getStatusColor(status),
                    ),
                    children: [
                      _jsx(Activity, { size: 8 }),
                      status.replace("_", " "),
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsx("div", {
            className: "flex items-center gap-3",
            children: _jsxs("div", {
              className: "flex flex-col items-end",
              children: [
                _jsx("span", {
                  className:
                    "text-[7px] font-black uppercase opacity-30 tracking-widest",
                  children: "Members",
                }),
                _jsx("span", {
                  className: "text-[10px] font-mono font-bold text-white/80",
                  children: memberCount,
                }),
              ],
            }),
          }),
        ],
      }),
      _jsxs("div", {
        className: "flex-1 flex flex-col gap-3",
        children: [
          _jsxs("div", {
            className:
              "p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2",
            children: [
              _jsxs("div", {
                className: "flex items-center gap-2 text-white/40",
                children: [
                  _jsx(Target, { size: 12 }),
                  _jsx("span", {
                    className:
                      "text-[9px] font-black uppercase tracking-widest",
                    children: "Group Objective",
                  }),
                ],
              }),
              _jsx("p", {
                className:
                  "text-[11px] leading-relaxed font-medium text-white/80 line-clamp-3 italic",
                children:
                  data.task?.userIntent ||
                  "No objective set. Select blocks and define a goal to begin orchestration.",
              }),
            ],
          }),
          data.task &&
            data.task.subtasks &&
            data.task.subtasks.length > 0 &&
            _jsxs("div", {
              className:
                "flex items-center gap-2 px-1 text-[9px] uppercase tracking-widest font-bold",
              children: [
                _jsxs("span", {
                  className: "text-brand-cyan",
                  children: [
                    data.task.subtasks.filter((s) => s.status === "completed")
                      .length,
                    " ",
                    "Done",
                  ],
                }),
                _jsx("span", {
                  className: "text-white/20",
                  children: "\u2022",
                }),
                _jsxs("span", {
                  className: "text-amber-500",
                  children: [
                    data.task.subtasks.filter(
                      (s) => s.status === "running" || s.status === "assigned",
                    ).length,
                    " ",
                    "Active",
                  ],
                }),
                _jsx("span", {
                  className: "text-white/20",
                  children: "\u2022",
                }),
                _jsxs("span", {
                  className: "text-white/40",
                  children: [
                    data.task.subtasks.filter((s) => s.status === "unassigned")
                      .length,
                    " ",
                    "Pending",
                  ],
                }),
              ],
            }),
          _jsx("div", {
            className: "mt-auto flex items-center justify-between gap-2 pt-2",
            children:
              status === "idle" ||
              status === "completed" ||
              status === "stopped"
                ? _jsxs("button", {
                    onClick: (e) => {
                      e.stopPropagation();
                      startGroupTask(
                        data.task?.userIntent || "Execute objective",
                      );
                    },
                    disabled: isOrchestrating || memberCount === 0,
                    className:
                      "flex-1 flex items-center justify-center gap-2 py-2 bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/20 text-brand-purple rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50",
                    children: [_jsx(Play, { size: 12 }), " Orchestrate"],
                  })
                : _jsxs(_Fragment, {
                    children: [
                      _jsxs("button", {
                        onClick: (e) => {
                          e.stopPropagation();
                          pauseGroup();
                        },
                        className:
                          "flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase transition-all",
                        children: [_jsx(Pause, { size: 12 }), " Pause All"],
                      }),
                      _jsxs("button", {
                        onClick: (e) => {
                          e.stopPropagation();
                          stopGroup();
                        },
                        className:
                          "flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase transition-all",
                        children: [_jsx(Square, { size: 12 }), " Stop All"],
                      }),
                    ],
                  }),
          }),
        ],
      }),
    ],
  });
};
