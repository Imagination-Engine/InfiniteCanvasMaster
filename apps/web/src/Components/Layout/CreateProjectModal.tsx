import React, { useState } from "react";
import { X, Sparkles, Send } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, story: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [story, setStory] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name, story);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-bg-page/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-brand-bg-surface border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[80px] -z-10" />

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-purple mb-1">
                <Sparkles size={12} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  New Venture
                </span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Initialize Project
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-brand-text-muted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-muted px-1">
                Project Title
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Give your creation a name..."
                className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4 text-white placeholder:text-brand-text-muted/40 outline-none focus:border-brand-purple/50 focus:bg-white/[0.06] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-muted px-1">
                The Story (Initial Context)
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Describe what you want to build. The AI will use this as a preliminary prompt to seed your canvas."
                rows={4}
                className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4 text-white placeholder:text-brand-text-muted/40 outline-none focus:border-brand-purple/50 focus:bg-white/[0.06] transition-all resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="group relative w-full px-6 py-4 bg-linear-to-r from-brand-purple to-brand-cyan text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.25em] shadow-[0_0_20px_3px_rgba(123,92,234,0.3)] hover:shadow-[0_0_30px_3px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50"
              >
                <span className="relative z-10">
                  {isSubmitting ? "Synchronizing..." : "Create Project"}
                </span>
                {!isSubmitting && (
                  <Send
                    size={16}
                    className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
