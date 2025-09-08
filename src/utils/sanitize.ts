import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param html - The HTML content to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (
  html: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    allowedClasses?: string[];
  }
): string => {
  const defaultOptions = {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "strike",
      "del",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "span",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      table: ["class"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      div: ["class"],
      span: ["class"],
      p: ["class"],
      h1: ["class"],
      h2: ["class"],
      h3: ["class"],
      h4: ["class"],
      h5: ["class"],
      h6: ["class"],
      ul: ["class"],
      ol: ["class"],
      li: ["class"],
      blockquote: ["class"],
      pre: ["class"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedClasses: {
      "wink-mention": ["*"],
      "wink-hashtag": ["*"],
      "wink-link": ["*"],
      "wink-image": ["*"],
    },
  };

  const sanitizeOptions = {
    ...defaultOptions,
    ...options,
  };

  return DOMPurify.sanitize(html, sanitizeOptions as any) as string;
};

/**
 * Validate URL to ensure it's safe
 *
 * @param url - The URL to validate
 * @returns Whether the URL is safe
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize URL to prevent malicious links
 *
 * @param url - The URL to sanitize
 * @returns Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!isValidUrl(url)) {
    return null;
  }

  // Additional checks for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return null;
    }
  }

  return url;
};

/**
 * Sanitize image source URL
 *
 * @param src - The image source URL
 * @returns Sanitized image source or null if invalid
 */
export const sanitizeImageSrc = (src: string): string | null => {
  if (!isValidUrl(src)) {
    return null;
  }

  // Check if it's an image URL
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const hasImageExtension = imageExtensions.some((ext) =>
    src.toLowerCase().includes(ext)
  );

  // Allow data URLs for images
  if (src.startsWith("data:image/")) {
    return src;
  }

  // Allow image URLs
  if (hasImageExtension) {
    return src;
  }

  return null;
};

/**
 * Remove potentially dangerous HTML attributes
 *
 * @param html - The HTML content
 * @returns HTML with dangerous attributes removed
 */
export const removeDangerousAttributes = (html: string): string => {
  const dangerousAttributes = [
    "onload",
    "onerror",
    "onclick",
    "onmouseover",
    "onmouseout",
    "onfocus",
    "onblur",
    "onchange",
    "onsubmit",
    "onreset",
    "onkeydown",
    "onkeyup",
    "onkeypress",
  ];

  let sanitized = html;

  dangerousAttributes.forEach((attr) => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, "gi");
    sanitized = sanitized.replace(regex, "");
  });

  return sanitized;
};

/**
 * Sanitize content for safe display
 *
 * @param content - The content to sanitize
 * @param options - Sanitization options
 * @returns Sanitized content
 */
export const sanitizeContent = (
  content: string,
  options?: {
    allowHtml?: boolean;
    maxLength?: number;
    allowedTags?: string[];
  }
): string => {
  const { allowHtml = true, maxLength, allowedTags } = options || {};

  let sanitized = content;

  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Sanitize HTML if allowed
  if (allowHtml) {
    sanitized = sanitizeHtml(sanitized, { allowedTags });
  } else {
    // Escape HTML if not allowed
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  return sanitized;
};
