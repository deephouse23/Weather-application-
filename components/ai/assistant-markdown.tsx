'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface AssistantMarkdownProps {
  text: string;
  className?: string;
}

/**
 * Renders assistant text as Markdown with compact, chat-friendly styling.
 */
export function AssistantMarkdown({ text, className }: AssistantMarkdownProps) {
  return (
    <div className={cn('assistant-md text-[0.9375rem] leading-relaxed', className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => (
            <h3 className="mb-1 mt-3 text-base font-semibold first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-1 mt-3 text-base font-semibold first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>
          ),
          code: ({ className, children, ...props }) => {
            const isFenced = /language-\w+/.test(className ?? '');
            if (isFenced) {
              return (
                <code className={cn('text-xs', className)} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-black/25 px-1 py-0.5 font-mono text-[0.85em]"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded bg-black/30 p-2 font-mono text-xs last:mb-0">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline decoration-1 underline-offset-2 hover:opacity-90"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-white/30 pl-3 opacity-90 last:mb-0">
              {children}
            </blockquote>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
