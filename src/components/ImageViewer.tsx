import React, { useState, useRef, useEffect, useCallback } from "react";
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

interface Dimensions {
  width: number;
  height: number;
}

interface ToolbarProps {
  url: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onReset?: () => void;
  showDownload?: boolean;
  className?: string;
  align?: "left" | "right"; // Optional prop for alignment
}

// Reusable Toolbar Component
export const Toolbar: React.FC<ToolbarProps> = ({
  url,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset,
  showDownload = true, // Default to true for ImageViewer
  className = "",
  align = "left", // Default to left alignment
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
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
    null
  );
  const [lastTouchPosition, setLastTouchPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Constants
  const ZOOM_FACTOR = 1.2;
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 10;

  // Reset on image change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [imageUrl]);

  // Image Control Functions
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
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const centerImage = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const imgWidth = dimensions.width * scale;
    const imgHeight = dimensions.height * scale;
    setPosition({
      x: (container.width - imgWidth) / 2,
      y: (container.height - imgHeight) / 2,
    });
  }, [scale, dimensions]);

  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      setDimensions({ width: naturalWidth, height: naturalHeight });
      setTimeout(() => centerImage(), 0);
    },
    [centerImage]
  );

  // Panning and Zooming Functions
  const getBoundedPosition = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return position;

    const container = containerRef.current.getBoundingClientRect();
    const imgWidth = dimensions.width * scale;
    const imgHeight = dimensions.height * scale;

    const maxX = Math.max(0, (container.width - imgWidth) / 2);
    const maxY = Math.max(0, (container.height - imgHeight) / 2);

    if (imgWidth < container.width && imgHeight < container.height) {
      return {
        x: (container.width - imgWidth) / 2,
        y: (container.height - imgHeight) / 2,
      };
    }

    return {
      x: Math.min(
        maxX,
        Math.max(position.x, container.width - imgWidth - maxX)
      ),
      y: Math.min(
        maxY,
        Math.max(position.y, container.height - imgHeight - maxY)
      ),
    };
  }, [position, scale, dimensions]);

  // Mouse Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    document.body.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;
      setPosition((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    document.body.style.cursor = "";
  }, []);

  // Touch Handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      setLastTouchDistance(distance);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!containerRef.current) return;

      if (e.touches.length === 1 && isPanning) {
        const touch = e.touches[0];
        setPosition((prev) => ({
          x: prev.x + (touch.clientX - lastTouchPosition.x),
          y: prev.y + (touch.clientY - lastTouchPosition.y),
        }));
        setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
      } else if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        if (lastTouchDistance !== null) {
          const scaleChange = distance / lastTouchDistance;
          const newScale = Math.max(
            MIN_SCALE,
            Math.min(scale * scaleChange, MAX_SCALE)
          );
          setScale(newScale);
        }
        setLastTouchDistance(distance);
      }
    },
    [isPanning, lastTouchDistance, lastTouchPosition, scale]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    setLastTouchDistance(null);
  }, []);

  // Wheel Handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!containerRef.current) return;
      e.preventDefault();

      const container = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - container.left;
      const mouseY = e.clientY - container.top;
      const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(scale * scaleFactor, MAX_SCALE)
      );

      setScale(newScale);
      setPosition((prev) => ({
        x: mouseX - (mouseX - prev.x) * scaleFactor,
        y: mouseY - (mouseY - prev.y) * scaleFactor,
      }));
    },
    [scale]
  );

  // Event Listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const boundedPosition = getBoundedPosition();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full touch-none overflow-hidden bg-gray-100"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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

      {/* Image */}
      <div
        className="absolute w-full h-full"
        style={{
          transform: `translate(${boundedPosition.x}px, ${boundedPosition.y}px)`,
        }}
      >
        <img
          ref={imageRef}
          onLoad={handleImageLoad}
          style={{
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="max-w-none"
          src={imageUrl}
          alt="Preview"
          draggable="false"
        />
      </div>

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default ImageViewer;
