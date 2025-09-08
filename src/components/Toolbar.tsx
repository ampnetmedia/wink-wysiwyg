import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor;
  className?: string;
  enableMentions?: boolean;
  enableHashtags?: boolean;
  enableImages?: boolean;
  enableLinks?: boolean;
  enableTables?: boolean;
  enableCodeBlocks?: boolean;
}

/**
 * W-Ink Editor Toolbar Component
 *
 * Provides formatting buttons for the WYSIWYG editor.
 * Supports basic text formatting, lists, links, images, and more.
 */
const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  className = "",
  enableMentions = true,
  enableHashtags = true,
  enableImages = true,
  enableLinks = true,
  enableTables = false,
  enableCodeBlocks = true,
}) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: React.ReactNode;
    tooltip: string;
  }> = ({ onClick, isActive = false, disabled = false, icon, tooltip }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`wink-button ${isActive ? "active" : ""}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  );

  const ToolbarSeparator: React.FC = () => (
    <div className="wink-toolbar-separator" />
  );

  return (
    <div className={`wink-toolbar ${className}`}>
      {/* Text Formatting */}
      <div className="wink-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={<Bold size={16} />}
          tooltip="Bold (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={<Italic size={16} />}
          tooltip="Italic (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={<Underline size={16} />}
          tooltip="Underline (Ctrl+U)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon={<Strikethrough size={16} />}
          tooltip="Strikethrough"
        />
      </div>

      <ToolbarSeparator />

      {/* Headings */}
      <div className="wink-toolbar-group">
        <select
          className="wink-button"
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
            }
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? 1
              : editor.isActive("heading", { level: 2 })
                ? 2
                : editor.isActive("heading", { level: 3 })
                  ? 3
                  : editor.isActive("heading", { level: 4 })
                    ? 4
                    : editor.isActive("heading", { level: 5 })
                      ? 5
                      : editor.isActive("heading", { level: 6 })
                        ? 6
                        : 0
          }
        >
          <option value={0}>Paragraph</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
          <option value={4}>Heading 4</option>
          <option value={5}>Heading 5</option>
          <option value={6}>Heading 6</option>
        </select>
      </div>

      <ToolbarSeparator />

      {/* Lists */}
      <div className="wink-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={<List size={16} />}
          tooltip="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={<ListOrdered size={16} />}
          tooltip="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={<Quote size={16} />}
          tooltip="Quote"
        />
      </div>

      <ToolbarSeparator />

      {/* Text Alignment */}
      <div className="wink-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          icon={<AlignLeft size={16} />}
          tooltip="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          icon={<AlignCenter size={16} />}
          tooltip="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          icon={<AlignRight size={16} />}
          tooltip="Align Right"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          icon={<AlignJustify size={16} />}
          tooltip="Justify"
        />
      </div>

      <ToolbarSeparator />

      {/* Links and Media */}
      <div className="wink-toolbar-group">
        {enableLinks && (
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive("link")}
            icon={<Link size={16} />}
            tooltip="Add Link"
          />
        )}

        {enableImages && (
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("Enter image URL:");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            icon={<Image size={16} />}
            tooltip="Add Image"
          />
        )}
      </div>

      <ToolbarSeparator />

      {/* Code */}
      {enableCodeBlocks && (
        <div className="wink-toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            icon={<Code size={16} />}
            tooltip="Code Block"
          />
        </div>
      )}

      <ToolbarSeparator />

      {/* Undo/Redo */}
      <div className="wink-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo size={16} />}
          tooltip="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo size={16} />}
          tooltip="Redo (Ctrl+Y)"
        />
      </div>
    </div>
  );
};

export default Toolbar;
