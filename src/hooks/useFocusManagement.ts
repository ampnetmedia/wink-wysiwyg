import { useCallback, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";

interface UseFocusManagementOptions {
  editor: Editor | null;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  enabled?: boolean;
}

export const useFocusManagement = ({
  editor,
  autoFocus = false,
  onFocus,
  onBlur,
  enabled = true,
}: UseFocusManagementOptions) => {
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusPositionRef = useRef<number | null>(null);

  // Handle focus events
  const handleFocus = useCallback(() => {
    if (!enabled || !editor) return;

    onFocus?.();

    // Store the current cursor position
    lastFocusPositionRef.current = editor.state.selection.from;
  }, [enabled, editor, onFocus]);

  // Handle blur events
  const handleBlur = useCallback(() => {
    if (!enabled || !editor) return;

    onBlur?.();
  }, [enabled, editor, onBlur]);

  // Auto focus functionality
  const focusEditor = useCallback(() => {
    if (!enabled || !editor) return;

    editor.commands.focus();
  }, [enabled, editor]);

  // Focus at end of content
  const focusAtEnd = useCallback(() => {
    if (!enabled || !editor) return;

    editor.commands.focus("end");
  }, [enabled, editor]);

  // Focus at beginning of content
  const focusAtStart = useCallback(() => {
    if (!enabled || !editor) return;

    editor.commands.focus("start");
  }, [enabled, editor]);

  // Focus at specific position
  const focusAtPosition = useCallback(
    (position: number) => {
      if (!enabled || !editor) return;

      editor.commands.focus(position);
    },
    [enabled, editor]
  );

  // Restore previous focus position
  const restoreFocus = useCallback(() => {
    if (!enabled || !editor || lastFocusPositionRef.current === null) return;

    editor.commands.focus(lastFocusPositionRef.current);
  }, [enabled, editor]);

  // Focus on next/previous element
  const focusNext = useCallback(() => {
    if (!enabled || !editor) return;

    const { selection } = editor.state;
    const nextPosition = selection.to + 1;

    if (nextPosition < editor.state.doc.content.size) {
      editor.commands.focus(nextPosition);
    }
  }, [enabled, editor]);

  const focusPrevious = useCallback(() => {
    if (!enabled || !editor) return;

    const { selection } = editor.state;
    const prevPosition = selection.from - 1;

    if (prevPosition >= 0) {
      editor.commands.focus(prevPosition);
    }
  }, [enabled, editor]);

  // Handle click to focus
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !editor) return;

      // Only focus if clicking within the editor content area
      const target = e.target as HTMLElement;
      const editorElement = editor.view.dom;

      if (editorElement.contains(target)) {
        // Small delay to ensure proper focus
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }

        focusTimeoutRef.current = setTimeout(() => {
          editor.commands.focus();
        }, 10);
      }
    },
    [enabled, editor]
  );

  // Handle keyboard navigation
  const handleKeyNavigation = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || !editor || !editor.isFocused) return;

      const { key, ctrlKey, metaKey } = e;
      const isModifier = ctrlKey || metaKey;

      switch (key) {
        case "Home":
          if (isModifier) {
            e.preventDefault();
            focusAtStart();
          }
          break;

        case "End":
          if (isModifier) {
            e.preventDefault();
            focusAtEnd();
          }
          break;

        case "ArrowUp":
          if (isModifier) {
            e.preventDefault();
            focusAtStart();
          }
          break;

        case "ArrowDown":
          if (isModifier) {
            e.preventDefault();
            focusAtEnd();
          }
          break;

        case "PageUp":
          e.preventDefault();
          // Move cursor to beginning of current line
          const { selection } = editor.state;
          const lineStart = editor.state.doc.resolve(selection.from).start();
          editor.commands.focus(lineStart);
          break;

        case "PageDown":
          e.preventDefault();
          // Move cursor to end of current line
          const { selection: selection2 } = editor.state;
          const lineEnd = editor.state.doc.resolve(selection2.from).end();
          editor.commands.focus(lineEnd);
          break;
      }
    },
    [enabled, editor, focusAtStart, focusAtEnd]
  );

  // Set up event listeners
  useEffect(() => {
    if (!editor || !enabled) return;

    const editorElement = editor.view.dom;

    // Add event listeners
    editorElement.addEventListener("focus", handleFocus);
    editorElement.addEventListener("blur", handleBlur);
    editorElement.addEventListener("click", handleClick);
    editorElement.addEventListener("keydown", handleKeyNavigation);

    // Auto focus if enabled
    if (autoFocus) {
      // Small delay to ensure editor is fully initialized
      const timeout = setTimeout(() => {
        focusEditor();
      }, 100);

      return () => {
        clearTimeout(timeout);
        editorElement.removeEventListener("focus", handleFocus);
        editorElement.removeEventListener("blur", handleBlur);
        editorElement.removeEventListener("click", handleClick);
        editorElement.removeEventListener("keydown", handleKeyNavigation);
      };
    }

    return () => {
      editorElement.removeEventListener("focus", handleFocus);
      editorElement.removeEventListener("blur", handleBlur);
      editorElement.removeEventListener("click", handleClick);
      editorElement.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [
    editor,
    enabled,
    autoFocus,
    handleFocus,
    handleBlur,
    handleClick,
    handleKeyNavigation,
    focusEditor,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return {
    focusEditor,
    focusAtEnd,
    focusAtStart,
    focusAtPosition,
    restoreFocus,
    focusNext,
    focusPrevious,
    isFocused: editor?.isFocused || false,
  };
};
