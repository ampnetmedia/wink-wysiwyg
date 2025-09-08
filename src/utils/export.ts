import { Editor } from "@tiptap/react";
import { ExportConfig, ImportConfig } from "../types/editor";

/**
 * Export editor content in various formats
 *
 * @param editor - The TipTap editor instance
 * @param config - Export configuration
 * @returns Exported content
 */
export const exportContent = (editor: Editor, config: ExportConfig): string => {
  const {
    format,
    includeStyles = false,
    includeMetadata = false,
    options = {},
  } = config;

  switch (format) {
    case "html":
      return exportToHtml(editor, {
        includeStyles,
        includeMetadata,
        ...options,
      });
    case "markdown":
      return exportToMarkdown(editor, { includeMetadata, ...options });
    case "text":
      return exportToText(editor, { includeMetadata, ...options });
    case "json":
      return exportToJson(editor, { includeMetadata, ...options });
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Import content into editor from various formats
 *
 * @param editor - The TipTap editor instance
 * @param content - Content to import
 * @param config - Import configuration
 */
export const importContent = (
  editor: Editor,
  content: string,
  config: ImportConfig
): void => {
  const { format, sanitize = true, options = {} } = config;

  switch (format) {
    case "html":
      importFromHtml(editor, content, { sanitize, ...options });
      break;
    case "markdown":
      importFromMarkdown(editor, content, { sanitize, ...options });
      break;
    case "text":
      importFromText(editor, content, { ...options });
      break;
    case "json":
      importFromJson(editor, content, { sanitize, ...options });
      break;
    default:
      throw new Error(`Unsupported import format: ${format}`);
  }
};

/**
 * Export to HTML format
 */
const exportToHtml = (
  editor: Editor,
  options: {
    includeStyles?: boolean;
    includeMetadata?: boolean;
    [key: string]: any;
  }
): string => {
  let html = editor.getHTML();

  if (options.includeStyles) {
    // Add inline styles for better portability
    html = addInlineStyles(html);
  }

  if (options.includeMetadata) {
    // Add metadata comments
    const metadata = {
      exportedAt: new Date().toISOString(),
      wordCount: editor.storage.characterCount?.words() || 0,
      characterCount: editor.storage.characterCount?.characters() || 0,
    };

    html = `<!-- W-Ink Export Metadata: ${JSON.stringify(metadata)} -->\n${html}`;
  }

  return html;
};

/**
 * Export to Markdown format
 */
const exportToMarkdown = (
  editor: Editor,
  options: {
    includeMetadata?: boolean;
    [key: string]: any;
  }
): string => {
  // This is a basic implementation
  // In a real implementation, you'd want to use a proper HTML to Markdown converter
  let markdown = editor.getText();

  if (options.includeMetadata) {
    const metadata = {
      exportedAt: new Date().toISOString(),
      wordCount: editor.storage.characterCount?.words() || 0,
      characterCount: editor.storage.characterCount?.characters() || 0,
    };

    markdown = `<!-- W-Ink Export Metadata: ${JSON.stringify(metadata)} -->\n\n${markdown}`;
  }

  return markdown;
};

/**
 * Export to plain text format
 */
const exportToText = (
  editor: Editor,
  options: {
    includeMetadata?: boolean;
    [key: string]: any;
  }
): string => {
  let text = editor.getText();

  if (options.includeMetadata) {
    const metadata = {
      exportedAt: new Date().toISOString(),
      wordCount: editor.storage.characterCount?.words() || 0,
      characterCount: editor.storage.characterCount?.characters() || 0,
    };

    text = `W-Ink Export Metadata: ${JSON.stringify(metadata)}\n\n${text}`;
  }

  return text;
};

/**
 * Export to JSON format
 */
const exportToJson = (
  editor: Editor,
  options: {
    includeMetadata?: boolean;
    [key: string]: any;
  }
): string => {
  const json = editor.getJSON();

  if (options.includeMetadata) {
    const metadata = {
      exportedAt: new Date().toISOString(),
      wordCount: editor.storage.characterCount?.words() || 0,
      characterCount: editor.storage.characterCount?.characters() || 0,
    };

    return JSON.stringify(
      {
        content: json,
        metadata,
      },
      null,
      2
    );
  }

  return JSON.stringify(json, null, 2);
};

/**
 * Import from HTML format
 */
const importFromHtml = (
  editor: Editor,
  content: string,
  options: {
    sanitize?: boolean;
    [key: string]: any;
  }
): void => {
  let html = content;

  if (options.sanitize) {
    // Import sanitize function
    const { sanitizeHtml } = require("./sanitize");
    html = sanitizeHtml(html);
  }

  editor.commands.setContent(html);
};

/**
 * Import from Markdown format
 */
const importFromMarkdown = (
  editor: Editor,
  content: string,
  options: {
    sanitize?: boolean;
    [key: string]: any;
  }
): void => {
  // This is a basic implementation
  // In a real implementation, you'd want to use a proper Markdown to HTML converter
  let html = content;

  // Basic markdown to HTML conversion
  html = html
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
    .replace(/^##### (.*$)/gim, "<h5>$1</h5>")
    .replace(/^###### (.*$)/gim, "<h6>$1</h6>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/`(.*)`/gim, "<code>$1</code>")
    .replace(/\n/gim, "<br>");

  if (options.sanitize) {
    const { sanitizeHtml } = require("./sanitize");
    html = sanitizeHtml(html);
  }

  editor.commands.setContent(html);
};

/**
 * Import from plain text format
 */
const importFromText = (
  editor: Editor,
  content: string,
  options: {
    [key: string]: any;
  }
): void => {
  // Convert plain text to HTML
  const html = content.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");

  editor.commands.setContent(html);
};

/**
 * Import from JSON format
 */
const importFromJson = (
  editor: Editor,
  content: string,
  options: {
    sanitize?: boolean;
    [key: string]: any;
  }
): void => {
  try {
    const json = JSON.parse(content);

    // Handle metadata wrapper
    const contentData = json.content || json;

    editor.commands.setContent(contentData);
  } catch (error) {
    console.error("Error parsing JSON content:", error);
    throw new Error("Invalid JSON content");
  }
};

/**
 * Add inline styles to HTML content
 */
const addInlineStyles = (html: string): string => {
  // This is a basic implementation
  // In a real implementation, you'd want to extract and inline CSS styles

  const styles = `
    <style>
      .wink-mention {
        background-color: #dbeafe;
        color: #1e40af;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }
      .wink-hashtag {
        background-color: #f3e8ff;
        color: #7c3aed;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }
      .wink-link {
        color: #3b82f6;
        text-decoration: underline;
      }
      .wink-image {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
    </style>
  `;

  return `${styles}\n${html}`;
};

/**
 * Get content statistics
 */
export const getContentStats = (editor: Editor) => {
  return {
    wordCount: editor.storage.characterCount?.words() || 0,
    characterCount: editor.storage.characterCount?.characters() || 0,
    paragraphCount: editor.state.doc.content.childCount,
    isEmpty: editor.isEmpty,
  };
};

/**
 * Validate content before import
 */
export const validateContent = (content: string, format: string): boolean => {
  switch (format) {
    case "html":
      return isValidHtml(content);
    case "json":
      return isValidJson(content);
    case "markdown":
    case "text":
      return typeof content === "string" && content.length > 0;
    default:
      return false;
  }
};

/**
 * Check if HTML content is valid
 */
const isValidHtml = (html: string): boolean => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return !doc.querySelector("parsererror");
  } catch {
    return false;
  }
};

/**
 * Check if JSON content is valid
 */
const isValidJson = (json: string): boolean => {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};
