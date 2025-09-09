import { Mark, InputRule } from "@tiptap/core";

export interface HashtagHighlightOptions {
  HTMLAttributes?: Record<string, any>;
}

export const HashtagHighlight = Mark.create<HashtagHighlightOptions>({
  name: "hashtagHighlight",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "wink-hashtag",
        style:
          "background:#F3E8FF;color:#7C3AED;border-radius:4px;padding:0 2px;border:1px solid #DDD6FE;",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[class*="wink-hashtag"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    // Merge default HTMLAttributes with those from options
    const mergedAttributes = {
      ...this.options.HTMLAttributes,
      ...HTMLAttributes,
    };
    // Ensure data-hashtag and data-tag are always present if the mark has them
    if (mark.attrs["data-hashtag"]) {
      mergedAttributes["data-hashtag"] = mark.attrs["data-hashtag"];
    }
    if (mark.attrs["data-tag"]) {
      mergedAttributes["data-tag"] = mark.attrs["data-tag"];
    }
    return ["span", mergedAttributes, 0];
  },

  addAttributes() {
    return {
      "data-hashtag": {
        default: "true",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-hashtag") ?? "true",
        renderHTML: (attributes: Record<string, any>) => ({
          "data-hashtag": attributes["data-hashtag"] ?? "true",
        }),
      },
      "data-tag": {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-tag"),
        renderHTML: (attributes: Record<string, any>) =>
          attributes["data-tag"] ? { "data-tag": attributes["data-tag"] } : {},
      },
    };
  },
});

export default HashtagHighlight;
