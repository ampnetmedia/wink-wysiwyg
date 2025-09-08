import { Editor } from "@tiptap/react";
import {
  WInkPlugin,
  PluginManager,
  PluginContext,
  PluginLifecycleEvents,
} from "../types/plugins";

/**
 * Create a plugin manager instance
 *
 * @param events - Lifecycle event handlers
 * @returns Plugin manager instance
 */
export const createPluginManager = (
  events?: PluginLifecycleEvents
): PluginManager => {
  const plugins = new Map<string, WInkPlugin>();
  const enabledPlugins = new Set<string>();
  const context: PluginContext = {
    data: new Map(),
    events: new EventTarget(),
    get: <T = any>(key: string) => context.data.get(key) as T,
    set: <T = any>(key: string, value: T) => context.data.set(key, value),
    emit: (event: string, data?: any) => {
      context.events.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    on: (event: string, handler: (data?: any) => void) => {
      context.events.addEventListener(event, (e: any) => handler(e.detail));
    },
    off: (event: string, handler: (data?: any) => void) => {
      context.events.removeEventListener(event, handler as EventListener);
    },
  };

  const manager: PluginManager = {
    register: (plugin: WInkPlugin) => {
      if (plugins.has(plugin.id)) {
        console.warn(`Plugin with id "${plugin.id}" is already registered`);
        return;
      }

      plugins.set(plugin.id, plugin);
      events?.onRegister?.(plugin);

      // Auto-enable if plugin is enabled by default
      if (plugin.enabled !== false) {
        manager.enable(plugin.id);
      }
    },

    unregister: (pluginId: string) => {
      const plugin = plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin with id "${pluginId}" is not registered`);
        return;
      }

      // Disable plugin before unregistering
      manager.disable(pluginId);

      plugins.delete(pluginId);
      events?.onUnregister?.(plugin);
    },

    get: (pluginId: string) => {
      return plugins.get(pluginId);
    },

    getAll: () => {
      return Array.from(plugins.values());
    },

    getEnabled: () => {
      return Array.from(plugins.values()).filter((plugin) =>
        enabledPlugins.has(plugin.id)
      );
    },

    enable: (pluginId: string) => {
      const plugin = plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin with id "${pluginId}" is not registered`);
        return;
      }

      if (enabledPlugins.has(pluginId)) {
        console.warn(`Plugin with id "${pluginId}" is already enabled`);
        return;
      }

      enabledPlugins.add(pluginId);
      events?.onEnable?.(plugin);
    },

    disable: (pluginId: string) => {
      const plugin = plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin with id "${pluginId}" is not registered`);
        return;
      }

      if (!enabledPlugins.has(pluginId)) {
        console.warn(`Plugin with id "${pluginId}" is not enabled`);
        return;
      }

      enabledPlugins.delete(pluginId);
      events?.onDisable?.(plugin);
    },

    isEnabled: (pluginId: string) => {
      return enabledPlugins.has(pluginId);
    },
  };

  return manager;
};

/**
 * Initialize plugins for an editor
 *
 * @param editor - The TipTap editor instance
 * @param pluginManager - The plugin manager
 */
export const initializePlugins = (
  editor: Editor,
  pluginManager: PluginManager
): void => {
  const enabledPlugins = pluginManager.getEnabled();

  enabledPlugins.forEach((plugin) => {
    try {
      plugin.init(editor);
    } catch (error) {
      console.error(`Error initializing plugin "${plugin.id}":`, error);
    }
  });
};

/**
 * Destroy plugins for an editor
 *
 * @param editor - The TipTap editor instance
 * @param pluginManager - The plugin manager
 */
export const destroyPlugins = (
  editor: Editor,
  pluginManager: PluginManager
): void => {
  const enabledPlugins = pluginManager.getEnabled();

  enabledPlugins.forEach((plugin) => {
    try {
      plugin.destroy?.(editor);
    } catch (error) {
      console.error(`Error destroying plugin "${plugin.id}":`, error);
    }
  });
};

/**
 * Get toolbar buttons from all enabled plugins
 *
 * @param editor - The TipTap editor instance
 * @param pluginManager - The plugin manager
 * @returns Array of toolbar buttons
 */
export const getPluginToolbarButtons = (
  editor: Editor,
  pluginManager: PluginManager
) => {
  const enabledPlugins = pluginManager.getEnabled();
  const buttons: any[] = [];

  enabledPlugins.forEach((plugin) => {
    try {
      const pluginButtons = plugin.getToolbarButtons?.(editor) || [];
      buttons.push(...pluginButtons);
    } catch (error) {
      console.error(
        `Error getting toolbar buttons from plugin "${plugin.id}":`,
        error
      );
    }
  });

  // Sort buttons by priority
  return buttons.sort((a, b) => (a.priority || 0) - (b.priority || 0));
};

/**
 * Get keyboard shortcuts from all enabled plugins
 *
 * @param editor - The TipTap editor instance
 * @param pluginManager - The plugin manager
 * @returns Array of keyboard shortcuts
 */
export const getPluginKeyboardShortcuts = (
  editor: Editor,
  pluginManager: PluginManager
) => {
  const enabledPlugins = pluginManager.getEnabled();
  const shortcuts: any[] = [];

  enabledPlugins.forEach((plugin) => {
    try {
      const pluginShortcuts = plugin.getKeyboardShortcuts?.() || [];
      shortcuts.push(...pluginShortcuts);
    } catch (error) {
      console.error(
        `Error getting keyboard shortcuts from plugin "${plugin.id}":`,
        error
      );
    }
  });

  return shortcuts;
};

/**
 * Get menu items from all enabled plugins
 *
 * @param editor - The TipTap editor instance
 * @param pluginManager - The plugin manager
 * @returns Array of menu items
 */
export const getPluginMenuItems = (
  editor: Editor,
  pluginManager: PluginManager
) => {
  const enabledPlugins = pluginManager.getEnabled();
  const menuItems: any[] = [];

  enabledPlugins.forEach((plugin) => {
    try {
      const pluginMenuItems = plugin.getMenuItems?.(editor) || [];
      menuItems.push(...pluginMenuItems);
    } catch (error) {
      console.error(
        `Error getting menu items from plugin "${plugin.id}":`,
        error
      );
    }
  });

  // Sort menu items by priority
  return menuItems.sort((a, b) => (a.priority || 0) - (b.priority || 0));
};

/**
 * Validate plugin configuration
 *
 * @param plugin - The plugin to validate
 * @returns Whether the plugin is valid
 */
export const validatePlugin = (plugin: WInkPlugin): boolean => {
  if (!plugin.id || typeof plugin.id !== "string") {
    console.error("Plugin must have a valid id");
    return false;
  }

  if (!plugin.name || typeof plugin.name !== "string") {
    console.error("Plugin must have a valid name");
    return false;
  }

  if (!plugin.init || typeof plugin.init !== "function") {
    console.error("Plugin must have an init function");
    return false;
  }

  return true;
};

/**
 * Create a plugin context for sharing data between plugins
 *
 * @returns Plugin context instance
 */
export const createPluginContext = (): PluginContext => {
  const data = new Map();
  const events = new EventTarget();

  return {
    data,
    events,
    get: <T = any>(key: string) => data.get(key) as T,
    set: <T = any>(key: string, value: T) => data.set(key, value),
    emit: (event: string, data?: any) => {
      events.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    on: (event: string, handler: (data?: any) => void) => {
      events.addEventListener(event, (e: any) => handler(e.detail));
    },
    off: (event: string, handler: (data?: any) => void) => {
      events.removeEventListener(event, handler as EventListener);
    },
  };
};

/**
 * Plugin configuration helpers
 */
export const pluginConfig = {
  /**
   * Create a plugin configuration object
   */
  create: (config: Partial<WInkPlugin>): WInkPlugin => {
    return {
      id: "",
      name: "",
      init: () => {},
      ...config,
    };
  },

  /**
   * Merge plugin configurations
   */
  merge: (base: WInkPlugin, override: Partial<WInkPlugin>): WInkPlugin => {
    return {
      ...base,
      ...override,
      config: {
        ...base.config,
        ...override.config,
      },
    };
  },

  /**
   * Validate plugin configuration
   */
  validate: validatePlugin,
};
