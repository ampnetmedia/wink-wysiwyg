import React, { useState } from "react";
import { WInkEditor } from "../src/components/WInkEditor";
import { WInkEditorProps } from "../src/types/editor";

/**
 * Basic example of using the W-Ink WYSIWYG editor
 */
const BasicExample: React.FC = () => {
  const [content, setContent] = useState(
    "<p>Hello, <strong>W-Ink</strong>! Start typing to see the magic happen.</p>"
  );

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log("Content changed:", newContent);
  };

  const editorProps: WInkEditorProps = {
    content,
    placeholder: "Start typing your content here...",
    onChange: handleContentChange,
    size: "lg",
    theme: "light",
    showToolbar: true,
    enableMentions: true,
    enableHashtags: true,
    enableImages: true,
    enableLinks: true,
    enableCodeBlocks: true,
    autoFocus: false,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          W-Ink WYSIWYG Editor
        </h1>
        <p className="text-gray-600">
          A modern, extensible WYSIWYG editor built with TipTap and React.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <WInkEditor {...editorProps} />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Current Content (HTML):
        </h3>
        <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-auto max-h-40">
          {content}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Features:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Rich text formatting (bold, italic, underline, etc.)</li>
          <li>• Headings and lists</li>
          <li>• Links and images</li>
          <li>• Code blocks</li>
          <li>• Text alignment</li>
          <li>• Undo/redo functionality</li>
          <li>• Responsive design</li>
          <li>• Accessibility support</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicExample;
