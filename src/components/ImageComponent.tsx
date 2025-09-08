import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Edit3,
  Trash2,
  Move,
} from "lucide-react";

interface ImageComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: any;
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [showControls, setShowControls] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const { src, alt, title, width, height, align } = node.attrs;

  // Handle mouse events for showing controls
  useEffect(() => {
    const handleMouseEnter = () => setShowControls(true);
    const handleMouseLeave = () => setShowControls(false);

    const imageElement = imageRef.current;
    if (imageElement) {
      imageElement.addEventListener("mouseenter", handleMouseEnter);
      imageElement.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (imageElement) {
        imageElement.removeEventListener("mouseenter", handleMouseEnter);
        imageElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  // Handle resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      });
      setIsResizing(true);
    }
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !imageRef.current) return;

    const deltaX = e.clientX - resizeStart.x;
    const newWidth = Math.max(100, resizeStart.width + deltaX);

    updateAttributes({ width: newWidth });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, resizeStart]);

  const handleAlignChange = (newAlign: string) => {
    updateAttributes({ align: newAlign });
  };

  const handleEdit = () => {
    const newAlt = prompt("Alt text:", alt || "");
    const newTitle = prompt("Title:", title || "");

    if (newAlt !== null) {
      updateAttributes({ alt: newAlt });
    }
    if (newTitle !== null) {
      updateAttributes({ title: newTitle });
    }
  };

  const getAlignmentClass = () => {
    switch (align) {
      case "center":
        return "wink-image-align-center";
      case "right":
        return "wink-image-align-right";
      default:
        return "wink-image-align-left";
    }
  };

  return (
    <NodeViewWrapper
      className={`wink-image-wrapper ${getAlignmentClass()} ${selected ? "selected" : ""}`}
      data-drag-handle
    >
      <div className="wink-image-container">
        <img
          ref={imageRef}
          src={src}
          alt={alt || ""}
          title={title || ""}
          width={width || undefined}
          height={height || undefined}
          className="wink-image"
          draggable={false}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />

        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          className="wink-resize-handle"
          onMouseDown={handleResizeStart}
        >
          <Maximize2 size={12} />
        </div>

        {/* Controls Overlay */}
        {(showControls || selected) && (
          <div className="wink-image-controls">
            <div className="wink-control-group">
              <button
                type="button"
                onClick={() => handleAlignChange("left")}
                className={`wink-control-button ${align === "left" ? "active" : ""}`}
                title="Align Left"
              >
                <AlignLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleAlignChange("center")}
                className={`wink-control-button ${align === "center" ? "active" : ""}`}
                title="Align Center"
              >
                <AlignCenter size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleAlignChange("right")}
                className={`wink-control-button ${align === "right" ? "active" : ""}`}
                title="Align Right"
              >
                <AlignRight size={14} />
              </button>
            </div>

            <div className="wink-control-group">
              <button
                type="button"
                onClick={handleEdit}
                className="wink-control-button"
                title="Edit Alt Text"
              >
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={deleteNode}
                className="wink-control-button wink-control-button-danger"
                title="Delete Image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Drag Handle */}
        <div className="wink-drag-handle" title="Drag to move">
          <Move size={12} />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export { ImageComponent };
