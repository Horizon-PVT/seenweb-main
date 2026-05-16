import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TypewriterMarkdownProps = {
  content: string;
  enabled?: boolean;
  speed?: number;
  className?: string;
};

export default function TypewriterMarkdown({
  content,
  enabled = true,
  speed = 8,
  className,
}: TypewriterMarkdownProps) {
  const [visibleText, setVisibleText] = useState(enabled ? "" : content);

  useEffect(() => {
    if (!enabled) {
      setVisibleText(content);
      return;
    }

    setVisibleText("");
    if (!content) return;

    let index = 0;
    const step = Math.max(1, Math.floor(speed));
    const interval = window.setInterval(() => {
      index = Math.min(content.length, index + step);
      setVisibleText(content.slice(0, index));

      if (index >= content.length) {
        window.clearInterval(interval);
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [content, enabled, speed]);

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{visibleText}</ReactMarkdown>
    </div>
  );
}
