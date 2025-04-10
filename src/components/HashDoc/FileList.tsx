// src/components/FileUploader/FileList.tsx
import { FileRecord } from "@/lib/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Image,
  FileText,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Clock,
  ArrowUpFromLine,
  Loader2,
} from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { FilePreview } from "./FilePreview";

interface FileListProps {
  uploadedFiles: FileRecord[];
  loading: boolean;
  previewFileId: number | null;
  togglePreview: (fileId: number) => void;
  handleDelete: (fileId: number, filename: string) => void;
  setActiveTab: (tab: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  uploadedFiles,
  loading,
  previewFileId,
  togglePreview,
  handleDelete,
  setActiveTab,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-cyan-300">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-cyan-400" />
        <p className="font-medium">Loading your documents...</p>
      </div>
    );
  }

  if (uploadedFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-cyan-300 bg-gray-700/40 backdrop-blur-sm rounded-xl border border-gray-600">
        <div className="bg-gray-700 p-4 rounded-full mb-4">
          <FileText className="h-12 w-12 text-cyan-300" />
        </div>
        <p className="font-medium text-lg text-cyan-100">
          No documents uploaded yet
        </p>
        <p className="text-sm mt-1 text-cyan-300/70 text-center max-w-xs">
          Upload your first PDF/Image document to get started with HashDoc
        </p>
        <Button
          className="mt-6 bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-700/30"
          onClick={() => setActiveTab("upload")}
        >
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Upload a Document
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] sm:h-[430px] rounded-md pr-2.5">
      <ul className="space-y-4">
        {uploadedFiles.map((file) => {
          // Determine icon based on file type
          const getFileIcon = (filename: string) => {
            const extension = filename.split(".").pop()?.toLowerCase();
            if (
              ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(
                extension || ""
              )
            ) {
              return <Image className="h-6 w-6 text-cyan-300" />;
            }
            return <FileText className="h-6 w-6 text-cyan-300" />;
          };

          return (
            <li
              key={file.id}
              className="transition-all duration-200 hover:translate-y-[-2px]"
            >
              <Card className="overflow-hidden bg-gray-700/40 border border-gray-600 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="p-3 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-700 p-2 rounded-lg flex-shrink-0">
                        {/* Render the appropriate icon */}
                        {getFileIcon(file.filename)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-white max-w-52 truncate text-sm sm:max-w-none sm:text-base">
                            {file.filename.replace(
                              /(.+)(\.[^\.]+)$/,
                              (_, name, ext) =>
                                name.length > 25
                                  ? `${name.substring(0, 25)}...${ext}`
                                  : name + ext
                            )}
                          </h4>
                          {file.is_duplicate && (
                            <Badge
                              variant="secondary"
                              className="font-normal text-xs bg-red-800/50 text-red-200 border-red-800/50"
                            >
                              Duplicate
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center mt-1 text-xs text-cyan-200/70 gap-2 sm:gap-3">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(file.created_at)}
                          </span>
                          <Badge
                            variant="outline"
                            className="font-normal text-xs border-gray-600 text-cyan-200 bg-gray-700/50"
                          >
                            {formatFileSize(file.size)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1 sm:space-x-2 self-start sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePreview(file.id)}
                        className="h-8 w-8 text-cyan-300 hover:text-white hover:bg-gray-600 rounded-full"
                      >
                        {previewFileId === file.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-cyan-300 hover:text-white hover:bg-gray-600 rounded-full"
                      >
                        <a
                          href={file.signedUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.id, file.filename)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {previewFileId === file.id && <FilePreview file={file} />}
              </Card>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
};
