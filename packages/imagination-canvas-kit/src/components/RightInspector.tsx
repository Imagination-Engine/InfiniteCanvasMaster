// @ts-nocheck
import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface RightInspectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  isOpen = false,
  onClose,
  title = "Inspector",
  children,
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`absolute right-4 top-20 bottom-6 z-30 w-80 rounded-3xl bg-brand-bg-card/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col ${className}`}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/40">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 text-white/80 text-sm">
            {children || (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-40">
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/20" />
                <p className="text-xs">
                  Select an object to view its properties
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
