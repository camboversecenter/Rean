import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

// Helper to highlight specific AI mentions
const processMentions = (text: string) => {
  // Regex looks for @tonsay or @sopheatonsay (case insensitive)
  const parts = text.split(/(@(?:tonsay|sopheatonsay)\b)/gi);

  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    /@(?:tonsay|sopheatonsay)\b/i.test(part) ? (
      <span
        key={i}
        className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded text-[0.9em] mx-0.5 inline-block"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

// Component to handle children mapping
const HighlightRenderer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return processMentions(child);
        }
        return child;
      })}
    </>
  );
};

const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  return (
    <div
      className={`prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 ${className} prose-strong:font-bold prose-strong:inherit`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="rounded-lg overflow-hidden my-3 shadow-sm border border-gray-700/50">
                <div className="bg-[#282c34] px-4 py-1.5 text-xs text-gray-400 font-mono border-b border-gray-700 flex justify-between items-center">
                  <span>{match[1]}</span>
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85em' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className={`${className} bg-gray-100 text-red-500 px-1.5 py-0.5 rounded font-mono text-xs border border-gray-200`}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Override paragraph to handle mentions in text
          p: ({ children }) => (
            <p className="mb-2">
              <HighlightRenderer>{children}</HighlightRenderer>
            </p>
          ),
          // Override list item to handle mentions in text
          li: ({ children }) => (
            <li>
              <HighlightRenderer>{children}</HighlightRenderer>
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownText;
