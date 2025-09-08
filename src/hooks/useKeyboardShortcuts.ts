import { useCallback, useEffect } from "react";
import { Editor } from "@tiptap/react";

interface UseKeyboardShortcutsOptions {
  editor: Editor | null;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  editor,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || !editor || !editor.isFocused) return;

      const { ctrlKey, metaKey, shiftKey, key } = e;
      const isModifier = ctrlKey || metaKey;

      // Handle keyboard shortcuts
      switch (key.toLowerCase()) {
        // Text formatting shortcuts
        case "b":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }
          break;

        case "i":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }
          break;

        case "u":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }
          break;

        case "k":
          if (isModifier) {
            e.preventDefault();
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }
          break;

        // List shortcuts
        case "8":
          if (isModifier && shiftKey) {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }
          break;

        case "7":
          if (isModifier && shiftKey) {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }
          break;

        // Heading shortcuts
        case "1":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }
          break;

        case "2":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }
          break;

        case "3":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }
          break;

        case "0":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().setParagraph().run();
          }
          break;

        // Alignment shortcuts
        case "l":
          if (isModifier && shiftKey) {
            e.preventDefault();
            editor.chain().focus().setTextAlign("left").run();
          }
          break;

        case "e":
          if (isModifier && shiftKey) {
            e.preventDefault();
            editor.chain().focus().setTextAlign("center").run();
          }
          break;

        case "r":
          if (isModifier && shiftKey) {
            e.preventDefault();
            editor.chain().focus().setTextAlign("right").run();
          }
          break;

        case "j":
          if (isModifier && shiftKey) {
            e.preventDefault();
            editor.chain().focus().setTextAlign("justify").run();
          }
          break;

        // Block shortcuts
        case "q":
          if (isModifier && shiftKey) {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }
          break;

        case "`":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().toggleCodeBlock().run();
          }
          break;

        // History shortcuts (these are handled by TipTap by default, but we can add custom behavior)
        case "z":
          if (isModifier && !shiftKey) {
            // Undo - TipTap handles this by default
            break;
          }
          if (isModifier && shiftKey) {
            // Redo - TipTap handles this by default
            break;
          }
          break;

        case "y":
          if (isModifier) {
            // Redo - TipTap handles this by default
            break;
          }
          break;

        // Selection shortcuts
        case "a":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().selectAll().run();
          }
          break;

        // Delete shortcuts
        case "backspace":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().deleteSelection().run();
          }
          break;

        case "delete":
          if (isModifier) {
            e.preventDefault();
            editor.chain().focus().deleteSelection().run();
          }
          break;

        // Focus shortcuts
        case "escape":
          e.preventDefault();
          editor.commands.blur();
          break;

        // Enter key enhancements
        case "enter":
          if (shiftKey) {
            // Shift+Enter for soft break (handled by TipTap by default)
            break;
          }
          if (isModifier) {
            e.preventDefault();
            // Ctrl/Cmd+Enter for hard break
            editor.chain().focus().setHardBreak().run();
          }
          break;

        // Tab handling
        case "tab":
          if (editor.isActive("listItem")) {
            e.preventDefault();
            if (shiftKey) {
              editor.chain().focus().liftListItem("listItem").run();
            } else {
              editor.chain().focus().sinkListItem("listItem").run();
            }
          }
          break;

        default:
          // Handle other shortcuts if needed
          break;
      }
    },
    [enabled, editor]
  );

  useEffect(() => {
    if (!editor || !enabled) return;

    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);

    return () => {
      editorElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, handleKeyDown, enabled]);

  // Return available shortcuts for documentation
  const shortcuts = {
    formatting: {
      "Ctrl/Cmd + B": "Bold",
      "Ctrl/Cmd + I": "Italic",
      "Ctrl/Cmd + U": "Underline",
      "Ctrl/Cmd + K": "Insert Link",
    },
    headings: {
      "Ctrl/Cmd + 1": "Heading 1",
      "Ctrl/Cmd + 2": "Heading 2",
      "Ctrl/Cmd + 3": "Heading 3",
      "Ctrl/Cmd + 0": "Paragraph",
    },
    lists: {
      "Ctrl/Cmd + Shift + 8": "Bullet List",
      "Ctrl/Cmd + Shift + 7": "Numbered List",
    },
    alignment: {
      "Ctrl/Cmd + Shift + L": "Align Left",
      "Ctrl/Cmd + Shift + E": "Align Center",
      "Ctrl/Cmd + Shift + R": "Align Right",
      "Ctrl/Cmd + Shift + J": "Justify",
    },
    blocks: {
      "Ctrl/Cmd + Shift + Q": "Blockquote",
      "Ctrl/Cmd + `": "Code Block",
    },
    history: {
      "Ctrl/Cmd + Z": "Undo",
      "Ctrl/Cmd + Y": "Redo",
      "Ctrl/Cmd + Shift + Z": "Redo",
    },
    selection: {
      "Ctrl/Cmd + A": "Select All",
      "Ctrl/Cmd + Backspace": "Delete Selection",
      "Ctrl/Cmd + Delete": "Delete Selection",
    },
    focus: {
      Escape: "Blur Editor",
      "Ctrl/Cmd + Enter": "Hard Break",
      "Shift + Enter": "Soft Break",
    },
    navigation: {
      Tab: "Indent List Item",
      "Shift + Tab": "Outdent List Item",
    },
  };

  return { shortcuts };
};
