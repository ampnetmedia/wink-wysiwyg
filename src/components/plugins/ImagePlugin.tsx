import React, { useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Image as ImageIcon,
  Upload,
  X,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface ImagePluginProps {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string>;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, alt?: string, width?: number, align?: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  onUpload,
}) => {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [width, setWidth] = useState<number>(300);
  const [align, setAlign] = useState("left");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert(url.trim(), alt.trim() || undefined, width, align);
      handleClose();
    }
  };

  const handleClose = () => {
    setUrl("");
    setAlt("");
    setWidth(300);
    setAlign("left");
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      setIsUploading(true);
      try {
        const uploadedUrl = await onUpload(file);
        setUrl(uploadedUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Image upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wink-modal-overlay" onClick={handleClose}>
      <div className="wink-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wink-modal-header">
          <h3>Insert Image</h3>
          <button
            type="button"
            onClick={handleClose}
            className="wink-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wink-modal-content">
          {/* File Upload */}
          {onUpload && (
            <div className="wink-form-group">
              <label className="wink-form-label">Upload Image</label>
              <div className="wink-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="wink-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="wink-upload-button"
                >
                  <Upload size={16} />
                  {isUploading ? "Uploading..." : "Choose File"}
                </button>
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="wink-form-group">
            <label className="wink-form-label">Image URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="wink-input"
              required
            />
          </div>

          {/* Alt Text */}
          <div className="wink-form-group">
            <label className="wink-form-label">
              Alt Text (for accessibility)
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
              className="wink-input"
            />
          </div>

          {/* Width */}
          <div className="wink-form-group">
            <label className="wink-form-label">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 300)}
              min="50"
              max="800"
              className="wink-input"
            />
          </div>

          {/* Alignment */}
          <div className="wink-form-group">
            <label className="wink-form-label">Alignment</label>
            <div className="wink-align-buttons">
              <button
                type="button"
                onClick={() => setAlign("left")}
                className={`wink-align-button ${align === "left" ? "active" : ""}`}
                title="Align Left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setAlign("center")}
                className={`wink-align-button ${align === "center" ? "active" : ""}`}
                title="Align Center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                type="button"
                onClick={() => setAlign("right")}
                className={`wink-align-button ${align === "right" ? "active" : ""}`}
                title="Align Right"
              >
                <AlignRight size={16} />
              </button>
            </div>
          </div>

          <div className="wink-modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="wink-button wink-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wink-button wink-button-primary"
              disabled={!url.trim()}
            >
              Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImagePlugin: React.FC<ImagePluginProps> = ({ editor, onImageUpload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInsertImage = (
    url: string,
    alt?: string,
    width?: number,
    align?: string
  ) => {
    if (!editor) return;

    const imageAttrs: any = {
      src: url,
      alt: alt || "",
      width: width || 300,
    };

    // Add alignment class
    if (align) {
      imageAttrs.class = `wink-image-align-${align}`;
    }

    editor.chain().focus().setImage(imageAttrs).run();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="wink-button"
        title="Insert Image"
        aria-label="Insert Image"
      >
        <ImageIcon size={16} />
      </button>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsert={handleInsertImage}
        onUpload={onImageUpload}
      />
    </>
  );
};

export default ImagePlugin;
