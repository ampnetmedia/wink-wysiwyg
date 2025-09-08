import { useCallback, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";

interface UseDragDropOptions {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
  enabled?: boolean;
}

export const useDragDrop = ({
  editor,
  onImageUpload,
  enabled = true,
}: UseDragDropOptions) => {
  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!enabled || !editor) return;

      // Add visual feedback
      const editorElement = editor.view.dom;
      if (editorElement) {
        editorElement.classList.add("wink-drag-over");
      }
    },
    [enabled, editor]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!enabled || !editor) return;

      // Remove visual feedback
      const editorElement = editor.view.dom;
      if (editorElement) {
        editorElement.classList.remove("wink-drag-over");
      }
    },
    [enabled, editor]
  );

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!enabled || !editor) return;

      // Remove visual feedback
      const editorElement = editor.view.dom;
      if (editorElement) {
        editorElement.classList.remove("wink-drag-over");
      }

      const files = Array.from(e.dataTransfer?.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length === 0) return;

      // Handle multiple images
      for (const file of imageFiles) {
        try {
          if (onImageUpload) {
            // Upload the file and get URL
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
          } else {
            // Create object URL for local preview
            const url = URL.createObjectURL(file);
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
          }
        } catch (error) {
          console.error("Failed to handle dropped image:", error);
        }
      }
    },
    [enabled, editor, onImageUpload]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!enabled || !editor) return;

      const items = Array.from(e.clipboardData?.items || []);
      const imageItems = items.filter((item) => item.type.startsWith("image/"));

      if (imageItems.length === 0) return;

      e.preventDefault();

      // Handle pasted images
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (!file) continue;

        try {
          if (onImageUpload) {
            // Upload the file and get URL
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
          } else {
            // Create object URL for local preview
            const url = URL.createObjectURL(file);
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
          }
        } catch (error) {
          console.error("Failed to handle pasted image:", error);
        }
      }
    },
    [enabled, editor, onImageUpload]
  );

  useEffect(() => {
    if (!editor || !enabled) return;

    const editorElement = editor.view.dom;

    // Add event listeners
    editorElement.addEventListener("dragover", handleDragOver);
    editorElement.addEventListener("dragleave", handleDragLeave);
    editorElement.addEventListener("drop", handleDrop);
    editorElement.addEventListener("paste", handlePaste);

    return () => {
      editorElement.removeEventListener("dragover", handleDragOver);
      editorElement.removeEventListener("dragleave", handleDragLeave);
      editorElement.removeEventListener("drop", handleDrop);
      editorElement.removeEventListener("paste", handlePaste);
    };
  }, [
    editor,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
    enabled,
  ]);
};
