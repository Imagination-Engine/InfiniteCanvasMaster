import React from "react";
import { useCanvasStore } from "../state/canvasStore";
import { motion, AnimatePresence } from "framer-motion";

export const AgentActivityLayer: React.FC = () => {
  const objects = useCanvasStore((s) => s.objects);
  const activeObjects = React.useMemo(
    () =>
      Object.values(objects).filter(
        (obj) => obj.status === "thinking" || obj.status === "generating",
      ),
    [objects],
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {activeObjects.map((obj) => (
          <motion.div
            key={`activity-${obj.id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              repeatType: "reverse",
            }}
            className="absolute rounded-full border-2 border-brand-purple/50 bg-brand-purple/5 shadow-[0_0_20px_rgba(123,92,234,0.3)]"
            style={{
              left: obj.x - 10,
              top: obj.y - 10,
              width: obj.width + 20,
              height: obj.height + 20,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
