// File: packages/imagination-canvas-kit/src/components/BlockAssistantPanel.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bot, Zap, Send } from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";

interface Props {
  selectedId: string;
  object: any; // replace with proper block type
  onClose: () => void;
}

export const BlockAssistantPanel: React.FC<Props> = ({
  selectedId,
  object,
  onClose,
}) => {
  const [chatHistories, setChatHistories] =
    useState <
    Record<
      string,
      Array<{
        role: "user" | "assistant" | "system-notification";
        content: string;
      }>
    >({});
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const accessToken = useCanvasStore((s) => s.accessToken);
  const updateObject = useCanvasStore((s) => s.updateObject);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, []);

  const getInitialGreeting = useCallback((type: string, name: string) => {
    return `Hello! I am your specialized AI Assistant for this **${name}** block.\n\nI have loaded the block parameters and schema. I can explain how to use it or help you configure it dynamically.\n\nFor example, you can ask me:\n- \"What does this block do?\"\n- \"Configure this block to use gemini-2.5-flash\"\n- \"Set webhook path to /users/signup\"`;
  }, []);

  const currentHistory = useMemo(() => {
    if (!selectedId) return [];
    const existing = chatHistories[selectedId];
    if (existing) return existing;
    return [
      {
        role: "assistant" as const,
        content: getInitialGreeting(
          object.type,
          object.metadata?.label || "Block",
        ),
      },
    ];
  }, [selectedId, chatHistories, object, getInitialGreeting]);

  useEffect(() => {
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [isStreaming, currentHistory, scrollToBottom]);

  const renderMarkdown = useCallback((text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[a-z]*\n[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("```")) {
        const lines = part.split("\n");
        const code = lines.slice(1, -1).join("\n");
        return (
          <pre
            key={idx}
            className="my-2 p-3 rounded-xl bg-black/40 border border-white/5 overflow-x-auto text-[10px] font-mono text-brand-cyan leading-normal"
          >
            <code>{code}</code>
          </pre>
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-black/30 border border-white/5 text-[10px] font-mono text-brand-cyan"
          >
            {part.slice(1, -1)}
          </code>
        );
      } else if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-extrabold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part.split("\n").map((line, lIdx) => (
        <span key={`${idx}-${lIdx}`} className="block min-h-[0.5rem]">
          {line}
        </span>
      ));
    });
  }, []);

  const suggestionChips = useMemo(
    () => ["Explain this block", "List parameters", "Optimize parameters"],
    [],
  );

  const handleChatSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg = { role: "user" as const, content: text };
      const updatedHistory = [...currentHistory, userMsg];

      setChatHistories((prev) => ({ ...prev, [selectedId]: updatedHistory }));
      setInputValue("");
      setIsStreaming(true);

      const blockContext = {
        instanceId: selectedId,
        type: object.type,
        currentData: {
          ...(object.metadata?.config || {}),
          ...(object.metadata?.inputs || {}),
        },
      };

      const serverMessages = updatedHistory
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        // Debug: log the request payload for block assistant
        console.log("[BlockAssistantPanel] Sending request to", url, {
          sessionId: `block-chat-${selectedId}`,
          messages: serverMessages,
          blockContext,
        });
        const url = "http://localhost:3001/api/chat";
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            sessionId: `block-chat-${selectedId}`,
            messages: serverMessages,
            blockContext,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "[BlockAssistantPanel] Error response:",
            response.status,
            errorText,
          );
          throw new Error(
            `Failed to send message: ${response.status} ${response.statusText}`,
          );
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response stream reader available");

        let assistantResponseContent = "";
        setChatHistories((prev) => ({
          ...prev,
          [selectedId]: [
            ...updatedHistory,
            { role: "assistant" as const, content: "" },
          ],
        }));

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(Boolean);

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const textChunk = JSON.parse(line.slice(2));
                assistantResponseContent += textChunk;
                setChatHistories((prev) => {
                  const hist = [...(prev[selectedId] || [])];
                  if (hist.length > 0) {
                    hist[hist.length - 1] = {
                      role: "assistant" as const,
                      content: assistantResponseContent,
                    };
                  }
                  return { ...prev, [selectedId]: hist };
                });
              } catch (e) {
                console.error("Error parsing text chunk:", e);
              }
            } else if (line.startsWith("9:")) {
              try {
                const toolData = JSON.parse(line.slice(2));
                if (toolData.toolName === "configure_block") {
                  const newParams =
                    toolData.result?.params || toolData.args?.params || {};
                  updateObject(selectedId, {
                    metadata: {
                      ...object.metadata,
                      config: {
                        ...(object.metadata?.config || {}),
                        ...newParams,
                      },
                      inputs: {
                        ...(object.metadata?.inputs || {}),
                        ...newParams,
                      },
                    },
                  });
                  const paramKeys = Object.keys(newParams);
                  const notificationText = `Updated parameters: ${paramKeys.map((k) => `\`${k}\` = "${newParams[k]}"`).join(", ")}`;
                  setChatHistories((prev) => {
                    const hist = [...(prev[selectedId] || [])];
                    hist.push({
                      role: "system-notification" as const,
                      content: notificationText,
                    });
                    return { ...prev, [selectedId]: hist };
                  });
                }
              } catch (e) {
                console.error("Error processing tool data:", e);
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Block AI Error:", err);
        setChatHistories((prev) => ({
          ...prev,
          [selectedId]: [
            ...(prev[selectedId] || []),
            {
              role: "assistant" as const,
              content: `⚠️ Error communicating with AI: ${err.message}`,
            },
          ],
        }));
      } finally {
        setIsStreaming(false);
      }
    },
    [
      currentHistory,
      selectedId,
      object,
      accessToken,
      updateObject,
      isStreaming,
    ],
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0A0A0F]/20">
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {currentHistory.map((msg, index) => {
          if (msg.role === "system-notification") {
            return (
              <div key={index} className="flex justify-center my-2">
                <div className="px-3 py-1.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-[9px] text-brand-cyan font-bold tracking-wide flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,194,255,0.05)] max-w-[90%]">
                  <Zap size={10} className="text-brand-cyan animate-pulse" />
                  <span className="truncate">{msg.content}</span>
                </div>
              </div>
            );
          }
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${
                  isUser
                    ? "rounded-tr-sm bg-brand-purple/20 border border-brand-purple/30 text-white"
                    : "rounded-tl-sm bg-white/5 border border-white/10 text-white/90"
                }`}
              >
                {renderMarkdown(msg.content)}
              </div>
            </div>
          );
        })}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-3 text-xs text-white/90 flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">
                Agent streaming...
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="px-4 pb-2 pt-1 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            disabled={isStreaming}
            onClick={() => handleChatSubmit(chip)}
            className="px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/60 hover:text-white hover:border-brand-purple/40 hover:bg-brand-purple/10 disabled:opacity-40 disabled:pointer-events-none transition-all font-bold uppercase tracking-wider shrink-0 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleChatSubmit(inputValue);
        }}
        className="p-3 border-t border-white/5 bg-white/[0.01] shrink-0 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isStreaming}
          placeholder="Ask agent..."
          className="flex-1 rounded-xl bg-white/5 border border-white/10 focus:border-brand-purple/50 focus:bg-white/[0.08] text-xs text-white px-3.5 py-2.5 placeholder:text-white/20 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isStreaming}
          className="p-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan hover:shadow-[0_0_12px_rgba(123,92,234,0.5)] transition-all text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
