import { Editor } from "@tiptap/react";
import { ReactNode } from "react";
import { WInkPlugin } from "./plugins";

/**
 * Base configuration for the W-Ink editor
 */
export interface WInkEditorConfig {
  /** Initial content for the editor */
  content?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Whether to show the toolbar */
  showToolbar?: boolean;
  /** Custom CSS classes for the editor */
  className?: string;
  /** Custom CSS classes for the toolbar */
  toolbarClassName?: string;
  /** Custom CSS classes for the content area */
  contentClassName?: string;
  /** Minimum height of the editor */
  minHeight?: string | number;
  /** Maximum height of the editor */
  maxHeight?: string | number;
  /** Whether to auto-focus the editor on mount */
  autoFocus?: boolean;
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Callback when editor is ready */
  onReady?: (editor: Editor) => void;
  /** Callback when editor is destroyed */
  onDestroy?: () => void;
}

/**
 * Toolbar button configuration
 */
export interface ToolbarButton {
  /** Unique identifier for the button */
  id: string;
  /** Display name for the button */
  name: string;
  /** Icon component or string */
  icon?: ReactNode | string;
  /** Whether the button is active */
  isActive?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler for the button */
  onClick: () => void;
  /** Keyboard shortcut for the button */
  shortcut?: string;
  /** Tooltip text for the button */
  tooltip?: string;
}

/**
 * Toolbar group configuration
 */
export interface ToolbarGroup {
  /** Unique identifier for the group */
  id: string;
  /** Display name for the group */
  name?: string;
  /** Buttons in this group */
  buttons: ToolbarButton[];
  /** Whether the group is visible */
  visible?: boolean;
}

/**
 * Editor size variants
 */
export type EditorSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Editor theme variants
 */
export type EditorTheme = "light" | "dark" | "auto";

/**
 * Editor mode variants
 */
export type EditorMode = "wysiwyg" | "markdown" | "html";

/**
 * Extended editor configuration with additional options
 */
export interface WInkEditorProps extends WInkEditorConfig {
  /** Size variant of the editor */
  size?: EditorSize;
  /** Theme variant of the editor */
  theme?: EditorTheme;
  /** Mode of the editor */
  mode?: EditorMode;
  /** Custom toolbar configuration */
  toolbar?: ToolbarGroup[];
  /** Whether to enable mentions */
  enableMentions?: boolean;
  /** Whether to enable hashtags */
  enableHashtags?: boolean;
  /** Whether to enable images */
  enableImages?: boolean;
  /** Whether to enable links */
  enableLinks?: boolean;
  /** Whether to enable tables */
  enableTables?: boolean;
  /** Whether to enable code blocks */
  enableCodeBlocks?: boolean;
  /** Custom plugins to load */
  plugins?: WInkPlugin[];
  /** Custom extensions to load */
  extensions?: any[];
  /** Callback for handling image uploads */
  onImageUpload?: (file: File) => Promise<string>;
}

/**
 * Editor state information
 */
export interface EditorState {
  /** Whether the editor is focused */
  isFocused: boolean;
  /** Whether the editor is empty */
  isEmpty: boolean;
  /** Current word count */
  wordCount: number;
  /** Current character count */
  characterCount: number;
  /** Whether the editor can undo */
  canUndo: boolean;
  /** Whether the editor can redo */
  canRedo: boolean;
  /** Current selection information */
  selection?: {
    from: number;
    to: number;
    text: string;
  };
}

/**
 * Editor event handlers
 */
export interface EditorEvents {
  /** Called when the editor is created */
  onCreate?: (editor: Editor) => void;
  /** Called when the editor is updated */
  onUpdate?: (editor: Editor) => void;
  /** Called when the editor selection changes */
  onSelectionUpdate?: (editor: Editor) => void;
  /** Called when the editor is focused */
  onFocus?: (editor: Editor) => void;
  /** Called when the editor is blurred */
  onBlur?: (editor: Editor) => void;
  /** Called when the editor is destroyed */
  onDestroy?: (editor: Editor) => void;
}

/**
 * Export configuration for the editor
 */
export interface ExportConfig {
  /** Format to export to */
  format: "html" | "markdown" | "text" | "json";
  /** Whether to include styles */
  includeStyles?: boolean;
  /** Whether to include metadata */
  includeMetadata?: boolean;
  /** Custom export options */
  options?: Record<string, any>;
}

/**
 * Import configuration for the editor
 */
export interface ImportConfig {
  /** Format to import from */
  format: "html" | "markdown" | "text" | "json";
  /** Whether to sanitize content */
  sanitize?: boolean;
  /** Custom import options */
  options?: Record<string, any>;
}
