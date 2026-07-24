"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { resolveMtLearnHref } from "@/lib/paths";

type Props = {
  markdown: string;
  className?: string;
  /** When set, `mtlearn:` links in markdown resolve to in-app learn routes. */
  tenantId?: string;
};

export function MarkdownBody({ markdown, className, tenantId }: Props) {
  return (
    <div className={className ?? "worksheet-markdown"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h2: ({ children }) => (
            <h2 className="worksheet-section-title">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 text-base font-semibold text-stone-900">{children}</h3>
          ),
          ol: ({ children }) => (
            <ol className="worksheet-questions">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="worksheet-bullets">{children}</ul>
          ),
          p: ({ children }) => <p className="worksheet-p">{children}</p>,
          a: ({ href, children }) => {
            if (href && tenantId) {
              const resolved = resolveMtLearnHref(tenantId, href);
              if (resolved) {
                return (
                  <Link
                    href={resolved}
                    className="font-medium text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-950"
                  >
                    {children}
                  </Link>
                );
              }
            }
            if (href?.startsWith("/t/")) {
              return (
                <Link
                  href={href}
                  className="font-medium text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-950"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                className="font-medium text-sky-800 underline decoration-sky-300 underline-offset-2"
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                target={href?.startsWith("http") ? "_blank" : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
