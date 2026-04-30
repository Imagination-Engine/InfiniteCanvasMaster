import React from 'react';

export interface ChapterViewProps {
  data: any;
}

export const ChapterView: React.FC<ChapterViewProps> = ({ data }) => {
  return (
    <div data-testid="chapter-view">
      <h3>Chapter</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
