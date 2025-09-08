import React, { useState } from "react";
import { Keyboard, X, HelpCircle } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  className?: string;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = {
    formatting: [
      { key: "Ctrl/Cmd + B", description: "Bold" },
      { key: "Ctrl/Cmd + I", description: "Italic" },
      { key: "Ctrl/Cmd + U", description: "Underline" },
      { key: "Ctrl/Cmd + K", description: "Insert Link" },
    ],
    headings: [
      { key: "Ctrl/Cmd + 1", description: "Heading 1" },
      { key: "Ctrl/Cmd + 2", description: "Heading 2" },
      { key: "Ctrl/Cmd + 3", description: "Heading 3" },
      { key: "Ctrl/Cmd + 0", description: "Paragraph" },
    ],
    lists: [
      { key: "Ctrl/Cmd + Shift + 8", description: "Bullet List" },
      { key: "Ctrl/Cmd + Shift + 7", description: "Numbered List" },
      { key: "Tab", description: "Indent List Item" },
      { key: "Shift + Tab", description: "Outdent List Item" },
    ],
    alignment: [
      { key: "Ctrl/Cmd + Shift + L", description: "Align Left" },
      { key: "Ctrl/Cmd + Shift + E", description: "Align Center" },
      { key: "Ctrl/Cmd + Shift + R", description: "Align Right" },
      { key: "Ctrl/Cmd + Shift + J", description: "Justify" },
    ],
    blocks: [
      { key: "Ctrl/Cmd + Shift + Q", description: "Blockquote" },
      { key: "Ctrl/Cmd + `", description: "Code Block" },
    ],
    history: [
      { key: "Ctrl/Cmd + Z", description: "Undo" },
      { key: "Ctrl/Cmd + Y", description: "Redo" },
      { key: "Ctrl/Cmd + Shift + Z", description: "Redo" },
    ],
    selection: [
      { key: "Ctrl/Cmd + A", description: "Select All" },
      { key: "Ctrl/Cmd + Backspace", description: "Delete Selection" },
      { key: "Ctrl/Cmd + Delete", description: "Delete Selection" },
    ],
    navigation: [
      { key: "Escape", description: "Blur Editor" },
      { key: "Ctrl/Cmd + Enter", description: "Hard Break" },
      { key: "Shift + Enter", description: "Soft Break" },
      { key: "Ctrl/Cmd + Home", description: "Go to Start" },
      { key: "Ctrl/Cmd + End", description: "Go to End" },
      { key: "Page Up", description: "Start of Line" },
      { key: "Page Down", description: "End of Line" },
    ],
  };

  const ShortcutGroup: React.FC<{
    title: string;
    shortcuts: Array<{ key: string; description: string }>;
  }> = ({ title, shortcuts }) => (
    <div className="wink-shortcut-group">
      <h4 className="wink-shortcut-group-title">{title}</h4>
      <div className="wink-shortcut-list">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="wink-shortcut-item">
            <kbd className="wink-shortcut-key">{shortcut.key}</kbd>
            <span className="wink-shortcut-description">
              {shortcut.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`wink-button ${className}`}
        title="Keyboard Shortcuts"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard size={16} />
      </button>

      {isOpen && (
        <div className="wink-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="wink-shortcuts-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wink-modal-header">
              <h3>Keyboard Shortcuts</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="wink-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="wink-modal-content wink-shortcuts-content">
              <div className="wink-shortcuts-grid">
                <ShortcutGroup
                  title="Text Formatting"
                  shortcuts={shortcuts.formatting}
                />
                <ShortcutGroup
                  title="Headings"
                  shortcuts={shortcuts.headings}
                />
                <ShortcutGroup title="Lists" shortcuts={shortcuts.lists} />
                <ShortcutGroup
                  title="Alignment"
                  shortcuts={shortcuts.alignment}
                />
                <ShortcutGroup title="Blocks" shortcuts={shortcuts.blocks} />
                <ShortcutGroup title="History" shortcuts={shortcuts.history} />
                <ShortcutGroup
                  title="Selection"
                  shortcuts={shortcuts.selection}
                />
                <ShortcutGroup
                  title="Navigation"
                  shortcuts={shortcuts.navigation}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcutsHelp;
