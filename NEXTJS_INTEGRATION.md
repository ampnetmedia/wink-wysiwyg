# Next.js Integration Guide

This guide provides comprehensive instructions for integrating the W-Ink WYSIWYG editor with Next.js 15 App Router and React Server Components.

## Table of Contents

- [Quick Start](#quick-start)
- [SSR-Safe Patterns](#ssr-safe-patterns)
- [TypeScript Integration](#typescript-integration)
- [Common Issues & Solutions](#common-issues--solutions)
- [Performance Optimization](#performance-optimization)
- [Complete Examples](#complete-examples)

## Quick Start

### 1. Installation

```bash
npm install @ampnet/wink-wysiwyg
```

### 2. CSS Import

Add the CSS to your root layout:

```tsx
// app/layout.tsx
import "@ampnet/wink-wysiwyg/dist/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Basic Editor Component

```tsx
// app/components/Editor.tsx
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);

export default function Editor() {
  const [content, setContent] = useState("");

  return (
    <WInkEditor
      content={content}
      onChange={setContent}
      immediatelyRender={false}
      hydrationStrategy="afterMount"
    />
  );
}
```

## SSR-Safe Patterns

### Pattern 1: Dynamic Import (Recommended)

Use dynamic imports with `ssr: false` for interactive editors:

```tsx
"use client";
import dynamic from "next/dynamic";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading editor...</span>
      </div>
    ),
  }
);

export default function InteractiveEditor() {
  return (
    <WInkEditor
      content="<p>Start typing...</p>"
      onChange={(content) => console.log(content)}
      immediatelyRender={false}
      hydrationStrategy="afterMount"
    />
  );
}
```

### Pattern 2: Server Component Content Display

Use `WInkRenderer` for displaying static content in Server Components:

```tsx
// app/components/ContentDisplay.tsx (Server Component)
import { WInkRenderer } from "@ampnet/wink-wysiwyg";

interface ContentDisplayProps {
  html: string;
  className?: string;
}

export default function ContentDisplay({
  html,
  className,
}: ContentDisplayProps) {
  return (
    <WInkRenderer content={html} className={className || "prose max-w-none"} />
  );
}
```

### Pattern 3: NoSSR Wrapper (Alternative)

Use the `WInkNoSSR` wrapper for other client-only components:

```tsx
"use client";
import { WInkNoSSR, WInkEditor } from "@ampnet/wink-wysiwyg";

export default function ClientOnlyEditor() {
  return (
    <WInkNoSSR fallback={<div>Loading editor...</div>}>
      <WInkEditor
        content="<p>Client-only content</p>"
        immediatelyRender={false}
        hydrationStrategy="afterMount"
      />
    </WInkNoSSR>
  );
}
```

## TypeScript Integration

### Basic TypeScript Setup

```tsx
import { WInkEditorProps, EditorState } from "@ampnet/wink-wysiwyg";
import { useState } from "react";

interface EditorComponentProps {
  initialContent: string;
  onSave: (content: string) => void;
  className?: string;
}

export default function EditorComponent({
  initialContent,
  onSave,
  className,
}: EditorComponentProps) {
  const [content, setContent] = useState<string>(initialContent);
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  const handleChange = (newContent: string): void => {
    setContent(newContent);
    onSave(newContent);
  };

  const editorProps: WInkEditorProps = {
    content,
    onChange: handleChange,
    immediatelyRender: false,
    hydrationStrategy: "afterMount",
    enableMentions: true,
    enableHashtags: true,
    onReady: (editor) => {
      console.log("Editor ready:", editor);
    },
  };

  return (
    <div className={className}>
      <WInkEditor {...editorProps} />
    </div>
  );
}
```

### Advanced TypeScript with Custom Types

```tsx
import { WInkEditor, WInkEditorProps, EditorState } from "@ampnet/wink-wysiwyg";
import { Editor } from "@tiptap/react";

interface User {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
}

interface CustomEditorProps extends Partial<WInkEditorProps> {
  users: User[];
  onMentionSelect: (user: User) => void;
  onHashtagSelect: (tag: string) => void;
}

export default function CustomEditor({
  users,
  onMentionSelect,
  onHashtagSelect,
  ...editorProps
}: CustomEditorProps) {
  const getMentionSuggestions = (query: string): string[] => {
    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.handle.toLowerCase().includes(query.toLowerCase())
      )
      .map((user) => user.handle);
  };

  const handleMentionClick = (handle: string): void => {
    const user = users.find((u) => u.handle === handle);
    if (user) {
      onMentionSelect(user);
    }
  };

  return (
    <WInkEditor
      {...editorProps}
      immediatelyRender={false}
      hydrationStrategy="afterMount"
      enableMentions={true}
      enableHashtags={true}
      getMentionSuggestions={getMentionSuggestions}
      onMentionClick={handleMentionClick}
      onHashtagClick={onHashtagSelect}
    />
  );
}
```

## Common Issues & Solutions

### Issue 1: Hydration Mismatch

**Error**: `Hydration failed because the initial UI does not match`

**Solution**: Use dynamic imports with `ssr: false`

```tsx
const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);
```

### Issue 2: Tiptap SSR Detection

**Error**: `Tiptap Error: SSR has been detected, please set immediatelyRender explicitly to false`

**Solution**: Set `immediatelyRender={false}`

```tsx
<WInkEditor
  content={content}
  onChange={setContent}
  immediatelyRender={false} // ✅ This fixes the SSR error
  hydrationStrategy="afterMount"
