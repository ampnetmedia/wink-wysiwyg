# W-Ink WYSIWYG Editor

A modern, extensible WYSIWYG editor for React applications with @mentions and #hashtags support.

[![npm version](https://badge.fury.io/js/%40ampnet%2Fwink-wysiwyg.svg)](https://badge.fury.io/js/%40ampnet%2Fwink-wysiwyg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Features

- 🎨 **Rich Text Editing** - Full-featured WYSIWYG editor with formatting, lists, links, and more
- 👥 **Social Features** - Built-in @mention and #hashtag support
- 🔌 **Extensible** - Plugin system for custom functionality
- 🎯 **Accessible** - WCAG compliant with keyboard navigation and screen reader support
- 📱 **Responsive** - Works on desktop and mobile devices
- 🎨 **Customizable** - TailwindCSS integration with custom themes
- ⚡ **Performance** - Optimized for speed and efficiency
- 🔒 **Secure** - Built-in XSS protection and content sanitization

## Installation

```bash
npm install @ampnet/wink-wysiwyg
```

## Quick Start

```tsx
import React, { useState } from "react";
import { WInkEditor } from "@ampnet/wink-wysiwyg";
import "@ampnet/wink-wysiwyg/dist/styles.css";

function App() {
  const [content, setContent] = useState(
    "<p>Hello, <strong>W-Ink</strong>!</p>"
  );

  return (
    <WInkEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
      enableMentions={true}
      enableHashtags={true}
    />
  );
}
```

## Next.js 15 App Router Integration

The W-Ink editor is fully compatible with Next.js 15 App Router and React Server Components. Here are the recommended patterns for different use cases:

### Client-Side Editor (Recommended)

For interactive editors that need to run on the client:

```tsx
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamic import with SSR disabled - prevents hydration issues
const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export default function RichTextEditor({
  initialContent,
}: {
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);

  return (
    <WInkEditor
      content={content}
      onChange={setContent}
      immediatelyRender={false} // Important for SSR safety
      hydrationStrategy="afterMount" // Defer initialization
      enableMentions={true}
      enableHashtags={true}
      onMentionClick={(handle) => console.log("Mention clicked:", handle)}
      onHashtagClick={(tag) => console.log("Hashtag clicked:", tag)}
      getMentionSuggestions={(query) =>
        ["adam", "sarah", "jordan"].filter((name) =>
          name.toLowerCase().includes(query.toLowerCase())
        )
      }
    />
  );
}
```

### SSR-Safe Content Display

For displaying static content in Server Components (no hydration issues):

```tsx
import { WInkRenderer } from "@ampnet/wink-wysiwyg";

export default function ContentDisplay({ html }: { html: string }) {
  return (
    <WInkRenderer
      content={html}
      className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
    />
  );
}
```

### NoSSR Wrapper (Alternative Approach)

For wrapping other client-only components:

```tsx
"use client";
import { WInkNoSSR } from "@ampnet/wink-wysiwyg";
import { WInkEditor } from "@ampnet/wink-wysiwyg";

export default function ClientOnlyComponent() {
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

### TypeScript Integration

The package provides full TypeScript support with comprehensive type definitions:

```tsx
import { WInkEditorProps, EditorState } from "@ampnet/wink-wysiwyg";

interface MyEditorProps {
  content: string;
  onSave: (content: string) => void;
}

export default function MyEditor({ content, onSave }: MyEditorProps) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  const handleChange = (newContent: string) => {
    // TypeScript knows newContent is a string
    onSave(newContent);
  };

  return (
    <WInkEditor
      content={content}
      onChange={handleChange}
      onReady={(editor) => {
        // TypeScript knows editor is a TipTap Editor instance
        console.log("Editor ready:", editor);
      }}
      immediatelyRender={false}
      hydrationStrategy="afterMount"
    />
  );
}
```

## Basic Usage

### Simple Editor

```tsx
import { WInkEditor } from "@ampnet/wink-wysiwyg";

<WInkEditor
  content="<p>Your content here</p>"
  onChange={(content) => console.log(content)}
  placeholder="Start typing..."
/>;
```

### With Social Features

```tsx
<WInkEditor
  content={content}
  onChange={setContent}
  enableMentions={true}
  enableHashtags={true}
  onMentionClick={(handle) => console.log("Mention clicked:", handle)}
  getMentionSuggestions={(query) => {
    // Return filtered suggestions based on query
    return suggestions.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );
  }}
