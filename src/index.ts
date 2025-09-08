// Main W-Ink WYSIWYG Editor exports

// Core components
export { default as WInkEditor } from "./components/WInkEditor";
export { default as Toolbar } from "./components/Toolbar";

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

// Styles
import "./styles/wink.css";

// Version
export const VERSION = "0.1.0";
