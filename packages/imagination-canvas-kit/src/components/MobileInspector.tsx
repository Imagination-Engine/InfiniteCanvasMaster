import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInspector: React.FC<MobileInspectorProps> = ({
  isOpen,
  onClose,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial width
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Don't render on desktop sizes or if not open
  if (!isMobile || !isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "black",
              zIndex: 9999,
            }}
            onClick={onClose}
          />
          <motion.div
            className="bottom-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50vh",
              backgroundColor: "white",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              padding: "16px",
              zIndex: 10000,
              boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "#d1d5db",
                borderRadius: "2px",
                margin: "0 auto 16px",
              }}
            />
            <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Inspector</h2>
            {/* Inspector Content Goes Here */}
            <div style={{ marginTop: "16px" }}>
              <p>Mobile-optimized controls...</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