/>
```

### With Custom Primary Color Theme

```tsx
<WInkEditor
  content={content}
  onChange={setContent}
  primaryColor="#ff6b6b" // Custom red theme
  enableMentions={true}
  enableHashtags={true}
  onMentionClick={(handle) => console.log("Mention clicked:", handle)}
  onHashtagClick={(tag) => console.log("Hashtag clicked:", tag)}
/>
```

### Custom Configuration

```tsx
<WInkEditor
  content={content}
  onChange={setContent}
  size="lg"
  theme="dark"
  showToolbar={true}
  enableImages={true}
  enableLinks={true}
  enableCodeBlocks={true}
  minHeight="200px"
  maxHeight="500px"
  autoFocus={true}
/>
```

## API Reference

### WInkEditor Props

| Prop                    | Type                                     | Default             | Description                            |
| ----------------------- | ---------------------------------------- | ------------------- | -------------------------------------- |
| `content`               | `string`                                 | `''`                | Initial HTML content                   |
| `onChange`              | `(content: string) => void`              | -                   | Callback when content changes          |
| `placeholder`           | `string`                                 | `'Start typing...'` | Placeholder text                       |
| `editable`              | `boolean`                                | `true`              | Whether editor is editable             |
| `showToolbar`           | `boolean`                                | `true`              | Whether to show toolbar                |
| `size`                  | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`              | Editor size                            |
| `theme`                 | `'light' \| 'dark' \| 'auto'`            | `'light'`           | Editor theme                           |
| `primaryColor`          | `string`                                 | -                   | Primary color for theming (hex)        |
| `immediatelyRender`     | `boolean`                                | `true`              | **SSR**: Control TipTap initialization |
| `hydrationStrategy`     | `'none' \| 'afterMount' \| 'rAF'`        | `'none'`            | **SSR**: Hydration strategy            |
| `enableMentions`        | `boolean`                                | `false`             | Enable @mention support                |
| `enableHashtags`        | `boolean`                                | `false`             | Enable #hashtag support                |
| `enableImages`          | `boolean`                                | `true`              | Enable image insertion                 |
| `enableLinks`           | `boolean`                                | `true`              | Enable link insertion                  |
| `enableCodeBlocks`      | `boolean`                                | `true`              | Enable code blocks                     |
| `autoFocus`             | `boolean`                                | `false`             | Auto-focus on mount                    |
| `minHeight`             | `string \| number`                       | `'120px'`           | Minimum editor height                  |
| `maxHeight`             | `string \| number`                       | -                   | Maximum editor height                  |
| `onMentionClick`        | `(handle: string) => void`               | -                   | Callback when mention is clicked       |
| `getMentionSuggestions` | `(query: string) => string[]`            | -                   | Function to get mention suggestions    |
| `onHashtagClick`        | `(tag: string) => void`                  | -                   | Callback when hashtag is clicked       |
| `onImageUpload`         | `(file: File) => Promise<string>`        | -                   | Handle image uploads                   |
| `onReady`               | `(editor: Editor) => void`               | -                   | Callback when editor is ready          |
| `onDestroy`             | `() => void`                             | -                   | Callback when editor is destroyed      |

### TypeScript Types

The package exports comprehensive TypeScript definitions:

```tsx
import {
  WInkEditorProps, // Main editor props interface
  EditorState, // Editor state interface
  WInkEditorConfig, // Base configuration
  EditorSize, // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  EditorTheme, // 'light' | 'dark' | 'auto'
  EditorMode, // 'wysiwyg' | 'markdown' | 'html'
  ToolbarButton, // Toolbar button interface
  ToolbarGroup, // Toolbar group interface
  WInkPlugin, // Plugin interface
  MentionConfig, // Mention configuration
  HashtagConfig, // Hashtag configuration
  ExportConfig, // Export configuration
  ImportConfig, // Import configuration
} from "@ampnet/wink-wysiwyg";
```

### TypeScript Usage Examples

#### Basic TypeScript Setup

```tsx
import { WInkEditorProps, EditorState } from "@ampnet/wink-wysiwyg";
import { useState } from "react";

interface MyEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  className?: string;
}

export default function MyEditor({
  initialContent,
  onSave,
  className,
}: MyEditorProps) {
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

#### Advanced TypeScript with Custom Types

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

### Hooks

#### useWInkEditor

```tsx
import { useWInkEditor } from "@ampnet/wink-wysiwyg";

const { editor, editorUtils, isReady } = useWInkEditor(editor, config);

// Available methods:
editorUtils.getContent("html" | "text" | "json");
editorUtils.setContent(content);
editorUtils.exportContent("html" | "markdown" | "text" | "json");
editorUtils.importContent(content, "html" | "markdown" | "text" | "json");
```

#### useMentions

```tsx
import { useMentions } from "@ampnet/wink-wysiwyg";

