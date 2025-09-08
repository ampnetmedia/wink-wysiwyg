import { Editor } from "@tiptap/react";
import { ReactNode } from "react";

/**
 * Base interface for all W-Ink plugins
 */
export interface WInkPlugin {
  /** Unique identifier for the plugin */
  id: string;
  /** Display name for the plugin */
  name: string;
  /** Description of what the plugin does */
  description?: string;
  /** Version of the plugin */
  version?: string;
  /** Whether the plugin is enabled by default */
  enabled?: boolean;
  /** Plugin configuration options */
  config?: Record<string, any>;
  /** Initialize the plugin */
  init: (editor: Editor) => void;
  /** Clean up the plugin */
  destroy?: (editor: Editor) => void;
  /** Get plugin-specific toolbar buttons */
  getToolbarButtons?: (editor: Editor) => ToolbarButton[];
  /** Get plugin-specific keyboard shortcuts */
  getKeyboardShortcuts?: () => KeyboardShortcut[];
  /** Get plugin-specific menu items */
  getMenuItems?: (editor: Editor) => MenuItem[];
}

/**
 * Toolbar button for plugins
 */
export interface ToolbarButton {
  /** Unique identifier for the button */
  id: string;
  /** Display name for the button */
  name: string;
  /** Icon component or string */
  icon?: ReactNode | string;
  /** Whether the button is active */
  isActive?: (editor: Editor) => boolean;
  /** Whether the button is disabled */
  disabled?: (editor: Editor) => boolean;
  /** Click handler for the button */
  onClick: (editor: Editor) => void;
  /** Keyboard shortcut for the button */
  shortcut?: string;
  /** Tooltip text for the button */
  tooltip?: string;
  /** Priority for button ordering */
  priority?: number;
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., 'Ctrl+B', 'Cmd+B') */
  key: string;
  /** Handler function */
  handler: (editor: Editor) => boolean;
  /** Description of what the shortcut does */
  description?: string;
}

/**
 * Menu item for plugins
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display name for the menu item */
  name: string;
  /** Icon component or string */
  icon?: ReactNode | string;
  /** Whether the menu item is visible */
  visible?: (editor: Editor) => boolean;
  /** Whether the menu item is disabled */
  disabled?: (editor: Editor) => boolean;
  /** Click handler for the menu item */
  onClick: (editor: Editor) => void;
  /** Submenu items */
  submenu?: MenuItem[];
  /** Priority for menu item ordering */
  priority?: number;
}

/**
 * Plugin configuration for specific features
 */
export interface PluginConfig {
  /** Whether the plugin is enabled */
  enabled: boolean;
  /** Plugin-specific configuration */
  options?: Record<string, any>;
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  /** Register a new plugin */
  register: (plugin: WInkPlugin) => void;
  /** Unregister a plugin */
  unregister: (pluginId: string) => void;
  /** Get a registered plugin */
  get: (pluginId: string) => WInkPlugin | undefined;
  /** Get all registered plugins */
  getAll: () => WInkPlugin[];
  /** Get enabled plugins */
  getEnabled: () => WInkPlugin[];
  /** Enable a plugin */
  enable: (pluginId: string) => void;
  /** Disable a plugin */
  disable: (pluginId: string) => void;
  /** Check if a plugin is enabled */
  isEnabled: (pluginId: string) => boolean;
}

/**
 * Plugin context for sharing data between plugins
 */
export interface PluginContext {
  /** Shared data store */
  data: Map<string, any>;
  /** Event emitter for plugin communication */
  events: EventTarget;
  /** Get shared data */
  get: <T = any>(key: string) => T | undefined;
  /** Set shared data */
  set: <T = any>(key: string, value: T) => void;
  /** Emit an event */
  emit: (event: string, data?: any) => void;
  /** Listen to an event */
  on: (event: string, handler: (data?: any) => void) => void;
  /** Remove event listener */
  off: (event: string, handler: (data?: any) => void) => void;
}

/**
 * Plugin lifecycle events
 */
export interface PluginLifecycleEvents {
  /** Called when a plugin is registered */
  onRegister?: (plugin: WInkPlugin) => void;
  /** Called when a plugin is unregistered */
  onUnregister?: (plugin: WInkPlugin) => void;
  /** Called when a plugin is enabled */
  onEnable?: (plugin: WInkPlugin) => void;
  /** Called when a plugin is disabled */
  onDisable?: (plugin: WInkPlugin) => void;
  /** Called when the editor is initialized */
  onEditorInit?: (editor: Editor) => void;
  /** Called when the editor is destroyed */
  onEditorDestroy?: (editor: Editor) => void;
}

/**
 * Built-in plugin types
 */
export type BuiltInPluginType =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "heading"
  | "paragraph"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "horizontalRule"
  | "hardBreak"
  | "link"
  | "image"
  | "table"
  | "mention"
  | "hashtag"
  | "textAlign"
  | "color"
  | "highlight"
  | "placeholder";

/**
 * Plugin registry for built-in plugins
 */
export type BuiltInPluginRegistry = {
  [K in BuiltInPluginType]: WInkPlugin;
};
