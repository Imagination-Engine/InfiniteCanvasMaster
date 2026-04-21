import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export interface ProseViewProps {
  data: {
    content?: string;
  };
}

export const ProseView: React.FC<ProseViewProps> = ({ data }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: data.content || '<p>Hello Scribe!</p>',
  });

  return (
    <div data-testid="prose-view" style={{ border: '1px solid #ccc', padding: '1rem', minHeight: '100px' }}>
      <h3>Prose Block</h3>
      <EditorContent editor={editor} data-testid="tiptap-editor" />
    </div>
  );
};
