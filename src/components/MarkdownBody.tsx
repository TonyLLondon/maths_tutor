"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Props = {
  markdown: string;
  className?: string;
};

export function MarkdownBody({ markdown, className }: Props) {
  return (
    <div className={className ?? "worksheet-markdown"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h2: ({ children }) => (
            <h2 className="worksheet-section-title">{children}</h2>
          ),
          ol: ({ children }) => (
            <ol className="worksheet-questions">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="worksheet-bullets">{children}</ul>
          ),
          p: ({ children }) => <p className="worksheet-p">{children}</p>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
