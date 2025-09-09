import { Mark, mergeAttributes } from "@tiptap/core";

export interface MentionHighlightOptions {
  HTMLAttributes?: Record<string, any>;
}

// Simple, stable mention highlighting using TipTap's mark system with input rules
export const MentionHighlight = Mark.create<MentionHighlightOptions>({
  name: "mentionHighlight",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "wink-mention",
        style:
          "background:#DBEAFE;color:#1D4ED8;border-radius:4px;padding:0 2px;border:1px solid #BFDBFE;",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[class*="wink-mention"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes || {}, HTMLAttributes),
      0,
    ];
  },

  addAttributes() {
    return {
      "data-mention": {
        default: "true",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-mention") ?? "true",
        renderHTML: (attributes: Record<string, any>) => ({
          "data-mention": attributes["data-mention"] ?? "true",
        }),
      },
      "data-handle": {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-handle"),
        renderHTML: (attributes: Record<string, any>) =>
          attributes["data-handle"]
            ? { "data-handle": attributes["data-handle"] }
            : {},
      },
    };
  },

  // No input rules; marking is handled at the editor level to avoid IME/typing issues
});

export default MentionHighlight;
