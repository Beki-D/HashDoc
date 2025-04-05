import { FileRecord } from "@/lib/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
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
    <ScrollArea className="h-[400px] sm:h-[500px] rounded-md mr-2">
      <ul className="space-y-4">
        {uploadedFiles.map((file) => (
          <li
            key={file.id}
            className="transition-all duration-200 hover:translate-y-[-2px]"
          >
            <Card className="mr-3 sm:mr-0 overflow-hidden bg-gray-700/40 border border-gray-600 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-700 p-2 rounded-lg flex-shrink-0">
                      <FileText className="h-6 w-6 text-cyan-300" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-white line-clamp-1 text-sm sm:text-base">
                        {file.filename}
                      </h4>
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
                        {file.is_duplicate && (
                          <Badge
                            variant="secondary"
                            className="font-normal text-xs bg-red-800/50 text-red-200 border-red-800/50"
                          >
                            Duplicate
                          </Badge>
                        )}
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

              {previewFileId === file.id && file.signedUrl && (
                <div className="border-t border-gray-600 bg-gray-700/30 transition-all duration-300">
                  <div className="p-4">
                    <iframe
                      src={file.signedUrl}
                      title={file.filename}
                      className="w-full h-[300px] sm:h-[400px] rounded-md border border-gray-600 shadow-sm bg-gray-800"
                    />
                  </div>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
};
