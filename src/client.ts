// Client-only entrypoint for SSR frameworks like Next.js
export { default as WInkEditor } from "./components/WInkEditor";
export { default as Toolbar } from "./components/Toolbar";
export { default as WInkNoSSR } from "./components/WInkNoSSR";
export { default as WInkRenderer } from "./components/WInkRenderer";

// Default export for convenience
export { default } from "./components/WInkEditor";

export { useWInkEditor } from "./hooks/useWInkEditor";
export { useMentions } from "./hooks/useMentions";
export { useHashtags } from "./hooks/useHashtags";

export { MentionHighlight } from "./extensions/MentionHighlight";
export { HashtagHighlight } from "./extensions/HashtagHighlight";

export type { WInkEditorProps } from "./types/editor";
