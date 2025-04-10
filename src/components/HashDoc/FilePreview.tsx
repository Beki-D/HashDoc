// src/components/FileUploader/FilePreview.tsx
import React from "react";
import { FileRecord } from "@/lib/supabase/types";
import ImageViewer, { Toolbar } from "@/components/ImageViewer";

interface FilePreviewProps {
  file: FileRecord;
}

const SUPPORTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
];

export const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const isOnline = navigator.onLine;

  // Determine if the file is an image based on its extension
  const isImage = file.filename
    ? SUPPORTED_IMAGE_EXTENSIONS.some((ext) =>
        file.filename.toLowerCase().endsWith(ext)
      )
    : false;

  return (
    <div className="border-t border-gray-600 bg-gray-700/30 transition-all duration-300">
      <div className="p-4 relative">
        {file.signedUrl && isOnline ? (
          isImage ? (
            <div className="w-full h-[300px] sm:h-[400px] rounded-md border border-gray-600 shadow-sm bg-gray-800 overflow-hidden">
              <ImageViewer imageUrl={file.signedUrl} />
            </div>
          ) : (
            <div className="w-full h-[300px] sm:h-[400px] rounded-md border border-gray-600 shadow-sm bg-gray-800 overflow-hidden relative">
              <Toolbar
                url={file.signedUrl}
                showDownload={false}
                align="right"
                className="sm:hidden"
              />
              <iframe
                src={file.signedUrl}
                title={file.filename}
                className="w-full h-full"
                onError={(e) => console.error("Iframe load error:", e)}
                style={{ display: "block" }}
                scrolling="yes"
              />
            </div>
          )
        ) : (
          <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center text-cyan-300 bg-gray-800 rounded-md border border-gray-600">
            {file.signedUrl
              ? "Preview unavailable offline"
              : "Invalid preview URL"}
          </div>
        )}
      </div>
    </div>
  );
};
