import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { ImageExtension } from "../extensions/ImageExtension";
import { WInkEditorProps, EditorState } from "../types/editor";
import { useDragDrop } from "../hooks/useDragDrop";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useFocusManagement } from "../hooks/useFocusManagement";
import { useCopyPaste } from "../hooks/useCopyPaste";
import Toolbar from "./Toolbar";

/**
 * W-Ink WYSIWYG Editor Component
 *
 * A modern, extensible WYSIWYG editor built with TipTap and React.
 * Supports @mentions, #hashtags, and a plugin system for extensibility.
 */
const WInkEditor: React.FC<WInkEditorProps> = ({
  content = "",
  placeholder = "Start typing...",
  editable = true,
  showToolbar = true,
  className = "",
  toolbarClassName = "",
  contentClassName = "",
  minHeight = "120px",
  maxHeight,
  autoFocus = false,
  onChange,
  onReady,
  onDestroy,
  size = "md",
  theme = "light",
  mode = "wysiwyg",
  enableMentions = true,
  enableHashtags = true,
  enableImages = true,
  enableLinks = true,
  enableTables = false,
  enableCodeBlocks = true,
  plugins = [],
  extensions = [],
  onImageUpload,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    isFocused: false,
    isEmpty: true,
    wordCount: 0,
    characterCount: 0,
    canUndo: false,
    canRedo: false,
  });

  // Create TipTap extensions
  const tipTapExtensions: any[] = [
    StarterKit.configure({
      // Disable features we'll handle separately
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Underline,
    Placeholder.configure({
      placeholder,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ];

  // Add conditional extensions
  if (enableLinks) {
    tipTapExtensions.push(
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "wink-link",
        },
      })
    );
  }

  if (enableImages) {
    tipTapExtensions.push(
      ImageExtension.configure({
        HTMLAttributes: {
          class: "wink-image",
        },
      })
    );
  }

  // Add custom extensions
  tipTapExtensions.push(...extensions);

  // Create the editor instance
  const editor = useEditor({
    extensions: tipTapExtensions,
    content,
    editable,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);

      // Update editor state
      setEditorState({
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
      });
    },
    onSelectionUpdate: ({ editor }) => {
      setEditorState((prev) => ({
        ...prev,
        isFocused: editor.isFocused,
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
      }));
    },
    onFocus: ({ editor }) => {
      setEditorState((prev) => ({
        ...prev,
        isFocused: true,
      }));
    },
    onBlur: ({ editor }) => {
      setEditorState((prev) => ({
        ...prev,
        isFocused: false,
      }));
    },
    onCreate: ({ editor }) => {
      onReady?.(editor);
    },
    onDestroy: () => {
      onDestroy?.();
    },
  });

  // Set up drag and drop functionality after editor is created
  useDragDrop({
    editor,
    onImageUpload,
    enabled: enableImages,
  });

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    editor,
    enabled: true,
  });

  // Set up focus management
  useFocusManagement({
    editor,
    autoFocus,
    onFocus: () => {
      setEditorState((prev) => ({ ...prev, isFocused: true }));
    },
    onBlur: () => {
      setEditorState((prev) => ({ ...prev, isFocused: false }));
    },
    enabled: true,
  });

  // Set up copy/paste handling
  useCopyPaste({
    editor,
    onImageUpload,
    enabled: true,
    preserveFormatting: true,
    sanitizeContent: true,
  });

  // Handle content changes from props
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Handle editable changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Handle auto focus
  useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus();
    }
  }, [editor, autoFocus]);

  // Get size classes
  const getSizeClasses = useCallback(() => {
    switch (size) {
      case "sm":
        return "min-h-[80px] text-sm";
      case "md":
        return "min-h-[120px] text-base";
      case "lg":
        return "min-h-[200px] text-lg";
      case "xl":
        return "min-h-[300px] text-xl";
      case "full":
        return "min-h-[500px] text-base";
      default:
        return "min-h-[120px] text-base";
    }
  }, [size]);

  // Get theme classes
  const getThemeClasses = useCallback(() => {
    switch (theme) {
      case "dark":
        return "dark";
      case "light":
        return "";
      case "auto":
        return "";
      default:
        return "";
    }
  }, [theme]);

  if (!editor) {
    return (
      <div className="wink-editor loading">
        <div className="flex items-center justify-center p-4">
          <div className="wink-spinner"></div>
          <span className="ml-2 text-gray-500">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={editorRef}
      className={`wink-editor ${getThemeClasses()} ${className}`}
      style={{
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        maxHeight: maxHeight
          ? typeof maxHeight === "number"
            ? `${maxHeight}px`
            : maxHeight
          : undefined,
      }}
    >
      {showToolbar && (
        <Toolbar
          editor={editor}
          className={toolbarClassName}
          enableMentions={enableMentions}
          enableHashtags={enableHashtags}
          enableImages={enableImages}
          enableLinks={enableLinks}
          enableTables={enableTables}
          enableCodeBlocks={enableCodeBlocks}
          onImageUpload={onImageUpload}
        />
      )}

      <div
        className={`wink-editor-content ${getSizeClasses()} ${contentClassName}`}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default WInkEditor;