const { mentionState, showSuggestions, hideSuggestions, insertMention } =
  useMentions(editor, {
    trigger: "@",
    fetchSuggestions: async (query) => {
      // Fetch mention suggestions
      return suggestions;
    },
  });
```

#### useHashtags

```tsx
import { useHashtags } from "@ampnet/wink-wysiwyg";

const {
  hashtagState,
  showSuggestions,
  hideSuggestions,
  insertHashtag,
  extractHashtags,
} = useHashtags(editor, {
  trigger: "#",
  fetchSuggestions: async (query) => {
    // Fetch hashtag suggestions
    return suggestions;
  },
});
```

## Theming

The editor supports custom theming through a primary color system. You can easily customize the appearance to match your brand or application design.

### Primary Color Theming

The `primaryColor` prop allows you to set a custom color that automatically generates a cohesive theme:

```tsx
<WInkEditor
  content={content}
  onChange={setContent}
  primaryColor="#ff6b6b" // Custom red theme
  enableMentions={true}
  enableHashtags={true}
/>
```

**What gets themed:**

- **Toolbar buttons**: Hover and active states use the primary color
- **@mentions**: Background, text, and border colors use primary color variations
- **#hashtags**: Background, text, and border colors use primary color variations
- **Interactive elements**: All hover effects respect the primary color theme

**Color variations generated:**

- Light variations (10% opacity) for backgrounds
- Medium variations (30% opacity) for borders
- Dark variations (80% opacity) for hover states
- Full opacity for text and active states

### CSS Variables

The editor uses CSS custom properties that can be overridden:

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-light: #dbeafe;
  --color-primary-dark: #1d4ed8;
  --color-mention-bg: var(--color-primary-light);
  --color-mention-text: var(--color-primary-dark);
  --color-mention-border: var(--color-primary);
  --color-hashtag-bg: var(--color-primary-light);
  --color-hashtag-text: var(--color-primary-dark);
  --color-hashtag-border: var(--color-primary);
}
```

### Advanced Styling

You can further customize the appearance by:

1. **CSS Custom Properties** - Override CSS variables
2. **TailwindCSS Classes** - Use Tailwind utility classes
3. **Custom CSS** - Add your own styles

### Custom Classes

```tsx
<WInkEditor
  className="my-custom-editor"
  toolbarClassName="my-custom-toolbar"
  contentClassName="my-custom-content"
/>
```

## Plugin System

Create custom plugins to extend functionality:

```tsx
import { WInkPlugin } from "@ampnet/wink-wysiwyg";

const customPlugin: WInkPlugin = {
  id: "custom-plugin",
  name: "Custom Plugin",
  init: (editor) => {
    // Initialize plugin
  },
  getToolbarButtons: (editor) => [
    {
      id: "custom-button",
      name: "Custom Action",
      onClick: () => {
        // Handle button click
      },
    },
  ],
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/ampnetmedia/wink-wysiwyg.git
cd wink-wysiwyg

# Install dependencies
npm install

# Start development server
npm run dev

# Build package
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

```
wink-wysiwyg/
├── src/
│   ├── components/          # React components
│   │   ├── WInkEditor.tsx   # Main editor component
│   │   ├── Toolbar.tsx      # Formatting toolbar
│   │   └── plugins/         # Built-in plugins
│   ├── hooks/               # Custom hooks
│   │   ├── useWInkEditor.ts # Main editor hook
│   │   ├── useMentions.ts   # Mention functionality
│   │   └── useHashtags.ts   # Hashtag functionality
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   └── styles/              # CSS and styling
├── dist/                    # Built package
├── examples/                # Usage examples
├── tests/                   # Test files
└── docs/                    # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## SSR Troubleshooting

If you encounter hydration errors in Next.js or other SSR frameworks, follow these solutions:

### Common SSR Issues and Solutions

#### 1. Hydration Mismatch Errors

**Error**: `Hydration failed because the initial UI does not match`

**Solution**: Use dynamic imports with `ssr: false`

```tsx
"use client";
import dynamic from "next/dynamic";

const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);
```

#### 2. Tiptap SSR Detection Error

**Error**: `Tiptap Error: SSR has been detected, please set immediatelyRender explicitly to false`

**Solution**: Set `immediatelyRender={false}` in your editor props

```tsx
<WInkEditor
  content={content}
  onChange={setContent}
  immediatelyRender={false} // ✅ This fixes the SSR error
  hydrationStrategy="afterMount"
/>
```

#### 3. Window/Global Object Errors

