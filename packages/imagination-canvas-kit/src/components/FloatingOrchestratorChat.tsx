// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, X, Send, Sparkles } from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";
import { useViewportStore } from "../state/viewportStore";
import { useExpansionStore } from "../state/expansionStore";
import { useConnectionStore } from "../state/connectionStore";
import { useSelectionStore } from "../state/selectionStore";
import { GrowingTextarea } from "@iem/chat-interaction-kit";
import { classifyOrchestratorIntent } from "../utils/orchestratorIntentClassifier";
import { useOrchestratorContext } from "../hooks/useOrchestratorContext";
import { extractAgentTraits } from "../utils/orchestratorTraitExtractor";

/**
 * Orchestrator Drawer: Fixed-width, right-docked production chat interface.
 * Mirrored exactly from BlockLibraryDrawer to ensure layout stability.
 */
export const FloatingOrchestratorChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedBlock, lastDroppedBlock, sessionContext } =
    useOrchestratorContext();

  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: string;
      content: string;
      type?: "text" | "artifact" | "card";
    }>
  >([
    {
      id: "msg-1",
      role: "agent",
      content:
        "I am your Canvas Orchestrator. Tell me what you want to build and I will generate the blueprint.",
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addObject = useCanvasStore((s) => s.addObject);
  const addConnection = useConnectionStore((s) => s.addConnection);
  const setSelection = useSelectionStore((s) => s.setSelection);

  // React to canvas changes
  useEffect(() => {
    if (lastDroppedBlock) {
      const blockName =
        lastDroppedBlock.metadata?.label || lastDroppedBlock.type;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "agent",
          content: `I see you added a ${blockName} block. How should we wire this into the flow?`,
          type: "text",
        },
      ]);
    }
  }, [lastDroppedBlock]);

  useEffect(() => {
    if (
      messagesEndRef.current &&
      typeof messagesEndRef.current.scrollIntoView === "function"
    ) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      } catch (e) {}
    }
  }, [messages, isOpen]);

  const getViewportCenter = () => {
    const viewport = useViewportStore.getState();
    const width = viewport.width || window.innerWidth || 1200;
    const height = viewport.height || window.innerHeight || 800;

    return {
      x: (width / 2 - viewport.x) / viewport.zoom,
      y: (height / 2 - viewport.y) / viewport.zoom,
    };
  };

  const createWorkingBlueprint = (sourceInput: string) => {
    const lowerInput = sourceInput.toLowerCase();
    const center = getViewportCenter();
    const suffix = Date.now();
    const isGame =
      /game|playable|player|sprite|joystick|platform|rpg|arcade|level/.test(
        lowerInput,
      );

    const blueprint = isGame
      ? {
          response:
            "I placed a playable game studio graph on the canvas: controls, player, physics, collision, score, and runtime are wired together.",
          nodes: [
            [
              "game-studio",
              "iem.studio.game",
              "Game Studio",
              "Coordinates the playable surface.",
              0,
              0,
            ],
            [
              "input",
              "iem.playable.input",
              "Input Controller",
              "Maps keyboard or joystick intent.",
              1,
              -0.6,
            ],
            [
              "player",
              "iem.playable.sprite",
              "Player Sprite",
              "The visible controllable character.",
              2,
              -0.6,
            ],
            [
              "physics",
              "iem.playable.physicsEntity",
              "Physics Entity",
              "Movement and collision state.",
              3,
              -0.6,
            ],
            [
              "collider",
              "iem.playable.collider",
              "Collision Rules",
              "Detects pickups and obstacles.",
              4,
              -0.6,
            ],
            [
              "score",
              "iem.playable.score",
              "Score System",
              "Tracks points and objectives.",
              5,
              -0.6,
            ],
            [
              "runtime",
              "iem.app.game",
              "Playable Runtime",
              "Runs the current playable scene.",
              6,
              0,
            ],
          ],
          edges: [
            ["game-studio", "input"],
            ["input", "player"],
            ["player", "physics"],
            ["physics", "collider"],
            ["collider", "score"],
            ["score", "runtime"],
          ],
        }
      : {
          response:
            "I placed a working starter workflow on the canvas: goal, plan, builder agent, and output artifact are wired together.",
          nodes: [
            [
              "goal",
              "iem.intent.goal",
              "Goal",
              sourceInput || "Capture the desired outcome.",
              0,
              0,
            ],
            [
              "plan",
              "iem.intent.plan",
              "Plan",
              "Break the goal into executable steps.",
              1,
              0,
            ],
            [
              "agent",
              "iem.agent.agent",
              "Builder Agent",
              "Executes the next concrete step.",
              2,
              0,
            ],
            [
              "artifact",
              "iem.data.artifact",
              "Output Artifact",
              "Stores the current result for review.",
              3,
              0,
            ],
          ],
          edges: [
            ["goal", "plan"],
            ["plan", "agent"],
            ["agent", "artifact"],
          ],
        };

    const ids: string[] = [];
    const idMap = new Map<string, string>();
    const startX = center.x - 520;
    const startY = center.y - 160;

    blueprint.nodes.forEach(([key, type, label, description, column, row]) => {
      const id = `${key}-${suffix}`;
      idMap.set(key, id);
      ids.push(id);
      addObject({
        id,
        type,
        x: startX + Number(column) * 360,
        y: startY + Number(row) * 260,
        width: type === "iem.app.game" ? 360 : 320,
        height: type === "iem.app.game" ? 260 : 220,
        zIndex: 1 + Number(column),
        status: type === "iem.app.game" ? "running" : "idle",
        metadata: {
          label,
          description,
          runtime: type === "iem.app.game" ? "PLAYABLE" : "LIVE",
          title: type === "iem.app.game" ? "Playable Runtime" : label,
          appUrl:
            type === "iem.app.game" ? "/playable-runtime.html" : undefined,
          capabilities: ["inspect", "connect", "move"],
        },
      });
    });

    blueprint.edges.forEach(([sourceKey, targetKey]) => {
      const fromId = idMap.get(sourceKey);
      const toId = idMap.get(targetKey);
      if (!fromId || !toId) return;
      addConnection({
        id: `edge-${fromId}-${toId}`,
        fromId,
        toId,
      });
    });

    setSelection(ids);
    requestAnimationFrame(() => {
      useViewportStore.getState().zoomToSelection(ids, 120);
    });

    return blueprint.response;
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);

    // Classify intent
    const intent = classifyOrchestratorIntent(input);
    setInput("");

    // --- Intent Analysis & Canvas Interaction ---
    setTimeout(() => {
      let response = "";

      if (intent === "emotional_expression") {
        const reactions = [
          "I am so glad you are enjoying the creative process! What should we build next?",
          "Thanks! I'm here to help you bring your imagination to life. Any specific ideas?",
          "That means a lot! The canvas is ready for your next big move.",
        ];
        response = reactions[Math.floor(Math.random() * reactions.length)];
      } else if (intent === "create_block") {
        const lowerInput = input.toLowerCase();

        // Calculate intelligent placement (center of viewport)
        const viewport = useViewportStore.getState();
        const vw = viewport.width || 1000;
        const vh = viewport.height || 1000;
        const dropX = (vw / 2 - viewport.x) / viewport.zoom - 150;
        const dropY = (vh / 2 - viewport.y) / viewport.zoom - 100;

        if (
          /game|playable|player|sprite|joystick|platform|rpg|arcade|level|workflow|blueprint|canvas|studio/.test(
            lowerInput,
          )
        ) {
          response = createWorkingBlueprint(input);
        } else if (
          lowerInput.includes("agent") ||
          lowerInput.includes("claw")
        ) {
          const traits = extractAgentTraits(input);
          const label = traits.role
            ? `${traits.role.charAt(0).toUpperCase() + traits.role.slice(1)} Agent`
            : "Autonomous Builder";

          response = traits.role
            ? `Initializing ${label} runtime. Dropping them onto the canvas for you.`
            : "Initializing OpenClaw runtime. Spinning up a builder agent on the canvas.";

          addObject({
            id: `agent-${Date.now()}`,
            type: "agent",
            x: dropX,
            y: dropY,
            width: 320,
            height: 260,
            zIndex: 1,
            status: "thinking",
            metadata: {
              label,
              description:
                traits.description || "Defining my purpose on the canvas...",
            },
          });
        } else if (
          lowerInput.includes("note") ||
          lowerInput.includes("write")
        ) {
          response = `I've drafted a narrative spine related to "${sessionContext || "your project"}". Dropping a Note block onto the canvas for you.`;
          addObject({
            id: `note-${Date.now()}`,
            type: "note",
            x: dropX,
            y: dropY,
            width: 300,
            height: 200,
            zIndex: 1,
            status: "idle",
            metadata: { label: "Orchestrator Note" },
          });
        } else {
          response =
            "I see you want to create something. Which block should I drop in?";
        }
      } else if (intent === "question") {
        if (selectedBlock) {
          response = `You currently have the "${selectedBlock.metadata?.label || selectedBlock.type}" block selected. It's currently in a "${selectedBlock.status}" state. What would you like to know about it?`;
        } else {
          response =
            "That's a great question. I can help you understand the current canvas layout or suggest new blocks to connect.";
        }
      } else if (intent === "plan_request" || intent === "run_workflow") {
        response = createWorkingBlueprint(input);
      } else {
        response = createWorkingBlueprint(input);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "agent",
          content: response,
          type: "text",
        },
      ]);
    }, 800);
  };

  const { activeExpansionId } = useExpansionStore();
  const isExpanded = !!activeExpansionId;

  return (
    <React.Fragment>
      {/* Toggle Tab - Mirroring Library Drawer Pattern Exactly */}
      {!isOpen && !isExpanded && (
        <button
          aria-label="Open Orchestrator"
          title="Open Canvas Orchestrator"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[10006] p-3 bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white hover:text-brand-cyan hover:border-brand-cyan/30 transition-colors group pointer-events-auto"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex flex-col items-center gap-2">
            <BrainCircuit size={20} className="text-brand-cyan" />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ writingMode: "vertical-rl" }}
            >
              Agent
            </span>
          </div>
        </button>
      )}

      {/* Orchestrator Drawer - Fixed & Mutation-Locked */}
      <AnimatePresence>
        {isOpen && !isExpanded && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            style={{
              width: "500px",
              minWidth: "500px",
              maxWidth: "500px",
            }}
            className="absolute right-0 top-0 bottom-0 bg-brand-bg-page/95 backdrop-blur-3xl border-l border-white/10 z-[10005] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="h-14 border-b border-white/5 bg-gradient-to-r from-brand-cyan/10 to-transparent flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2 text-brand-cyan">
                <BrainCircuit size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest text-white">
                  Orchestrator
                </h2>
              </div>
              <button
                aria-label="Close Orchestrator"
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Stream Area */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6 w-full">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={
                      "flex flex-col gap-2 w-full " +
                      (msg.role === "user" ? "items-end" : "items-start")
                    }
                  >
                    <div className="flex items-center gap-1.5 px-1">
                      <span
                        className={
                          "text-[8px] font-black uppercase tracking-widest " +
                          (msg.role === "user"
                            ? "text-white/40"
                            : "text-brand-cyan")
                        }
                      >
                        {msg.role === "user" ? "You" : "Canvas AI"}
                      </span>
                    </div>

                    <div
                      className={
                        "text-[13px] leading-relaxed p-4 rounded-2xl shadow-sm break-words overflow-hidden " +
                        (msg.role === "user"
                          ? "bg-white/10 text-white rounded-tr-sm"
                          : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-tl-sm")
                      }
                      style={{
                        maxWidth: "100%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-4 shrink-0" />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/40 shrink-0 w-full">
              <GrowingTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your intent..."
                onEnter={handleSubmit}
                className="bg-transparent border-none"
                maxHeight={150}
                actions={
                  <button
                    aria-label="Send Message"
                    type="button"
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="w-9 h-9 flex items-center justify-center text-brand-cyan disabled:text-white/20 hover:bg-brand-cyan/10 rounded-xl transition-colors"
                  >
                    <Send size={18} />
                  </button>
                }
              />
              <div className="mt-3 flex items-center justify-center gap-2 opacity-50">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">
                  <Sparkles size={10} className="text-brand-cyan" />
                  <span>Sovereign Engine Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};