/>
```

### Issue 3: Window/Document Undefined

**Error**: `ReferenceError: window is not defined`

**Solution**: Use dynamic imports or NoSSR wrapper

```tsx
// Option 1: Dynamic import (recommended)
const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);

// Option 2: NoSSR wrapper
import { WInkNoSSR } from "@ampnet/wink-wysiwyg";
<WInkNoSSR fallback={<div>Loading...</div>}>
  <WInkEditor content={content} />
</WInkNoSSR>;
```

### Issue 4: TypeScript Import Errors

**Error**: `Module not found: Package path ./client is not exported`

**Solution**: Use the main package import

```tsx
// ❌ Don't use this
import { WInkEditor } from "@ampnet/wink-wysiwyg/client";

// ✅ Use this instead
import dynamic from "next/dynamic";
const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);
```

### Issue 5: CSS Import Issues

**Error**: `Missing "./dist/index.css" specifier in package`

**Solution**: Import CSS from the correct path

```tsx
// In your layout.tsx or _app.tsx
import "@ampnet/wink-wysiwyg/dist/index.css";
```

## Performance Optimization

### 1. Lazy Loading

```tsx
import dynamic from "next/dynamic";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);
```

### 2. Conditional Loading

```tsx
import { useState } from "react";
import dynamic from "next/dynamic";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);

export default function ConditionalEditor() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <button onClick={() => setShowEditor(!showEditor)}>
        {showEditor ? "Hide" : "Show"} Editor
      </button>
      {showEditor && (
        <WInkEditor
          content="<p>Conditionally loaded editor</p>"
          immediatelyRender={false}
          hydrationStrategy="afterMount"
        />
      )}
    </div>
  );
}
```

### 3. Preloading

```tsx
import { useEffect } from "react";

export default function PreloadEditor() {
  useEffect(() => {
    // Preload the editor module
    import("@ampnet/wink-wysiwyg");
  }, []);

  return <div>Editor will load faster when needed</div>;
}
```

## Complete Examples

### Example 1: Blog Post Editor

```tsx
// app/admin/posts/editor/page.tsx
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { WInkRenderer } from "@ampnet/wink-wysiwyg";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);

export default function PostEditor() {
  const [content, setContent] = useState("<p>Start writing your post...</p>");
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 rounded ${!isPreview ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Edit
        </button>
        <button
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 rounded ${isPreview ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div className="border rounded-lg p-6">
          <WInkRenderer content={content} className="prose max-w-none" />
        </div>
      ) : (
        <WInkEditor
          content={content}
          onChange={setContent}
          immediatelyRender={false}
          hydrationStrategy="afterMount"
          enableMentions={true}
          enableHashtags={true}
          minHeight="400px"
        />
      )}
    </div>
  );
}
```

### Example 2: Comment System

```tsx
// app/components/CommentEditor.tsx
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);

interface CommentEditorProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

export default function CommentEditor({
  onSubmit,
  placeholder,
}: CommentEditorProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <WInkEditor
        content={content}
        onChange={setContent}
        placeholder={placeholder || "Write a comment..."}
        immediatelyRender={false}
        hydrationStrategy="afterMount"
        enableMentions={true}
        enableHashtags={true}
        minHeight="120px"
        showToolbar={true}
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </div>
  );
}
```

### Example 3: Rich Text Field Component

```tsx
// app/components/RichTextField.tsx
"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { WInkRenderer } from "@ampnet/wink-wysiwyg";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);

interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function RichTextField({
  value,
  onChange,
  label,
  placeholder,
  required,
  error,
  className,
}: RichTextFieldProps) {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="border rounded-lg overflow-hidden">
        <WInkEditor
          content={content}
          onChange={handleChange}
          placeholder={placeholder}
          immediatelyRender={false}
          hydrationStrategy="afterMount"
          enableMentions={true}
          enableHashtags={true}
          minHeight="200px"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

## Best Practices

1. **Always use dynamic imports** for interactive editors
2. **Set `immediatelyRender={false}`** to prevent SSR issues
3. **Use `hydrationStrategy="afterMount"`** for better performance
4. **Import CSS globally** in your layout or app file
5. **Use `WInkRenderer`** for displaying static content in Server Components
6. **Provide loading states** for better user experience
7. **Handle errors gracefully** with try-catch blocks
8. **Use TypeScript** for better development experience

## Support

- 📖 [Full Documentation](../README.md)
- 🐛 [Issue Tracker](https://github.com/ampnet-media/wink-wysiwyg/issues)
- 💬 [Discussions](https://github.com/ampnet-media/wink-wysiwyg/discussions)
