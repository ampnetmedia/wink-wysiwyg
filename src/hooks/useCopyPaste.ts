import { useCallback, useEffect } from "react";
import { Editor } from "@tiptap/react";

interface UseCopyPasteOptions {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
  enabled?: boolean;
  preserveFormatting?: boolean;
  sanitizeContent?: boolean;
}

export const useCopyPaste = ({
  editor,
  onImageUpload,
  enabled = true,
  preserveFormatting = true,
  sanitizeContent = true,
}: UseCopyPasteOptions) => {
  // Handle paste events
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!enabled || !editor) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = Array.from(clipboardData.items);
      const hasImages = items.some((item) => item.type.startsWith("image/"));
      const hasText = items.some((item) => item.type === "text/plain");
      const hasHtml = items.some((item) => item.type === "text/html");

      // Handle image pasting
      if (hasImages) {
        e.preventDefault();

        const imageItems = items.filter((item) =>
          item.type.startsWith("image/")
        );

        for (const item of imageItems) {
          const file = item.getAsFile();
          if (!file) continue;

          try {
            if (onImageUpload) {
              const url = await onImageUpload(file);
              editor
                .chain()
                .focus()
                .setImage({ src: url, alt: file.name })
                .run();
            } else {
              const url = URL.createObjectURL(file);
              editor
                .chain()
                .focus()
                .setImage({ src: url, alt: file.name })
                .run();
            }
          } catch (error) {
            console.error("Failed to handle pasted image:", error);
          }
        }
        return;
      }

      // Handle text/HTML pasting
      if (hasText || hasHtml) {
        let textContent = "";
        let htmlContent = "";

        // Get text content
        if (hasText) {
          textContent = clipboardData.getData("text/plain");
        }

        // Get HTML content
        if (hasHtml && preserveFormatting) {
          htmlContent = clipboardData.getData("text/html");
        }

        // If we have HTML and want to preserve formatting
        if (htmlContent && preserveFormatting) {
          e.preventDefault();

          // Sanitize HTML if needed
          if (sanitizeContent) {
            // Basic HTML sanitization - remove potentially dangerous elements
            htmlContent = htmlContent
              .replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                ""
              )
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
              .replace(/on\w+="[^"]*"/gi, "")
              .replace(/javascript:/gi, "");
          }

          // Insert HTML content
          editor.chain().focus().insertContent(htmlContent).run();
          return;
        }

        // If we only have text or don't want to preserve formatting
        if (textContent && !preserveFormatting) {
          e.preventDefault();

          // Insert as plain text
          editor.chain().focus().insertContent(textContent).run();
          return;
        }
      }
    },
    [enabled, editor, onImageUpload, preserveFormatting, sanitizeContent]
  );

  // Handle copy events
  const handleCopy = useCallback(
    (e: ClipboardEvent) => {
      if (!enabled || !editor) return;

      const { selection } = editor.state;
      if (selection.empty) return;

      const selectedText = editor.state.doc.textBetween(
        selection.from,
        selection.to
      );
      const selectedHtml = editor
        .getHTML()
        .slice(
          editor.state.doc.resolve(selection.from).start(),
          editor.state.doc.resolve(selection.to).end()
        );

      // Set clipboard data
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", selectedText);
        e.clipboardData.setData("text/html", selectedHtml);
      }
    },
    [enabled, editor]
  );

  // Handle cut events
  const handleCut = useCallback(
    (e: ClipboardEvent) => {
      if (!enabled || !editor) return;

      const { selection } = editor.state;
      if (selection.empty) return;

      // First copy the content
      handleCopy(e);

      // Then delete the selection
      editor.chain().focus().deleteSelection().run();
    },
    [enabled, editor, handleCopy]
  );

  // Enhanced paste from Word/Google Docs
  const handleWordPaste = useCallback(
    (e: ClipboardEvent) => {
      if (!enabled || !editor) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const htmlContent = clipboardData.getData("text/html");

      // Check if content is from Word or Google Docs
      if (
        htmlContent &&
        (htmlContent.includes("mso-") || // Microsoft Word
          htmlContent.includes("google-docs") || // Google Docs
          htmlContent.includes("data-google-docs")) // Google Docs
      ) {
        e.preventDefault();

        // Clean up Word/Google Docs specific formatting
        let cleanHtml = htmlContent
          .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
          .replace(/<o:p\s*\/?>/g, "") // Remove Word specific tags
          .replace(/<\/o:p>/g, "")
          .replace(/<w:[^>]*>/g, "") // Remove Word namespace tags
          .replace(/<\/w:[^>]*>/g, "")
          .replace(/<span[^>]*class="[^"]*mso-[^"]*"[^>]*>/g, "<span>") // Clean Word classes
          .replace(/style="[^"]*mso-[^"]*"/g, "") // Remove Word styles
          .replace(/<p[^>]*class="[^"]*MsoNormal[^"]*"[^>]*>/g, "<p>") // Clean Word paragraph classes
          .replace(/<div[^>]*class="[^"]*google-docs[^"]*"[^>]*>/g, "<div>") // Clean Google Docs classes
          .replace(
            /<br[^>]*class="[^"]*Apple-interchange-newline[^"]*"[^>]*>/g,
            "<br>"
          ) // Clean Apple formatting
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim();

        // Insert cleaned content
        editor.chain().focus().insertContent(cleanHtml).run();
      }
    },
    [enabled, editor]
  );

  // Set up event listeners
  useEffect(() => {
    if (!editor || !enabled) return;

    const editorElement = editor.view.dom;

    // Add event listeners
    editorElement.addEventListener("paste", handlePaste);
    editorElement.addEventListener("copy", handleCopy);
    editorElement.addEventListener("cut", handleCut);
    editorElement.addEventListener("paste", handleWordPaste);

    return () => {
      editorElement.removeEventListener("paste", handlePaste);
      editorElement.removeEventListener("copy", handleCopy);
      editorElement.removeEventListener("cut", handleCut);
      editorElement.removeEventListener("paste", handleWordPaste);
    };
  }, [editor, enabled, handlePaste, handleCopy, handleCut, handleWordPaste]);

  return {
    // Utility functions for programmatic copy/paste
    copySelection: () => {
      if (!editor) return;
      const { selection } = editor.state;
      if (selection.empty) return;

      const selectedText = editor.state.doc.textBetween(
        selection.from,
        selection.to
      );
      navigator.clipboard?.writeText(selectedText);
    },

    cutSelection: () => {
      if (!editor) return;
      const { selection } = editor.state;
      if (selection.empty) return;

      const selectedText = editor.state.doc.textBetween(
        selection.from,
        selection.to
      );
      navigator.clipboard?.writeText(selectedText);
      editor.chain().focus().deleteSelection().run();
    },

    pasteText: (text: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },

    pasteHtml: (html: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(html).run();
    },
  };
};