**Error**: `ReferenceError: window is not defined` or `document is not defined`

**Solution**: Use the SSR-safe wrapper or dynamic imports

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

#### 4. TypeScript Import Errors

**Error**: `Module not found: Package path ./client is not exported`

**Solution**: Use the main package import with dynamic loading

```tsx
// ❌ Don't use this (client entrypoint may not be available)
import { WInkEditor } from "@ampnet/wink-wysiwyg/client";

// ✅ Use this instead
import dynamic from "next/dynamic";
const WInkEditor = dynamic(
  () => import("@ampnet/wink-wysiwyg").then((m) => m.WInkEditor),
  { ssr: false }
);
```

#### 5. CSS Import Issues

**Error**: `Missing "./dist/index.css" specifier in package`

**Solution**: Import CSS from the correct path

```tsx
// In your layout.tsx or _app.tsx
import "@ampnet/wink-wysiwyg/dist/index.css";
```

### Best Practices for Next.js Integration

1. **Always use dynamic imports** for interactive editors
2. **Set `immediatelyRender={false}`** to prevent SSR issues
3. **Use `hydrationStrategy="afterMount"`** for better performance
4. **Import CSS globally** in your layout or app file
5. **Use `WInkRenderer`** for displaying static content in Server Components

### Complete Next.js Setup Example

```tsx
// app/layout.tsx
import "@ampnet/wink-wysiwyg/dist/index.css";

// app/components/Editor.tsx
("use client");
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
      enableMentions={true}
      enableHashtags={true}
    />
  );
}

// app/components/ContentDisplay.tsx (Server Component)
import { WInkRenderer } from "@ampnet/wink-wysiwyg";

export default function ContentDisplay({ html }: { html: string }) {
  return <WInkRenderer content={html} className="prose" />;
}
```

## Additional Resources

- 📖 [Next.js Integration Guide](./NEXTJS_INTEGRATION.md) - Comprehensive guide for Next.js 15 App Router
- 🎯 [TypeScript Examples](./NEXTJS_INTEGRATION.md#typescript-integration) - Advanced TypeScript usage patterns
- 🔧 [SSR Troubleshooting](./README.md#ssr-troubleshooting) - Common issues and solutions

## Support

- 📖 [Documentation](https://github.com/ampnet-media/wink-wysiwyg)
- 🐛 [Issue Tracker](https://github.com/ampnet-media/wink-wysiwyg/issues)
- 💬 [Discussions](https://github.com/ampnet-media/wink-wysiwyg/discussions)

## Version Management

This project uses semantic versioning (semver) for version management. Use the following npm scripts to manage versions:

### Version Commands

```bash
# Patch version (0.1.0 -> 0.1.1) - Bug fixes
npm run version:patch

# Minor version (0.1.0 -> 0.2.0) - New features, backward compatible
npm run version:minor

# Major version (0.1.0 -> 1.0.0) - Breaking changes
npm run version:major

# Prerelease version (0.1.0 -> 0.1.1-0) - Alpha/beta releases
npm run version:prerelease
```

### Release Commands

```bash
# Release with automatic build and git push
npm run release:patch   # For bug fixes
npm run release:minor   # For new features
npm run release:major   # For breaking changes
```

### Manual Version Management

```bash
# Set a specific version
npm version 0.2.0

# Set a prerelease version
npm version 0.2.0-beta.1
```

## Changelog

### 0.2.0

- ✨ **New Feature**: Primary color theming system
  - Added `primaryColor` prop for custom color theming
  - Automatic generation of color variations for mentions and hashtags
  - Dynamic toolbar button theming with hover effects
  - CSS custom properties for advanced customization
  - Backward compatible with existing implementations

### 0.1.0

- Initial release with comprehensive WYSIWYG functionality
- Core editor with TipTap integration
- Complete toolbar with animated buttons
- Text formatting (bold, italic, underline, strikethrough)
- Text alignment (left, center, right, justify)
- Headings (H1-H6) with dropdown selector
- Lists (bullet and numbered) with proper styling
- Blockquotes and code blocks
- Link insertion and management
- Image support with drag & drop
- Undo/redo functionality
- Comprehensive keyboard shortcuts modal
- Enhanced copy/paste with Word/Google Docs support
- Smart focus management and navigation
- Light theme with proper CSS isolation
- Plugin system architecture
- @mention and #hashtag support hooks (ready for implementation)
- TailwindCSS integration
- Accessibility features
- TypeScript support
- Build system with Rollup

---

Built with ❤️ by [ampnet (media)](https://ampnet.media) and [Flexhub](https://flexhub.ampnet.media)
