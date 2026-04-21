import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChapterView } from './ChapterView';

describe('ChapterView Component', () => {
  it('renders correctly with given data', () => {
    render(<ChapterView data={{ test: true }} />);
    expect(screen.getByTestId('chapter-view')).toBeInTheDocument();
    expect(screen.getByText('Chapter')).toBeInTheDocument();
  });
});
