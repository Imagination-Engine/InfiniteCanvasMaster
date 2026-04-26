import { KeyboardEvent } from "react";

interface UseComposerSubmitArgs {
  onSubmit: () => void;
  onStop?: () => void;
  isStreaming?: boolean;
}

export function useComposerSubmit({
  onSubmit,
  onStop,
  isStreaming,
}: UseComposerSubmitArgs) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleButtonClick = () => {
    if (isStreaming && onStop) {
      onStop();
    } else {
      onSubmit();
    }
  };

  return {
    handleKeyDown,
    handleButtonClick,
  };
}
