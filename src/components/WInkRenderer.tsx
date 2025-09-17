import React from "react";
import { sanitizeHtml } from "../utils/sanitize";

interface RendererProps {
  content: string;
  className?: string;
  sanitizeOptions?: Parameters<typeof sanitizeHtml>[1];
}

const WInkRenderer: React.FC<RendererProps> = ({
  content,
  className = "prose",
  sanitizeOptions,
}) => {
  const safe = React.useMemo(
    () => sanitizeHtml(content, sanitizeOptions),
    [content, sanitizeOptions]
  );
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};

export default WInkRenderer;
