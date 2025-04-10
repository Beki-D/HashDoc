// src/components/ImageViewer.tsx
import React, { useState, useCallback } from "react";
import {
  RotateCw,
  Download,
  ExternalLink,
  Minus,
  Plus,
  Move,
} from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
}

interface Position {
  x: number;
  y: number;
}

interface ToolbarProps {
  url: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onReset?: () => void;
  showDownload?: boolean;
  className?: string;
  align?: "left" | "right";
}

// Reusable Toolbar Component
export const Toolbar: React.FC<ToolbarProps> = ({
  url,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset,
  showDownload = true,
  className = "",
  align = "left",
}) => {
  const openInNewTab = useCallback(() => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  }, [url]);

  const downloadFile = useCallback(() => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "file";
    link.click();
  }, [url]);

  return (
    <div
      className={`absolute top-2 ${
        align === "left" ? "left-2" : "right-2"
      } bg-white/90 rounded-full flex items-center gap-1 p-1 shadow-lg z-50 ${className}`}
    >
      {onZoomIn && (
        <button
          onClick={onZoomIn}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
      )}
      {onZoomOut && (
        <button
          onClick={onZoomOut}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
      )}
      {onRotate && (
        <button
          onClick={onRotate}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Rotate"
        >
          <RotateCw size={16} />
        </button>
      )}
      {onReset && (
        <button
          onClick={onReset}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Reset"
        >
          <Move size={16} />
        </button>
      )}
      {(onZoomIn || onZoomOut || onRotate || onReset) && showDownload && (
        <div className="w-px h-4 bg-gray-300 mx-1" />
      )}
      <button
        onClick={openInNewTab}
        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        title="Open in new tab"
      >
        <ExternalLink size={16} />
      </button>
      {showDownload && (
        <button
          onClick={downloadFile}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Download"
        >
          <Download size={16} />
        </button>
      )}
    </div>
  );
};

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(
    null
  );

  const ZOOM_FACTOR = 1.2;
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 10;

  // Control Functions
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * ZOOM_FACTOR, MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev / ZOOM_FACTOR, MIN_SCALE));
  }, []);

  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Unified Drag/Pan Handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setIsPanning(true);
      setDragStart({ x: clientX - position.x, y: clientY - position.y });
    },
    [position]
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isPanning || !dragStart) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isPanning, dragStart]
  );

  const handleDragEnd = useCallback(() => {
    setIsPanning(false);
    setDragStart(null);
  }, []);

  // Touch-Specific Pinch/Zoom Handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleDragStart(e);
      } else if (e.touches.length === 2) {
        setIsPanning(false);
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        setPinchStartDistance(distance);
      }
    },
    [handleDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleDragMove(e);
      } else if (e.touches.length === 2 && pinchStartDistance !== null) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const newDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        const scaleChange = newDistance / pinchStartDistance;
        setScale((prev) =>
          Math.min(Math.max(prev * scaleChange, MIN_SCALE), MAX_SCALE)
        );
        setPinchStartDistance(newDistance);
      }
    },
    [handleDragMove, pinchStartDistance]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    setDragStart(null);
    setPinchStartDistance(null);
  }, []);

  // Wheel Handler (Zoom)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    setScale((prev) =>
      Math.max(MIN_SCALE, Math.min(prev * scaleFactor, MAX_SCALE))
    );
  }, []);

  return (
    <div
      className="relative w-full h-full max-w-full overflow-hidden bg-gray-100 touch-none"
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
    >
      <Toolbar
        url={imageUrl}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onRotate={rotate}
        onReset={reset}
      />
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-full object-contain transition-transform"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
        }}
        draggable="false"
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default ImageViewer;
