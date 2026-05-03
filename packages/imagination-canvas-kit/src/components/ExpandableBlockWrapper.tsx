import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpansionStore } from "../state/expansionStore";
import { BaseCanvasObject } from "../contracts";

interface ExpandableBlockWrapperProps {
  block: BaseCanvasObject;
  children: React.ReactNode;
}

export const ExpandableBlockWrapper: React.FC<ExpandableBlockWrapperProps> = ({
  block,
  children,
}) => {
  const { activeExpansionId, activeMode, setExpanded, clearExpanded } =
    useExpansionStore();
  const isExpanded = activeExpansionId === block.id;

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(block.id, "fullscreen");
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearExpanded();
  };

  return (
    <>
      {/* Inline / Canvas Version */}
      <motion.div
        layoutId={`expandable-${block.id}`}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          visibility: isExpanded ? "hidden" : "visible",
        }}
      >
        {children}

        {/* Simple expand affordance if not expanded */}
        {!isExpanded && (
          <button
            onClick={handleExpand}
            className="expand-btn"
            style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}
          >
            Expand
          </button>
        )}
      </motion.div>

      {/* Expanded / Fullscreen Overlay Version */}
      <AnimatePresence>
        {isExpanded && activeMode === "fullscreen" && (
          <motion.div
            className="expanded-overlay"
            layoutId={`expandable-${block.id}`}
            initial={{ borderRadius: 12 }}
            animate={{ borderRadius: 0 }}
            exit={{ borderRadius: 12 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "white",
              zIndex: 9999, // Extremely high z-index to overlay canvas
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <button
              onClick={handleClose}
              style={{ alignSelf: "flex-end", marginBottom: "20px" }}
            >
              Close
            </button>
            <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
