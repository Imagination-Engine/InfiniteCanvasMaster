export type TransitionType = "cinematic" | "spatial";

export const getTransition = (type: TransitionType) => {
  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return { duration: 0 };
  }

  // Exact cubic-bezier values from spec
  if (type === "cinematic") {
    return {
      duration: 0.6,
      ease: [0.2, 0.8, 0.2, 1],
    };
  }

  if (type === "spatial") {
    return {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    };
  }

  // Fallback
  return { duration: 0.3 };
};
