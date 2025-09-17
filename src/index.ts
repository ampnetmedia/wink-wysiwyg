// Main W-Ink WYSIWYG Editor exports

// Core components
export { default as WInkEditor } from "./components/WInkEditor";
export { default as Toolbar } from "./components/Toolbar";
export { default as WInkNoSSR } from "./components/WInkNoSSR";
export { default as WInkRenderer } from "./components/WInkRenderer";

// Default export for convenience
export { default } from "./components/WInkEditor";

// Hooks
export { useWInkEditor } from "./hooks/useWInkEditor";
export { useMentions } from "./hooks/useMentions";
export { useHashtags } from "./hooks/useHashtags";

// Types
export type {
  WInkEditorConfig,
  WInkEditorProps,
  ToolbarButton,
  ToolbarGroup,
  EditorSize,
  EditorTheme,
  EditorMode,
  EditorState,
  EditorEvents,
  ExportConfig,
  ImportConfig,
} from "./types/editor";

export type {
  WInkPlugin,
  ToolbarButton as PluginToolbarButton,
  KeyboardShortcut,
  MenuItem,
  PluginConfig,
  PluginManager,
  PluginContext,
  PluginLifecycleEvents,
  BuiltInPluginType,
  BuiltInPluginRegistry,
} from "./types/plugins";

export type {
  MentionData,
  MentionSuggestion,
  MentionConfig,
  MentionState,
  MentionEvents,
  HashtagData,
  HashtagSuggestion,
  HashtagConfig,
  HashtagState,
  HashtagEvents,
  SocialFeaturesConfig,
  SocialFeaturesState,
  SocialFeaturesEvents,
} from "./types/mentions";

// Utilities
export { sanitizeHtml } from "./utils/sanitize";
export { exportContent, importContent } from "./utils/export";
export { createPluginManager } from "./utils/plugins";

// Extensions
export { MentionHighlight } from "./extensions/MentionHighlight";
export { HashtagHighlight } from "./extensions/HashtagHighlight";

// Styles
import "./styles/wink.css";

// Version
export const VERSION = "0.2.5";

// Re-export TipTap Editor type for convenience
export type { Editor } from "@tiptap/react";
