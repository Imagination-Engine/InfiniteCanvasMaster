import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export interface ProseViewProps {
  data?: {
    content?: string;
    input?: any;
    output?: any;
    params?: any;
  };
}

export const ProseView: React.FC<ProseViewProps> = ({ data = {} }) => {
  const content =
    data.content ||
    data.input?.payload ||
    data.params?.payload ||
    "<p>Hello Scribe!</p>";

  const editor = useEditor({
    extensions: [StarterKit],
    content,
  });

  return (
    <div
      data-testid="prose-view"
      style={{ border: "1px solid #ccc", padding: "1rem", minHeight: "100px" }}
    >
      <h3>Prose Block</h3>
      <EditorContent editor={editor} data-testid="tiptap-editor" />
    </div>
  );
};
