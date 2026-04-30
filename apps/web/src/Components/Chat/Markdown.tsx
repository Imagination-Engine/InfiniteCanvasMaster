import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown = memo(({ content, className }: MarkdownProps) => {
  return (
    <div className={cn('prose prose-invert prose-sm max-w-none break-words', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
          rehypeKatex,
        ]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group my-4">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{match[1]}</span>
                </div>
                <pre className={cn('overflow-x-auto rounded-xl bg-black/40 p-4 border border-white/5', className)}>
                  <code {...props}>{children}</code>
                </pre>
              </div>
            ) : (
              <code className={cn('bg-white/10 rounded px-1.5 py-0.5 font-mono text-xs', className)} {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-slate-300">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-4 mb-4 space-y-2 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-4 mb-4 space-y-2 text-slate-300">{children}</ol>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brand-purple/50 pl-4 italic text-slate-400 my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

Markdown.displayName = 'Markdown';
