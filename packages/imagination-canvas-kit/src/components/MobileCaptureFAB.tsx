import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileCaptureFABProps {
  onCapture: () => void;
  onOrganize: () => void;
}

export const MobileCaptureFAB: React.FC<MobileCaptureFABProps> = ({
  onCapture,
  onOrganize,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "16px",
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={() => {
                onOrganize();
                setIsOpen(false);
              }}
              style={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "24px",
                padding: "12px 24px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
                color: "#3b82f6",
              }}
            >
              ✨ Organize
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                onCapture();
                setIsOpen(false);
              }}
              style={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "24px",
                padding: "12px 24px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              📷 Capture
            </motion.button>
          </>
        )}
      </AnimatePresence>

      <motion.button
        aria-label="Add"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "28px",
          backgroundColor: "#111827",
          color: "white",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
        }}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>+</motion.div>
      </motion.button>
    </div>
  );
};
