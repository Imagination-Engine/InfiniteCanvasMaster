import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../auth/AuthContext";

const slides = [
  {
    title: "Welcome",
    description:
      "This is the Imagination Engine. Type what you want, and watch it appear on a canvas.",
    icon: "✨",
  },
  {
    title: "Blocks are Agents",
    description:
      "Every shape on the canvas is a little AI. Connect them to build something bigger than any one of them.",
    icon: "🤖",
  },
  {
    title: "The Canvas is yours",
    description:
      "Save what you make. Come back to it. Share it. Launch it as an app, a game, a movie.",
    icon: "🎨",
  },
  {
    title: "Type your first spark",
    description: "Let's start your journey with the Imagination Engine.",
    icon: "🚀",
    isLast: true,
  },
];

export const OnboardingCarousel: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { accessToken, completeOnboarding } = useAuth();
  const [completing, setCompleting] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleComplete = async () => {
    if (!accessToken || completing) return;
    setCompleting(true);
    try {
      await apiRequest(
        "/api/auth/complete-onboarding",
        { method: "POST" },
        accessToken,
      );
      completeOnboarding();
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Even if it fails, let them proceed for now
      completeOnboarding();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col h-[500px]">
        <div className="flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 flex flex-col items-center justify-center p-12 text-center space-y-6"
              >
                <div className="text-8xl">{slide.icon}</div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {slide.title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 flex items-center justify-between">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${index === selectedIndex ? "bg-blue-600 w-4" : "bg-gray-300"}`}
              />
            ))}
          </div>

          {slides[selectedIndex].isLast ? (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {completing ? "..." : "Let's start"}
            </button>
          ) : (
            <button
              onClick={scrollNext}
              className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
