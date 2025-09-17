import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { ImageExtension } from "../extensions/ImageExtension";
import { MentionHighlight } from "../extensions/MentionHighlight";
import { HashtagHighlight } from "../extensions/HashtagHighlight";
import { WInkEditorProps, EditorState } from "../types/editor";
import { useDragDrop } from "../hooks/useDragDrop";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useFocusManagement } from "../hooks/useFocusManagement";
import { useCopyPaste } from "../hooks/useCopyPaste";
import Toolbar from "./Toolbar";
import { Editor as TiptapEditor } from "@tiptap/react";

/**
 * Internal client-only editor implementation. Do not export directly.
 */
const EditorImpl: React.FC<WInkEditorProps> = ({
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
  primaryColor,
  immediatelyRender = true,
  hydrationStrategy = "none",
  enableMentions = true,
  enableHashtags = true,
  enableImages = true,
  enableLinks = true,
  enableTables = false,
  enableCodeBlocks = true,
  plugins = [],
  extensions = [],
  onImageUpload,
  onMentionClick,
  getMentionSuggestions,
  onHashtagClick,
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

  // Generate CSS custom properties for primary color theming
  const getPrimaryColorStyles = useCallback(() => {
    if (!primaryColor) return {};

    // Convert hex to RGB for opacity variations
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const rgb = hexToRgb(primaryColor);
    if (!rgb) return {};

    // Generate color variations
    const lightColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
    const mediumColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    const darkColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;

    return {
      "--color-primary": primaryColor,
      "--color-primary-hover": darkColor,
      "--color-primary-light": lightColor,
      "--color-primary-dark": primaryColor,
      "--color-mention-bg": lightColor,
      "--color-mention-text": primaryColor,
      "--color-mention-border": mediumColor,
      "--color-hashtag-bg": lightColor,
      "--color-hashtag-text": primaryColor,
      "--color-hashtag-border": mediumColor,
    } as React.CSSProperties;
  }, [primaryColor]);

  // Create TipTap extensions (memoized)
  const tipTapExtensions: any[] = useMemo(() => {
    const exts: any[] = [
      StarterKit.configure({
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
        // Disable extensions that we add separately to avoid duplicates
        link: false,
        underline: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ];

    if (enableLinks) {
      exts.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "wink-link",
          },
        })
      );
    }

    if (enableImages) {
      exts.push(
        ImageExtension.configure({
          HTMLAttributes: {
            class: "wink-image",
          },
        })
      );
    }

    if (enableMentions) {
      exts.push(
        MentionHighlight.configure({
          HTMLAttributes: {
            class: "wink-mention",
          },
        })
      );
    }

    if (enableHashtags) {
      exts.push(
        HashtagHighlight.configure({
          HTMLAttributes: {
            class: "wink-hashtag",
          },
        })
      );
    }

    exts.push(...extensions);
    return exts;
  }, [
    enableLinks,
    enableImages,
    enableMentions,
    enableHashtags,
    placeholder,
    extensions,
  ]);

  // Create the editor instance
  const editor = useEditor({
    extensions: tipTapExtensions,
    content,
    editable,
    autofocus: autoFocus,
    immediatelyRender,
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

      // Lightweight @mention highlighter: scan current paragraph tokens and apply mark
      try {
        if (enableMentions) {
          const { state } = editor;
          const { selection } = state;
          const { $from } = selection;
          const parent = $from.parent;
          const startPos = $from.start();
          const text = parent.textContent || "";
          // Match @handle; allow dots inside, but not as the trailing char, and stop before punctuation
          const regex = /@([A-Za-z0-9_.-]*[A-Za-z0-9_-])(?![A-Za-z0-9_-])/g;
          let match: RegExpExecArray | null;
          const tr = state.tr;
          // Clear existing marks of this type in the paragraph to avoid duplicates
          const type = (editor.schema.marks as any)["mentionHighlight"];
          if (type) {
            tr.removeMark(startPos, startPos + text.length, type);
          }
          while ((match = regex.exec(text)) !== null) {
            const from = startPos + match.index;
            const to = from + match[0].length;
            if (type) {
              tr.addMark(
                from,
                to,
                type.create({ "data-mention": "true", "data-handle": match[1] })
              );
            }
          }
          if (tr.steps.length > 0) {
            editor.view.dispatch(tr);
          }
        }
      } catch (_) {}

      // Lightweight #hashtag highlighter: scan current paragraph tokens and apply mark
      try {
        if (enableHashtags) {
          const { state } = editor;
          const { selection } = state;
          const { $from } = selection;
          const parent = $from.parent;
          const startPos = $from.start();
          const text = parent.textContent || "";
          // Match #hashtag; allow dots inside, but not as the trailing char, and stop before punctuation
          const regex = /#([A-Za-z0-9_.-]*[A-Za-z0-9_-])(?![A-Za-z0-9_-])/g;
          let match: RegExpExecArray | null;
          const tr = state.tr;
          // Clear existing marks of this type in the paragraph to avoid duplicates
          const type = (editor.schema.marks as any)["hashtagHighlight"];
          if (type) {
            tr.removeMark(startPos, startPos + text.length, type);
          }
          while ((match = regex.exec(text)) !== null) {
            const from = startPos + match.index;
            const to = from + match[0].length;
            if (type) {
              tr.addMark(
                from,
                to,
                type.create({ "data-hashtag": "true", "data-tag": match[1] })
              );
            }
          }
          if (tr.steps.length > 0) {
            editor.view.dispatch(tr);
          }
        }
      } catch (_) {}
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

  // Optional defer of any heavy work post-mount
  useEffect(() => {
    if (!editor) return;
    if (hydrationStrategy === "afterMount") {
      // no-op; editor already created, but heavy work could be scheduled here
    } else if (hydrationStrategy === "rAF") {
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          // hook for future defers
        });
      }
    }
  }, [editor, hydrationStrategy]);

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
        ...getPrimaryColorStyles(),
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
        onClick={(e) => {
          const target = e.target as HTMLElement;

          // Check for mention clicks
          const mentionEl = target.closest(
            '[data-mention="true"]'
          ) as HTMLElement | null;
          if (mentionEl && onMentionClick) {
            const handle = mentionEl.getAttribute("data-handle") || "";
            onMentionClick(handle);
            return;
          }

          // Check for hashtag clicks
          const hashtagEl = target.closest(
            '[data-hashtag="true"]'
          ) as HTMLElement | null;
          if (hashtagEl && onHashtagClick) {
            const tag = hashtagEl.getAttribute("data-tag") || "";
            onHashtagClick(tag);
            return;
          }

          editor?.commands.focus();
        }}
      >
        {/* Suggestions dropdown */}
        {enableMentions && getMentionSuggestions && editor && (
          <MentionSuggestions
            editor={editor}
            getMentionSuggestions={getMentionSuggestions}
          />
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

/**
 * SSR-safe wrapper that defers client initialization and avoids hydration mismatches.
 */
const WInkEditor: React.FC<WInkEditorProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  const [shouldInit, setShouldInit] = useState(false);

  const strategy = props.hydrationStrategy ?? "none";
  const immediate = props.immediatelyRender ?? typeof window !== "undefined";

  useEffect(() => {
    setIsClient(true);
    if (immediate) {
      setShouldInit(true);
      return;
    }
    if (strategy === "afterMount") {
      const t = setTimeout(() => setShouldInit(true), 0);
      return () => clearTimeout(t);
    }
    if (strategy === "rAF") {
      const id = requestAnimationFrame(() => setShouldInit(true));
      return () => cancelAnimationFrame(id);
    }
    // default: none -> initialize on mount anyway
    setShouldInit(true);
  }, [immediate, strategy]);

  // During SSR or before client init, render a stable placeholder
  if (!isClient || !shouldInit) {
    return (
      <div className="wink-editor loading">
        <div className="flex items-center justify-center p-4">
          <div className="wink-spinner"></div>
          <span className="ml-2 text-gray-500">Loading editor...</span>
        </div>
      </div>
    );
  }

  return <EditorImpl {...props} />;
};

export default WInkEditor;

// Lightweight suggestion dropdown component
const MentionSuggestions: React.FC<{
  editor: TiptapEditor;
  getMentionSuggestions: (
    query: string
  ) => Array<string | { handle: string; label?: string; avatarUrl?: string }>;
}> = ({ editor, getMentionSuggestions }) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<
    Array<{ handle: string; label?: string; avatarUrl?: string }>
  >([]);
  const [coords, setCoords] = React.useState<{
    left: number;
    top: number;
  } | null>(null);

  React.useEffect(() => {
    const view = editor.view;
    const handler = () => {
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        "\uFFFC"
      );
      const match = /@([A-Za-z0-9_.-]*)$/.exec(textBefore);
      const qRaw = match?.[1] ?? "";
      if (!match || qRaw.length === 0) {
        setOpen(false);
        return;
      }
      const q = qRaw;
      setQuery(q);
      const rect = view.coordsAtPos($from.pos);
      const containerRect = view.dom.getBoundingClientRect();
      setCoords({
        left: rect.left - containerRect.left - 8,
        top: rect.bottom - containerRect.top + 22,
      });
      const raw = getMentionSuggestions(q) || [];
      const norm = raw.map((v) => (typeof v === "string" ? { handle: v } : v));
      setItems(norm.slice(0, 8));
      setOpen(true);
    };

    view.dom.addEventListener("keyup", handler);
    view.dom.addEventListener("click", handler);
    return () => {
      view.dom.removeEventListener("keyup", handler);
      view.dom.removeEventListener("click", handler);
    };
  }, [editor, getMentionSuggestions]);

  if (!open || !coords || items.length === 0) return null;

  return (
    <div
      className="wink-dropdown-content"
      style={{
        position: "absolute",
        left: coords.left,
        top: coords.top,
        zIndex: 50,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.map((item) => (
        <div
          key={item.handle}
          className="wink-mention-suggestion"
          onClick={() => {
            // Replace current @query with selected handle
            const { state } = editor;
            const { selection } = state;
            const { $from } = selection;
            const textBefore = $from.parent.textBetween(
              0,
              $from.parentOffset,
              undefined,
              "\uFFFC"
            );
            const match = /@([A-Za-z0-9_.-]*)$/.exec(textBefore);
            if (!match) return;
            const from = $from.pos - match[0].length;
            editor
              .chain()
              .focus()
              .deleteRange({ from, to: $from.pos })
              .insertContent(`@${item.handle} `)
              .run();
            setOpen(false);
          }}
        >
          @{item.handle}
        </div>
      ))}
    </div>
  );
};
