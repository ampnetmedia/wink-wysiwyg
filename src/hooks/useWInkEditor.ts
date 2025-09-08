import { useCallback, useMemo } from "react";
import { Editor } from "@tiptap/react";
import { WInkEditorConfig, EditorState } from "../types/editor";

/**
 * Custom hook for W-Ink editor functionality
 *
 * Provides utilities and state management for the W-Ink editor.
 */
export const useWInkEditor = (
  editor: Editor | null,
  config: WInkEditorConfig = {}
) => {
  // Get current editor state
  const getEditorState = useCallback((): EditorState => {
    if (!editor) {
      return {
        isFocused: false,
        isEmpty: true,
        wordCount: 0,
        characterCount: 0,
        canUndo: false,
        canRedo: false,
      };
    }

    return {
      isFocused: editor.isFocused,
      isEmpty: editor.isEmpty,
      wordCount: editor.storage.characterCount?.words() || 0,
      characterCount: editor.storage.characterCount?.characters() || 0,
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
      selection: editor.state.selection.empty
        ? undefined
        : {
            from: editor.state.selection.from,
            to: editor.state.selection.to,
            text: editor.state.doc.textBetween(
              editor.state.selection.from,
              editor.state.selection.to
            ),
          },
    };
  }, [editor]);

  // Get editor content in different formats
  const getContent = useCallback(
    (format: "html" | "text" | "json" = "html") => {
      if (!editor) return "";

      switch (format) {
        case "html":
          return editor.getHTML();
        case "text":
          return editor.getText();
        case "json":
          return JSON.stringify(editor.getJSON());
        default:
          return editor.getHTML();
      }
    },
    [editor]
  );

  // Set editor content
  const setContent = useCallback(
    (content: string, emitUpdate = true) => {
      if (!editor) return;
      editor.commands.setContent(content, { emitUpdate });
    },
    [editor]
  );

  // Clear editor content
  const clearContent = useCallback(() => {
    if (!editor) return;
    editor.commands.clearContent();
  }, [editor]);

  // Focus the editor
  const focus = useCallback(() => {
    if (!editor) return;
    editor.commands.focus();
  }, [editor]);

  // Blur the editor
  const blur = useCallback(() => {
    if (!editor) return;
    editor.commands.blur();
  }, [editor]);

  // Undo last action
  const undo = useCallback(() => {
    if (!editor) return;
    editor.commands.undo();
  }, [editor]);

  // Redo last action
  const redo = useCallback(() => {
    if (!editor) return;
    editor.commands.redo();
  }, [editor]);

  // Check if editor can perform an action
  const can = useCallback(
    (action: string) => {
      if (!editor) return false;
      const canMethods = editor.can() as any;
      const canMethod = canMethods[action];
      return typeof canMethod === "function" ? canMethod() : false;
    },
    [editor]
  );

  // Get editor selection
  const getSelection = useCallback(() => {
    if (!editor || editor.state.selection.empty) return null;

    return {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
      text: editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      ),
    };
  }, [editor]);

  // Set selection
  const setSelection = useCallback(
    (from: number, to?: number) => {
      if (!editor) return;
      editor.commands.setTextSelection({ from, to: to || from });
    },
    [editor]
  );

  // Insert text at current position
  const insertText = useCallback(
    (text: string) => {
      if (!editor) return;
      editor.commands.insertContent(text);
    },
    [editor]
  );

  // Insert content at current position
  const insertContent = useCallback(
    (content: string) => {
      if (!editor) return;
      editor.commands.insertContent(content);
    },
    [editor]
  );

  // Delete selection or character
  const deleteSelection = useCallback(() => {
    if (!editor) return;
    editor.commands.deleteSelection();
  }, [editor]);

  // Check if editor is active for a specific mark or node
  const isActive = useCallback(
    (name: string, attributes?: Record<string, any>) => {
      if (!editor) return false;
      return editor.isActive(name, attributes);
    },
    [editor]
  );

  // Toggle a mark or node
  const toggle = useCallback(
    (name: string, attributes?: Record<string, any>) => {
      if (!editor) return;
      editor.commands.toggleMark?.(name, attributes);
    },
    [editor]
  );

  // Set a mark or node
  const setMark = useCallback(
    (name: string, attributes?: Record<string, any>) => {
      if (!editor) return;
      editor.commands.setMark(name, attributes);
    },
    [editor]
  );

  // Unset a mark or node
  const unsetMark = useCallback(
    (name: string) => {
      if (!editor) return;
      editor.commands.unsetMark(name);
    },
    [editor]
  );

  // Export content
  const exportContent = useCallback(
    (format: "html" | "markdown" | "text" | "json") => {
      if (!editor) return "";

      switch (format) {
        case "html":
          return editor.getHTML();
        case "markdown":
          // TODO: Implement markdown export
          return editor.getText();
        case "text":
          return editor.getText();
        case "json":
          return JSON.stringify(editor.getJSON(), null, 2);
        default:
          return editor.getHTML();
      }
    },
    [editor]
  );

  // Import content
  const importContent = useCallback(
    (content: string, format: "html" | "markdown" | "text" | "json") => {
      if (!editor) return;

      switch (format) {
        case "html":
          editor.commands.setContent(content);
          break;
        case "markdown":
          // TODO: Implement markdown import
          editor.commands.setContent(content);
          break;
        case "text":
          editor.commands.setContent(content);
          break;
        case "json":
          try {
            const json = JSON.parse(content);
            editor.commands.setContent(json);
          } catch (error) {
            console.error("Invalid JSON content:", error);
          }
          break;
        default:
          editor.commands.setContent(content);
      }
    },
    [editor]
  );

  // Memoized editor utilities
  const editorUtils = useMemo(
    () => ({
      getEditorState,
      getContent,
      setContent,
      clearContent,
      focus,
      blur,
      undo,
      redo,
      can,
      getSelection,
      setSelection,
      insertText,
      insertContent,
      deleteSelection,
      isActive,
      toggle,
      setMark,
      unsetMark,
      exportContent,
      importContent,
    }),
    [
      getEditorState,
      getContent,
      setContent,
      clearContent,
      focus,
      blur,
      undo,
      redo,
      can,
      getSelection,
      setSelection,
      insertText,
      insertContent,
      deleteSelection,
      isActive,
      toggle,
      setMark,
      unsetMark,
      exportContent,
      importContent,
    ]
  );

  return {
    editor,
    editorUtils,
    isReady: !!editor,
  };
};
