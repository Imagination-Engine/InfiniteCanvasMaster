import React from "react";

interface MarkdownTextProps {
  text: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ text }) => {
  if (!text) return null;

  // Split content by block-level elements (lines)
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // 1. Handle Bullet lists starting with '-' or '*'
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <ul key={lineIdx} className="list-disc pl-4 space-y-1 my-1">
              <li className="text-slate-200">
                {renderInlineMarkdown(content)}
              </li>
            </ul>
          );
        }

        // 2. Handle Ordered lists starting with numbers e.g. "1. "
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const content = numMatch[2];
          return (
            <ol key={lineIdx} className="list-decimal pl-4 space-y-1 my-1">
              <li className="text-slate-200">
                {renderInlineMarkdown(content)}
              </li>
            </ol>
          );
        }

        // 3. Handle empty line (paragraph spacer)
        if (trimmed === "") {
          return <div key={lineIdx} className="h-2" />;
        }

        // 4. Default paragraph text
        return (
          <p key={lineIdx} className="text-slate-200 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses inline formatting tags: bold, italics, and inline code.
 */
function renderInlineMarkdown(content: string): React.ReactNode[] {
  // Regex to match inline code (`code`), bold (**bold** or __bold__), and italics (*italic* or _italic_)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^*]+__|\*[^*]+\*|_[^*]+_)/g;
  const parts = content.split(regex);

  return parts.map((part, idx) => {
    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-brand-cyan"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold: **text** or __text__
    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Italic: *text* or _text_
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return (
        <em key={idx} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    // Plain text
    return part;
  });
}
